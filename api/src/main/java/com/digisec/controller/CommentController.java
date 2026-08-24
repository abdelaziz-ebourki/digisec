package com.digisec.controller;

import com.digisec.dto.CommentRequest;
import com.digisec.dto.CommentResponse;
import com.digisec.service.CommentService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Forum comments", description = "Comments attached to forum posts")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/posts/{postId}/comments")
    @Operation(summary = "List comments of a post, oldest first (public)")
    public List<CommentResponse> list(@PathVariable Long postId) {
        return commentService.list(postId);
    }

    @PostMapping("/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Comment on a post (authenticated users)")
    public CommentResponse add(@PathVariable Long postId,
                               @Valid @RequestBody CommentRequest request,
                               @AuthenticationPrincipal UserDetails principal) {
        return commentService.add(postId, request, principal.getUsername());
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a comment (author or admin)")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails principal) {
        commentService.delete(id, principal.getUsername());
    }
}
