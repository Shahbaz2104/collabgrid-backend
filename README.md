
---

# CollabGrid Backend Engine 🚀

A highly secure, decoupled, and type-safe backend authentication API built using **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**. This serves as the foundational core framework for the entire CollabGrid ecosystem.

---

## 🛠️ System Tech Stack Explained

If you are new to backend development, here is a breakdown of the tools we chose and why they matter:

* **Node.js & Express.js:** Node.js is a runtime environment that allows us to run JavaScript on a server instead of just inside a web browser. Express.js is a minimal, fast framework built on top of Node.js that simplifies handling incoming HTTP server requests (like `POST` or `GET`).
* **TypeScript (`ts-node`):** TypeScript adds static typing to JavaScript. It catches syntax errors and bugs directly inside the code editor before the application ever runs, ensuring production stability.
* **PostgreSQL & Prisma ORM:** PostgreSQL is an enterprise-grade relational database. Instead of writing raw SQL commands by hand, we use **Prisma ORM** (Object-Relational Mapping). Prisma allows us to interact with our database tables using clean, type-safe JavaScript methods (e.g., `prisma.user.create()`).
* **Bcrypt:** You must **never** store passwords as plain text in a database. Bcrypt runs raw passwords through a heavy cryptographic hashing function along with an isolated "salt" (random characters) 10 times over. This transforms a password like `MyPassword123` into an irreversible string like `$2b$10$X7...`, keeping user data fully secure even if a database breach occurs.
* **JSON Web Tokens (JWT):** HTTP requests are stateless, meaning the server forgets who you are the millisecond a request finishes. When a user logs in, we sign a custom JWT containing their user ID and role. The user stores this token and sends it along in the header of future requests, proving their identity seamlessly without re-authenticating every single second.
* **Zod:** Security starts at the gate. Zod is a runtime validation library. If a user tries to register with an invalid email address or a password that is too short, Zod instantly flags it and rejects the request before it ever consumes database computing power.

---

## 🏗️ Deep-Dive Architectural Overview

The project is built using a **layered, decoupled design pattern**. Instead of throwing all our code into a single file, every task is strictly isolated. This makes the system incredibly easy to scale, test, and maintain.

### 1. The Entry Point (`src/server.ts`)

This is the heart of the application. It initializes the Express application server, configures global security rules (like CORS policy rules), mounts the routing blocks, and binds the server execution lifecycle to a local machine network port.

### 2. The Data Layer Link (`src/db.ts`)

Instead of opening a brand-new connection instance to PostgreSQL every time a user makes a request (which slows down and crashes production environments), this file instantiates a single, globally shared **PrismaClient** singleton instance.

### 3. The Input Validation Layer (`src/schemas/authSchema.ts`)

This acts as our defensive wall. We define strict shapes for incoming client payloads using Zod schemas:

* `registerSchema`: Ensures `email` is structured correctly, and `password` meets minimum length security thresholds.
* `loginSchema`: Inspects incoming login fields before passing execution down to the database layers.

### 4. The Request Gatekeepers (`src/middleware/authMiddleware.ts`)

Middleware functions intercept a request before it reaches a private route handler. Our `authenticateToken` middleware:

1. Grabs the incoming HTTP request.
2. Extracts the `Authorization` header and strips out the `Bearer ` prefix.
3. Cryptographically decrypts and validates the JWT signature against the server's private `JWT_SECRET`.
4. Extends the Express `Request` scope object, binding the user's `userId` and `role` information directly onto the request lifecycle so down-stream endpoints know exactly who is executing the actions.

### 5. The Logic Core Controllers (`src/controllers/authController.ts`)

Controllers handle the core business logic processing of the app:

* **`registerUser`:** Checks if an email is already occupied, salts and hashes the new password sequence, and persists the record safely inside PostgreSQL via Prisma.
* **`loginUser`:** Locates the existing profile via email, runs an exact cryptographic comparison via `bcrypt.compare()`, and mints a secure custom signed JWT token valid for 24 hours if credentials match up.

---

## 🚀 Step-by-Step Local Installation & Setup

Follow these exact steps to clone, configure, and spin up this backend engine locally on your machine:

### 1. Clone the repository

```bash
git clone https://github.com/Shahbaz2104/collabgrid-backend.git
cd collabgrid-backend

```

### 2. Install dependencies

Download and unpack all core architectural design systems listed in `package.json`:

```bash
npm install

```

### 3. Configure Environment Variables

The application looks for hidden operating values inside a `.env` file. Create a new file named `.env` in the root project folder:

```bash
touch .env

```

Paste the following block into it, swapping out the placeholder credentials with your local PostgreSQL parameters:

```env
PORT=3000
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/YOUR_DB_NAME?schema=collabgrid_schema"
JWT_SECRET="super_secret_cryptographic_signing_key_here"

```

### 4. Synchronize Database & Generate Client

Synchronize your local schema layout definitions and compile your internal database type-safe definitions cleanly:

```bash
npx prisma generate

```

### 5. Fire up the development environment

Launch the engine with live-reload hot-swapping listening actively for source modifications:

```bash
npm run dev

```

Your terminal will clear and show a clean victory line:
`🚀 CollabGrid Engine live at http://localhost:3000`

---

## 🧪 Testing the API Endpoints

Once your server is running locally, use a terminal tool like `curl` (or Postman) to interact with your identity infrastructure gateway parameters:

### 1. Register a New Account

```bash
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "dev-test@gmail.com", "password": "SuperSecurePassword123"}'

```

### 2. Login to Generate an Identity Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "dev-test@gmail.com", "password": "SuperSecurePassword123"}'

```

*Copy the long `"token"` string returned inside the successful JSON response block.*

### 3. Access a Private Protected Profile Route

Test the middleware security gatekeeper by supplying your signed token credentials directly inside an HTTP Authorization Header request wrapper:

```bash
curl -X GET http://localhost:3000/api/users/profile \
     -H "Authorization: Bearer PASTE_YOUR_COPIED_JWT_TOKEN_STRING_HERE"

```
