
Homeowners Insurance AI - Comprehensive Product Requirements Document (Revised for Accounts, Generalized Files, Policies & Claims)


1.0 Introduction & Vision


1.1 Product Vision

To be the trusted guide that empowers every household to simply and securely protect their assets, providing true peace of mind through AI-powered inventory management and insurance analysis.

1.2 The Problem

Most homeowners and renters lack accurate, up-to-date documentation of their household goods' value. This becomes critical during catastrophic events like fires, floods, or major theft. Victims often experience shock, vulnerability, and overwhelming stress when trying to provide detailed inventories to insurance companies. Manual inventory creation from memory is emotionally taxing and guarantees inaccuracies, leading to incomplete claims and significant financial loss.

1.3 Target Audience & Personas


Primary Persona: "The Proactive Homeowner" (Insurance & Preparedness)

Who: Homeowners aged 35-60, financially responsible, tech-savvy but time-poor
Needs: Insurance-grade inventory ensuring maximum reimbursement, intelligent guidance for insurance practices, proactive documentation prompts for high-value items
Success Metric: Frictionless and complete claims process

Secondary Persona: "The Millennial Renter" (Financial & Lifestyle Utility)

Who: Renters aged 25-35, frequent movers, mix of high-value electronics and sentimental items
Needs: Financial benefit of accurate inventory for renter's insurance, practical everyday utility
Success Metric: Living, useful asset that serves as a "personal asset graph"

1.4 Strategic Goals & Success Metrics

Business Goal: Profitable, scalable subscription service with strong ARR and high retention
Primary Metric: Annual Recurring Revenue (ARR)
Year 1 KPIs: Subscriber activation, user engagement, system value
Post-Year 1: >85% membership renewal rate, new subscription growth

2.0 Technical Architecture & Stack


2.1 Technology Stack


Frontend

Framework: React 19.1.0 with TypeScript
Build Tool: Vite 7.0.4
Styling: Tailwind CSS 4.1.11 with custom design system
State Management: React Context API with custom hooks
Animation: Framer Motion 12.23.12
Icons: Lucide React 0.536.0
Utilities: clsx 2.1.1, tailwind-merge 3.3.1

Backend

Runtime: Node.js with TypeScript
Framework: Express.js with TypeScript
Database: PostgreSQL with Prisma ORM
Authentication: JWT with two-token system (access + refresh)
File Storage: Replit's built-in file storage system
AI Integration: OpenAI GPT-4 API
Payment Processing: Stripe (initially mocked)

Development & Testing

Testing: Jest with React Testing Library
Linting: ESLint with TypeScript support
Documentation: Storybook for component documentation
Deployment: Replit Core/Native environment

2.2 Security Architecture


Zero Trust Principles

Never Trust, Always Verify: All requests must be authenticated and authorized
Least Privilege Access: Users only access resources they need. Implement granular role-based access control (RBAC) checks on all API endpoints.
Micro-segmentation: Separate network segments for different services
Continuous Monitoring: Real-time security monitoring and logging

JWT Implementation

Access Token: 15-minute lifespan, stored in memory
Refresh Token: 24-hour lifespan, stored in HttpOnly cookie
Silent Refresh: Automatic token renewal without user interruption
Token Rotation: Refresh tokens rotate on each use

Security Headers

TypeScript

