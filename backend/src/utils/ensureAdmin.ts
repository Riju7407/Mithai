import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { ENV } from '../config/env';

/**
 * Ensures that the admin account defined in .env exists in the database
 * with the correct role (ADMIN), active state, and password hash.
 * If credentials in .env change, it automatically synchronizes the database.
 */
export const ensureAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = (ENV.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
    const adminPassword = ENV.ADMIN_PASSWORD || 'Admin@41312';

    if (!adminEmail || !adminPassword) {
      console.warn('[Admin Setup] ADMIN_EMAIL or ADMIN_PASSWORD not configured.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'Rana Vikram Singh (Admin)',
        email: adminEmail,
        passwordHash,
        phone: '+91 98765 00001',
        role: 'ADMIN',
        isActive: true,
      });

      console.log(`[Admin Setup] Created default admin user from .env: ${adminEmail}`);
    } else {
      let needsSave = false;

      // Check if current database password matches .env password
      const isMatch = await existingAdmin.comparePassword(adminPassword);
      if (!isMatch) {
        const salt = await bcrypt.genSalt(10);
        existingAdmin.passwordHash = await bcrypt.hash(adminPassword, salt);
        needsSave = true;
      }

      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        needsSave = true;
      }

      if (existingAdmin.isActive === false) {
        existingAdmin.isActive = true;
        needsSave = true;
      }

      if (needsSave) {
        await existingAdmin.save();
        console.log(`[Admin Setup] Updated existing admin user credentials to match .env: ${adminEmail}`);
      } else {
        console.log(`[Admin Setup] Admin user verified from .env: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error('[Admin Setup] Failed to ensure admin user:', error);
  }
};
