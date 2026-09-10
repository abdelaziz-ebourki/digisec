package com.digisec.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "FIRST_NAME_REQUIRED")
        @Size(max = 100, message = "FIRST_NAME_TOO_LONG")
        String firstName,

        @NotBlank(message = "LAST_NAME_REQUIRED")
        @Size(max = 100, message = "LAST_NAME_TOO_LONG")
        String lastName,

        @NotBlank(message = "CODE_APOGEE_REQUIRED")
        @Size(max = 20, message = "CODE_APOGEE_TOO_LONG")
        String codeApoge,

        @NotBlank(message = "EMAIL_REQUIRED")
        @Email(message = "EMAIL_INVALID")
        String email,

        @NotBlank(message = "PHONE_REQUIRED")
        @Pattern(regexp = "^\\+?[0-9 .-]{8,30}$", message = "PHONE_INVALID")
        String phoneNumber,

        @NotBlank(message = "PASSWORD_REQUIRED")
        @Size(min = 8, max = 72, message = "PASSWORD_LENGTH")
        String password
) {
}
