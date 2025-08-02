# 🏠 Homeowners Insurance AI

AI-powered inventory management and insurance analysis platform that empowers households to protect their assets with comprehensive documentation and intelligent guidance.

## 🎯 Vision

To be the trusted guide that empowers every household to simply and securely protect their assets, providing true peace of mind through AI-powered inventory management and insurance analysis.

## 🚀 Features

### Core Functionality
- **AI-Powered Inventory Management**: Automatically extract item details from photos using GPT-4 Vision
- **Multi-Account Support**: Family and business account management with role-based access
- **Insurance Policy Analysis**: AI-powered document analysis for policy understanding
- **Claims Management**: Comprehensive claims tracking and documentation
- **File Management**: Secure upload, validation, and malware scanning
- **Export & Reporting**: CSV/PDF exports for insurance documentation

### Security & Compliance
- **Zero Trust Architecture**: Never trust, always verify
- **JWT Authentication**: Secure token-based authentication with refresh
- **Role-Based Access Control**: Granular permissions for different user roles
- **Malware Scanning**: ClamAV integration for file security
- **Rate Limiting**: Protection against abuse and attacks

### AI Integration
- **OpenAI GPT-4 Vision**: Advanced image analysis for inventory items
- **Document Processing**: Policy document analysis and data extraction
- **Real-time Processing**: WebSocket updates for AI processing status
- **Queue Management**: Asynchronous processing for scalability

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 19.1.0 with TypeScript
- Vite 7.0.4 for build tooling
- Tailwind CSS 4.1.11 for styling
- Framer Motion 12.23.12 for animations
- Lucide React 0.536.0 for icons

**Backend**
- Node.js with TypeScript
- Express.js framework
- PostgreSQL with Prisma ORM
- Redis for caching and queues
- JWT for authentication

**AI & External Services**
- OpenAI GPT-4 Vision API
- Stripe for payment processing
- ClamAV for malware scanning
- Sentry for error tracking

### Modular Architecture

The application follows a modular architecture with clear separation of concerns:

```
homeowners-insurance-ai/
├── backend/                 # Backend API and services
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── accounts/   # Account management
│   │   │   ├── households/ # Household management
│   │   │   ├── files/      # File upload & storage
│   │   │   ├── ai-integration/ # AI processing
│   │   │   ├── inventory/  # Inventory management
│   │   │   ├── policies/   # Policy management
│   │   │   ├── claims/     # Claims management
│   │   │   └── ...
│   │   └── common/         # Shared utilities
├── frontend/               # React application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   └── api/           # API clients
└── tasks/                 # Development task list
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis (for caching and queues)
- OpenAI API key
- Stripe API keys (for payments)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/homeowners-insurance-ai.git
   cd homeowners-insurance-ai
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp backend/env.template backend/.env.development
   cp frontend/env.template frontend/.env.development
   
   # Edit the files with your actual values
   nano backend/.env.development
   nano frontend/.env.development
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   cd ..
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Environment Variables

#### Backend (.env.development)
```bash
# Database
DATABASE_URL=postgresql://localhost:5432/homeowners_dev

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=24h

# OpenAI
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4-vision-preview

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.development)
```bash
# API
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_BASE_URL=ws://localhost:3001

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Features
VITE_ENABLE_AI_PROCESSING=true
VITE_ENABLE_FILE_UPLOAD=true
```

## 🚀 Deployment

### Replit Deployment

For deployment on Replit, see [REPLIT_DEPLOYMENT.md](./REPLIT_DEPLOYMENT.md) for detailed instructions.

### Production Deployment

1. **Set production environment variables**
   ```bash
   cp backend/env.template backend/.env.production
   cp frontend/env.template frontend/.env.production
   # Edit with production values
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

```typescript
// User Registration
POST /api/auth/register
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// User Login
POST /api/auth/login
{
  email: string;
  password: string;
}

// Password Reset
POST /api/auth/forgot-password
{
  email: string;
}
```

### Account Management

```typescript
// Create Account
POST /api/accounts
{
  name: string;
}

// Invite Member
POST /api/accounts/:accountId/members/invite
{
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'legal_advisor' | 'financial_advisor';
}
```

### File Upload

```typescript
// Upload File
POST /api/files/upload
Content-Type: multipart/form-data
{
  file: File;
  entityType: 'InventoryItem' | 'Policy' | 'Claim';
  entityId?: string;
  filePurpose: string;
}
```

### AI Processing

```typescript
// Process Photo for Inventory
POST /api/ai/process-inventory
{
  fileId: string;
  roomId?: string;
}

