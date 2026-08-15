# Smart Krishi Sahayak: Setup & Installation Guide

## 1. System Requirements & Prerequisites

Before setting up the project locally, verify that the following tools are installed on your machine:

| Tool | Recommended Version | Verification Command |
|---|---|---|
| **JDK (Java Development Kit)** | Java 17 LTS or 21 LTS | `java -version` |
| **Build Tool** | Apache Maven 3.8+ | `mvn -version` |
| **Database** | MySQL Server 8.0+ | `mysql --version` |
| **Version Control** | Git 2.x+ | `git --version` |
| **Code Editor** | VS Code / IntelliJ IDEA / Eclipse | - |

---

## 2. Environment Configuration (`.env.example`)

Create a `.env` file in the root of `CEP_PROJECT/` (or set Environment Variables in your system). **Never commit the `.env` file to Git.**

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=krishi_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Spring Security JWT Configuration
# Set a 256-bit secret key for HMAC-SHA256 signing
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000

# Initial Admin Seeding Configuration
ADMIN_MOBILE=9999999999
ADMIN_EMAIL=admin@smartkrishi.gov.in
ADMIN_PASSWORD=Admin@123

# Server Port
PORT=8080
```

---

## 3. Initial Admin Account Seeding
Upon application startup, if no user with `ROLE_ADMIN` exists in the database, `AdminInitializer` automatically seeds the initial administrator account using `ADMIN_MOBILE` and `ADMIN_PASSWORD`.

- **Default Admin Credentials (Dev):**
  - **Mobile Number:** `9999999999`
  - **Password:** `Admin@123`

---

## 4. Testing Authentication APIs locally

### 4.1 Farmer Registration
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ramesh Patil",
    "mobileNumber": "9876543210",
    "password": "FarmerPassword123",
    "preferredLanguage": "MR",
    "district": "Nashik"
  }'
```

### 4.2 Login to receive JWT
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumberOrEmail": "9876543210",
    "password": "FarmerPassword123"
  }'
```

### 4.3 Access Protected `/me` Profile Endpoint
```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 3. Database Initialization (MySQL)

1. Open your terminal or MySQL Workbench.
2. Log into MySQL:
   ```bash
   mysql -u root -p
   ```
3. Execute the database initialization commands:
   ```sql
   CREATE DATABASE IF NOT EXISTS krishi_db
   CHARACTER SET utf8mb4
   COLLATE utf8mb4_unicode_ci;

   SHOW DATABASES;
   ```

*(Note: Hibernate in Spring Boot will automatically create table structures upon application startup when `spring.jpa.hibernate.ddl-auto=update` is enabled).*

---

## 4. Building & Running the Application

### 4.1 Clone Repository & Navigate
```bash
git clone https://github.com/your-org/CEP_PROJECT.git
cd CEP_PROJECT
```

### 4.2 Build Spring Boot Application
```bash
mvn clean package -DskipTests
```

### 4.3 Run Spring Boot Backend & Web Server
```bash
mvn spring-boot:run
```
Alternatively, run the packaged JAR file:
```bash
java -jar target/smart-krishi-sahayak-1.0.0.jar
```

---

## 5. Accessing the Web Application & Frontend Architecture

Once the console displays `Started SmartKrishiSahayakApplication in X seconds`, open your web browser:

