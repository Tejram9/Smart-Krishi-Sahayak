package com.smartkrishisahayak.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long jwtExpirationMs;

    private static final String DEFAULT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @org.springframework.beans.factory.annotation.Autowired
    public JwtService(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") String jwtExpirationMsStr) {
        this(secret, parseExpiration(jwtExpirationMsStr, 86400000L));
    }

    public JwtService(String secret, long jwtExpirationMs) {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("app.jwt.secret is not configured. Refusing to start with a missing JWT signing key.");
        }
        if (DEFAULT_SECRET.equals(secret.trim())) {
            throw new IllegalStateException("app.jwt.secret is set to the well-known default value. Replace it with a securely generated 256-bit secret.");
        }
        byte[] keyBytes;
        if (isHexString(secret)) {
            keyBytes = hexStringToByteArray(secret);
        } else {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 32 bytes (256 bits) long.");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.jwtExpirationMs = jwtExpirationMs > 0 ? jwtExpirationMs : 86400000L;
    }

    private static long parseExpiration(String value, long defaultVal) {
        if (value == null || value.trim().isEmpty()) {
            return defaultVal;
        }
        try {
            long parsed = Long.parseLong(value.trim());
            return parsed > 0 ? parsed : defaultVal;
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }

    private static boolean isHexString(String s) {
        return s != null && s.length() >= 64 && s.length() % 2 == 0 && s.matches("^[0-9a-fA-F]+$");
    }

    private static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateTokenFromUserId(userPrincipal.getId(), userPrincipal.getRole().name(), userPrincipal.getMobileNumber());
    }

    public String generateTokenFromUserId(Long userId, String role, String mobileNumber) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(Long.toString(userId))
                .claim("role", role)
                .claim("mobile", mobileNumber)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Long getUserIdFromJwt(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token is invalid, expired, or malformed
            return false;
        }
    }
}
