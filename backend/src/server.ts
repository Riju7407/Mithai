import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/error';
import { apiLimiter } from './middlewares/rateLimiter';
import { ensureAdminUser } from './utils/ensureAdmin';

// Route imports
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import deliverySlotRoutes from './routes/deliverySlotRoutes';
import packagingRoutes from './routes/packagingRoutes';
import eventTypeRoutes from './routes/eventTypeRoutes';
import couponRoutes from './routes/couponRoutes';
import bannerRoutes from './routes/bannerRoutes';
import cmsRoutes from './routes/cmsRoutes';
import settingRoutes from './routes/settingRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app = express();

// Security and HTTP logging
app.use(helmet({ crossOriginResourcePolicy: false }));
// Configure comprehensive CORS support for Vercel, Render, local dev, and custom domains
const allowedOrigins = [
  ENV.FRONTEND_URL,
  'https://mithai-theta.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, mobile)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isVercelDomain = origin.endsWith('.vercel.app');
    const isRenderDomain = origin.endsWith('.onrender.com');
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isExplicitlyAllowed || isVercelDomain || isRenderDomain || isLocalhost) {
      callback(null, true);
    } else {
      // In production, safely reflect origin for valid web clients
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api', apiLimiter);

// Health check endpoint (available at both /api/health and /health)
app.get(['/api/health', '/health'], (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mithai Restaurant & Event Booking API is healthy and operational.',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// Consolidate API Router
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/delivery-slots', deliverySlotRoutes);
apiRouter.use('/packaging-options', packagingRoutes);
apiRouter.use('/event-types', eventTypeRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/banners', bannerRoutes);
apiRouter.use('/cms', cmsRoutes);
apiRouter.use('/settings', settingRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/reviews', reviewRoutes);

// Mount API routes at both /api and root / for seamless compatibility
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist on this server.`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminUser();
    app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`[Express] Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode.`);
      console.log(`[Express] Health check available at: http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Express] Server failed to start:', error);
    process.exit(1);
  }
};

startServer();

export default app;
