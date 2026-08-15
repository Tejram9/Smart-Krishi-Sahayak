package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.request.ChatMessageRequest;
import com.smartkrishisahayak.dto.response.ChatMessageResponse;
import com.smartkrishisahayak.dto.response.ChatResponse;
import com.smartkrishisahayak.dto.response.ChatSessionResponse;
import com.smartkrishisahayak.dto.response.SafetyAssessment;
import com.smartkrishisahayak.entity.ChatMessage;
import com.smartkrishisahayak.entity.ChatSession;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.MessageSender;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.ChatMessageRepository;
import com.smartkrishisahayak.repository.ChatSessionRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.AgricultureKnowledgeService;
import com.smartkrishisahayak.service.AgricultureSafetyService;
import com.smartkrishisahayak.service.AiChatService;
import com.smartkrishisahayak.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);
    private static final DateTimeFormatter SESSION_TITLE_FORMATTER =
            DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final AiChatService aiChatService;
    private final AgricultureKnowledgeService agricultureKnowledgeService;
    private final AgricultureSafetyService agricultureSafetyService;

    @Autowired
    public ChatServiceImpl(ChatSessionRepository chatSessionRepository,
                           ChatMessageRepository chatMessageRepository,
                           UserRepository userRepository,
                           AiChatService aiChatService,
                           AgricultureKnowledgeService agricultureKnowledgeService,
                           AgricultureSafetyService agricultureSafetyService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.aiChatService = aiChatService;
        this.agricultureKnowledgeService = agricultureKnowledgeService;
        this.agricultureSafetyService = agricultureSafetyService;
    }

    @Override
    @Transactional
    public ChatSessionResponse createSession(UserPrincipal principal) {
        log.debug("Creating new chat session for user ID={}", principal.getId());
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        String title = "Chat Session - " + LocalDateTime.now().format(SESSION_TITLE_FORMATTER);
        PreferredLanguage language = user.getPreferredLanguage() != null
                ? user.getPreferredLanguage()
                : PreferredLanguage.EN;

        ChatSession session = new ChatSession(user, title, language);
        ChatSession saved = chatSessionRepository.save(session);
        log.info("Created chat session ID={} for user ID={}", saved.getId(), principal.getId());
        return mapToSessionResponse(saved);
    }

    @Override
    @Transactional
    public ChatResponse sendMessage(Long sessionId, ChatMessageRequest request, UserPrincipal principal) {
        log.debug("User ID={} sending message to session ID={}", principal.getId(), sessionId);

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));

        if (!session.getUser().getId().equals(principal.getId())) {
            log.warn("Access denied: user ID={} attempted to access session ID={} owned by user ID={}",
                    principal.getId(), sessionId, session.getUser().getId());
            throw new AccessDeniedException("You do not have permission to access this chat session.");
        }

        PreferredLanguage language = parseLanguage(request.getLanguage());
        if (language == null) {
            language = session.getLanguage();
        }

        ChatMessage userMessage = new ChatMessage(session, MessageSender.USER, request.getMessage(), language);
        ChatMessage savedUserMessage = chatMessageRepository.save(userMessage);

        // Auto-update generic title to a concise title based on first query
        if (session.getSessionTitle() == null || session.getSessionTitle().startsWith("Chat Session -")) {
            String msg = request.getMessage().trim().replaceAll("\\r?\\n", " ");
            String displayTitle = msg.length() > 50 ? msg.substring(0, 47).trim() + "..." : msg;
            session.setSessionTitle(displayTitle);
            session.setUpdatedAt(LocalDateTime.now());
            chatSessionRepository.save(session);
        }

        // 1. Retrieve grounded agriculture context from verified knowledge base
        String verifiedContext = agricultureKnowledgeService.buildGroundedContext(request.getMessage(), language);

        // 2. Perform safety & responsible AI assessment
        SafetyAssessment safetyAssessment = agricultureSafetyService.evaluateQuery(request.getMessage(), language, verifiedContext);

        String aiText;
        if (safetyAssessment.isOffTopic()) {
            // Off-topic queries receive polite direct redirection without LLM invocation
            aiText = safetyAssessment.getDirectResponse();
        } else {
            // Generate grounded response from AI provider
            String rawAiText = aiChatService.generateResponse(request.getMessage(), language, verifiedContext);
            // Post-process & sanitize response to ensure mandatory expert referrals where appropriate
            aiText = agricultureSafetyService.sanitizeAiResponse(rawAiText, request.getMessage(), language, safetyAssessment);
        }

        ChatMessage aiMessage = new ChatMessage(session, MessageSender.AI, aiText, language);
        ChatMessage savedAiMessage = chatMessageRepository.save(aiMessage);

        return new ChatResponse(sessionId,
                mapToMessageResponse(savedUserMessage),
                mapToMessageResponse(savedAiMessage));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getUserSessions(UserPrincipal principal) {
        log.debug("Fetching sessions for user ID={}", principal.getId());
        return chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(principal.getId())
                .stream()
                .map(this::mapToSessionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getSessionMessages(Long sessionId, UserPrincipal principal) {
        log.debug("Fetching messages for session ID={}, user ID={}", sessionId, principal.getId());
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));

        if (!session.getUser().getId().equals(principal.getId())) {
            log.warn("Access denied: user ID={} attempted to read messages from session ID={}",
                    principal.getId(), sessionId);
            throw new AccessDeniedException("You do not have permission to access this chat session.");
        }

        return chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(sessionId)
                .stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    private ChatSessionResponse mapToSessionResponse(ChatSession session) {
        int messageCount = chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(session.getId()).size();
        return new ChatSessionResponse(
                session.getId(),
                session.getSessionTitle(),
                session.getLanguage(),
                session.getCreatedAt(),
                session.getUpdatedAt(),
                messageCount
        );
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getSender(),
                message.getMessageText(),
                message.getLanguage(),
                message.getTimestamp()
        );
    }

    private PreferredLanguage parseLanguage(String langStr) {
        if (langStr == null || langStr.trim().isEmpty()) {
            return null;
        }
        try {
            return PreferredLanguage.valueOf(langStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.debug("Unknown language value '{}', using session default.", langStr);
            return null;
        }
    }
}