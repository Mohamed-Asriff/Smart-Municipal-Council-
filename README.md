# Smart Municipal Council Management System — Kalmunai (KMC)

Unified Full-Stack Governance & Civic Services Platform.

This project integrates the 4 branches (`home`, `comp`, `pay`, `ai`) into **one cohesive, maintainable, production-ready system**:
1. **Unified Spring Boot Backend** (`com.smc`, Java 17, Port 8080)
2. **Unified PostgreSQL Database** (`smart_municipal_council`, Port 5432)
3. **Unified React Frontend** (Vite 8, Tailwind CSS v4, Lucide Icons, Leaflet Maps, Port 5173)
4. **Autonomous AI Microservice** (FastAPI, Python 3.11, Gemini & ML Models, Port 8001)

---

## 🏛️ System Architecture

```
smart-municipal-council/
├── backend/                   # Unified Spring Boot 3.3.5 Backend (Java 17)
│   ├── src/main/java/com/smc/
│   │   ├── config/            # SecurityConfig, ApplicationConfig, WebConfig
│   │   ├── controller/        # Auth, Complaint, Payment, Admin, News, Notice
│   │   ├── dto/               # Unified Request/Response DTOs
│   │   ├── entity/            # User, Complaint, Timeline, History, Payment, News, Notice
│   │   ├── repository/        # Spring Data JPA Repositories
│   │   ├── security/          # JWT Service & Authentication Filter
│   │   └── service/           # ComplaintService, PaymentService, FileStorageService
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                  # Unified React + Vite + Tailwind 4 Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Hero, Modals, Chatbot, MapPicker
│   │   │   ├── admin/         # AdminPortal, AdminComplaints, AdminNews, AdminPayment
│   │   │   └── portal/        # CitizenPortal, PortalDashboard, PortalComplaints, etc.
│   │   ├── data/              # Trilingual translations (EN, TA, SI), user data
│   │   ├── services/          # Unified API client (Spring Boot + AI service)
│   │   ├── App.jsx            # Main router & state manager
│   │   └── index.css          # Tailwind CSS styles & animations
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── ai-service/                # Python FastAPI AI Microservice (Port 8001)
│   ├── app.py                 # FastAPI endpoints (chat, predict, duplicate check)
│   ├── chatbot.py             # Gemini-powered trilingual civic assistant
│   ├── category_service.py    # ML category classifier
│   ├── priority_service.py    # ML priority predictor
│   ├── duplicate_service.py   # TF-IDF duplicate complaint detector
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/                  # Unified Database Scripts
│   ├── schema.sql             # Unified PostgreSQL DDL (users, complaints, payments, etc.)
│   └── seed.sql               # Demo data with hashed passwords (BCrypt cost 10)
│
├── docker-compose.yml         # One-command orchestration for entire stack
└── .env.example               # Configuration template
```

---

## 🚀 Quick Start with Docker Compose

Run the entire platform (PostgreSQL + Spring Boot Backend + FastAPI AI Service + React Frontend) with a single command:

```bash
docker-compose up --build
```

Access points:
- **Frontend Web Portal:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:8080/api](http://localhost:8080/api)
- **AI Microservice:** [http://localhost:8001/docs](http://localhost:8001/docs)
- **PostgreSQL Database:** `localhost:5432` (`smart_municipal_council`)

---

## 💻 Manual Local Development

### 1. Database Setup
Ensure PostgreSQL is running, then execute:
```bash
psql -U postgres -d postgres -c "CREATE DATABASE smart_municipal_council;"
psql -U postgres -d smart_municipal_council -f database/schema.sql
psql -U postgres -d smart_municipal_council -f database/seed.sql
```

### 2. Backend (Java 17 Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
Backend runs on `http://localhost:8080`.

### 3. AI Service (Python FastAPI)
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate      # On Windows
pip install -r requirements.txt
uvicorn app:app --port 8001 --reload
```
AI service runs on `http://localhost:8001`.

### 4. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🔑 Demo User Credentials

All accounts use the password: `password123`

| Name | Role | Email | Password |
|---|---|---|---|
| M. S. Farhan | **ADMIN** | `admin@kmc.gov.lk` | `password123` |
| Eng. R. Thilak | **OFFICER** | `officer.thilak@kmc.gov.lk` | `password123` |
| S. Mohamed Aslam | **CITIZEN** | `aslam.mohamed@gmail.com` | `password123` |
| F. Rihana Banu | **CITIZEN** | `rihana.banu@yahoo.com` | `password123` |
| K. Yogeswaran | **CITIZEN** | `yoges.k@outlook.com` | `password123` |

---

## 📦 Module Integration Summary

| Module | Source Branch | Integrated Destination | Highlights |
|---|---|---|---|
| **Auth & Security** | `home` | `backend/src/main/java/com/smc/security/` | JWT stateless auth, BCrypt hashing, role-based controls (`ADMIN`, `OFFICER`, `CITIZEN`). |
| **Landing Portal** | `home` | `frontend/src/` | Trilingual (English, Tamil, Sinhala), Hero, Services grid, Public Ticket Tracker. |
| **Complaint Engine** | `comp` + `home` | `backend/service/ComplaintService.java` & `frontend/` | Leaflet map picker, GPS coordinates, photo evidence upload, status audit trail, timeline steps, search & triage. |
| **Payment Ledger** | `pay` + `home` | `backend/service/PaymentService.java` & `AdminPayment.jsx` | Online checkout, transaction ledger, Admin KPI dashboard (Revenue, Pending, Success Rate), Bill Issuance. |
| **AI Assistant** | `ai` | `ai-service/` & `frontend/Chatbot.jsx` | Floating civic chatbot, Gemini API integration, ML classification & duplicate detection. |
