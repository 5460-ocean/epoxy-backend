# Epoxy Backend

A FastAPI backend with JWT authentication and SQLite database.

## Overview

This is a SaaS backend built with FastAPI, SQLAlchemy (SQLite), and JWT-based authentication. It includes user registration/login, project management, admin endpoints, and activity logging.

## Architecture

- **Framework**: FastAPI
- **Database**: SQLite (`app.db`) via SQLAlchemy ORM
- **Auth**: JWT tokens using `python-jose`, passwords hashed with `passlib[bcrypt]`
- **Rate Limiting**: `slowapi`

## Project Structure

```
app/
  main.py            - FastAPI app entry point, router registration
  database.py        - SQLAlchemy engine + session setup (SQLite)
  security.py        - JWT + password hashing utilities
  models/            - SQLAlchemy ORM models (User, Project, ActivityLog, etc.)
  routers/           - API route handlers (auth, wizard/projects, admin)
  schemas/           - Pydantic request/response schemas
  services/          - Business logic services (activity_logger)
  dependencies/      - Shared FastAPI dependencies (auth)
```

## Running

The app runs via uvicorn on port 5000:
```
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

API docs are available at `/docs` (Swagger UI) and `/redoc`.

## Key Endpoints

- `POST /register` - Create a new user
- `POST /login` - Authenticate and receive a JWT token
- `GET /wizard` (auth required) - List user projects
- `POST /wizard` (auth required) - Create a project
- `GET /admin/users` (admin required) - List all users
- `GET /admin/projects` (admin required) - List all projects
- `GET /admin/logs` (admin required) - View activity logs

## Dependencies

Managed via `requirements.txt`. Install with:
```
pip install -r requirements.txt
```
