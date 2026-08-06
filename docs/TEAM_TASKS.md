# Smart Krishi Sahayak: Team Responsibility Division & Collaboration Matrix

## 1. 4-Member CSE Student Team Responsibilities

To ensure equal contribution, clarity of ownership, and smooth integration for project viva presentation, the development tasks are partitioned across four roles:

```
+-----------------------------------------------------------------------------------+
|                           PROJECT DEVELOPMENT TEAM                                |
+-------------------------+-------------------------+-------------------------------+
| Member 1: Frontend UI   | Member 2: Backend Auth  | Member 3: Database & Admin    |
| • Responsive Web Pages  | • Spring Boot Core      | • MySQL & JPA Entities        |
| • Bootstrap 5 & CSS     | • Security & JWT        | • Admin Dashboard APIs        |
| • i18n Client Framework | • Farmer REST APIs      | • Chart.js Integration        |
+-------------------------+-------------------------+-------------------------------+
                                      │
                                      ▼
                        +---------------------------+
                        | Member 4: AI & Quality    |
                        | • AiChatService Engine    |
                        | • Prompt Engineering      |
                        | • Testing & QA Matrix     |
                        | • Deployment & Docs       |
                        +---------------------------+
```

---

## 2. Detailed Member Task Allocations

### 🎨 Member 1: Website UI & Frontend Lead
- **Primary Domain:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Fetch API integration.
- **Key Responsibilities:**
  1. Build responsive public pages (`index.html`, `about.html`, `login.html`, `register.html`, `contact.html`).
  2. Build farmer portal interface (`farmer-dashboard.html`, `profile.html`, `crop-info.html`).
  3. Implement client-side i18n language switcher framework (`i18n.js`, `en.json`, `mr.json`, `hi.json`).
  4. Ensure mobile responsiveness across screens (360px to 1920px).
  5. Handle loading spinners, error popups, and empty states.

---

### ⚙️ Member 2: Spring Boot Backend & Security Lead
- **Primary Domain:** Java 17, Spring Boot, Spring Security, JWT, REST Architecture.
- **Key Responsibilities:**
  1. Setup Maven project structure (`pom.xml`) and dependency management.
  2. Implement Spring Security configuration (`SecurityConfig`, `JwtAuthenticationFilter`, `JwtTokenProvider`).
  3. Develop Authentication APIs (`AuthController`, `AuthService`, DTOs).
  4. Build Farmer Profile APIs (`FarmerProfileController`, `FarmerProfileService`).
  5. Enforce Global Exception Handling (`GlobalExceptionHandler`) and Bean Input Validation (`@Valid`).

---

### 🗄️ Member 3: Database, JPA & Admin Module Lead
- **Primary Domain:** MySQL 8.0, Spring Data JPA, Admin REST APIs, Chart.js Integration.
- **Key Responsibilities:**
  1. Design normalized MySQL tables (`users`, `farmer_profiles`, `crops`, `chat_sessions`, `chat_messages`, `verified_agriculture_content`).
  2. Implement Java JPA Entities, Enums, and Repository interfaces (`UserRepository`, `CropRepository`, etc.).
  3. Build Admin Controllers and Services (`AdminController`, `AdminService`, `CropService`).
  4. Build Admin Dashboard UI (`admin-dashboard.html`, `admin.js`).
  5. Implement system usage analytics endpoint and integrate Chart.js for data visualization.

---

### 🤖 Member 4: AI Chatbot, Multilingual Engine & QA Lead
- **Primary Domain:** AI Prompt Engineering, External LLM API Integration, Testing, Documentation.
- **Key Responsibilities:**
  1. Implement provider-independent `AiChatService` interface and implementations (`MockAiChatServiceImpl`, `OpenAiChatServiceImpl`).
  2. Implement Chatbot REST Controllers and Session Repositories (`ChatbotController`, `ChatService`).
  3. Formulate agricultural prompt guardrails (Marathi, Hindi, English).
  4. Build interactive Chatbot UI (`chatbot.html`, `chat.js`) with auto-scroll and history drawer.
  5. Lead automated backend unit tests (`JUnit 5`, `Mockito`) and maintain project documentation files.

---

## 3. Mandatory Collaboration Touchpoints

To prevent isolated development blocks, all four members must collaborate at these critical project touchpoints:

| Touchpoint Phase | Collaborating Members | Objective |
|---|---|---|
| **API Contract Definition** | Members 1, 2, 3, 4 | Finalize JSON request/response DTO structures before writing UI or Controller code. |
| **Authentication Handshake** | Members 1 & 2 | Verify JWT token storage in browser `localStorage` and header injection in Fetch requests. |
| **Chatbot Data Integration** | Members 1 & 4 | Connect Chat UI Fetch calls with `ChatbotController` and session history APIs. |
| **Admin Analytics Setup** | Members 3 & 1 | Align `AdminStatsResponse` JSON payload with Chart.js canvas rendering. |
| **End-to-End Testing & Viva Prep** | All Members | Execute full manual test matrix, conduct mock viva Q&A, and verify final presentation. |
