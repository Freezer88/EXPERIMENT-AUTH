# Replit Deployment Guide

This guide explains how to deploy the Homeowners Insurance AI project on Replit.

## Prerequisites

- Replit account
- PostgreSQL database (Replit provides this)
- Redis (for caching and queues)
- OpenAI API key
- Stripe API keys (for payment processing)

## Environment Setup

### 1. Set Environment Variables

In your Replit project, go to the "Secrets" tab and add the following environment variables:

#### Required Variables:
```
DATABASE_URL=postgresql://replit:replit@localhost:5432/homeowners_prod
JWT_SECRET=your-secure-jwt-secret
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
CLAMAV_API_KEY=your-clamav-api-key
```

#### Optional Variables:
```
LOG_LEVEL=info
AI_PROCESSING_TIMEOUT=300000
AI_MAX_CONCURRENT_REQUESTS=5
FILE_STORAGE_PATH=/home/runner/app/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/heic,application/pdf
```

### 2. Database Setup

The project uses PostgreSQL. In Replit:

1. Go to the "Tools" tab
2. Click on "Database"
3. Create a new PostgreSQL database
4. Update the `DATABASE_URL` in your secrets

### 3. Redis Setup

For caching and queues:

1. Install Redis in the shell:
   ```bash
   redis-server --daemonize yes
   ```

2. Verify Redis is running:
   ```bash
   redis-cli ping
   ```

## Deployment Steps

### 1. Install Dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Build the Application

```bash
npm run build
```

This will:
- Build the frontend with Vite
- Build the backend with TypeScript
- Create the uploads directory

### 3. Database Migration

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..
```

### 4. Start the Application

```bash
npm start
```

## Configuration Files

### replit.nix
- Defines required packages (Node.js, PostgreSQL, Redis, etc.)
- Sets up environment variables
- Configures build and start scripts

### .replit
- Configures the Replit environment
- Sets up language servers for TypeScript
- Defines deployment settings

## Security Considerations

### 1. Environment Variables
- Never commit sensitive keys to the repository
- Use Replit's Secrets feature for all sensitive data
- Rotate keys regularly

### 2. File Uploads
- Files are stored in `/home/runner/app/uploads`
- Implement proper file validation
- Use malware scanning for uploaded files

### 3. Rate Limiting
- Configured to prevent abuse
- Monitor usage patterns
- Implement proper error handling

## Monitoring and Logging

### 1. Application Logs
- Structured JSON logging
- Different log levels for development/production
- Error tracking with Sentry

### 2. Performance Monitoring
- API response time monitoring
- Database query performance
- AI processing timeouts

### 3. Health Checks
- `/api/health` endpoint for monitoring
- Database connectivity checks
- Redis connectivity checks

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check if PostgreSQL is running
   - Verify `DATABASE_URL` in secrets
   - Run database migrations

2. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

3. **File Upload Issues**
   - Verify uploads directory exists
   - Check file size limits
   - Validate file types

4. **AI Processing Errors**
   - Verify OpenAI API key
   - Check API rate limits
   - Monitor processing timeouts

### Debug Mode

Enable debug mode by setting:
```
NODE_ENV=development
LOG_LEVEL=debug
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use production API keys
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up monitoring and alerting
6. Implement backup strategies

## Backup and Recovery

### Database Backups
- Automated daily backups
- 30-day retention policy
- Point-in-time recovery capability

### File Backups
- Uploaded files backed up daily
- Version control for important documents
- Disaster recovery procedures

## Support

For deployment issues:
1. Check the application logs
2. Verify environment variables
3. Test database connectivity
4. Monitor resource usage
5. Review security configurations 