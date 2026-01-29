package com.bsa.campcard.service;

import com.bsa.campcard.dto.qr.*;
import com.bsa.campcard.entity.CampCard;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.CampCardRepository;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class QRCodeService {

    private final UserRepository userRepository;
    private final CampCardRepository campCardRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${campcard.base-url:https://api.campcardapp.org}")
    private String baseUrl;

    @Value("${campcard.static-site-url:https://www.campcardapp.org}")
    private String staticSiteUrl;

    private static final String QR_CODE_PREFIX = "qr:user:";
    private static final String QR_CARD_PREFIX = "qr:card:";
    private static final String LINK_PREFIX = "link:offer:";
    private static final int CODE_LENGTH = 12;
    private static final SecureRandom random = new SecureRandom();

    public QRCodeResponse generateUserQRCode(UUID userId) {
        log.info("Generating QR code for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String cacheKey = QR_CODE_PREFIX + userId.toString();
        String existingCode = null;

        // Try to get cached code, but handle Redis failures gracefully
        try {
            existingCode = (String) redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            log.warn("Redis unavailable for QR code cache read, generating new code: {}", e.getMessage());
        }

        String uniqueCode;
        if (existingCode != null) {
            uniqueCode = existingCode;
        } else {
            uniqueCode = generateUniqueCode();
            // Try to cache, but don't fail if Redis is unavailable
            try {
                redisTemplate.opsForValue().set(cacheKey, uniqueCode, 30, TimeUnit.DAYS);
            } catch (Exception e) {
                log.warn("Redis unavailable for QR code caching, code won't be persisted: {}", e.getMessage());
            }
        }

        Map<String, Object> qrData = new HashMap<>();
        qrData.put("type", "campcard_user");
        qrData.put("userId", userId.toString());
        qrData.put("uniqueCode", uniqueCode);
        qrData.put("validUntil", LocalDateTime.now().plusDays(30));

        String qrCodeData;
        try {
            qrCodeData = objectMapper.writeValueAsString(qrData);
        } catch (JsonProcessingException e) {
            log.error("Error serializing QR code data", e);
            qrCodeData = uniqueCode;
        }

        // Build subscribe URL based on user role
        // Scouts use ?scout= parameter ($10/year tier)
        // Customers/Parents use ?ref= parameter ($15/year tier)
        String userName = URLEncoder.encode(
                user.getFirstName() + " " + user.getLastName(),
                StandardCharsets.UTF_8);

        String subscribeUrl;
        if (user.getRole() == User.UserRole.SCOUT) {
            // Scout referral - $10/year
            subscribeUrl = staticSiteUrl + "/buy-campcard/?scout=" + uniqueCode + "&name=" + userName;
        } else {
            // Customer/Parent referral - $15/year
            subscribeUrl = staticSiteUrl + "/buy-campcard/?ref=" + uniqueCode + "&refname=" + userName;
        }

        return QRCodeResponse.builder()
                .uniqueCode(uniqueCode)
                .qrCodeData(qrCodeData)
                .shareableLink(subscribeUrl)
                .validUntil(LocalDateTime.now().plusDays(30))
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    public ShareableLinkResponse generateOfferLink(GenerateLinkRequest request) {
        log.info("Generating shareable link for offer: {}", request.getOfferId());

        String uniqueCode = generateUniqueCode();
        String cacheKey = LINK_PREFIX + uniqueCode;

        Map<String, Object> linkData = new HashMap<>();
        linkData.put("offerId", request.getOfferId());
        linkData.put("userId", request.getUserId());
        linkData.put("createdAt", LocalDateTime.now());
        linkData.put("expiresAt", LocalDateTime.now().plusDays(90));
        linkData.put("maxUses", 1000);
        linkData.put("currentUses", 0);

        try {
            String jsonData = objectMapper.writeValueAsString(linkData);
            redisTemplate.opsForValue().set(cacheKey, jsonData, 90, TimeUnit.DAYS);
        } catch (JsonProcessingException e) {
            log.error("Error storing link data", e);
        }

        return ShareableLinkResponse.builder()
                .uniqueCode(uniqueCode)
                .shareableLink(baseUrl + "/o/" + uniqueCode)
                .offerId(request.getOfferId())
                .expiresAt(LocalDateTime.now().plusDays(90))
                .maxUses(1000)
                .currentUses(0)
                .build();
    }

    public Map<String, Object> validateOfferLink(String uniqueCode) {
        String cacheKey = LINK_PREFIX + uniqueCode;
        String jsonData = (String) redisTemplate.opsForValue().get(cacheKey);

        if (jsonData == null) {
            throw new ResourceNotFoundException("Link not found or expired");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> linkData = objectMapper.readValue(jsonData, Map.class);

            Integer currentUses = (Integer) linkData.get("currentUses");
            Integer maxUses = (Integer) linkData.get("maxUses");

            if (currentUses >= maxUses) {
                throw new IllegalStateException("Link has reached maximum usage limit");
            }

            linkData.put("currentUses", currentUses + 1);
            String updatedJson = objectMapper.writeValueAsString(linkData);
            redisTemplate.opsForValue().set(cacheKey, updatedJson, 90, TimeUnit.DAYS);

            return linkData;
        } catch (JsonProcessingException e) {
            log.error("Error parsing link data", e);
            throw new IllegalStateException("Invalid link data");
        }
    }

    public QRCodeResponse validateUserQRCode(String uniqueCode) {
        String pattern = QR_CODE_PREFIX + "*";
        var keys = redisTemplate.keys(pattern);

        if (keys != null) {
            for (String key : keys) {
                String storedCode = (String) redisTemplate.opsForValue().get(key);
                if (uniqueCode.equals(storedCode)) {
                    String userIdStr = key.replace(QR_CODE_PREFIX, "");
                    UUID userId = UUID.fromString(userIdStr);
                    return generateUserQRCode(userId);
                }
            }
        }

        throw new ResourceNotFoundException("Invalid QR code");
    }

    /**
     * Generate QR code for a specific camp card
     * Each card gets its own unique QR code for offer redemption
     */
    public CardQRCodeResponse generateCardQRCode(Long cardId, UUID userId) {
        log.info("Generating QR code for card: {} owned by user: {}", cardId, userId);

        CampCard card = campCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        // Verify ownership
        if (!card.getOwnerUserId().equals(userId)) {
            throw new ResourceNotFoundException("Card not found");
        }

        // Check if card is usable
        if (!card.isUsable()) {
            throw new IllegalStateException("Card is not active or has expired");
        }

        String cacheKey = QR_CARD_PREFIX + cardId.toString();
        String existingCode = null;

        // Try to get cached code, but handle Redis failures gracefully
        try {
            existingCode = (String) redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            log.warn("Redis unavailable for card QR code cache read: {}", e.getMessage());
        }

        String uniqueCode;
        if (existingCode != null) {
            uniqueCode = existingCode;
        } else {
            uniqueCode = generateUniqueCode();
            // Try to cache, but don't fail if Redis is unavailable
            try {
                // Card QR codes valid until card expiry (max 365 days)
                redisTemplate.opsForValue().set(cacheKey, uniqueCode, 365, TimeUnit.DAYS);
            } catch (Exception e) {
                log.warn("Redis unavailable for card QR code caching: {}", e.getMessage());
            }
        }

        Map<String, Object> qrData = new HashMap<>();
        qrData.put("type", "campcard_redemption");
        qrData.put("cardId", cardId);
        qrData.put("cardNumber", card.getCardNumber());
        qrData.put("userId", userId.toString());
        qrData.put("uniqueCode", uniqueCode);
        qrData.put("validUntil", card.getExpiresAt());

        String qrCodeData;
        try {
            qrCodeData = objectMapper.writeValueAsString(qrData);
        } catch (JsonProcessingException e) {
            log.error("Error serializing card QR code data", e);
            qrCodeData = card.getCardNumber() + ":" + uniqueCode;
        }

        return CardQRCodeResponse.builder()
                .cardId(cardId)
                .cardNumber(card.getCardNumber())
                .uniqueCode(uniqueCode)
                .qrCodeData(qrCodeData)
                .validUntil(card.getExpiresAt())
                .status(card.getStatus().name())
                .build();
    }

    /**
     * Validate a card QR code for offer redemption
     */
    public CardQRCodeResponse validateCardQRCode(String uniqueCode) {
        String pattern = QR_CARD_PREFIX + "*";
        var keys = redisTemplate.keys(pattern);

        if (keys != null) {
            for (String key : keys) {
                String storedCode = (String) redisTemplate.opsForValue().get(key);
                if (uniqueCode.equals(storedCode)) {
                    String cardIdStr = key.replace(QR_CARD_PREFIX, "");
                    Long cardId = Long.parseLong(cardIdStr);

                    CampCard card = campCardRepository.findById(cardId)
                            .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

                    return generateCardQRCode(cardId, card.getOwnerUserId());
                }
            }
        }

        throw new ResourceNotFoundException("Invalid card QR code");
    }

    private String generateUniqueCode() {
        byte[] bytes = new byte[CODE_LENGTH];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes)
                .substring(0, CODE_LENGTH)
                .toUpperCase();
    }
}
