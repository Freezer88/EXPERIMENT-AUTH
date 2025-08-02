{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.yarn
    pkgs.postgresql_15
    pkgs.redis
    pkgs.git
    pkgs.curl
    pkgs.wget
    pkgs.unzip
    pkgs.zip
    pkgs.clamav
    pkgs.openssl
    pkgs.cacert
  ];

  env = {
    NODE_ENV = "production";
    DATABASE_URL = "postgresql://replit:replit@localhost:5432/homeowners_prod";
    JWT_SECRET = "replit-production-secret-key";
    OPENAI_API_KEY = "your-openai-key";
    STRIPE_SECRET_KEY = "sk_test_your_stripe_key";
    PORT = "3001";
    CORS_ORIGIN = "https://your-replit-domain.replit.co";
    FILE_STORAGE_PATH = "/home/runner/app/uploads";
    LOG_LEVEL = "info";
    LOG_FORMAT = "json";
    AI_PROCESSING_TIMEOUT = "300000";
    AI_MAX_CONCURRENT_REQUESTS = "5";
    CLAMAV_API_URL = "https://api.clamav.net";
    CLAMAV_API_KEY = "your-clamav-api-key";
    REDIS_URL = "redis://localhost:6379";
    BCRYPT_ROUNDS = "12";
    RATE_LIMIT_WINDOW_MS = "900000";
    RATE_LIMIT_MAX_REQUESTS = "100";
    MAX_FILE_SIZE = "10485760";
    ALLOWED_FILE_TYPES = "image/jpeg,image/png,image/heic,application/pdf";
  };

  # Build script for Replit
  build = ''
    # Install dependencies
    npm install
    cd backend && npm install
    cd ../frontend && npm install
    cd ..

    # Build frontend
    cd frontend && npm run build
    cd ..

    # Build backend
    cd backend && npm run build
    cd ..

    # Create uploads directory
    mkdir -p uploads

    # Set up database (if needed)
    # cd backend && npx prisma migrate deploy
  '';

  # Start script for Replit
  start = ''
    # Start the backend server
    cd backend && npm start
  '';

  # Development script for Replit
  dev = ''
    # Start both frontend and backend in development mode
    npm run dev
  '';

  # Health check script
  healthCheck = ''
    # Check if the server is running
    curl -f http://localhost:3001/api/health || exit 1
  '';

  # Database setup script
  setupDb = ''
    # Initialize PostgreSQL database
    cd backend
    npx prisma migrate deploy
    npx prisma generate
    cd ..
  '';

  # Redis setup script
  setupRedis = ''
    # Start Redis server
    redis-server --daemonize yes
  '';

  # File permissions
  filePermissions = {
    "uploads" = "755";
    "backend/dist" = "755";
    "frontend/dist" = "755";
  };

  # Environment-specific configurations
  environments = {
    development = {
      NODE_ENV = "development";
      LOG_LEVEL = "debug";
      CORS_ORIGIN = "https://your-replit-domain.replit.co";
    };
    production = {
      NODE_ENV = "production";
      LOG_LEVEL = "info";
      CORS_ORIGIN = "https://your-replit-domain.replit.co";
    };
  };

  # Security configurations
  security = {
    # Enable HTTPS
    https = true;
    # Enable CORS
    cors = true;
    # Rate limiting
    rateLimit = true;
    # File upload restrictions
    maxFileSize = "10MB";
    allowedFileTypes = ["image/jpeg", "image/png", "image/heic", "application/pdf"];
  };

  # Monitoring and logging
  monitoring = {
    # Enable structured logging
    structuredLogging = true;
    # Enable performance monitoring
    performanceMonitoring = true;
    # Enable error tracking
    errorTracking = true;
  };

  # Backup and recovery
  backup = {
    # Database backup schedule
    databaseBackup = "0 2 * * *";
    # File backup schedule
    fileBackup = "0 3 * * *";
    # Backup retention days
    retentionDays = 30;
  };
} 