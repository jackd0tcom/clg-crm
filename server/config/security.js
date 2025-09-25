/**
 * Security Configuration
 * Centralized security settings for the CLG CRM application
 */

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { body, param, validationResult } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';

// Rate limiting configurations
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message) => {
  return rateLimit({
    windowMs,
    max,
    message: message || {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Stricter rate limiting for auth endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  { error: 'Too many authentication attempts, please try again later.' }
);

// Rate limiting for API endpoints
export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests per window
);

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5050',
      'http://localhost:3000',
      'http://localhost:5173',
      // Add production domains here
      process.env.FRONTEND_URL,
      process.env.RAILWAY_PUBLIC_DOMAIN,
      // Allow Railway preview deployments
      /^https:\/\/.*\.railway\.app$/,
    ].filter(Boolean);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://kit.fontawesome.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://kit.fontawesome.com"],
      connectSrc: ["'self'", "https://clauselawgroup.auth0.com"],
      frameSrc: ["'self'", "https://clauselawgroup.auth0.com"],
    },
  } : false, // Disable CSP in development
  crossOriginEmbedderPolicy: false, // Disable for Vite dev server compatibility
});

// Session security configuration
export const sessionConfig = {
  name: 'clg-session',
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  resave: false,
  saveUninitialized: false, // Changed to false for security
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // More permissive in development
  },
};

// Input validation rules
export const validationRules = {
  // Task validation
  task: [
    body('title').trim().isLength({ min: 1, max: 255 }).escape(),
    body('notes').optional().trim().isLength({ max: 5000 }).escape(),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('status').optional().isIn(['not started', 'in progress', 'blocked', 'completed']),
    body('dueDate').optional().isISO8601(),
    body('caseId').optional().isInt({ min: 1 }),
  ],
  
  // Case validation
  case: [
    body('title').trim().isLength({ min: 1, max: 255 }).escape(),
    body('description').optional().trim().isLength({ max: 5000 }).escape(),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('phase').optional().isIn(['intake', 'investigation', 'negotiation', 'litigation', 'settlement', 'closed']),
    body('practiceAreas').optional().isArray(),
  ],
  
  // User validation
  user: [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  ],
  
  // ID parameter validation
  id: [
    param('id').isInt({ min: 1 }),
  ],
  
  // Task ID validation
  taskId: [
    param('taskId').isInt({ min: 1 }),
  ],
  
  // Case ID validation
  caseId: [
    param('caseId').isInt({ min: 1 }),
  ],
};

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// Security middleware setup
export const setupSecurityMiddleware = (app) => {
  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);
  
  // Compression middleware
  app.use(compression());
  
  // Request logging
  app.use(morgan('combined'));
  
  // Security headers (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.use(helmetConfig);
  } else {
    // Development: disable helmet completely to avoid CSP issues
    console.log('🔧 Development mode: Security headers disabled for smooth development');
    
    // Explicitly remove any CSP headers that might be set elsewhere
    app.use((req, res, next) => {
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('X-Content-Type-Options');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('X-XSS-Protection');
      next();
    });
  }
  
  // CORS
  app.use(cors(corsOptions));
  
  // Rate limiting
  app.use('/api/auth', authRateLimit);
  app.use('/api', apiRateLimit);
  
  // Body parsing security
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Data sanitization
  app.use(mongoSanitize()); // Prevent NoSQL injection
  app.use(xss()); // Prevent XSS attacks
  app.use(hpp()); // Prevent parameter pollution
  
  // Request size limiting
  app.use((req, res, next) => {
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'Request entity too large' });
    }
    next();
  });
};

// Environment variable validation
export const validateEnvironment = () => {
  const requiredVars = [
    'SESSION_SECRET',
    'DATABASE_URL',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'ADMIN_EMAIL',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.log('📋 Please set the following environment variables:');
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('📖 See RAILWAY_DEPLOYMENT.md for setup instructions');
    
    // Don't exit in production, just warn
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
  
  console.log('✅ Environment variables validated');
  console.log(`🚀 Running in ${process.env.NODE_ENV || 'development'} mode`);
};

// Security logging
export const logSecurityEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, details);
};
