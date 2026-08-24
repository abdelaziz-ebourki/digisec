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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final CurrentUserProvider currentUserProvider;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          CurrentUserProvider currentUserProvider) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public CommentResponse add(Long postId, CommentRequest request, String authorEmail) {
        Post post = findPost(postId);
        User author = currentUserProvider.getUser(authorEmail);
        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .commentText(request.commentText())
                .build();
        return toResponse(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> list(Long postId) {
        findPost(postId);
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(CommentService::toResponse)
                .toList();
    }

    @Transactional
    public void delete(Long commentId, String requesterEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        requireOwnerOrAdmin(comment.getAuthor(), requesterEmail);
        commentRepository.delete(comment);
    }

    private void requireOwnerOrAdmin(User author, String requesterEmail) {
        User requester = currentUserProvider.getUser(requesterEmail);
        boolean isOwner = author.getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to delete this resource");
        }
    }

    private Post findPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
    }

    private static CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFirstName(),
                comment.getCommentText(),
                comment.getCreatedAt());
    }
}
