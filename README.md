# AgriSubsidyAI 🌾

AI-powered agricultural subsidy management platform connecting farmers with government benefits.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS      |
| Backend    | FastAPI + SQLAlchemy + Alembic      |
| Database   | PostgreSQL 14                       |
| ML Models  | Python (scikit-learn / TensorFlow)  |
| Auth       | JWT (PyJWT)                         |

## Project Structure

```
agrisubsidyai/
├── frontend/        # React + Vite application
├── backend/         # FastAPI REST API
├── ml-models/       # ML training & inference scripts
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional, for local DB)

### 1. Start Infrastructure (PostgreSQL + pgAdmin)
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
cp .env.example .env        # fill in your values
alembic upgrade head
uvicorn app.main:app --reload
```
API available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at: http://localhost:5173

## Environment Variables

See [.env.example](.env.example) for all required variables.

## License

MIT
