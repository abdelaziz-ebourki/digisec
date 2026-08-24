package com.digisec.service;

import com.digisec.exception.InvalidFileException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService storage() {
        return new LocalFileStorageService(tempDir.toString());
    }

    @Test
    void storesJpegAndReturnsGeneratedName() throws Exception {
        String name = storage().store(new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[]{1, 2, 3}));

        assertThat(name).endsWith(".jpg");
        assertThat(Files.exists(tempDir.resolve(name))).isTrue();
    }

    @Test
    void rejectsUnsupportedContentType() {
        MockMultipartFile text = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[]{1});

        assertThatThrownBy(() -> storage().store(text))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("JPEG, PNG and WebP");
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[0]);

        assertThatThrownBy(() -> storage().store(empty))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("required");
    }

    @Test
    void loadsStoredFileWithImageContentType() throws Exception {
        LocalFileStorageService storage = storage();
        String name = storage.store(new MockMultipartFile("file", "pic.png", "image/png", new byte[]{9, 9}));

        StoredFile loaded = storage.load(name);

        assertThat(loaded.resource().exists()).isTrue();
        assertThat(loaded.contentType()).isEqualTo("image/png");
    }

    @Test
    void deletesStoredFile() throws Exception {
        LocalFileStorageService storage = storage();
        String name = storage.store(new MockMultipartFile("file", "pic.webp", "image/webp", new byte[]{5}));

        storage.delete(name);

        assertThat(Files.exists(tempDir.resolve(name))).isFalse();
    }

    @Test
    void rejectsPathTraversal() {
        LocalFileStorageService storage = storage();

        assertThatThrownBy(() -> storage.load("../outside.txt"))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("Invalid file path");
    }
}
