package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.ChatMessageRequest;
import com.smartkrishisahayak.dto.response.ChatMessageResponse;
import com.smartkrishisahayak.dto.response.ChatResponse;
import com.smartkrishisahayak.dto.response.ChatSessionResponse;
import com.smartkrishisahayak.security.UserPrincipal;

import java.util.List;

/**
 * Service interface for chat session and message management.
 * All operations are scoped to the authenticated user from the security context.
 * Session ownership is always verified before data access.
 */
public interface ChatService {

    /**
     * Create a new chat session for the authenticated farmer.
     */
    ChatSessionResponse createSession(UserPrincipal principal);

    /**
     * Send a message to an existing session. Verifies ownership.
     * Saves both the user message and AI response atomically.
     */
    ChatResponse sendMessage(Long sessionId, ChatMessageRequest request, UserPrincipal principal);

    /**
     * Retrieve all chat sessions belonging to the authenticated user,
     * ordered by most recently updated first.
     */
    List<ChatSessionResponse> getUserSessions(UserPrincipal principal);

    /**
     * Retrieve all messages from a specific session in chronological order.
     * Verifies that the session belongs to the authenticated user.
     */
    List<ChatMessageResponse> getSessionMessages(Long sessionId, UserPrincipal principal);
}