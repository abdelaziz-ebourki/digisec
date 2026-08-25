package com.digisec.security;

import com.digisec.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String DEV_FALLBACK_PREFIX = "dev-only-secret";

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(JwtProperties properties, Environment environment) {
        String secret = properties.secret();
        boolean isProd = environment.acceptsProfiles(Profiles.of("prod"));
        if (secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 characters. Current length: " + secret.length());
        }
        if (isProd && secret.startsWith(DEV_FALLBACK_PREFIX)) {
            throw new IllegalStateException(
                    "Refusing to start with the development JWT fallback secret under the prod profile");
        }
        log.info("JWT secret configuration validated ({} characters, active profiles: {})",
                secret.length(), Arrays.toString(environment.getActiveProfiles()));
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = properties.expirationMs();
    }

    public String generate(String username, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        Claims claims = parseClaims(token);
        return claims == null ? null : claims.getSubject();
    }

    public boolean isValid(String token, String expectedUsername) {
        Claims claims = parseClaims(token);
        return claims != null
                && expectedUsername.equals(claims.getSubject())
                && claims.getExpiration().after(new Date());
    }

    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
