package com.digisec.dto;

public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
