package com.bsa.campcard.service;

import com.bsa.campcard.dto.qr.*;
import com.bsa.campcard.exception.ResourceNotFoundException;
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
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.base.url:https://campcardapp.com}")
    private String baseUrl;

    private static final String QR_CODE_PREFIX = "qr:user:";
    private static final String LINK_PREFIX = "link:offer:";
    private static final int CODE_LENGTH = 12;
    private static final SecureRandom random = new SecureRandom();

    public QRCodeResponse generateUserQRCode(UUID userId) {
        log.info("Generating QR code for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String cacheKey = QR_CODE_PREFIX + userId.toString();
        String existingCode = (String) redisTemplate.opsForValue().get(cacheKey);

        String uniqueCode;
        if (existingCode != null) {
            uniqueCode = existingCode;
        } else {
            uniqueCode = generateUniqueCode();
            redisTemplate.opsForValue().set(cacheKey, uniqueCode, 30, TimeUnit.DAYS);
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

        // Build subscribe URL with scout tracking
        String scoutName = URLEncoder.encode(
                user.getFirstName() + " " + user.getLastName(),
                StandardCharsets.UTF_8);
        String subscribeUrl = baseUrl + "/campcard/subscribe/?scout=" + uniqueCode + "&name=" + scoutName;

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
