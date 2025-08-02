LLM Agent Onboarding Guide in Markdown format. This guide is intended for use by LLMs like Claude, ChatGPT, or Copilot operating in environments like Cursor or Replit.

markdown
CopyEdit
# 🧠 LLM Agent Onboarding Guide for `homeowners-insurance-ai`

This document is for AI coding agents (e.g., Claude in Cursor, Copilot, ChatGPT) to correctly interpret and operate on the [Product Requirements Document (PRD)](../PRD.md) for the **Homeowners Insurance AI** project.

## 🚀 Goal

Enable the AI agent to:
- Generate valid, modular React + Node.js code using the PRD
- Respect the architecture, folder structure, and business logic
- Accelerate development in Cursor or Replit with minimal human intervention

---

## 📂 Project Overview

- **Frontend**: React 19 + TypeScript + Tailwind CSS, modular by feature
- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma
- **Hosting**: Replit monorepo with `frontend/` and `backend/`
- **AI Integration**: OpenAI GPT-4 Vision for item extraction from room photos

---

## 🧱 Where to Start

### Step 1: Scaffold the Backend Modules

Each backend module lives under:

backend/src/modules/<module-name>/
markdown
CopyEdit
Recommended starting order:

1. `auth/` — Authentication + JWT token logic
2. `users/` — User profile management
3. `households/` — Core domain object: households
4. `rooms/` — Rooms inside a household
5. `photo-processing/` — File uploads, validation, scanning
6. `ai-integration/` — AI analysis orchestration
7. `inventory/` — Inventory CRUD and organization

Use `auth.controller.ts`, `auth.service.ts`, `auth.routes.ts` as base patterns.

### Step 2: Scaffold the Frontend Modules

Each frontend module lives under:

frontend/src/modules/<module-name>/
vbnet
CopyEdit
Use the following structure:

/auth/components/pages/hooks/contexts/components/ui
markdown
CopyEdit
Start with:

- `LoginForm.tsx`
- `SignupForm.tsx`
- `AuthPage.tsx`
- `useAuth.ts`
- `AuthContext.tsx`

Ensure all state is handled via Context + custom hooks (no Redux).

---

## 🔁 API Integration & Standards

All frontend-to-backend API requests should:
- Use RESTful endpoints defined in the PRD
- Be typed using shared TypeScript interfaces (`types/`)
- Use `api/<module>Api.ts` files on the frontend
- Handle auth with the JWT token stored in memory (access) or secure cookie (refresh)

Example:
```tsx
// frontend/src/api/authApi.ts
export async function loginUser(email: string, password: string) { ... }

🧠 Prompt Engineering Guidance
Use the prompt in ai-integration/promptTemplates.ts as-is when interacting with GPT-4 Vision.
You must:
Expect structured JSON from AI
Validate all AI output against the schema in InventoryItem model
Implement retry logic and fallback behavior if AI response is malformed

📡 WebSocket Updates (AI Processing)
AI analysis sends real-time updates via WebSocket:
ts
CopyEdit
ws://localhost:3000/api/inventory/status/:jobId
Ensure:
Job ID is unique per room analysis
ProcessingStatus interface is followed for frontend updates
AIProcessingStatusDisplay.tsx updates UI live

🔐 Security Rules for LLMs
LLMs must enforce security and validation rules defined in the PRD:
Use RBAC + JWT checks on every backend route
Enforce Business Rules (BR-AUTH-001, etc.) as validation logic or error responses
Never expose raw stack traces in API responses
Always sanitize logs and AI inputs/outputs

✅ Code Completion Standards
Use consistent formatting (ESLint + Prettier will run)
Use correct file/folder placement as defined in PRD
Add tests under /tests/unit and /tests/integration
Generate OpenAPI-like request/response types (even if not exposed)
Use only approved libraries (see PRD for Tailwind, Vite, Prisma, etc.)

📊 How to Validate Completion
LLMs should confirm:



🔎 Useful Shortcuts
PRD Module Reference: Search ### 4.x Module: for full specs
Business Rules: Look for BR- IDs with exact validation and errors
DB Schema: See 3.0 Database Schema Design
Folder Structure: See 2.4 Project Folder Structure

📦 Deployment Reminder (Replit)
Use "start": "node backend/dist/index.js" for backend
Use "build:frontend" and "build:backend" separately
Set .env variables for:
DATABASE_URL
OPENAI_API_KEY
JWT_SECRET
STRIPE_SECRET_KEY

💡 Final Notes for LLMs
You are a modular, secure, performance-aware AI developer. Prioritize clarity, maintainability, and correctness. Follow the PRD. Use smart scaffolding. Validate everything.
Happy building!
