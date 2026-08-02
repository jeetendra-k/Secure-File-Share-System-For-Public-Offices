# SecureGov: Secure File Sharing System for Public Offices

SecureGov is a secure document-sharing and governance application designed for public-sector office workflows. It combines role-based access control, encrypted file storage, audit logging, and biometric verification to support confidential file handling with traceable access policies.

## Overview

This repository contains a full-stack solution for controlled file exchange in public offices:

- Backend: FastAPI application for authentication, file encryption, RBAC, audit trails, and biometric access control
- Frontend: React + TypeScript + Vite dashboard and operations UI
- Storage: encrypted files stored in the local `storage/` directory with metadata tracked in the database

The solution is intended for environments where data classification, policy enforcement, and accountability matter.

## Key Features

- Secure user authentication using JWT access tokens
- Role-based access control across admin, officer, clerk, auditor, and security roles
- File upload and download workflow with encryption and protected storage
- Classification-aware file access rules for Public, Internal, Restricted, Highly Confidential, Secret, and Top Secret records
- Biometric verification gating for high-sensitivity files
- Audit logging of authentication, file access, uploads, and denied access actions
- Executive dashboard for security and operational visibility

## Technology Stack

### Backend
- Python 3.11
- FastAPI
- Uvicorn
- SQLAlchemy
- PyMySQL
- Pydantic + Pydantic Settings
- Passlib with bcrypt
- Python-Jose for JWT handling
- OpenCV and face recognition tooling for biometric operations

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Axios

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   └── storage/
├── securegov-frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Backend Architecture

The backend application is powered by a FastAPI app entry point in [`backend/app/main.py`](backend/app/main.py). It exposes routers for:

- authentication
- user management
- file operations
- biometric verification
- audit logs
- dashboard analytics

The API uses SQLAlchemy to interact with a database configured through environment settings. The security model includes:

- JWT token issuance for authenticated sessions
- RBAC check enforcement before file operations
- classification-based download rules
- audit middleware for event tracking
- encrypted file envelope storage

## Frontend Architecture

The frontend is a Vite-based React application. It provides:

- login and protected routing
- user management UI
- file explorer experience
- biometric verification modal flow
- audit logs and dashboard insights

## Environment Configuration

The backend expects a `.env` file in the `backend/` directory. The application configuration is defined in [`backend/app/core/config.py`](backend/app/core/config.py) and reads the following settings:

```env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
FILE_MASTER_KEY=your_master_encryption_key
BIOMETRIC_API_URL=optional_biometric_service_url
```

The backend uses these values to connect to the database, issue JWTs, and protect file encryption operations.

## Database Setup

The application uses SQLAlchemy with a database URL configured in the `.env` file.

Typical setup considerations:

1. Create the database instance.
2. Point `DATABASE_URL` at the database server.
3. Initialize the schema using the application’s ORM model definitions.
4. Ensure the database user has write permissions for the selected database.

## Running the Backend

From the project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> In this workspace, the backend was verified using Python 3.11 with the repository-local virtual environment because the compiled biometric dependencies rely on that interpreter chain.

## Running the Frontend

From the project root:

```bash
cd securegov-frontend
npm install
npm run dev
```

The development server should run on a Vite port such as `5173` or the automatically selected fallback port.

## Production Build

To produce a frontend build:

```bash
cd securegov-frontend
npm run build
```

## Security and Governance Notes

This project is designed around a zero-trust file protection model:

- files are encrypted before persistence
- access decisions are role- and classification-aware
- sensitive downloads require additional verification steps
- every access event is captured in an audit trail

The architecture is suitable for controlled public-office file flows where access must remain reviewable and policy-driven.

## Suggested Development Workflow

1. Configure the backend `.env` file.
2. Start the database service.
3. Launch the FastAPI backend.
4. Install and launch the frontend.
5. Authenticate with a user seeded in the database.
6. Upload, classify, and review file access through the secure UI.

## Notes for Contributors

- Keep sensitive configuration in local `.env` files and do not commit secrets.
- Prefer source-only repo changes over bundling virtual environment artifacts.
- Backend and frontend should be kept aligned with the API contract exposed through the services.

## License

This project is provided as a source code workspace for demonstration and internal/public-office deployment use. Add your organization’s preferred license terms before production release.
