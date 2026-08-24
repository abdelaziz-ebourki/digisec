package com.digisec.service;

import com.digisec.dto.CommentRequest;
import com.digisec.dto.CommentResponse;
import com.digisec.entity.Comment;
import com.digisec.entity.Post;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.repository.CommentRepository;
import com.digisec.repository.PostRepository;
import com.digisec.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private CommentService commentService;

    private Post post;
    private User author;

    @BeforeEach
    void setUp() {
        User postAuthor = User.builder().id(1L).firstName("Poster").email("p@digisec.local").role(Role.USER).build();
        author = User.builder().id(2L).firstName("Commenter").email("c@digisec.local").role(Role.USER).build();
        post = Post.builder().id(10L).author(postAuthor).title("Post").content("Content").build();
    }

    @Test
    void addsCommentToExistingPost() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(currentUserProvider.getUser("c@digisec.local")).thenReturn(author);
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment toSave = invocation.getArgument(0);
            return Comment.builder()
                    .id(20L)
                    .post(toSave.getPost())
                    .author(toSave.getAuthor())
                    .commentText(toSave.getCommentText())
                    .createdAt(LocalDateTime.now())
                    .build();
        });

        CommentResponse response = commentService.add(10L, new CommentRequest("Nice!"), "c@digisec.local");

        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.postId()).isEqualTo(10L);
        assertThat(response.authorFirstName()).isEqualTo("Commenter");
    }

    @Test
    void addingCommentToMissingPostYields404() {
        when(postRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.add(99L, new CommentRequest("Hi"), "c@digisec.local"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listsCommentsOfExistingPost() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        Comment comment = Comment.builder()
                .id(20L)
                .post(post)
                .author(author)
                .commentText("Nice!")
                .createdAt(LocalDateTime.now())
                .build();
        when(commentRepository.findByPostIdOrderByCreatedAtAsc(10L)).thenReturn(List.of(comment));

        List<CommentResponse> comments = commentService.list(10L);

        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).commentText()).isEqualTo("Nice!");
    }

    @Test
    void authorCanDeleteOwnComment() {
        Comment comment = Comment.builder().id(20L).post(post).author(author).commentText("Nice!").build();
        when(commentRepository.findById(20L)).thenReturn(Optional.of(comment));
        when(currentUserProvider.getUser("c@digisec.local")).thenReturn(author);

        commentService.delete(20L, "c@digisec.local");

        verify(commentRepository).delete(comment);
    }

    @Test
    void strangerCannotDeleteComment() {
        User stranger = User.builder().id(3L).firstName("Stranger").email("s@digisec.local").role(Role.USER).build();
        Comment comment = Comment.builder().id(20L).post(post).author(author).commentText("Nice!").build();
        when(commentRepository.findById(20L)).thenReturn(Optional.of(comment));
        when(currentUserProvider.getUser("s@digisec.local")).thenReturn(stranger);

        assertThatThrownBy(() -> commentService.delete(20L, "s@digisec.local"))
                .isInstanceOf(AccessDeniedException.class);

        verify(commentRepository, never()).delete(any());
    }
}
