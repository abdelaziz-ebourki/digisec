package com.digisec.service;

import com.digisec.dto.PagedResponse;
import com.digisec.dto.PostRequest;
import com.digisec.dto.PostResponse;
import com.digisec.entity.Post;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.repository.PostRepository;
import com.digisec.security.CurrentUserProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CurrentUserProvider currentUserProvider;

    public PostService(PostRepository postRepository, CurrentUserProvider currentUserProvider) {
        this.postRepository = postRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public PostResponse create(PostRequest request, String authorEmail) {
        User author = currentUserProvider.getUser(authorEmail);
        Post post = Post.builder()
                .author(author)
                .title(request.title())
                .content(request.content())
                .build();
        return toResponse(postRepository.save(post));
    }

    @Transactional(readOnly = true)
    public PagedResponse<PostResponse> list(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));
        Page<PostResponse> result = postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PostService::toResponse);
        return new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public PostResponse get(Long id) {
        return toResponse(findPost(id));
    }

    @Transactional
    public void delete(Long id, String requesterEmail) {
        Post post = findPost(id);
        requireOwnerOrAdmin(post.getAuthor(), requesterEmail);
        postRepository.delete(post);
    }

    private void requireOwnerOrAdmin(User author, String requesterEmail) {
        User requester = currentUserProvider.getUser(requesterEmail);
        boolean isOwner = author.getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to delete this resource");
        }
    }

    private Post findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
    }

    private static PostResponse toResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getAuthor().getId(),
                post.getAuthor().getFirstName(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt());
    }
}
