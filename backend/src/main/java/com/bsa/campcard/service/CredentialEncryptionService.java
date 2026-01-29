package com.bsa.campcard.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting and decrypting sensitive credentials using AES-256-GCM.
 *
 * Security features:
 * - AES-256-GCM (authenticated encryption)
 * - Unique IV (Initialization Vector) for each encryption
 * - IV prepended to ciphertext for decryption
 * - Master key stored in environment variable (not in code)
 */
@Slf4j
@Service
public class CredentialEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits recommended for GCM
    private static final int GCM_TAG_LENGTH = 128; // 128 bits authentication tag

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;

    public CredentialEncryptionService(
            @Value("${CREDENTIAL_ENCRYPTION_KEY:#{null}}") String encryptionKey) {

        if (encryptionKey == null || encryptionKey.isEmpty()) {
            // Use a default key for development - MUST be overridden in production
            log.warn("CREDENTIAL_ENCRYPTION_KEY not set. Using default key - NOT SECURE FOR PRODUCTION!");
            encryptionKey = "Y2FtcGNhcmQtZGV2LWtleS1mb3ItZW5jcnlwdGlvbiE="; // Base64 of "campcard-dev-key-for-encryption!" (32 bytes)
        }

        byte[] keyBytes = Base64.getDecoder().decode(encryptionKey);
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("Encryption key must be 32 bytes (256 bits) when Base64 decoded");
        }

        this.secretKey = new SecretKeySpec(keyBytes, "AES");
        this.secureRandom = new SecureRandom();

        log.info("CredentialEncryptionService initialized with AES-256-GCM");
    }

    /**
     * Encrypt a plain text credential.
     *
     * @param plainText The credential to encrypt
     * @return Base64 encoded string containing IV + ciphertext
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            throw new IllegalArgumentException("Plain text cannot be null or empty");
        }

        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            // Encrypt
            byte[] cipherText = cipher.doFinal(plainText.getBytes());

            // Combine IV + ciphertext
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            // Return Base64 encoded
            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            log.error("Encryption failed", e);
            throw new RuntimeException("Failed to encrypt credential", e);
        }
    }

    /**
     * Decrypt an encrypted credential.
     *
     * @param encryptedText Base64 encoded string containing IV + ciphertext
     * @return The decrypted plain text credential
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            throw new IllegalArgumentException("Encrypted text cannot be null or empty");
        }

        try {
            // Decode Base64
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedText);

            // Extract IV
            ByteBuffer byteBuffer = ByteBuffer.wrap(encryptedBytes);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            // Extract ciphertext
            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            // Decrypt
            byte[] plainTextBytes = cipher.doFinal(cipherText);

            return new String(plainTextBytes);

        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new RuntimeException("Failed to decrypt credential", e);
        }
    }

    /**
     * Mask a credential for display (show only last 4 characters).
     *
     * @param value The value to mask
     * @return Masked string like "••••••••1234"
     */
    public static String mask(String value) {
        if (value == null || value.length() <= 4) {
            return "••••••••";
        }
        return "••••••••" + value.substring(value.length() - 4);
    }
}