// Required security headers
{
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

2.3 Modular Architecture Overview

The application will be developed using a modular architecture to ensure clear separation of concerns, improve maintainability, facilitate parallel development, and enable easier code generation by AI tools. Each module encapsulates a specific set of functionalities and responsibilities.

1. User Authentication Module

Why a module: This module encapsulates all functionalities related to individual user identity, including registration, login, session management (JWT handling), and password recovery. It authenticates a User, who then gains access to Accounts based on their membership.

2. User Profile & Management Module

Why a module: This module is responsible for storing, retrieving, and updating user-specific metadata (e.g., names, contact info, individual login attempts). It manages the individual user's personal profile, distinct from the account they belong to.

3. Account Management Module

Why a module: NEW MODULE. This is the central module for managing Account entities. It handles account creation, settings, and crucially, inviting and managing AccountMembers (other users) with specific roles (Owner, Viewer, Legal Advisor, Financial Advisor). This module is foundational for RBAC and shared data access.

4. Household Management Module

Why a module: This module governs the core business entity of a "household," handling its creation, retrieval, updates, and deletion. Households are now owned by Accounts. It includes the business logic for enforcing subscription-based limits on the number of households an account can manage.


11. Subscription & Entitlements Engine Module

Why a module: This module centrally manages and enforces user entitlements based on their Account's subscription level, determining what features an Account (and its AccountMembers) can access and what operational limits they face (e.g., number of rooms, items, AI analyses). It provides a single source of truth for all feature gating and quota management.

12. Payment Processing Module

Why a module: This module abstracts away the complexities of integrating with external payment gateways (Stripe). It handles subscription lifecycle events (creation, cancellation, renewals) for Accountsand ensures secure processing of financial transactions, even if initially mocked.

13. Data Export & Reporting Module

Why a module: This module is responsible for generating structured data exports (CSV, PDF) and summary reports based on an Account's inventory, policies, and claims. It encapsulates the logic for data retrieval, formatting, and file generation.

14. Global UI Components Library/Module (Frontend-Specific)

Why a module: This module is purely frontend-focused and provides a reusable collection of atomic and molecular UI components (buttons, inputs, modals, navigation, icons) that adhere to the application's design system. It ensures visual consistency, accelerates development, and simplifies component testing.

15. Database Access / ORM Module (Backend-Specific)

Why a module: This backend-specific module provides an abstraction layer over the database, typically using an ORM like Prisma, to perform CRUD operations on all entities (Users, Accounts, Households, Rooms, Inventory Items, Collections, Subscriptions, Files, Policies, Claims). It centralizes data access logic and promotes consistency.

16. Centralized Logging & Monitoring Module

Why a module: This module standardizes how application events, errors, and performance metrics are logged and monitored across both frontend and backend. It ensures consistent log formats, facilitates debugging, and provides a unified mechanism for tracking system health and user behavior. Logs now include account_id where applicable.

17. Error Handling & Response Module

Why a module: This cross-cutting module defines a consistent strategy for handling errors across the application (both client and server) and generating user-friendly error messages or appropriate HTTP responses. It centralizes error mapping, logging of exceptions, and implementation of recovery strategies.

2.4 Project Folder Structure

The application will adopt a monorepo structure, dividing the codebase into backend/ and frontend/ directories, with further modularization within each as described below. This structure promotes clear separation of concerns, simplifies parallel development, and enhances compatibility with AI code generation tools.
homeowners-insurance-ai/
├── backend/
│   ├── src/
│   │   ├── app.ts                  // Main Express app setup, middleware, route loading
│   │   ├── config/
│   │   │   ├── index.ts            // Environment variables loading, main config
│   │   │   └── security.ts         // Security headers, JWT secrets setup
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts  // JWT validation, authentication checks
│   │   │   ├── error.middleware.ts // Global error handling (part of Error Handling & Response Module)
│   │   │   └── rateLimit.middleware.ts // Rate limiting for API endpoints
│   │   ├── modules/
│   │   │   ├── auth/                        // User Authentication Module (Backend part)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── users/                       // User Profile & Management Module (Backend part)
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   └── user.types.ts
│   │   │   ├── accounts/                    // NEW: Account Management Module (Backend part)
│   │   │   │   ├── account.controller.ts
│   │   │   │   ├── account.service.ts
│   │   │   │   ├── account.routes.ts
│   │   │   │   ├── account.types.ts
│   │   │   │   └── member.service.ts       // For managing account members/roles
│   │   │   ├── households/                  // Household Management Module (Backend part)
│   │   │   │   ├── household.controller.ts
│   │   │   │   ├── household.service.ts
│   │   │   │   ├── household.routes.ts
│   │   │   │   └── household.types.ts
│   │   │   ├── rooms/                       // Room Management Module (Backend part)
│   │   │   │   ├── room.controller.ts      // For managing room definitions/metadata
│   │   │   │   ├── room.service.ts         // Core logic for room management (as attributes)
│   │   │   │   ├── room.routes.ts
│   │   │   │   └── room.types.ts
│   │   │   ├── files/                       // REVISED: File Management & Storage Module (Backend part)
│   │   │   │   ├── file.controller.ts      // Handles uploads/downloads
│   │   │   │   ├── file.service.ts         // Core logic: validation, storage, metadata, conversion, security scan
│   │   │   │   ├── file.routes.ts
│   │   │   │   ├── file.types.ts
│   │   │   │   └── utils/
│   │   │   │       ├── imageConversion.ts  // HEIC to JPEG conversion utility
│   │   │   │       └── metadataExtractor.ts // EXIF data extraction
│   │   │   ├── ai-integration/              // AI Integration & Processing Module (Backend part)
│   │   │   │   ├── ai.controller.ts        // WebSocket connection handler
│   │   │   │   ├── ai.service.ts           // Orchestrates AI workflow for photos and documents
│   │   │   │   ├── ai.routes.ts            // Optional: for triggering AI processing via REST
│   │   │   │   ├── ai.types.ts
│   │   │   │   ├── promptTemplates.ts      // Stores AI prompts
│   │   │   │   └── worker.ts               // Worker process for queue consumption
│   │   │   ├── inventory/                   // Inventory Item & Collection Management Module (Backend part)
│   │   │   │   ├── inventory.controller.ts
│   │   │   │   ├── inventory.service.ts
│   │   │   │   ├── inventory.routes.ts
│   │   │   │   ├── inventory.types.ts
│   │   │   │   └── trash.service.ts        // Logic for soft delete and permanent delete
│   │   │   ├── policies/                    // NEW: Insurance Policy Management Module (Backend part)
│   │   │   │   ├── policy.controller.ts
│   │   │   │   ├── policy.service.ts
│   │   │   │   ├── policy.routes.ts
│   │   │   │   └── policy.types.ts
│   │   │   ├── claims/                      // NEW: Claims Management Module (Backend part)
│   │   │   │   ├── claim.controller.ts
│   │   │   │   ├── claim.service.ts
│   │   │   │   ├── claim.routes.ts
│   │   │   │   └── claim.types.ts
│   │   │   ├── subscriptions/               // Subscription & Entitlements Engine Module (Backend part)
│   │   │   │   ├── subscription.controller.ts
│   │   │   │   ├── subscription.service.ts // Manages account subscription status
│   │   │   │   ├── subscription.routes.ts
│   │   │   │   └── subscription.types.ts
│   │   │   ├── payments/                    // Payment Processing Module (Backend part)
│   │   │   │   ├── payment.controller.ts   // Handles Stripe webhooks/API calls
│   │   │   │   ├── payment.service.ts      // Integrates with Stripe API (mocked initially)
│   │   │   │   └── payment.types.ts
│   │   │   ├── exports/                     // Data Export & Reporting Module (Backend part)
│   │   │   │   ├── export.controller.ts
│   │   │   │   ├── export.service.ts       // Handles CSV/PDF generation logic
│   │   │   │   ├── export.routes.ts
│   │   │   │   └── export.types.ts
│   │   │   └── common/                      // Common utilities, not tied to a single domain
│   │   │       ├── database/                // Database Access / ORM Module (Backend-Specific)
│   │   │       │   ├── prisma.ts           // Prisma client instance, setup
│   │   │       │   ├── repositories/       // Optional: Wrapper for Prisma queries per model
│   │   │       │   │   ├── userRepository.ts
│   │   │       │   │   ├── accountRepository.ts
│   │   │       │   │   ├── householdRepository.ts
│   │   │       │   │   └── ...
│   │   │       │   └── types.ts            // Shared DB-related types
│   │   │       ├── errors/                  // Error Handling & Response Module (Backend part)
│   │   │       │   ├── apiError.ts         // Custom API error classes
│   │   │       │   ├── errorHandler.ts     // Centralized error handling logic
│   │   │       │   └── errorTypes.ts       // Enum or union for known error codes
│   │   │       ├── logging/                 // Centralized Logging & Monitoring Module (Backend part)
│   │   │       │   ├── logger.ts           // Winston/Pino setup, structured logging
│   │   │       │   └── metrics.ts          // Performance metric collection
│   │   │       ├── security/
│   │   │       │   ├── jwt.ts              // JWT utility functions (signing, verifying)
│   │   │       │   └── malwareScanner.ts   // Interface/client for ClamAV API
│   │   │       └── entitlements/            // Subscription & Entitlements Engine Module (Backend part) - core logic
│   │   │           ├── entitlements.service.ts // Core logic for checking/enforcing limits
│   │   │           └── entitlements.types.ts
│   │   ├── types/                     // Global backend types/interfaces
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── helpers.ts             // Generic utility functions
│   ├── tests/
│   │   ├── unit/
│   │   │   └── modules/
│   │   │       ├── auth.test.ts
│   │   │       └── ...
│   │   └── integration/
│   │       ├── api.test.ts
│   │       └── ...
│   ├── .env.development
│   ├── .env.production
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   // Main application entry point
│   │   ├── index.css                 // Tailwind CSS entry
│   │   ├── main.tsx
│   │   ├── api/                      // API client for backend communication
│   │   │   ├── authApi.ts
│   │   │   ├── accountsApi.ts        // NEW: for account management
│   │   │   ├── householdsApi.ts
│   │   │   └── ...
│   │   ├── assets/                   // Static assets (images, fonts)
│   │   ├── components/                // Global UI Components Library/Module (Frontend-Specific)
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── icons/
│   │   │   ├── feedback/
│   │   │   └── EmptyState.tsx
│   │   ├── contexts/                 // React Contexts (for state management)
│   │   │   ├── AuthContext.tsx
│   │   │   ├── AppContext.tsx
│   │   │   ├── AccountContext.tsx    // NEW: for current active account and user's role
│   │   │   └── NotificationContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useAccount.ts         // NEW: hook for active account/role
│   │   │   ├── useFormValidation.ts
│   │   │   └── ...
│   │   ├── modules/                  // Feature-specific modules (UI and logic)
│   │   │   ├── auth/                        // User Authentication Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   └── AuthPage.tsx
│   │   │   ├── user-profile/                // User Profile & Management Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   │       └── ProfilePage.tsx
│   │   │   ├── accounts/                    // NEW: Account Management Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   │   ├── AccountSwitcher.tsx
│   │   │   │   │   ├── AccountSettings.tsx
│   │   │   │   │   └── AccountMembersTable.tsx
│   │   │   │   └── pages/
│   │   │   │       ├── AccountSelectionPage.tsx // If user belongs to multiple accounts
│   │   │   │       └── AccountSettingsPage.tsx
│   │   │   ├── households/                  // Household Management Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   │       └── HouseholdsPage.tsx
│   │   │   ├── rooms/                       // Room Management Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   │       └── RoomDetailPage.tsx
│   │   │   ├── file-management/             // REVISED: File Management & Storage Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   │   ├── FileUpload.tsx
│   │   │   │   │   ├── FilePreview.tsx
│   │   │   │   │   └── DocumentList.tsx
│   │   │   │   └── pages/
│   │   │   │       └── DocumentUploadPage.tsx
│   │   │   ├── ai-processing/               // AI Integration & Processing Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   │       └── useAiProcessingStatus.ts
│   │   │   ├── inventory/                   // Inventory Item & Collection Management Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   │       └── InventoryDashboard.tsx
│   │   │   ├── policies/                    // NEW: Insurance Policy Management Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   │   ├── PolicyCard.tsx
│   │   │   │   │   └── PolicyUploadFlow.tsx
│   │   │   │   └── pages/
│   │   │   │       └── PoliciesDashboard.tsx
│   │   │   ├── claims/                      // NEW: Claims Management Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   │   ├── ClaimForm.tsx
│   │   │   │   │   └── ClaimStatusDisplay.tsx
│   │   │   │   └── pages/
│   │   │   │       └── ClaimsDashboard.tsx
│   │   │   ├── subscriptions/               // Subscription & Entitlements Engine Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   │       └── SubscriptionPage.tsx
│   │   │   ├── exports/                     // Data Export & Reporting Module (Frontend part)
│   │   │   │   ├── components/
│   │   │   │   └── pages/
│   │   │   │       └── ExportHistoryPage.tsx
│   │   │   └── settings/
│   │   │       └── pages/
│   │   │           └── SettingsPage.tsx
│   │   ├── routes/
│   │   │   ├── AppRouter.tsx
│   │   │   └── protectedRoutes.tsx
│   │   ├── styles/
│   │   │   └── tailwind.config.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── formValidation.ts
│   │       ├── constants.ts
│   │       └── helpers.ts
│   ├── public/
│   │   └── index.html
│   ├── tests/
│   │   ├── components/
│   │   ├── modules/
│   │   └── hooks/
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── .prettierrc
├── package.json
├── README.md
└── replit.nix

3.0 Database Schema Design


3.1 Core Tables


Users Table (Modified)

SQL

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Accounts Table (NEW)

SQL

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- e.g., "John Doe's Family Account", "Smith Family Holdings"
  owner_user_id UUID REFERENCES users(id) ON DELETE RESTRICT, -- The primary user associated with this account for billing/admin
  current_subscription_id UUID UNIQUE REFERENCES subscriptions(id) ON DELETE SET NULL, -- Link to the active subscription
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Account Members Table (NEW)

SQL

CREATE TABLE account_members (
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'owner', 'admin', 'editor', 'viewer', 'legal_advisor', 'financial_advisor'
  invited_by UUID REFERENCES users(id), -- Who invited them (optional)
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (account_id, user_id)
);

Subscriptions Table (Modified)

SQL

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE, -- Now linked to an account
  stripe_subscription_id VARCHAR(255),
  plan_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Households Table (Modified)

SQL

CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE, -- Now linked to an account
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


Files Table (REVISED - generalized from Photos)

SQL

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE, -- All files belong to an account
  user_id UUID REFERENCES users(id), -- Who uploaded/created the file
  file_path VARCHAR(500) NOT NULL, -- Path to storage (Replit, S3, etc.)
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  
  -- Polymorphic association: identifies the specific entity this file relates to
  entity_type VARCHAR(50) NOT NULL, -- e.g., 'InventoryItem', 'Room', 'Policy', 'Claim', 'Account'
  entity_id UUID, -- The ID of the related entity (can be NULL for general account-level files)

  file_purpose VARCHAR(50) NOT NULL, -- e.g., 'Inventory Photo', 'Policy Document', 'Appraisal', 'Receipt', 'Claim Export', 'Other'
  
  metadata JSONB, -- For EXIF data for photos, or other file-specific metadata (e.g., policy page numbers)
  security_scan_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'clean', 'infected', 'error'
  
  is_primary BOOLEAN DEFAULT FALSE, -- e.g., for a photo, is it the main thumbnail?
  deleted_at TIMESTAMP, -- For soft deletion
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraint to enforce valid entity_type and entity_id combinations (simplified for example)
  CONSTRAINT chk_files_entity_association CHECK (
    (entity_type = 'Account' AND entity_id IS NULL) OR
    (entity_type = 'Household' AND entity_id IS NOT NULL) OR -- If a file broadly relates to a household
    (entity_type = 'Room' AND entity_id IS NOT NULL) OR
    (entity_type = 'InventoryItem' AND entity_id IS NOT NULL) OR
    (entity_type = 'Policy' AND entity_id IS NOT NULL) OR
    (entity_type = 'Claim' AND entity_id IS NOT NULL)
  )
);

