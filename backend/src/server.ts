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
    // Test database connection (don't exit if it fails)
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ Database connection failed - app will still start for debugging');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      
      if (!dbConnected) {
        console.log('🔧 Database connection issues detected. Check logs above.');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;