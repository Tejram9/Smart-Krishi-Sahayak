# Smart Krishi Sahayak: REST API Documentation

## 1. API Architecture & Standards

All endpoints adhere to **RESTful** design principles. Data interchange uses **JSON** with UTF-8 encoding. 

### 1.1 Base URL
```
http://localhost:8080/api/v1
```

### 1.2 Common HTTP Headers
- `Content-Type: application/json`
- `Accept: application/json`
- `Authorization: Bearer <JWT_TOKEN>` (for protected endpoints)

---

## 2. Standard Response Wrapper (`ApiResponse<T>`)

Every API endpoint returns a predictable envelope JSON format.

### 2.1 Success Response Payload Format
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "timestamp": "2026-08-06T14:30:00Z"
}
```

### 2.2 Error Response Payload Format
```json
{
  "success": false,
  "message": "Validation failed / Invalid credentials",
  "errors": [
    "mobileNumber: Mobile number must be exactly 10 digits",
    "password: Password must be at least 6 characters"
  ],
  "timestamp": "2026-08-06T14:30:00Z"
}
```
---

## 3. Authentication & User Management Endpoints (`/api/v1/auth`)

### 3.1 Register New Farmer Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body (`RegisterRequest`):**
```json
{
  "fullName": "Ramesh Patil",
  "mobileNumber": "9876543210",
  "email": "ramesh.patil@example.com",
  "password": "FarmerPassword123",
  "preferredLanguage": "MR",
  "district": "Nashik",
  "state": "Maharashtra",
  "taluka": "Niphad",
  "village": "Pimpalgaon",
  "landSizeAcres": 4.5,
  "primaryCrops": "Grapes, Onion",
  "soilType": "Black Soil"
}
```
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Farmer account registered successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwicm9sZSI6IlJPTEVfRkFSTUVSIiwibW9iaWxlIjoiOTg3NjU0MzIxMCIsImlhdCI6MTcyMjk4NjQwMCwiZXhwIjoxNzIzOTcyODAwfQ...",
    "tokenType": "Bearer",
    "userId": 2,
    "fullName": "Ramesh Patil",
    "mobileNumber": "9876543210",
    "email": "ramesh.patil@example.com",
    "preferredLanguage": "MR",
    "role": "ROLE_FARMER"
  },
  "timestamp": "2026-08-06T14:31:00Z"
}
```
- **Error Response (`400 Bad Request`):** Duplicate mobile/email or validation failure.

---

### 3.2 Login (Farmer / Admin)
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body (`LoginRequest`):**
```json
{
  "mobileNumberOrEmail": "9876543210",
  "password": "FarmerPassword123"
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwicm9sZSI6IlJPTEVfRkFSTUVSIiwibW9iaWxlIjoiOTg3NjU0MzIxMCIsImlhdCI6MTcyMjk4NjQwMCwiZXhwIjoxNzIzOTcyODAwfQ...",
    "tokenType": "Bearer",
    "userId": 2,
    "fullName": "Ramesh Patil",
    "mobileNumber": "9876543210",
    "email": "ramesh.patil@example.com",
    "preferredLanguage": "MR",
    "role": "ROLE_FARMER"
  },
  "timestamp": "2026-08-06T14:32:00Z"
}
```
- **Error Response (`400 Bad Request` / `401 Unauthorized`):** Invalid credentials.

---

### 3.3 Get Current Authenticated User Details (`/api/v1/auth/me`)
- **Endpoint:** `GET /api/v1/auth/me`
- **Access:** Protected (`ROLE_FARMER`, `ROLE_ADMIN`)
- **Required Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "User profile fetched successfully.",
  "data": {
    "userId": 2,
    "fullName": "Ramesh Patil",
    "mobileNumber": "9876543210",
    "email": "ramesh.patil@example.com",
    "preferredLanguage": "MR",
    "role": "ROLE_FARMER",
    "enabled": true,
    "createdAt": "2026-08-06T14:31:00Z",
    "state": "Maharashtra",
    "district": "Nashik",
    "taluka": "Niphad",
    "village": "Pimpalgaon",
    "landSizeAcres": 4.5,
    "primaryCrops": "Grapes, Onion",
    "soilType": "Black Soil"
  },
  "timestamp": "2026-08-06T14:33:00Z"
}
```
- **Error Response (`401 Unauthorized`):** Missing, invalid, or expired JWT.
- **Error Response (`403 Forbidden`):** Insufficient role permission.

---

## 4. Farmer Profile Endpoints (`/api/v1/farmer`)

### 4.1 Get Profile
- **Endpoint:** `GET /api/v1/farmer/profile`
- **Access:** Protected (`ROLE_FARMER`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "userId": 2,
    "fullName": "Ramesh Patil",
    "mobileNumber": "9876543210",
    "email": "ramesh.patil@example.com",
    "preferredLanguage": "MR",
    "state": "Maharashtra",
    "district": "Nashik",
    "taluka": "Niphad",
    "village": "Pimpalgaon",
    "landSizeAcres": 4.5,
    "primaryCrops": "Grapes, Onion, Sugarcane",
    "soilType": "Black Soil"
  }
}
```

