package com.digisec.dto;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long authorId,
        String authorFirstName,
        String commentText,
        LocalDateTime createdAt
) {
}
