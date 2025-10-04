import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { testConnection } from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    // Quick database connection test
    const dbConnected = await testConnection();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: dbConnected ? 'Connected' : 'Disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve static files in production
if (env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/health')) {
      res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
    }
  });
}

// Error handling
app.use(errorHandler);

const PORT = env.PORT || 3001;

// Start server with optional database connection test
const startServer = async () => {
  try {
    // Skip database connection test on startup for debugging
    console.log('⚠️ Skipping database connection test on startup - will test via health endpoint');
    console.log('📍 Primary DATABASE_URL:', env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
    console.log('📍 Available fallback URLs:', [
      process.env.DATABASE_URL_POOLER_SESSION ? 'Session Pooler' : null,
      process.env.DATABASE_URL_FALLBACK ? 'Fallback' : null,
      process.env.DATABASE_URL_IPv4_DIRECT ? 'IPv4 Direct' : null
    ].filter(Boolean).join(', '));

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log('🔧 Database connection will be tested via health endpoint');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;