### 4.2 Update Profile
- **Endpoint:** `PUT /api/v1/farmer/profile`
- **Access:** Protected (`ROLE_FARMER`)
- **Request Body:** Fields to update (`preferredLanguage`, `district`, `landSizeAcres`, etc.).

---

## 5. Chat Session & AI Message Endpoints (`/api/v1/chat`)

> **Responsible AI & Knowledge-Grounded Architecture (Steps 5D & 5E):** The backend supports pluggable AI providers via `app.ai.provider` (`mock` or `gemini`). The message flow incorporates a deterministic safety and grounding pipeline:
> 1. **Knowledge Retrieval (`AgricultureKnowledgeService`):** Scans the query for crop and topic names in English, Marathi, or Hindi, retrieving published advisory articles from MySQL (`verified_agriculture_content`).
> 2. **Safety & Risk Assessment (`AgricultureSafetyService`):**
>    - **Off-Topic Detection:** Automatically redirects non-agricultural requests (sports, coding, politics, crypto) with polite native responses without LLM invocations.
>    - **Risk Classification:** Classifies queries into `LOW_RISK`, `MEDIUM_RISK`, and `HIGH_RISK`.
>    - **Expert Referrals:** High-risk queries (chemical mixing, exact pesticide dosages, acute toxicity) mandate localized Krishi Seva Kendra or Agriculture Officer referral disclaimers.
>    - **No-Knowledge Disclaimers:** Queries without verified data explicitly acknowledge absence of verified records and direct farmers to local officers.

### 5.1 Create Chat Session
- **Endpoint:** `POST /api/v1/chat/sessions`
- **Access:** Protected (`ROLE_FARMER`, `ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:** None — the authenticated user is resolved from the JWT; no userId is accepted from the client.
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Chat session created successfully.",
  "data": {
    "id": 1,
    "sessionTitle": "Chat Session - 15-Aug-2026 19:45",
    "language": "MR",
    "createdAt": "2026-08-15T19:45:00",
    "updatedAt": "2026-08-15T19:45:00",
    "messageCount": 0
  },
  "timestamp": "2026-08-15T19:45:00"
}
```

### 5.2 Send Message (and Receive Grounded AI Response)
- **Endpoint:** `POST /api/v1/chat/sessions/{sessionId}/messages`
- **Access:** Protected (`ROLE_FARMER`, `ROLE_ADMIN`); session must belong to the authenticated user.
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Path Variable:** `sessionId` (Long)
- **Request Body:**
```json
{
  "message": "कापसावरील गुलाबी बोंडअळी नियंत्रणासाठी काय करावे?",
  "language": "MR"
}
```
  - `message` — required, non-blank, max 2000 characters.
  - `language` — optional (`EN`, `MR`, `HI`). Falls back to session language if omitted.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Message sent successfully.",
  "data": {
    "sessionId": 1,
    "userMessage": {
      "id": 1,
      "sender": "USER",
      "message": "कापसावरील गुलाबी बोंडअळी नियंत्रणासाठी काय करावे?",
      "language": "MR",
      "timestamp": "2026-08-15T19:46:00"
    },
    "aiMessage": {
      "id": 2,
      "sender": "AI",
      "message": "कापसावरील गुलाबी बोंडअळीच्या नियंत्रणासाठी सत्यापित कृषी मार्गदर्शक तत्त्वे:\n\n१. पीक ४५ दिवसांचे झाल्यावर एकरी ५ कामगंध सापळे लावावेत.\n२. निंबोळी अर्क ५% किंवा ५ मिली निमतेल प्रति लिटर पाण्यात मिसळून फवारावे.\n३. ट्रायकोग्रामा मित्रकीटकांचे ट्रायकोकार्ड्स एकरी ३ ते ४ लावावेत.\n\nमहत्त्वाचे: रासायनिक उपचार किंवा कीटकनाशकांच्या प्रमाणासाठी स्थानिक कृषी सेवा केंद्र किंवा कृषी सहाय्यकांचा सल्ला घ्या.",
      "language": "MR",
      "timestamp": "2026-08-15T19:46:00"
    },
    "timestamp": "2026-08-15T19:46:00"
  },
  "timestamp": "2026-08-15T19:46:00"
}
```
- **Error Responses:**
  - `400 Bad Request` — blank or missing message.
  - `401 Unauthorized` — no valid JWT.
  - `403 Forbidden` — session belongs to a different user.
  - `404 Not Found` — session ID does not exist.

### 5.3 List User's Chat Sessions
- **Endpoint:** `GET /api/v1/chat/sessions`
- **Access:** Protected — returns only sessions belonging to the authenticated user.
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Sessions retrieved successfully.",
  "data": [
    {
      "id": 2,
      "sessionTitle": "Chat Session - 15-Aug-2026 19:50",
      "language": "MR",
      "createdAt": "2026-08-15T19:50:00",
      "updatedAt": "2026-08-15T19:51:00",
      "messageCount": 2
    },
    {
      "id": 1,
      "sessionTitle": "Chat Session - 15-Aug-2026 19:45",
      "language": "MR",
      "createdAt": "2026-08-15T19:45:00",
      "updatedAt": "2026-08-15T19:46:00",
      "messageCount": 2
    }
  ],
  "timestamp": "2026-08-15T19:51:00"
}
```

