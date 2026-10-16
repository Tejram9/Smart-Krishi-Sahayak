# Smart Krishi Sahayak: Team Responsibility Division & Collaboration Matrix

## 1. 5-Member CSE Student Team Responsibilities

To ensure equal contribution, clarity of ownership, and smooth integration for project viva presentation, the development tasks are partitioned across five roles:

```
+------------------------------------------------------------------------------------------------------------------+
|                                            PROJECT DEVELOPMENT TEAM                                              |
+------------------------------+------------------------------+----------------------------------------------------+
| Member 1: Frontend & UI/UX   | Member 2: Backend & Security | Member 3: Database & Content                       |
| • Responsive Web Pages       | • Spring Boot Core           | • MySQL 8.0 & 3NF Schemas                          |
| • Bootstrap 5 & Custom CSS   | • Security & Stateless JWT   | • JPA Entities & Repositories                      |
| • i18n Client Framework      | • Farmer REST APIs           | • Verified Agriculture Content                     |
| • Farmer Portal & Navigation | • Bean Validation & Errors   | • Data Fixtures & Query Tuning                     |
+------------------------------+------------------------------+----------------------------------------------------+
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
+----------------------------------------------+ +-----------------------------------------------------------------+
| Member 4: AI & Advisory Engine               | | Member 5: Admin Analytics, QA & DevOps                          |
| • AiChatService & Gemini LLM Engine          | | • Admin Control Panel & User Management                         |
| • Prompt Engineering & Trilingual Guardrails | | • Chart.js Real-time System Analytics Visualizer               |
| • Weather Advisory & Disease Diagnostic Logic| | • Automated JUnit 5 / Mockito Test Suite                        |
| • Chatbot History & Session Management       | | • CI/CD Deployment, System Docs & Viva Presentation Defense     |
+----------------------------------------------+ +-----------------------------------------------------------------+
```

---

## 2. Detailed Member Task Allocations

### 🎨 Member 1: Website UI & Frontend Lead
- **Primary Domain:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Fetch API integration, Responsive UX.
- **Key Responsibilities:**
  1. Build responsive public pages (`index.html`, `about.html`, `login.html`, `register.html`, `contact.html`).
  2. Build farmer portal interface (`farmer-dashboard.html`, `profile.html`, `crop-info.html`, `my-farm.html`).
  3. Implement client-side i18n language switcher framework (`i18n.js`, `en.json`, `mr.json`, `hi.json`).
  4. Ensure mobile responsiveness across screens (360px to 1920px) and agricultural design system tokens.
  5. Handle client-side form validation, loading spinners, toast alerts, and empty states.

---

### ⚙️ Member 2: Spring Boot Backend & Security Lead
- **Primary Domain:** Java 17, Spring Boot 3.x, Spring Security 6, JWT, REST Architecture.
- **Key Responsibilities:**
  1. Setup Maven project structure (`pom.xml`) and dependency management.
  2. Implement Spring Security configuration (`SecurityConfig`, `JwtAuthenticationFilter`, `JwtTokenProvider`).
  3. Develop Authentication APIs (`AuthController`, `AuthService`, DTOs, BCrypt hashing).
  4. Build Farmer Profile APIs (`FarmerProfileController`, `FarmerProfileService`).
  5. Enforce Global Exception Handling (`GlobalExceptionHandler`), CORS policy, and Bean Input Validation (`@Valid`).

---

### 🗄️ Member 3: Database & Agricultural Content Management Lead
- **Primary Domain:** MySQL 8.0, Spring Data JPA, Hibernate, Schema Normalization, Content Engineering.
- **Key Responsibilities:**
  1. Design normalized 3NF MySQL tables (`users`, `farmer_profiles`, `crops`, `chat_sessions`, `chat_messages`, `verified_agriculture_content`).
  2. Implement Java JPA Entities, Enums, and Repository interfaces (`UserRepository`, `CropRepository`, `FarmerProfileRepository`).
  3. Build Crop & Content Services (`CropService`, `CropController`) with localized agricultural recommendations.
  4. Build and maintain initial SQL migration scripts and sample agricultural seed data (`schema.sql`, `data.sql`).
  5. Optimize database indexing, transaction management (`@Transactional`), and foreign key constraints.

---

### 🤖 Member 4: AI Chatbot & Advisory Engine Lead
- **Primary Domain:** AI Prompt Engineering, Google Gemini / LLM API Integration, Advisory Algorithms.
- **Key Responsibilities:**
  1. Implement provider-independent `AiChatService` interface and implementations (`GeminiAiChatServiceImpl`, `MockAiChatServiceImpl`).
  2. Implement Chatbot REST Controllers, Session Repositories (`ChatbotController`, `ChatService`).
  3. Formulate agricultural prompt guardrails for native languages (Marathi, Hindi, English).
  4. Build interactive Chatbot UI (`chatbot.html`, `chatbot.js`) with markdown parsing, suggested prompts, and voice support.
  5. Develop crop disease advisory rules and weather-based guidance logic (`CropDiseaseAdvisoryService`).

---

### 📊 Member 5: Admin Analytics, QA & DevOps Lead
- **Primary Domain:** Admin Control Panels, Chart.js Visualization, JUnit 5 / Mockito, DevOps & Docs.
- **Key Responsibilities:**
  1. Build Admin Controllers and Services (`AdminController`, `AdminService`) for user & system audits.
  2. Build Admin Dashboard UI (`admin-dashboard.html`, `admin.js`) with responsive tables and management actions.
  3. Implement system usage analytics endpoint and integrate Chart.js for real-time visual graphs.
  4. Lead automated unit and integration tests (`JUnit 5`, `Mockito`) ensuring robust test coverage.
  5. Manage application packaging (`mvn clean package`), environment configuration, system documentation, and academic viva defense presentation.

---

## 3. Mandatory Collaboration Touchpoints

To prevent isolated development blocks, all five members must collaborate at these critical project touchpoints:

| Touchpoint Phase | Collaborating Members | Objective |
|---|---|---|
| **API Contract Definition** | Members 1, 2, 3, 4, 5 | Finalize JSON request/response DTO structures before writing UI or Controller code. |
| **Authentication Handshake** | Members 1 & 2 | Verify JWT token storage in browser `localStorage` and header injection in Fetch requests. |
| **Database & Repository Integration** | Members 2 & 3 | Align entity relations with REST DTO serialization and service business rules. |
| **Chatbot Data Integration** | Members 1 & 4 | Connect Chat UI Fetch calls with `ChatbotController` and session history APIs. |
| **Admin Analytics Setup** | Members 5, 3 & 1 | Align `AdminStatsResponse` JSON payload with Chart.js canvas rendering and UI widgets. |
| **End-to-End Testing & Viva Prep** | All 5 Members | Execute full manual test matrix, conduct mock viva Q&A, and verify final presentation. |
