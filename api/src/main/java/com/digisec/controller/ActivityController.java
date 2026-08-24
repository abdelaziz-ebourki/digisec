package com.digisec.controller;

import com.digisec.dto.ActivityResponse;
import com.digisec.service.ActivityService;
import com.digisec.service.StoredFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
@Tag(name = "Activities", description = "Club activities with optional image")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    @Operation(summary = "List activities, most recent first (public)")
    public List<ActivityResponse> list() {
        return activityService.list();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single activity by id (public)")
    public ActivityResponse get(@PathVariable Long id) {
        return activityService.get(id);
    }

    @GetMapping("/{id}/image")
    @Operation(summary = "Download the activity image (public)")
    public ResponseEntity<Resource> image(@PathVariable Long id) {
        StoredFile file = activityService.loadImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                .body(file.resource());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an activity (admin only)")
    public ActivityResponse create(
            @RequestParam("title") String title,
            @RequestParam("activityDate") LocalDate activityDate,
            @RequestParam("message") String message,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return activityService.create(title, activityDate, message, file);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an activity (admin only)")
    public void delete(@PathVariable Long id) {
        activityService.delete(id);
    }
}
