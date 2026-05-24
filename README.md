# 🚀 CollabGrid Backend Engine

CollabGrid is a robust, production-ready RESTful API engineered with Node.js, TypeScript, and Express. It serves as the relational core data layer for a highly interactive Kanban project workspace, fully fortified with cryptographic token-based authentication and modular Role-Based Access Control (RBAC).

---

## 🛠️ Core Technology Stack
* **Runtime Environment:** Node.js (TypeScript v5+)
* **API Framework:** Express.js with custom middleware gating
* **Database Engine:** PostgreSQL
* **ORM Infrastructure:** Prisma v6 Client & Schema Engines
* **Security Layer:** JWT (JsonWebTokens) & Bcrypt password hashing
* **Validation Engine:** Zod Data Type Validation
* **Testing Framework:** Jest & Supertest integration suites

---

## 🧬 Database Architecture & Relations

The data layer utilizes a cascading relational hierarchy managed through Prisma. 

* **User 1 → 💡 Board:** A unique user accounts for and owns multiple distinct workspace layouts.
* **Board 1 → 📋 Column:** Automatic creation triggers standard interactive columns (`To Do`, `In Progress`, `Done`) inside a relational transaction block upon board provisioning.
* **Column 1 → 📍 Task:** Individual action cards sit ordered inside a parent column layout via sequential positional indicators.

---

## 🛣️ API Endpoints Registry

### 🔐 Authentication Gateway (`/api/auth`)
* `POST /register` - Registers a new user identity (Defaults to `Member` role).
* `POST /login` - Evaluates credentials; returns a signed, cryptographically verified JWT bearer token.

### 👤 Profile Operations (`/api/users`)
* `GET /profile` - *[Protected]* Decodes bearer claims to expose the active user data envelope.

### 📋 Board Workspaces (`/api/boards`)
* `POST /` - *[Protected]* Generates a project board and seeds standard tracking columns.
* `GET /` - *[Protected]* Deep-fetches the user's workspace layouts alongside nested columns and tasks.
* `DELETE /:id` - *[Admin Only]* Destructive database purge requiring elevated privilege clearance.

### 📍 Task Manipulation (`/api/tasks`)
* `POST /` - *[Protected]* Injects an action card inside a target column structure.
* `PATCH /:id` - *[Protected]* Mutates title, description, or updates positional indices and shifts cards across columns.

---

## 🚀 Local Environment Installation & Initialization

### 1. Repository Setup & Dependencies Installation
Clone the repository to your environment and run:
```bash
npm install
