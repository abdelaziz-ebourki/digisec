package com.digisec.dto;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String codeApoge,
        String phoneNumber,
        String role,
        boolean verified,
        LocalDateTime createdAt
) {
}
