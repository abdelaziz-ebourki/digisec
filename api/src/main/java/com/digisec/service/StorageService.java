package com.digisec.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String store(MultipartFile file);

    StoredFile load(String storedName);

    void delete(String storedName);
}
