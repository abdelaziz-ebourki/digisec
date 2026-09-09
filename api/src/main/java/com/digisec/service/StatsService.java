package com.digisec.service;

import com.digisec.dto.StatsResponse;
import com.digisec.repository.ActivityRepository;
import com.digisec.repository.PostRepository;
import com.digisec.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsService {

    private final ActivityRepository activityRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public StatsService(ActivityRepository activityRepository,
                        PostRepository postRepository,
                        UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        return new StatsResponse(
                activityRepository.count(),
                postRepository.count(),
                userRepository.count());
    }
}