Inventory Items Table (Modified - now links to files for photos)

SQL

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL, -- Room is now a descriptive location, not necessarily a rigid container
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL, -- Collection as a flexible grouping
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  estimated_value DECIMAL(10,2),
  condition VARCHAR(20),
  location_hint TEXT,
  is_high_value BOOLEAN DEFAULT FALSE,
  ai_generated BOOLEAN DEFAULT FALSE,
  user_corrected BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Insurance Policies Table (NEW)

SQL

CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE, -- Policy belongs to an account
  name VARCHAR(255) NOT NULL, -- e.g., "Main Home Policy 2024", "Rental Property Policy"
  insurer_name VARCHAR(255),
  policy_number VARCHAR(255), -- Not necessarily unique globally, but for this account
  policy_type VARCHAR(50), -- e.g., 'Homeowners', 'Renters', 'Auto', 'Umbrella'
  effective_date DATE,
  expiration_date DATE,
  total_coverage_amount DECIMAL(15,2),
  deductible DECIMAL(10,2),
  ai_analysis_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'analyzing', 'completed', 'error'
  ai_analysis_summary TEXT, -- AI-extracted key details
  user_verified BOOLEAN DEFAULT FALSE, -- Has user confirmed AI analysis?
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_policy_number_per_account_insurer UNIQUE (account_id, policy_number, insurer_name) -- Ensure uniqueness for practical purposes
);

