package com.digisec.service;

import com.digisec.dto.StatsResponse;
import com.digisec.repository.ActivityRepository;
import com.digisec.repository.PostRepository;
import com.digisec.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    private StatsService statsService;

    @BeforeEach
    void setUp() {
        statsService = new StatsService(activityRepository, postRepository, userRepository);
    }

    @Test
    void returnsEntityCounts() {
        when(activityRepository.count()).thenReturn(6L);
        when(postRepository.count()).thenReturn(5L);
        when(userRepository.count()).thenReturn(5L);

        StatsResponse stats = statsService.getStats();

        assertThat(stats.activities()).isEqualTo(6L);
        assertThat(stats.posts()).isEqualTo(5L);
        assertThat(stats.members()).isEqualTo(5L);
        verify(activityRepository).count();
        verify(postRepository).count();
        verify(userRepository).count();
    }
}
