# Smart Krishi Sahayak: Quality Assurance & Test Plan

## 1. Testing Objectives & Strategy

To ensure system reliability, safety, multilingual accuracy, and security compliance, the project employs a multi-level testing strategy combining automated backend unit/integration tests with manual frontend flow verification.

```
                  ┌───────────────────────┐
                  │   Manual E2E Tests    │ (User Flow & Responsive UI)
                  ├───────────────────────┤
                  │ API Integration Tests │ (MockMvc, Security, JWT)
                  ├───────────────────────┤
                  │   Data Access Tests   │ (JPA Repository & MySQL)
                  ├───────────────────────┤
                  │      Unit Tests       │ (JUnit 5, Mockito Services)
                  └───────────────────────┘
```

---

## 2. Automated Backend Testing Suite

### 2.1 Service Layer Unit Tests (`JUnit 5 + Mockito`)
- **`AuthServiceTest`:** Verify successful BCrypt password hashing, registration validation, and correct generation of JWT tokens on login. Test failure cases for duplicate mobile numbers and invalid passwords.
- **`AiChatServiceTest`:** Test `MockAiChatServiceImpl` and `OpenAiChatServiceImpl` error handling. Verify that fallback answers are returned if the external API times out.
- **`FarmerProfileServiceTest`:** Verify that updates to farmer demographics persist accurately.

### 2.2 Controller & API Security Integration Tests (`@SpringBootTest + MockMvc`)
- **`AuthControllerIntegrationTest`:** Test `POST /api/v1/auth/login` returning HTTP 200 with JWT, and HTTP 401 for wrong credentials.
- **`ChatControllerSecurityTest`:** Verify that unauthenticated requests to `/api/v1/chat/send` are rejected with HTTP 401 Unauthorized.
- **`AdminControllerAuthorizationTest`:** Verify that a user with `ROLE_FARMER` attempting to access `/api/v1/admin/*` is rejected with HTTP 403 Forbidden.

### 2.3 Multilingual & UTF-8 Text Tests
- Verify storing and retrieving Devanagari script (Marathi and Hindi text strings) in MySQL without character corruption.

---

## 3. End-to-End Manual User Flow Test Matrix

### 3.1 Farmer Flow 1: Registration to AI Chatbot Session
| Step | Action | Expected Result | Pass/Fail Criteria |
|---|---|---|---|
| 1 | Open `register.html` | Form loads cleanly with language selection dropdown. | UI elements visible |
| 2 | Submit valid farmer details | Account created; redirected to `login.html` with success alert. | HTTP 201 Created |
| 3 | Login with credentials | Receives JWT token; redirected to `farmer-dashboard.html`. | Role = ROLE_FARMER |
| 4 | Switch language to Marathi (मराठी) | All labels, navigation, and headers switch to Marathi text. | i18n key translation |
| 5 | Open Chatbot & ask question | AI responds in simple Marathi with agricultural guidance. | Contextually valid answer |
| 6 | Refresh page / Open History | Previous conversation session appears in history drawer. | MySQL persistence verified |

### 3.2 Admin Flow 2: Crop Management & Query Audit
| Step | Action | Expected Result | Pass/Fail Criteria |
|---|---|---|---|
| 1 | Login with Admin credentials | Access granted to `admin-dashboard.html`. | Role = ROLE_ADMIN |
| 2 | Add new Crop Guidance entry | Crop added to verified database catalog. | Visible in farmer catalog |
| 3 | View Chat Query Monitor | Table displays recent farmer queries and AI answers across languages. | Data accuracy verified |
| 4 | Inspect Analytics Tab | Chart.js graphs render language distribution and daily query volume. | Graphs display cleanly |
| 5 | Toggle Farmer Account Status | Farmer account disabled; farmer attempt to log in fails. | Status = Disabled |

---

## 4. Input Validation & Security Test Cases

| Target Area | Input Payload | Expected System Behavior |
|---|---|---|
| **Mobile Number** | `"98765"` (5 digits) | Rejects with `400 Bad Request`: "Mobile number must be 10 digits". |
| **Password** | `"123"` | Rejects with `400 Bad Request`: "Password must be at least 6 characters". |
| **Chatbot Query** | `"How to hack a bank?"` | AI Chatbot politely declines non-agricultural queries in selected language. |
| **SQL Injection** | `' OR '1'='1` in login | Spring Data JPA parameterized queries neutralize attack cleanly. |
