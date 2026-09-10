package com.digisec.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(

        @NotBlank(message = "COMMENT_REQUIRED")
        String commentText
) {
}
