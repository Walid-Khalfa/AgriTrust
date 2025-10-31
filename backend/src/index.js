
import express from 'express';
import cors from 'cors';
import { env } from './utils/config.js';
import apiRoutes from './routes/api.js';
import healthRoutes from './routes/health.js';
import aiRoutes from './routes/ai.js';
import { getHederaClient, closeHederaClient } from './hederaClient.js';

const app = express();

// Middleware - CORS for frontend origins
app.use(cors({
  origin: [
    /localhost:\d+$/,           // Any localhost port
    /https:\/\/.*\.codenut\.dev$/,  // CodeNut preview domains (HTTPS)
    'http://localhost:5173',    // Vite dev server
    'http://localhost:3000'     // Alternative dev port
  ],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', healthRoutes);
app.use('/api', apiRoutes);
app.use('/api/ai', aiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AgriTrust API',
    version: '1.0.0',
    description: 'Backend API for agricultural batch traceability using Hedera Hashgraph',
    endpoints: {
      healthPing: 'GET /api/health/ping',
      healthDb: 'GET /api/health/db',
      healthFull: 'GET /api/health/full',
      registerBatch: 'POST /api/register-batch',
      tokenizeBatch: 'POST /api/tokenize-batch',
      verifyBatch: 'GET /api/verify-batch/:tokenId/:serialNumber',
      ai: {
        analyzeImage: 'POST /api/ai/analyze-image',
        summarizeProvenance: 'POST /api/ai/summarize-provenance',
        buyerQA: 'POST /api/ai/buyer-qa',
        translateMarketing: 'POST /api/ai/translate-marketing',
        priceSuggestion: 'POST /api/ai/price-suggestion'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize Hedera client on startup
try {
  getHederaClient();
} catch (error) {
  console.error('Failed to initialize Hedera client:', error.message);
  process.exit(1);
}

// Start server
const PORT = env.PORT || 4000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🌾 AgriTrust API                              ║
║  URL: http://localhost:${PORT}                            ║
║  NODE_ENV: ${process.env.NODE_ENV || 'development'}                           ║
║  Health: http://localhost:${PORT}/api/health/ping         ║
╚════════════════════════════════════════════════════════╝
║        🌾 AgriTrust API Server 🌾            ║
║                                                        ║
║  Server running on: http://localhost:${PORT}           ║
║  Environment: ${env.NODE_ENV.padEnd(37)}║
║  Hedera Network: Testnet                              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await closeHederaClient();
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(async () => {
    await closeHederaClient();
    console.log('Server closed');
    process.exit(0);
  });
});
