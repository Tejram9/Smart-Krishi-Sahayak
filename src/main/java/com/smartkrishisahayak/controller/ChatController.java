package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.request.ChatMessageRequest;
import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.ChatMessageResponse;
import com.smartkrishisahayak.dto.response.ChatResponse;
import com.smartkrishisahayak.dto.response.ChatSessionResponse;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for authenticated chat session and message management.
 *
 * All endpoints require a valid JWT Bearer token.
 * The authenticated user is always resolved from the Spring Security context
 * via @AuthenticationPrincipal - no userId is ever accepted from the client.
 * Session ownership is enforced in the service layer for every operation.
 */
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Create a new chat session for the authenticated farmer.
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> createSession(
            @AuthenticationPrincipal UserPrincipal principal) {
        ChatSessionResponse session = chatService.createSession(principal);
        return new ResponseEntity<>(
                ApiResponse.success("Chat session created successfully.", session),
                HttpStatus.CREATED
        );
    }

    /**
     * Send a message to an existing session. Returns both the saved user
     * message and the AI-generated response.
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @PathVariable Long sessionId,
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ChatResponse response = chatService.sendMessage(sessionId, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully.", response));
    }

    /**
     * List all chat sessions belonging to the authenticated user,
     * ordered by most recently updated first.
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> getUserSessions(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ChatSessionResponse> sessions = chatService.getUserSessions(principal);
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully.", sessions));
    }

    /**
     * Retrieve all messages in a specific session in chronological order.
     * Access is denied if the session does not belong to the authenticated user.
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getSessionMessages(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ChatMessageResponse> messages = chatService.getSessionMessages(sessionId, principal);
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully.", messages));
    }
}