Claims Table (NEW)

SQL

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE, -- Claim belongs to an account
  policy_id UUID REFERENCES insurance_policies(id), -- Which policy this claim is against (nullable if not linked to a specific policy yet)
  claim_number VARCHAR(255) UNIQUE, -- If provided by insurer, unique within the system
  date_of_loss DATE NOT NULL,
  loss_type VARCHAR(50), -- e.g., 'Fire', 'Theft', 'Flood', 'Damage', 'Other'
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'under_review', 'approved', 'denied', 'closed'
  estimated_claim_value DECIMAL(15,2), -- Calculated from items
  insurer_adjuster_name VARCHAR(255),
  insurer_contact_info TEXT,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

);

3.2 Indexes for Performance

SQL

-- Performance indexes (updated for new tables and relationships)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_owner_user_id ON accounts(owner_user_id);
CREATE INDEX idx_account_members_account_id ON account_members(account_id);
CREATE INDEX idx_account_members_user_id ON account_members(user_id);
CREATE INDEX idx_subscriptions_account_id ON subscriptions(account_id);
CREATE INDEX idx_households_account_id ON households(account_id);

4.0 Core Features & Implementation (Organized by Modules)


4.1 Module: User Authentication Module

This module encompasses all functionalities related to individual user registration, login, password management, and JWT token handling. It authenticates a User, who then gains access to Accounts based on their membership.