// Process Policy Document
POST /api/ai/process-policy
{
  fileId: string;
}
```

## 🔧 Development

### Project Structure

```
backend/src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication
│   ├── accounts/     # Account management
│   ├── households/   # Household management
│   ├── files/        # File management
│   ├── ai-integration/ # AI processing
│   ├── inventory/    # Inventory management
│   ├── policies/     # Policy management
│   ├── claims/       # Claims management
│   └── common/       # Shared utilities
├── config/           # Configuration
├── middlewares/      # Express middlewares
└── types/           # TypeScript types

frontend/src/
├── modules/          # Feature modules
│   ├── auth/         # Authentication UI
│   ├── accounts/     # Account management UI
│   ├── households/   # Household management UI
│   ├── file-management/ # File upload UI
│   ├── ai-processing/ # AI processing UI
│   ├── inventory/    # Inventory management UI
│   ├── policies/     # Policy management UI
│   └── claims/       # Claims management UI
├── components/       # Shared UI components
├── contexts/         # React contexts
├── hooks/           # Custom React hooks
└── api/             # API clients
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Building
npm run build            # Build both frontend and backend
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only

# Testing
npm run test             # Run all tests
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests

# Linting
npm run lint             # Lint both frontend and backend
npm run lint:backend     # Lint backend only
npm run lint:frontend    # Lint frontend only

# Formatting
npm run format           # Format all code with Prettier
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:backend
npm run test:frontend

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Database Management

```bash
# Generate Prisma client
cd backend && npx prisma generate

# Run migrations
cd backend && npx prisma migrate dev

# Reset database
cd backend && npx prisma migrate reset

# View database
cd backend && npx prisma studio
```

## 🔒 Security

### Authentication & Authorization

- **JWT Tokens**: Access tokens (15min) + refresh tokens (24h)
- **Role-Based Access Control**: Owner, Admin, Editor, Viewer, Legal Advisor, Financial Advisor
- **Rate Limiting**: Protection against brute force attacks
- **Password Security**: Bcrypt hashing with configurable rounds

### File Security

- **Malware Scanning**: ClamAV integration for uploaded files
- **File Validation**: Type, size, and content validation
- **Secure Storage**: Encrypted file storage with access controls
- **Soft Deletion**: Recoverable file deletion

### API Security

- **CORS Protection**: Configured for specific origins
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries via Prisma
- **XSS Protection**: Content Security Policy headers

## 📊 Monitoring & Logging

### Logging

- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: Debug, Info, Warn, Error
- **Context Tracking**: User ID, Account ID, Session ID
- **Performance Metrics**: Response times, database queries

### Error Tracking

- **Sentry Integration**: Real-time error tracking
- **Error Classification**: Categorized error types
- **Recovery Strategies**: Automatic retry mechanisms
- **User Notifications**: Friendly error messages

### Health Checks

```bash
# Application health
GET /api/health

# Database connectivity
GET /api/health/database

# Redis connectivity
GET /api/health/redis

# AI service status
GET /api/health/ai
```

## 🚀 Performance

### Optimization Strategies

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis-based caching for frequently accessed data
- **File Compression**: Optimized image and document storage
- **CDN Integration**: Static asset delivery optimization
- **Connection Pooling**: Database connection optimization

### Scalability

- **Horizontal Scaling**: Stateless API design
- **Queue Processing**: Asynchronous AI processing
- **Load Balancing**: Multiple instance support
- **Database Sharding**: Multi-tenant architecture support

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Testing**: Minimum 80% code coverage
- **Documentation**: JSDoc comments for all functions

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Security**: Report security vulnerabilities privately

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in environment variables
   - Run database migrations

2. **AI Processing Errors**
   - Verify OpenAI API key
   - Check API rate limits
   - Monitor processing timeouts

3. **File Upload Issues**
   - Check file size limits
   - Verify file type restrictions
   - Ensure uploads directory exists

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core authentication and user management
- ✅ Account and household management
- ✅ File upload and storage
- ✅ AI-powered inventory analysis
- ✅ Basic policy management

### Phase 2 (Next)
- 🔄 Advanced policy analysis
- 🔄 Claims management system
- 🔄 Export and reporting features
- 🔄 Mobile app development
- 🔄 Insurance company integrations

### Phase 3 (Future)
- 📋 Advanced AI features
- 📋 Real-time collaboration
- 📋 Advanced analytics
- 📋 International expansion
- 📋 API marketplace

## 🙏 Acknowledgments

- **OpenAI**: For GPT-4 Vision API
- **Stripe**: For payment processing
- **Prisma**: For database ORM
- **Tailwind CSS**: For styling framework
- **React Team**: For the amazing framework

---

**Built with ❤️ for homeowners everywhere** 