### 5.4 Get Messages in Session
- **Endpoint:** `GET /api/v1/chat/sessions/{sessionId}/messages`
- **Access:** Protected — returns messages only when the session belongs to the authenticated user.
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Path Variable:** `sessionId` (Long)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Messages retrieved successfully.",
  "data": [
    {
      "id": 1,
      "sender": "USER",
      "message": "Which crops are best for black soil?",
      "language": "MR",
      "timestamp": "2026-08-15T19:46:00"
    },
    {
      "id": 2,
      "sender": "AI",
      "message": "[MOCK AI] तुमचा शेतीविषयक प्रश्न प्राप्त झाला आहे...",
      "language": "MR",
      "timestamp": "2026-08-15T19:46:00"
    }
  ],
  "timestamp": "2026-08-15T19:51:00"
}
```
- **Error Responses:**
  - `401 Unauthorized` — no valid JWT.
  - `403 Forbidden` — session belongs to a different user.
  - `404 Not Found` — session ID does not exist.

---



## 6. Verified Crop Knowledge Base Endpoints (`/api/v1/crops`)

### 6.1 List All Verified Crops
- **Endpoint:** `GET /api/v1/crops`
- **Access:** Protected (`ROLE_FARMER`, `ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters:**
  - `keyword` (optional): search term matched against English, Marathi, and Hindi crop names
  - `category` (optional): category filter (`Commercial`, `Cereals`, `Pulses`, `Vegetables`, `Fruits`)
  - `season` (optional): season filter (`Kharif`, `Rabi`, `Zaid`, `Perennial`)
  - `language` (optional): preferred language (`EN`, `MR`, `HI`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Crops retrieved successfully.",
  "data": [
    {
      "id": 1,
      "nameEn": "Cotton",
      "nameMr": "कापूस",
      "nameHi": "कपास",
      "category": "Commercial",
      "suitableSeason": "Kharif",
      "soilRequirements": "Deep black cotton soil (Vertisols), well-drained",
      "waterRequirement": "Medium (500-700 mm)",
      "description": "High-value fiber and cash crop extensively cultivated in Vidarbha and Marathwada regions of Maharashtra.",
      "createdAt": "2026-08-15T15:51:09",
      "updatedAt": "2026-08-15T15:51:09"
    }
  ],
  "timestamp": "2026-08-15T15:51:09"
}
```

### 6.2 Get Single Crop Details with Verified Guidance
- **Endpoint:** `GET /api/v1/crops/{id}`
- **Access:** Protected (`ROLE_FARMER`, `ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Path Variable:** `id` (Crop ID)
- **Query Parameters:** `language` (optional, `EN`, `MR`, `HI`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Crop details retrieved successfully.",
  "data": {
    "id": 1,
    "nameEn": "Cotton",
    "nameMr": "कापूस",
    "nameHi": "कपास",
    "category": "Commercial",
    "suitableSeason": "Kharif",
    "soilRequirements": "Deep black cotton soil (Vertisols), well-drained",
    "waterRequirement": "Medium (500-700 mm)",
    "description": "High-value fiber and cash crop extensively cultivated in Vidarbha and Marathwada regions of Maharashtra.",
    "createdAt": "2026-08-15T15:51:09",
    "updatedAt": "2026-08-15T15:51:09",
    "verifiedContents": [
      {
        "id": 1,
        "title": "Pink Bollworm Integrated Pest Management",
        "contentBody": "To control Pink Bollworm in Cotton:\n1. Install pheromone traps @ 5 traps/ha for monitoring and 20 traps/ha for mass trapping.\n2. Spray Neem oil (1500 ppm) @ 5 ml/liter water at 45 days after sowing.\n3. Release Trichogramma egg parasitoids @ 1,50,000/ha.\n4. Avoid chemical spraying during early crop stages to protect natural predators.",
        "category": "Pest Control",
        "language": "EN",
        "createdAt": "2026-08-15T15:51:09",
        "updatedAt": "2026-08-15T15:51:09"
      }
    ]
  },
  "timestamp": "2026-08-15T15:51:09"
}
```
- **Error Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Crop not found with id : '999999'",
  "errors": null,
  "timestamp": "2026-08-15T15:51:09"
}
```