4.1.1 User Registration

Implementation Details:
TypeScript

// Backend registration endpoint
POST /api/auth/register
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Response (initial registration might create a default account or prompt for one)
{
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken: string;
  // May include default account info or redirect to account creation/selection
}
Frontend Components:
SignupForm.tsx with real-time validation and clear error feedback.
Password strength indicator to guide users.
Email confirmation flow (future enhancement for full account activation).

4.1.2 User Login

Implementation Details:
TypeScript

// Backend login endpoint
POST /api/auth/login
{
  email: string;
  password: string;
}

// Response
{
  success: boolean;
  user: UserObject;
  accessToken: string;
  refreshToken: string;
  accounts: AccountPreview[]; // List of accounts this user is a member of
}
Frontend Components:
LoginForm.tsx with secure input fields and error display.
After login, if multiple accounts exist, AccountSelectionPage.tsx will be displayed.

4.1.3 Password Reset

Implementation Details:
TypeScript

// Request reset
POST /api/auth/forgot-password
{
  email: string;
}

// Reset password
POST /api/auth/reset-password
{
  token: string;
  newPassword: string;
}
Frontend Components:
ForgotPasswordForm.tsx for requesting a reset email.
ResetPasswordForm.tsx for entering a new password with the token.

4.1.4 Business Rules



4.2 Module: User Profile & Management Module

This module handles the non-authentication related management of individual user data and profiles.

4.2.1 User Profile Management

Backend APIs:
GET /api/users/:id: Retrieve individual user details.
PUT /api/users/:id: Update user's first name, last name, or other non-sensitive profile information.
Frontend Components:
UserProfileSettings.tsx: Component to display and allow editing of user profile information.

4.2.2 Business Rules



4.3 Module: Account Management Module (NEW)

This module is central to managing Account entities, including their creation, settings, and, crucially, inviting and managing AccountMembers (other users) with specific roles.

4.3.1 Account Creation & Management

Backend APIs:
TypeScript

// Create Account (typically done during initial user registration or later)
POST /api/accounts
{
  name: string;
  // The authenticated user will automatically become the 'owner'
}

// Get user's accessible accounts
GET /api/accounts

// Get details of a specific account (if user has access)
GET /api/accounts/:accountId

// Update account details (e.g., name)
PUT /api/accounts/:accountId
{
  name?: string;
  // Only Account Owners/Admins can update
}
Frontend Components:
AccountSelectionPage.tsx: Allows users belonging to multiple accounts to select which one to work within.
AccountSettingsPage.tsx: Displays and allows editing of account-level details.
CreateAccountForm.tsx: Form for creating new accounts.

