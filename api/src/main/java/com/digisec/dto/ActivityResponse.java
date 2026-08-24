package com.digisec.dto;

import java.time.LocalDate;

public record ActivityResponse(
        Long id,
        String title,
        LocalDate activityDate,
        String message,
        String imageUrl
) {
}
