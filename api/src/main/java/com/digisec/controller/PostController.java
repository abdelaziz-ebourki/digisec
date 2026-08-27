package com.digisec.controller;

import com.digisec.dto.PagedResponse;
import com.digisec.dto.PostRequest;
import com.digisec.dto.PostResponse;
import com.digisec.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/posts")
@Tag(name = "Forum posts", description = "Discussion forum posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    @Operation(summary = "List forum posts, newest first (public)")
    public PagedResponse<PostResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.list(page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single post by id (public)")
    public PostResponse get(@PathVariable Long id) {
        return postService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a forum post (authenticated users)")
    public PostResponse create(@Valid @RequestBody PostRequest request,
                               @AuthenticationPrincipal UserDetails principal) {
        return postService.create(request, principal.getUsername());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a post (author or admin)")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails principal) {
        postService.delete(id, principal.getUsername());
    }
}
