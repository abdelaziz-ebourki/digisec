package com.digisec.dto;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        Long authorId,
        String authorFirstName,
        String title,
        String content,
        LocalDateTime createdAt
) {
}
