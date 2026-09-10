package com.digisec.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(

        @NotBlank(message = "TITLE_REQUIRED")
        @Size(max = 200, message = "TITLE_TOO_LONG")
        String title,

        @NotBlank(message = "CONTENT_REQUIRED")
        String content
) {
}
