package com.digisec.service;

import com.digisec.exception.InvalidFileException;
import com.digisec.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalFileStorageService implements StorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");

    private final Path root;

    public LocalFileStorageService(@Value("${app.storage.location:./uploads}") String location) {
        this.root = Path.of(location).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile file) {
        validate(file);
        try {
            Files.createDirectories(root);
            String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
            String extension = extensionOf(original, file.getContentType());
            String storedName = UUID.randomUUID() + extension;
            Path target = root.resolve(storedName).normalize();
            if (!target.startsWith(root)) {
                throw new InvalidFileException("Invalid file path");
            }
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return storedName;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }
    }

    @Override
    public StoredFile load(String storedName) {
        Path path = resolveSafely(storedName);
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("Image not found");
        }
        Resource resource = new FileSystemResource(path);
        return new StoredFile(resource, probeContentType(path));
    }

    @Override
    public void delete(String storedName) {
        try {
            Files.deleteIfExists(resolveSafely(storedName));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete file: " + storedName, e);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException("Only JPEG, PNG and WebP images are allowed");
        }
    }

    private Path resolveSafely(String storedName) {
        Path path = root.resolve(storedName).normalize();
        if (!path.startsWith(root)) {
            throw new InvalidFileException("Invalid file path");
        }
        return path;
    }

    private String extensionOf(String originalName, String contentType) {
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0 && dot < originalName.length() - 1) {
            String ext = originalName.substring(dot).toLowerCase();
            if (ext.matches("\\.(jpe?g|png|webp)")) {
                return ext;
            }
        }
        return switch (contentType == null ? "" : contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

    private String probeContentType(Path path) {
        try {
            return Files.probeContentType(path);
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }
}
