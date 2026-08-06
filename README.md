# Smart Krishi Sahayak: AI-Based Farmer Assistance and Precision Farming System

> **Community Engagement Project (CEP)**  
> **Developed by:** 2nd Year Computer Science & Engineering Students (Team of 4)

---

## 📌 Project Overview
**Smart Krishi Sahayak** is a multilingual, responsive, farmer-centric web application designed to bridge the agricultural knowledge gap for Indian farmers. The system provides real-time, crop-specific guidance and an AI-driven agricultural chatbot supporting **Marathi (मराठी), Hindi (हिंदी), and English**.

The system is engineered using a clean, decoupled RESTful architecture powered by **Spring Boot** and **MySQL**. While the primary interface for Phase 1 is a modern web application, the backend is built to seamlessly serve a future **Flutter** mobile application without requiring architectural changes.

---

## 🚀 Key Features

### 👨‍🌾 Farmer Module
- **Multilingual Support:** Seamless toggling between Marathi, Hindi, and English.
- **Secure Registration & Login:** Mobile/email-based authentication with role-based access.
- **AI Agricultural Assistant:** Context-aware chatbot answering crop, pest, season, and soil questions in native languages.
- **Chat History:** Persistent session and chat history stored securely in MySQL.
- **Verified Crop Knowledge Base:** Access to curated, verified agricultural guidance.
- **Personalized Profile:** Farm location, primary crops, and preferred language management.

### 🛡️ Admin Module
- **Dashboard & Analytics:** Real-time visual metrics on registered farmers, active queries, and system usage via Chart.js.
- **Crop Information Management:** Create, update, publish, and delete verified crop repository entries.
- **Chatbot Query Monitoring:** Monitor user queries and AI responses for quality control and system auditing.
- **User Management:** Enable/disable accounts and manage farmer profiles.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Java 17, Spring Boot 3.x, Maven |
| **Persistence & Database** | Spring Data JPA, Hibernate, MySQL 8.0 |
| **Security** | Spring Security 6, JWT (Stateless Token), BCrypt Hashing |
| **AI Integration** | Provider-Independent LLM Interface (Spring WebClient / RestTemplate) |
| **Frontend Web** | HTML5, CSS3 (Custom Vanilla + Design System), JavaScript (ES6+), Bootstrap 5, Chart.js |
| **API Client** | Native Fetch API with standard DTO contracts |
| **Future Mobile App** | Flutter (consumes identical Spring Boot REST APIs) |

---

## 📁 Repository Structure & Documentation

```
CEP_PROJECT/
├── docs/
│   ├── MASTER_PLAN.md         # Phased roadmap, sprint planning, and MVP scope
│   ├── ARCHITECTURE.md        # System architecture, design patterns, security & AI
│   ├── DATABASE_DESIGN.md     # MySQL schema, ER diagram, indexes & relationships
│   ├── API_DOCUMENTATION.md   # Complete REST API endpoint reference and DTOs
│   ├── SETUP_GUIDE.md         # Prerequisites, environment variables, local build instructions
│   ├── TEST_PLAN.md           # Unit, integration, security, and manual test suites
│   ├── DEPLOYMENT_GUIDE.md    # Production setup, packaging, and security hardening
│   └── TEAM_TASKS.md          # 4-member task allocation and collaboration matrix
└── README.md                  # Project overview (this file)
```

---

## 📑 Documentation Index

1. [Master Plan & Roadmap](file:///d:/CEP_PROJECT/docs/MASTER_PLAN.md)
2. [System Architecture](file:///d:/CEP_PROJECT/docs/ARCHITECTURE.md)
3. [Database Design & ER Diagram](file:///d:/CEP_PROJECT/docs/DATABASE_DESIGN.md)
4. [API Documentation](file:///d:/CEP_PROJECT/docs/API_DOCUMENTATION.md)
5. [Setup & Installation Guide](file:///d:/CEP_PROJECT/docs/SETUP_GUIDE.md)
6. [Testing Strategy](file:///d:/CEP_PROJECT/docs/TEST_PLAN.md)
7. [Deployment Guide](file:///d:/CEP_PROJECT/docs/DEPLOYMENT_GUIDE.md)
8. [Team Responsibilities & Work Division](file:///d:/CEP_PROJECT/docs/TEAM_TASKS.md)

---

## 🎓 Academic viva & Project Defense
This repository is documented to fulfill CSE Second Year Community Engagement Project guidelines. All design patterns, database normalized schemas, security tokens, and AI integration layers are explained in detail in the `docs/` folder.