4.3.2 Account Member Management (RBAC)

Backend APIs:
TypeScript

// Invite a new member to an account
POST /api/accounts/:accountId/members/invite
{
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'legal_advisor' | 'financial_advisor';
}

// Update a member's role
PUT /api/accounts/:accountId/members/:userId/role
{
  role: 'admin' | 'editor' | 'viewer' | 'legal_advisor' | 'financial_advisor';
}

// Remove a member from an account
DELETE /api/accounts/:accountId/members/:userId

// Get all members for an account
GET /api/accounts/:accountId/members
Frontend Components:
AccountMembersTable.tsx: Lists all members of the current account with their roles.
InviteMemberModal.tsx: Interface for inviting new users and assigning roles.
Role-based UI elements: Show/hide features based on the current user's role in the active account.

4.3.3 Business Rules



4.4 Module: Household Management Module

This module governs the core business entity of a "household," handling its creation, retrieval, updates, and deletion. Households are now owned by Accounts. It includes the business logic for enforcing subscription-based limits on the number of households an account can manage.

4.4.1 Household Management Operations

Implementation Details (Backend):
TypeScript

// Create household for the active account
POST /api/accounts/:accountId/households
{
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

// Update household for the active account
PUT /api/households/:householdId
{
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Get active account's households
GET /api/accounts/:accountId/households
Frontend Components:
HouseholdList.tsx: Displays a list of the active account's households.
HouseholdForm.tsx: Form for creating or editing household details.
HouseholdDetails.tsx: Displays specific household information.

4.4.2 Business Rules



4.11 Module: Subscription & Entitlements Engine Module

This module centrally manages and enforces user entitlements based on their Account's subscription level, determining what features an Account (and its AccountMembers) can access and what operational limits they face (e.g., number of rooms, items, AI analyses). It provides a single source of truth for all feature gating and quota management.

4.11.1 Subscription Level Definitions

TypeScript

interface SubscriptionLevel {
  id: string;
  name: 'free' | 'premium' | 'platinum';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  limits: {
    households: number;
    totalItems: number;
    aiAnalysesPerMonth: number; // Applies to both inventory photos and policy docs
    policyDocuments: number; // Max number of policies an account can store
    claimsManagement: boolean; // Access to Claims Management module
    pdfExport: boolean;
  };
  features: string[]; // List of additional features (e.g., "AI powered value suggestions")
}
Level Definitions:
Free: 1 household, 2,000 items, 5 AI analyses/month, 1 policy document, no claims management, no PDF export.
Premium: 1 household, 20,000 items, 20 AI analyses/month, 5 policy documents, claims management access, PDF export.
Platinum: 2 households, 200,000 items, 100 AI analyses/month, 20 policy documents, claims management access, PDF export.

4.11.2 Entitlements Engine (Backend Logic)

TypeScript

class EntitlementsEngine {
  /**
   * Checks if an account is allowed to perform a specific action based on its subscription and member's role.
   * Actions include 'CREATE_HOUSEHOLD', 'UPLOAD_FILE', 'RUN_AI_ANALYSIS_INVENTORY', 'RUN_AI_ANALYSIS_POLICY', 'CREATE_POLICY', 'CREATE_CLAIM'.
   */
  async checkAccountLimits(accountId: string, userId: string, action: string): Promise<boolean>;

  /**
   * Retrieves the current usage and limits for an account.
   */
  async getRemainingQuota(accountId: string): Promise<QuotaInfo>;

  /**
   * Increments the usage count for a specific action (e.g., file upload, AI analysis).
   */
  async incrementUsage(accountId: string, action: string): Promise<void>;

  /**
   * Enforces limits for a resource creation/update, throwing an error if limit is exceeded.
   * Used before persisting new households, rooms, files, policies, claims, etc.
   */
  async enforceLimits(accountId: string, resource: string): Promise<void>;
}

interface QuotaInfo {
  households: { used: number; limit: number };
  items: { used: number; limit: number };
  aiAnalyses: { used: number; limit: number };
  policyDocuments: { used: number; limit: number };
}
Frontend Components:
SubscriptionStatusDisplay.tsx: Shows current plan, remaining quotas, and upgrade prompts for the active account.
UpgradePlanModal.tsx: Interface for selecting and initiating subscription upgrades.

4.11.3 Business Rules



4.12 Module: Payment Processing Module

This module handles the integration with Stripe (initially mocked) for managing Account subscriptions and payments.

4.12.1 Mock Stripe Integration (Backend Service)

TypeScript

// Mock Stripe service
class MockStripeService {
  async createSubscription(accountId: string, planId: string): Promise<Subscription> {
    // Simulate Stripe API call
    return {
      id: `sub_${generateId()}`,
      status: 'active',
      planId,
      accountId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: addMonths(new Date(), 1)
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Simulate cancellation
    console.log(`Mock: Cancelled subscription ${subscriptionId}`);
  }

  async getSubscriptionDetails(subscriptionId: string): Promise<Subscription> {
    // Simulate retrieval
    return { /* ... mock data ... */ };
  }
}
Backend API Endpoints (Placeholder for future Stripe webhook integration):
POST /api/stripe/webhook: For handling Stripe events (e.g., successful payment, subscription cancelled).

4.12.2 Business Rules



4.13 Module: Data Export & Reporting Module

This module provides functionality to export inventory data, policy details, and claim information in various formats and potentially generate summary reports.

4.14 Module: Global UI Components Library/Module (Frontend-Specific)

This module centralizes all reusable UI components that are not specific to a particular feature or business domain.
Contents:
Atomic Components: Buttons, Input fields, Checkboxes, Radios, Icons (Lucide React).
Molecular Components: Modals, Toasts/Notifications, Spinners/Loaders, Navigation bars, Dropdowns, Tabs.
Styling Utilities: Integration with Tailwind CSS and custom design system tokens (colors, spacing, typography).
Animation Primitives: Reusable components/hooks for Framer Motion animations.
Why a module: Centralizing these ensures visual consistency, promotes reusability, reduces redundant code, and simplifies maintenance. It allows frontend developers to build complex UIs rapidly by composing these building blocks, and provides a clear catalog for Storybook documentation.

4.14.1 Business Rules



4.15 Module: Database Access / ORM Module (Backend-Specific)

This module provides the direct interface for all application services to interact with the PostgreSQL database via Prisma ORM.
Responsibilities:
Define Prisma schema models mapping to users, accounts, account_members, households, rooms, files, inventory_items, collections, subscriptions, insurance_policies, claims, claim_items tables.
Encapsulate all direct database queries (CRUD operations) for each entity, potentially via repository pattern (e.g., UserRepository).
Handle database connection management.
Ensure efficient data retrieval and persistence.
Why a module: This module abstracts away the underlying database technology and direct SQL queries from the business logic layer. It centralizes all data access patterns, making it easier to switch databases or ORMs in the future, and promotes consistency in data manipulation.

4.15.1 Business Rules



4.16 Module: Centralized Logging & Monitoring Module

This module defines and implements the application's logging strategy and provides utilities for performance monitoring.

4.16.1 Logging Strategy (Backend & Frontend)

Structured Logging Format:
TypeScript

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  userId?: string;
  accountId?: string; // NEW: Logged for multi-tenancy context
  action?: string;
  metadata?: Record<string, any>; // Additional context data
  sessionId?: string;
  component?: string; // e.g., 'AuthService', 'FileManagementModule'
}
User Click Tracking (Frontend):
TypeScript

interface UserAction {
  userId: string;
  accountId?: string; // NEW: For analytics per account
  action: string; // e.g., 'CLICK_BUTTON', 'FORM_SUBMIT'
  component: string; // e.g., 'SignupForm', 'FileUpload'
  timestamp: Date;
  metadata: {
    page: string;
    element: string; // e.g., 'login-button', 'file-input'
    value?: any; // Sanitized input value if relevant
  };
}
Why a module: Standardizing logging ensures that all critical application events, errors, and user interactions are captured in a consistent and analyzable format. This central repository for logs is crucial for debugging, auditing, security analysis, and performance monitoring.

4.16.2 Business Rules



4.17 Module: Error Handling & Response Module

This cross-cutting module defines a consistent strategy for handling and responding to errors across the application.
Responsibilities:
Centralized Error Catching: Global error handlers (middleware for Express.js, React Error Boundaries for frontend).
Error Classification: Mapping raw errors (e.g., database errors, external API failures, validation errors) to specific, user-friendly error types (FILE_ERROR, AI_TIMEOUT, VALIDATION_ERROR).
Standardized Error Responses: Ensuring API error responses follow a consistent format (e.g., { success: false, code: 'ERROR_CODE', message: 'User-friendly message', details: [...] }).
User Notification: Presenting clear, actionable error messages to the user on the frontend.
Recovery Strategies: Implementing system-level retries or graceful degradation for specific error types.
Error Logging: Utilizing the Centralized Logging & Monitoring Module to log all errors for debugging and analysis.
Why a module: A dedicated error handling module ensures that errors are caught, processed, and presented consistently across the entire application, improving user experience and making debugging significantly more efficient. It centralizes complex logic for error mapping, logging, and recovery.

4.17.1 Business Rules




5.0 Testing Strategy


5.1 Unit Testing Requirements

Frontend Testing:
Component testing with React Testing Library
Hook testing with custom test utilities
Form validation testing (e.g., for Auth Module, Household Management Module)
Error handling testing for Error Handling & Response Module and specific feature modules.
Accessibility testing with jest-axe
Backend Testing:
API endpoint testing with supertest
Database integration testing (via Database Access / ORM Module)
Authentication middleware testing (for User Authentication Module, Account Management Module)
File upload testing (for File Management & Storage Module)
AI integration mocking (for AI Integration & Processing Module)
Role-based access control testing (Account Management Module, Entitlements Engine Module)
Test Coverage Requirements:
Minimum 80% code coverage
100% coverage for critical paths (auth, payments, file upload, AI processing, account management, RBAC enforcement)
All error conditions must be tested (using Error Handling & Response Module guidelines).
Performance testing for file uploads.

5.2 Integration Testing Strategy

API Integration Tests:
End-to-end authentication and account selection flow.
File upload and AI processing pipeline (File Management & Storage Module -> AI Integration & Processing Module -> Inventory Item & Collection Management Module / Insurance Policy Management Module).
Database transaction testing (via Database Access / ORM Module).
Error recovery scenarios.
Comprehensive RBAC tests across all protected endpoints.
UI Integration Tests:
User registration, login, and account selection flow.
Account creation, member invitation, and role changes.
Household creation and file uploads (photos, policy documents).
Inventory management workflows.
Policy creation and AI analysis.
Claims creation and item association.
Subscription upgrade/downgrade.
Export functionality.

6.0 Deployment & Infrastructure


6.1 Replit Deployment Configuration

Environment Setup:
JSON

{
  "name": "homeowners-insurance-ai",
  "language": "nodejs",
  "run": "npm run dev",
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "postgresql://...",
    "JWT_SECRET": "your-secret-key",
    "OPENAI_API_KEY": "your-openai-key",
    "STRIPE_SECRET_KEY": "your-stripe-key"
  }
}
Build Configuration:
JSON

{
  "scripts": {
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build",
    "build:backend": "tsc -p backend/tsconfig.json",
    "start": "node backend/dist/index.js"
  }
}

6.2 Environment Configuration

Development Environment:
Bash

# .env.development
DATABASE_URL=postgresql://localhost:5432/homeowners_dev
JWT_SECRET=dev-secret-key
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=development
Production Environment:
Bash

# .env.production
DATABASE_URL=postgresql://production-db-url
JWT_SECRET=production-secret-key
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=sk_live_...
NODE_ENV=production

7.0 Monitoring & Logging

This section leverages the Centralized Logging & Monitoring Module.

7.1 Logging Strategy

(See Centralized Logging & Monitoring Module for structured logging format and user click tracking details.)

7.2 Performance Monitoring

Key Metrics (Captured via Centralized Logging & Monitoring Module):
API response times
File upload success rates
AI processing times
Database query performance
User engagement metrics per account
Specific module performance (e.g., policy analysis time)
Alerting:
Error rate > 5%
Response time > 2 seconds
AI processing failures
Database connection issues
Security alerts (e.g., failed login attempts, malware detections)

8.0 Success Metrics & KPIs


8.1 Technical Metrics

Performance: API response time < 500ms
Reliability: 99.9% uptime
Security: Zero security incidents
Quality: < 1% error rate

8.2 Business Metrics

User Acquisition: Monthly signup growth
Engagement: Daily active users, active accounts
Retention: 30-day retention rate for accounts
Revenue: Monthly recurring revenue, average revenue per account (ARPA)

8.3 User Experience Metrics

Task Completion: Household/Account creation < 1 minute
File Upload: Success rate > 95%
AI Processing: Inventory item accuracy > 90%, Policy data extraction accuracy > 85%
Export Functionality: Success rate > 98%
Account Sharing: Successful invitations/role assignments

9.0 Open Questions & Future Considerations


9.1 Technical Questions

Specific antivirus service for malware scanning (e.g., ClamAV API provider). For MVP, integrating a managed ClamAV API service (e.g., from AWS Marketplace or a dedicated provider) is recommended. This offloads operational overhead, allowing focus on core features while maintaining a strong security posture. It leverages familiarity with ClamAV's capabilities without requiring self-hosting and virus definition updates.
Image enhancement service integration (e.g., for noise reduction, lighting correction before AI analysis). For MVP, this is not required. As per POC testing, quality can be managed effectively through prompting and requiring multiple photos. Image enhancement adds complexity and cost without a proven necessity at this stage. It should be considered post-MVP if real-world data reveals significant AI failures directly due to image quality that can be remediated by enhancement.
Backup and disaster recovery strategy for database and file storage. A robust strategy is critical due to the non-negotiable data retention requirements. For PostgreSQL, implement automated, point-in-time backups with tested restore procedures. For Replit's file storage, ensure independent backups (e.g., syncing files to highly durable cloud object storage like AWS S3 with versioning and encryption), as Replit's native backup features might not meet production-grade RPO/RTO needs.
Scaling strategy for AI processing to handle high load (e.g., message queues, serverless functions). Implement an asynchronous processing model using a message queue (e.g., Redis-based queue) and worker processes (e.g., serverless functions like AWS Lambda). File uploads and AI analysis requests would publish messages to the queue, and workers would consume these messages to handle AI API calls and subsequent data processing. This decouples the frontend, provides inherent scalability and resilience, and is cost-efficient for bursty AI workloads.

9.2 Business Questions

Pricing strategy for different markets and potential new subscription tiers, potentially differentiated by AI usage or number of accounts/users.
Partnership opportunities with insurance companies for direct integration or data sharing.
Mobile app development timeline and platform prioritization (iOS, Android).
International expansion considerations (localization, legal compliance, regional insurance variations).

