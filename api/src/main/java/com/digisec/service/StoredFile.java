package com.digisec.service;

import org.springframework.core.io.Resource;

public record StoredFile(Resource resource, String contentType) {
}