- **Public Landing Page:** [http://localhost:8080/](http://localhost:8080/) (or `index.html`)
- **Farmer Registration:** [http://localhost:8080/register.html](http://localhost:8080/register.html)
- **Login Page:** [http://localhost:8080/login.html](http://localhost:8080/login.html)
- **Farmer Dashboard:** [http://localhost:8080/farmer-dashboard.html](http://localhost:8080/farmer-dashboard.html) (Requires login)
- **Crop Information Hub:** [http://localhost:8080/crop-info.html](http://localhost:8080/crop-info.html) (Requires login)
- **Admin Dashboard:** [http://localhost:8080/admin-dashboard.html](http://localhost:8080/admin-dashboard.html) (Requires `ROLE_ADMIN`)

### 5.1 Frontend Structure
The frontend is built with vanilla HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, and served directly as static resources by Spring Boot:

```
src/main/resources/static/
├── index.html            # Public Landing Page
├── login.html            # Authentication Login Page
├── register.html         # Farmer Registration Page
├── farmer-dashboard.html # Farmer Profile & Services Dashboard
├── crop-info.html        # Crop Information Hub & Verified Knowledge Viewer
├── admin-dashboard.html  # Administrator Control Center
├── css/
│   ├── style.css         # Global design system & theme
│   ├── auth.css          # Login & registration layouts
│   └── dashboard.css     # Dashboard cards & grid layouts
├── js/
│   ├── api.js            # Centralized fetch client (adds Bearer token, handles 401/403)
│   ├── auth.js           # JWT token management & role redirect logic
│   ├── utils.js          # Toast notifications & button loaders
│   ├── i18n.js           # Client-side dynamic multilingual manager
│   ├── crop.js           # Crop browser, multilingual search, filter, and modal controller
│   ├── login.js          # Login page controller
│   ├── register.js       # Registration form controller
│   ├── farmer-dashboard.js # Farmer dashboard controller (GET /api/v1/auth/me)
│   └── admin-dashboard.js  # Admin dashboard controller
└── lang/
    ├── en.json           # English dictionary
    ├── mr.json           # Marathi (मराठी) dictionary
    └── hi.json           # Hindi (हिंदी) dictionary
```

### 5.2 Automated Data Seeding
Upon application startup:
1. `AdminInitializer` creates the default system administrator account if no admin exists.
2. `CropDataInitializer` seeds 10 realistic Maharashtra crop varieties (Cotton, Soybean, Sugarcane, Onion, Wheat, Turmeric, Pomegranate, Jowar, Gram, Tomato) along with published verified agriculture advisories across Pest Control, Fertilizer, Irrigation, and Sowing categories in English, Marathi, and Hindi if `cropRepository.count() == 0`.

### 5.2 Multilingual Support
The application natively supports **English (EN)**, **Marathi (MR)**, and **Hindi (HI)**. Users can switch languages dynamically from the dropdown selector on any page, and the choice is persisted in local storage.

### 5.3 Authentication & Authorization
- **JWT Storage:** Tokens are stored in browser `localStorage` upon successful authentication and sent automatically via `Authorization: Bearer <token>` headers.
- **Role Redirection:** Upon login, `ROLE_FARMER` users are routed to `farmer-dashboard.html`, while `ROLE_ADMIN` users are routed to `admin-dashboard.html`.
- **Route Guarding:** Unauthenticated requests to protected dashboards automatically redirect to `login.html`. Non-admin users attempting to access the admin dashboard are rejected and redirected.


## 6. Switching AI Modes

The application supports a pluggable AI provider architecture using the `AiChatService` interface. You can easily switch between offline development mode and the live Google Gemini API.

### 6.1 Offline / Mock AI Mode (Default for Development & Tests)
In `.env` or system environment variables:
```env
AI_PROVIDER=mock
```
Or in `application.yml`:
```yaml
app:
  ai:
    provider: mock
```
- Requires **zero external network access** and **no API keys**.
- Returns predictable, trilingual agricultural mock responses (`[MOCK AI]`).
- Automatically active in automated test suites (`@ActiveProfiles("test")`).

### 6.2 Google Gemini Live AI Mode
To use the live Google Gemini API:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set the environment variables in your `.env` file:
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
GEMINI_MODEL=gemini-1.5-flash
```
3. (Optional) Custom settings in `application.yml`:
```yaml
app:
  ai:
    provider: ${AI_PROVIDER:mock}
    gemini:
      api-key: ${GEMINI_API_KEY:}
      model: ${GEMINI_MODEL:gemini-1.5-flash}
      base-url: ${GEMINI_BASE_URL:https://generativelanguage.googleapis.com}
      timeout-ms: ${GEMINI_TIMEOUT_MS:15000}
```

### 6.3 AI Error and Fallback Behavior
- If `AI_PROVIDER=gemini` is set but `GEMINI_API_KEY` is missing or empty, the application throws an `AiServiceException` returning HTTP 503 (`AI Service unavailable: Gemini API key is not configured`) without leaking credentials or stack traces.
- Network timeouts (default 15,000 ms) prevent the application from hanging on slow provider responses.
- API keys and query parameters are stripped/masked from all error logs.

### 6.4 Knowledge-Grounded Advisory (Step 5D)
- Regardless of whether `AI_PROVIDER` is set to `mock` or `gemini`, `AgricultureKnowledgeService` deterministically scans the farmer query for crop names (English, Marathi, Hindi) and agricultural categories (Pest Control, Fertilizer Management, Sowing, Irrigation).
- Factual advisory records from `verified_agriculture_content` with `is_published = true` are injected as structured context into Gemini prompt calls.
- If no verified content is found for a specific crop/topic, Gemini explicitly provides a no-knowledge disclosure and advises contacting a local Krishi Seva Kendra, eliminating ungrounded hallucinations.


