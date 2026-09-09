package com.digisec.dto;

public record StatsResponse(
        long activities,
        long posts,
        long members) {
}
