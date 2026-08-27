package com.digisec.service;

import com.digisec.dto.PostRequest;
import com.digisec.dto.PostResponse;
import com.digisec.entity.Post;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.repository.PostRepository;
import com.digisec.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;
    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private PostService postService;

    private User author;
    private User admin;
    private User stranger;
    private Post post;

    @BeforeEach
    void setUp() {
        author = user(1L, "author@digisec.local", Role.USER);
        admin = user(2L, "admin@digisec.local", Role.ADMIN);
        stranger = user(3L, "stranger@digisec.local", Role.USER);
        post = Post.builder()
                .id(10L)
                .author(author)
                .title("Hello DIGISEC")
                .content("First forum post")
                .createdAt(LocalDateTime.now())
                .build();
    }

    private User user(Long id, String email, Role role) {
        return User.builder()
                .id(id)
                .firstName("Test")
                .email(email)
                .role(role)
                .verified(true)
                .build();
    }

    @Test
    void createsPostWithAuthenticatedAuthor() {
        when(currentUserProvider.getUser("author@digisec.local")).thenReturn(author);
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post toSave = invocation.getArgument(0);
            return Post.builder()
                    .id(11L)
                    .author(toSave.getAuthor())
                    .title(toSave.getTitle())
                    .content(toSave.getContent())
                    .createdAt(LocalDateTime.now())
                    .build();
        });

        PostResponse response = postService.create(
                new PostRequest("Hello DIGISEC", "First forum post"), "author@digisec.local");

        assertThat(response.id()).isEqualTo(11L);
        assertThat(response.authorId()).isEqualTo(1L);
        assertThat(response.authorFirstName()).isEqualTo("Test");
    }

    @SuppressWarnings("unchecked")
    @Test
    void listsPostsNewestFirst() {
        when(postRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(post), PageRequest.of(0, 10), 1));

        var result = postService.list(0, 10);

        assertThat(result.content()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.content().get(0).title()).isEqualTo("Hello DIGISEC");
    }

    @Test
    void getsSinglePost() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        PostResponse response = postService.get(10L);

        assertThat(response.title()).isEqualTo("Hello DIGISEC");
    }

    @Test
    void missingPostYields404() {
        when(postRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.get(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Post not found");
    }

    @Test
    void authorCanDeleteOwnPost() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(currentUserProvider.getUser("author@digisec.local")).thenReturn(author);

        postService.delete(10L, "author@digisec.local");

        verify(postRepository).delete(post);
    }

    @Test
    void adminCanDeleteAnyPost() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(currentUserProvider.getUser("admin@digisec.local")).thenReturn(admin);

        postService.delete(10L, "admin@digisec.local");

        verify(postRepository).delete(post);
    }

    @Test
    void strangerCannotDeletePost() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(currentUserProvider.getUser("stranger@digisec.local")).thenReturn(stranger);

        assertThatThrownBy(() -> postService.delete(10L, "stranger@digisec.local"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not allowed");

        verify(postRepository, org.mockito.Mockito.never()).delete(any());
    }
}
