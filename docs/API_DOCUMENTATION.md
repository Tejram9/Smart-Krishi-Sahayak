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

## 5. AI Chatbot & History Endpoints (`/api/v1/chat`)

### 5.1 Send Query to AI Chatbot
- **Endpoint:** `POST /api/v1/chat/send`
- **Access:** Protected (`ROLE_FARMER`)
- **Request Body (`ChatMessageRequest`):**
```json
{
  "sessionId": 12,
  "message": "द्राक्षावरील भुरी रोगावर काय उपाय करावा?",
  "language": "MR"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "sessionId": 12,
    "userMessage": "द्राक्षावरील भुरी रोगावर काय उपाय करावा?",
    "aiResponse": "द्राक्षावरील भुरी (Powdery Mildew) रोगाच्या नियंत्रणासाठी:\n1. झाडाची पानांची हवा खेळती ठेवा.\n2. प्राथमिक अवस्थेत पाण्यात विरघळणारे गंधक (Sulfur 80% WP) ३ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा.\n3. अधिक माहितीसाठी जवळच्या कृषी सेवा केंद्राशी संपर्क साधा.",
    "language": "MR",
    "timestamp": "2026-08-06T14:35:00Z"
  }
}
```

### 5.2 Get User Chat Sessions List
- **Endpoint:** `GET /api/v1/chat/sessions`
- **Access:** Protected (`ROLE_FARMER`)
- **Response (`200 OK`):** Array of past chat session summaries.

### 5.3 Get Messages in Session
- **Endpoint:** `GET /api/v1/chat/sessions/{sessionId}`
- **Access:** Protected (`ROLE_FARMER`)
- **Response (`200 OK`):** Full message history for specified session.

---

## 6. Verified Crop Knowledge Base Endpoints (`/api/v1/crops`)

### 6.1 List All Verified Crops
- **Endpoint:** `GET /api/v1/crops`
- **Query Params:** `language` (EN/MR/HI), `category` (optional)
- **Access:** Public / Farmer

### 6.2 Get Single Crop Details
- **Endpoint:** `GET /api/v1/crops/{id}`
- **Access:** Public / Farmer

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
