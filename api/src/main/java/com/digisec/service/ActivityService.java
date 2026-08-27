package com.digisec.service;

import com.digisec.dto.ActivityResponse;
import com.digisec.entity.Activity;
import com.digisec.exception.InvalidFileException;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.repository.ActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
public class ActivityService {

    private static final int MAX_MESSAGE_LENGTH = 5000;

    private final ActivityRepository activityRepository;
    private final StorageService storageService;

    public ActivityService(ActivityRepository activityRepository, StorageService storageService) {
        this.activityRepository = activityRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> list() {
        return activityRepository.findAllByOrderByActivityDateDesc().stream()
                .map(ActivityService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ActivityResponse get(Long id) {
        return toResponse(findActivity(id));
    }

    @Transactional
    public ActivityResponse create(String title, LocalDate activityDate, String message, MultipartFile image) {
        if (title == null || title.isBlank()) {
            throw new InvalidFileException("Title is required");
        }
        if (activityDate == null) {
            throw new InvalidFileException("Activity date is required");
        }
        if (message == null || message.isBlank()) {
            throw new InvalidFileException("Message is required");
        }
        if (message.length() > MAX_MESSAGE_LENGTH) {
            throw new InvalidFileException("Message must not exceed " + MAX_MESSAGE_LENGTH + " characters");
        }
        String imagePath = image != null && !image.isEmpty() ? storageService.store(image) : null;

        Activity activity = Activity.builder()
                .title(title.trim())
                .activityDate(activityDate)
                .message(message.trim())
                .imagePath(imagePath)
                .build();
        return toResponse(activityRepository.save(activity));
    }

    @Transactional
    public void delete(Long id) {
        Activity activity = findActivity(id);
        if (activity.getImagePath() != null) {
            storageService.delete(activity.getImagePath());
        }
        activityRepository.delete(activity);
    }

    @Transactional(readOnly = true)
    public StoredFile loadImage(Long id) {
        Activity activity = findActivity(id);
        if (activity.getImagePath() == null) {
            throw new ResourceNotFoundException("Activity has no image");
        }
        return storageService.load(activity.getImagePath());
    }

    private Activity findActivity(Long id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found: " + id));
    }

    private static ActivityResponse toResponse(Activity activity) {
        return new ActivityResponse(
                activity.getId(),
                activity.getTitle(),
                activity.getActivityDate(),
                activity.getMessage(),
                activity.getImagePath() == null ? null : "/api/v1/activities/" + activity.getId() + "/image");
    }
}
