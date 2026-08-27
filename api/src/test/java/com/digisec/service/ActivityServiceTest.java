package com.digisec.service;

import com.digisec.dto.ActivityResponse;
import com.digisec.entity.Activity;
import com.digisec.exception.InvalidFileException;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.repository.ActivityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private StorageService storageService;

    private ActivityService activityService;

    @BeforeEach
    void setUp() {
        activityService = new ActivityService(activityRepository, storageService);
    }

    private MockMultipartFile jpeg() {
        return new MockMultipartFile("file", "event.jpg", "image/jpeg", new byte[]{1, 2, 3});
    }

    @Test
    void createsActivityWithStoredImage() {
        when(storageService.store(any())).thenReturn("uuid.jpg");
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> {
            Activity toSave = invocation.getArgument(0);
            return Activity.builder().id(7L)
                    .title(toSave.getTitle())
                    .activityDate(toSave.getActivityDate())
                    .message(toSave.getMessage())
                    .imagePath(toSave.getImagePath())
                    .build();
        });

        ActivityResponse response = activityService.create(
                "Hackathon 2026", LocalDate.of(2026, 10, 10), "Cyber hackathon", jpeg());

        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.imageUrl()).isEqualTo("/api/v1/activities/7/image");
        ArgumentCaptor<Activity> captor = ArgumentCaptor.forClass(Activity.class);
        verify(activityRepository).save(captor.capture());
        assertThat(captor.getValue().getImagePath()).isEqualTo("uuid.jpg");
    }

    @Test
    void createsActivityWithoutImage() {
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> {
            Activity toSave = invocation.getArgument(0);
            return Activity.builder().id(8L)
                    .title(toSave.getTitle())
                    .activityDate(toSave.getActivityDate())
                    .message(toSave.getMessage())
                    .imagePath(null)
                    .build();
        });

        ActivityResponse response = activityService.create(
                "Workshop", LocalDate.of(2026, 11, 1), "No image here", null);

        assertThat(response.imageUrl()).isNull();
        verify(storageService, never()).store(any());
    }

    @Test
    void rejectsBlankTitle() {
        assertThatThrownBy(() -> activityService.create(" ", LocalDate.now(), "msg", null))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("Title");
    }

    @Test
    void rejectsMissingDate() {
        assertThatThrownBy(() -> activityService.create("Title", null, "msg", null))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("date");
    }

    @Test
    void rejectsBlankMessage() {
        assertThatThrownBy(() -> activityService.create("Title", LocalDate.now(), "", null))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("Message");
    }

    @Test
    void listsActivitiesWithImageUrls() {
        Activity a = Activity.builder().id(1L).title("Old").activityDate(LocalDate.of(2026, 1, 1))
                .message("m").imagePath("x.png").build();
        Activity b = Activity.builder().id(2L).title("Recent").activityDate(LocalDate.of(2026, 5, 5))
                .message("m").imagePath(null).build();
        when(activityRepository.findAllByOrderByActivityDateDesc()).thenReturn(List.of(b, a));

        List<ActivityResponse> result = activityService.list();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).title()).isEqualTo("Recent");
        assertThat(result.get(0).imageUrl()).isNull();
        assertThat(result.get(1).imageUrl()).isEqualTo("/api/v1/activities/1/image");
    }

    @Test
    void deleteRemovesStoredFileAndRow() {
        Activity a = Activity.builder().id(1L).title("T").activityDate(LocalDate.now())
                .message("m").imagePath("stored.png").build();
        when(activityRepository.findById(1L)).thenReturn(Optional.of(a));

        activityService.delete(1L);

        verify(storageService).delete("stored.png");
        verify(activityRepository).delete(a);
    }

    @Test
    void loadImageOfImagelessActivityYields404() {
        Activity a = Activity.builder().id(1L).title("T").activityDate(LocalDate.now())
                .message("m").imagePath(null).build();
        when(activityRepository.findById(1L)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> activityService.loadImage(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("no image");
    }
}
