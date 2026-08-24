package com.digisec.service;

import com.digisec.config.JwtProperties;
import com.digisec.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(new JwtProperties("test-secret-key-with-at-least-32-characters!!", 3600000L));
    }

    @Test
    void generatesAndParsesToken() {
        String token = jwtService.generate("user@digisec.local", "USER");

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("user@digisec.local");
        assertThat(jwtService.isValid(token, "user@digisec.local")).isTrue();
    }

    @Test
    void rejectsTokenForDifferentUser() {
        String token = jwtService.generate("user@digisec.local", "USER");

        assertThat(jwtService.isValid(token, "other@digisec.local")).isFalse();
    }

    @Test
    void rejectsGarbageToken() {
        assertThat(jwtService.extractUsername("not-a-token")).isNull();
        assertThat(jwtService.isValid("not-a-token", "user@digisec.local")).isFalse();
    }

    @Test
    void rejectsExpiredToken() {
        JwtService shortLived = new JwtService(new JwtProperties("test-secret-key-with-at-least-32-characters!!", -1000L));
        String token = shortLived.generate("user@digisec.local", "USER");

        assertThat(shortLived.isValid(token, "user@digisec.local")).isFalse();
    }
}
