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
app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mithai Restaurant & Event Booking API is healthy and operational.',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery-slots', deliverySlotRoutes);
app.use('/api/packaging-options', packagingRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

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