---

## 6. Farmer Profile & My Farm Endpoints (`/api/v1/farmer/profile`)

### 6.1 Get Authenticated Farmer Profile
- **Endpoint:** `GET /api/v1/farmer/profile`
- **Access:** Protected (Authenticated Farmer)
- **Headers:** `Authorization: Bearer <JWT>`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Farmer profile fetched successfully.",
  "data": {
    "userId": 2,
    "fullName": "विष्णू पाटील",
    "mobileNumber": "9811223344",
    "email": "vishnu.patil@example.com",
    "preferredLanguage": "MR",
    "role": "ROLE_FARMER",
    "state": "Maharashtra",
    "district": "Nashik",
    "taluka": "Niphad",
    "village": "Pimpalgaon",
    "landSizeAcres": 5.5,
    "primaryCrops": "कापूस, सोयाबीन",
    "soilType": "काळी कसदार",
    "updatedAt": "2026-08-16T01:14:00"
  },
  "timestamp": "2026-08-16T01:14:00"
}
```

### 6.2 Update Authenticated Farmer Profile
- **Endpoint:** `PUT /api/v1/farmer/profile`
- **Access:** Protected (Authenticated Farmer)
- **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
- **Request Body (`FarmerProfileUpdateRequest`):**
```json
{
  "fullName": "विष्णू नारायण पाटील",
  "email": "vishnu.updated@example.com",
  "preferredLanguage": "MR",
  "state": "Maharashtra",
  "district": "Nashik",
  "taluka": "दिंडोरी",
  "village": "वणी",
  "landSizeAcres": 7.25,
  "primaryCrops": "द्राक्ष, कांदा, टोमॅटो",
  "soilType": "काळी कसदार"
}
```
- **Success Response (`200 OK`):** Returns updated `FarmerProfileResponse`.
- **Validation Errors (`400 Bad Request`):** Invalid land size, malformed email, or duplicate email address.

---

## 7. Admin Management & Analytics Endpoints (`/api/v1/admin`)

### 7.1 View Registered Farmers List
- **Endpoint:** `GET /api/v1/admin/users?page=0&size=10`
- **Access:** Protected (`ROLE_ADMIN`)

### 7.2 Enable / Disable User Account
- **Endpoint:** `PUT /api/v1/admin/users/{userId}/toggle-status`
- **Access:** Protected (`ROLE_ADMIN`)

### 7.3 Crop CRUD Endpoints
- `POST /api/v1/admin/crops` (Create crop)
- `PUT /api/v1/admin/crops/{id}` (Update crop)
- `DELETE /api/v1/admin/crops/{id}` (Delete crop)

### 7.4 Monitor All Farmer Queries
- **Endpoint:** `GET /api/v1/admin/chat-queries`
- **Access:** Protected (`ROLE_ADMIN`)

### 7.5 Get System Analytics Summary (for Chart.js)
- **Endpoint:** `GET /api/v1/admin/analytics/stats`
- **Access:** Protected (`ROLE_ADMIN`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "totalFarmers": 142,
    "totalQueriesAnswered": 589,
    "totalCropsManaged": 24,
    "languageDistribution": {
      "MR": 65,
      "HI": 25,
      "EN": 10
    },
    "recentQueriesPerDay": [
      { "date": "2026-08-01", "count": 45 },
      { "date": "2026-08-02", "count": 60 },
      { "date": "2026-08-03", "count": 72 }
    ]
  }
}
```
