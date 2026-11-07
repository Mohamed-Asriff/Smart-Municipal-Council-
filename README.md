# Smart Municipal Council Management System

A modern, full-stack civic management platform designed to streamline municipal operations, improve public service response, and support AI-assisted complaint handling for local government teams.

This repository brings together a React frontend, a Spring Boot backend, a Python AI service, and PostgreSQL database to deliver a unified system for complaint management, administrative workflows, citizen engagement, and data-driven decision-making.

## Overview

The Smart Municipal Council Management System helps local authorities manage:

- Public complaints and service requests
- Waste and sanitation tracking
- Payment processing for council services
- Administrative dashboards and reporting
- AI-powered complaint categorization, priority detection, and chatbot support
- User authentication and role-based access

The platform is structured as a modular monorepo, enabling independent services for frontend, backend, AI intelligence, and database management while maintaining a single deployment experience.

## Key Features

### Citizen and Service Management
- Complaint submission and tracking
- User authentication and authorization
- Notification and communication workflows
- Resident service request management

### Municipal Operations
- Dashboard with operational insights
- Waste and sanitation oversight
- Payment integration for civic services
- Administrative record management

### AI Capabilities
- Complaint text cleaning and classification
- Duplicate detection
- Priority scoring
- AI chatbot support for citizen interaction
- Smart analysis for faster municipal response

### Technical Capabilities
- REST API backend
- Secure JWT authentication
- PostgreSQL persistence
- Reusable frontend components and feature-based architecture
- Dockerized deployment for local and production environments

## Architecture

The solution is split into four main layers:

- Frontend: React + Vite + Tailwind CSS
- Backend: Spring Boot + Java 17 + Spring Security + JPA
- AI Service: Python microservice with Gemini-powered intelligence
- Database: PostgreSQL

A Docker Compose setup orchestrates the services together through a shared internal network.

## Repository Structure

```text
Smart-Municipal-Council/
├── .env.example                 # Environment configuration template
├── .gitignore
├── Dockerfile                   # Root image configuration
├── docker-compose.yml           # Service orchestration for all components
├── pom.xml                      # Maven parent project definition
├── README.md                    # Project documentation
├── ai-service/                  # AI and analytics microservice
│   ├── app.py
│   ├── chatbot.py
│   ├── requirements.txt
│   ├── models/
│   ├── database/
│   └── README.md
├── backend/                     # Spring Boot backend application
│   ├── src/
│   ├── uploads/
│   ├── pom.xml
│   └── Dockerfile
├── database/                    # SQL schema and seed scripts
│   ├── schema.sql
│   ├── seed.sql
│   ├── upgrade_auth.sql
│   └── migrations/
├── frontend/                    # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── models/                      # AI model assets and related artifacts
├── test_integration.ps1         # Integration test script
└── .vscode/                     # Editor configuration
```

## Technology Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Leaflet / Google Maps integration
- Chart.js + React charting components
- Axios for API calls

### Backend
- Java 17
- Spring Boot 3.5
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL Driver
- JWT authentication

### AI Service
- Python
- Gemini API integration
- NLP and classification logic
- Complaint analysis and chatbot support

### Infrastructure
- PostgreSQL
- Docker
- Docker Compose

## Prerequisites

Before you begin, make sure you have:

- Java 17+
- Maven
- Node.js 18+
- npm
- Python 3.10+
- Docker and Docker Compose
- PostgreSQL (if running services outside Docker)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mohamed-Asriff/Smart-Municipal-Council-.git
cd Smart-Municipal-Council-
```

### 2. Configure environment variables

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

Key environment variables include:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `VITE_API_BASE_URL`
- `VITE_AI_BASE_URL`
- PayHere gateway settings for payment integration

### 3. Start the application with Docker Compose

```bash
docker compose up --build
```

This starts:

- PostgreSQL on port `5432`
- Backend API on port `8080`
- AI service on port `8001`
- Frontend app on port `5173`

### 4. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- AI Service: http://localhost:8001

## Running Services Individually

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Database

The project includes SQL setup scripts under the `database/` folder:

- `schema.sql` — database schema definition
- `seed.sql` — initial seed data
- `upgrade_auth.sql` — authentication-related updates
- `update_passwords.sql` — password update script

The Docker Compose configuration automatically initializes PostgreSQL using these scripts.

## API and Service Notes

The backend exposes municipal service endpoints for features such as:
- Authentication and authorization
- Complaint workflows
- Payment processing
- Dashboard and analytics endpoints
- File uploads and document handling

The AI service provides analysis and recommendation logic related to complaint categories, duplicate detection, and municipal prioritization.

## Development Workflow

A typical development workflow is:

1. Update backend logic and database schema as needed.
2. Adjust frontend API connections in the React app.
3. Run AI models / service for complaint intelligence.
4. Validate with Docker Compose or targeted service commands.
5. Test integrations with the provided scripts and environment setup.

## Security Considerations

- Never commit real production secrets.
- Rotate `JWT_SECRET` and API credentials in deployment environments.
- Use secure environment variables for external integrations.
- Review the PayHere and Gemini environment settings before production deployment.

## Future Enhancements

Potential next steps include:

- Role-based access refinement
- Advanced notification systems
- Enhanced GIS and mapping features
- More robust analytics and reporting
- CI/CD pipeline integration
- Production deployment hardening

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation and tests
5. Open a pull request with a clear description

## Project Status

This project is a working municipal management platform prototype with integrated backend, frontend, database, and AI capabilities, designed for local government use cases and future expansion.

## License

This repository does not currently declare a license file. If you plan to distribute or publish the project, add a project license before release.

---

For support or project collaboration, contact the repository owner or maintainers through the GitHub project page.
