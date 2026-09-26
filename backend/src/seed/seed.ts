import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { DeliverySlot } from '../models/DeliverySlot';
import { PackagingOption } from '../models/PackagingOption';
import { EventType } from '../models/EventType';
import { Banner } from '../models/Banner';
import { Announcement } from '../models/Announcement';
import { Coupon } from '../models/Coupon';
import { CMSPage } from '../models/CMSPage';
import { Setting } from '../models/Setting';
import { Order } from '../models/Order';
import { AdvanceBooking } from '../models/AdvanceBooking';
import { DEFAULT_SETTINGS, DEFAULT_EVENT_TYPES, DEFAULT_PACKAGING_OPTIONS, DEFAULT_DELIVERY_SLOTS } from '../../../shared/constants';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Seed] Connected.');

    // 1. Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      DeliverySlot.deleteMany({}),
      PackagingOption.deleteMany({}),
      EventType.deleteMany({}),
      Banner.deleteMany({}),
      Announcement.deleteMany({}),
      Coupon.deleteMany({}),
      CMSPage.deleteMany({}),
      Setting.deleteMany({}),
      Order.deleteMany({}),
      AdvanceBooking.deleteMany({}),
    ]);

    // 2. Settings
    console.log('[Seed] Inserting Settings...');
    await Setting.create(DEFAULT_SETTINGS);

    // 3. Users (Admin + Customer)
    console.log('[Seed] Creating Admin and Customer users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD, salt);
    const customerPasswordHash = await bcrypt.hash('Customer@123456', salt);

    const adminUser = await User.create({
      name: 'Rana Vikram Singh (Admin)',
      email: ENV.ADMIN_EMAIL.toLowerCase(),
      passwordHash: adminPasswordHash,
      phone: '+91 98765 00001',
      role: 'ADMIN',
      isActive: true,
    });

    const customerUser = await User.create({
      name: 'Ananya Sharma',
      email: 'customer@mithai.com',
      passwordHash: customerPasswordHash,
      phone: '+91 98765 00002',
      role: 'CUSTOMER',
      isActive: true,
    });

    // 4. Delivery Slots
    console.log('[Seed] Inserting Delivery Slots...');
    await DeliverySlot.insertMany(DEFAULT_DELIVERY_SLOTS);

    // 5. Packaging Options
    console.log('[Seed] Inserting Packaging Options...');
    const packagingDocs = await PackagingOption.insertMany(DEFAULT_PACKAGING_OPTIONS);

    // 6. Event Types
    console.log('[Seed] Inserting Event Types...');
    await EventType.insertMany(DEFAULT_EVENT_TYPES);

    // 7. Categories
    console.log('[Seed] Creating Categories...');
    const categoriesData = [
      {
        name: 'Traditional Sweets',
        slug: 'traditional-sweets',
        description: 'Authentic heritage sweets prepared with pure A2 Desi Cow Ghee and rich saffron.',
        image: { url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80' },
        displayOrder: 1,
      },
      {
        name: 'Dry Fruit Sweets',
        slug: 'dry-fruit-sweets',
        description: 'Premium sweets handcrafted from Californian Almonds, Iranian Pistachios, and rich Cashews.',
        image: { url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80' },
        displayOrder: 2,
      },
      {
        name: 'Bengali Delicacies',
        slug: 'bengali-delicacies',
        description: 'Soft, melt-in-the-mouth cottage cheese confections steeped in fragrant cardamom syrup and saffron milk.',
        image: { url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
        displayOrder: 3,
      },
      {
        name: 'Snacks & Savories',
        slug: 'snacks-savories',
        description: 'Crisp golden savories, cocktail samosas, mathris, and royal Rajasthani namkeens.',
        image: { url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
        displayOrder: 4,
      },
      {
        name: 'Royal Gift Hampers',
        slug: 'royal-gift-hampers',
        description: 'Ornate gift boxes and velvet chests for weddings, festive galas, and corporate gifting.',
        image: { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' },
        displayOrder: 5,
      },
      {
        name: 'Festival Specials',
        slug: 'festival-specials',
        description: 'Limited-edition seasonal delicacies crafted for auspicious celebrations.',
        image: { url: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&w=600&q=80' },
        displayOrder: 6,
      },
    ];

    const insertedCategories = await Category.insertMany(categoriesData);
    const catMap = new Map(insertedCategories.map((c) => [c.slug, c._id]));

    // 8. Products with Variants and Bulk Pricing Tiers
    console.log('[Seed] Creating Products with Pricing Variants and Bulk Tiers...');
    const productsData = [
      {
        productName: 'Royal Kaju Katli (Silver Leaf)',
        slug: 'royal-kaju-katli',
        description:
          'Our signature diamond-cut delicacy prepared exclusively from Goan cashew nuts and pure organic sugar, adorned with certified 100% vegetarian silver vark. Silky smooth texture that dissolves luxuriously on your palate.',
        shortDescription: 'Signature melt-in-mouth diamond cashews with vegetarian silver foil.',
        category: catMap.get('dry-fruit-sweets'),
        productImages: [
          {
            url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=85',
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=85',
            isPrimary: false,
          },
        ],
        basePrice: 900,
        discountPercentage: 10,
        finalPrice: 810,
        weightUnit: 'kg',
        variants: [
          { name: '1 Kg Box', weightOrPieces: 1, unit: 'kg', price: 900, discountedPrice: 810, isDefault: true },
          { name: '500 gm Box', weightOrPieces: 0.5, unit: 'kg', price: 470, discountedPrice: 430 },
          { name: '250 gm Box', weightOrPieces: 0.25, unit: 'kg', price: 250, discountedPrice: 230 },
        ],
        bulkPricingTiers: [
          { minQty: 10, maxQty: 25, pricePerUnit: 780, unit: 'kg' },
          { minQty: 26, maxQty: 50, pricePerUnit: 740, unit: 'kg' },
          { minQty: 51, pricePerUnit: 700, unit: 'kg' },
        ],
        ingredients: ['Grade A Cashews', 'Organic Sugar', 'Vegetable Silver Foil', 'Green Cardamom'],
        shelfLife: '20 Days in cool dry place',
        dietary: 'VEG',
        isSugarFree: false,
        stockQuantity: 150,
        reservedStock: 10,
        lowStockThreshold: 20,
        minOrderQuantity: 1,
        maxOrderQuantity: 200,
        availableForInstant: true,
        availableForAdvance: true,
        minAdvanceBookingDays: 2,
        isFeatured: true,
        isActive: true,
      },
      {
        productName: 'Shahi Motichoor Ladoo (Pure Desi Ghee)',
        slug: 'shahi-motichoor-ladoo',
        description:
          'Microscopic pearl-sized gram flour beads fried to golden perfection in fragrant A2 Gir Cow Ghee, steeped in saffron syrup, and enriched with melon seeds and roasted pistachios. A timeless royal classic for celebrations.',
        shortDescription: 'Golden gram flour pearls fried in pure cow ghee and Kashmiri saffron.',
        category: catMap.get('traditional-sweets'),
        productImages: [
          {
            url: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&w=800&q=85',
            isPrimary: true,
          },
        ],
        basePrice: 650,
        discountPercentage: 0,
        finalPrice: 650,
        weightUnit: 'kg',
        variants: [
          { name: '1 Kg Box', weightOrPieces: 1, unit: 'kg', price: 650, discountedPrice: 650, isDefault: true },
          { name: '500 gm Box', weightOrPieces: 0.5, unit: 'kg', price: 340, discountedPrice: 340 },
          { name: '250 gm Box', weightOrPieces: 0.25, unit: 'kg', price: 180, discountedPrice: 180 },
        ],
        bulkPricingTiers: [
          { minQty: 15, maxQty: 40, pricePerUnit: 580, unit: 'kg' },
          { minQty: 41, pricePerUnit: 540, unit: 'kg' },
        ],
        ingredients: ['Gram Flour', 'A2 Desi Cow Ghee', 'Kashmiri Saffron', 'Melon Seeds', 'Green Cardamom'],
        shelfLife: '8 Days',
        dietary: 'VEG',
        isSugarFree: false,
        stockQuantity: 200,
        reservedStock: 25,
        lowStockThreshold: 30,
        minOrderQuantity: 1,
        availableForInstant: true,
        availableForAdvance: true,
        minAdvanceBookingDays: 3,
        isFeatured: true,
        isActive: true,
      },
      {
        productName: 'Kesaria Rasmalai (Pistachio Milk Pot)',
        slug: 'kesaria-rasmalai',
        description:
          'Spongy handmade chenna patties poached in sweet syrup and gently submerged in thick, saffron-infused milk cream topped with Iranian pistachio slivers and dried rose petals.',
        shortDescription: 'Velvety saffron milk cream with melt-in-mouth cottage cheese medallions.',
        category: catMap.get('bengali-delicacies'),
        productImages: [
          {
            url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=85',
            isPrimary: true,
          },
        ],
        basePrice: 420,
        discountPercentage: 5,
        finalPrice: 399,
        weightUnit: 'box',
        variants: [
          { name: 'Box of 5 Pieces', weightOrPieces: 5, unit: 'pc', price: 420, discountedPrice: 399, isDefault: true },
          { name: 'Box of 10 Pieces', weightOrPieces: 10, unit: 'pc', price: 800, discountedPrice: 750 },
        ],
        bulkPricingTiers: [
          { minQty: 10, maxQty: 30, pricePerUnit: 700, unit: 'box' },
          { minQty: 31, pricePerUnit: 650, unit: 'box' },
        ],
        ingredients: ['Fresh Cow Milk Chenna', 'Thickened Whole Milk', 'Kashmiri Saffron', 'Pistachios', 'Cardamom'],
        shelfLife: '2 Days (Must be refrigerated below 4°C)',
        dietary: 'VEG',
        isSugarFree: false,
        stockQuantity: 60,
        reservedStock: 0,
        lowStockThreshold: 10,
        minOrderQuantity: 1,
        availableForInstant: true,
        availableForAdvance: true,
        minAdvanceBookingDays: 1,
        isFeatured: true,
        isActive: true,
      },
      {
        productName: 'Pista & Anjeer Sugar-Free Delight',
        slug: 'pista-anjeer-sugar-free',
        description:
          'Specially crafted guilt-free confection with zero refined sugar. Made naturally from Turkish dried figs (Anjeer), pistachio chunks, and golden almonds roasted in cold-pressed ghee.',
        shortDescription: '100% Zero Added Sugar delicacy made with dried Turkish figs and roasted nuts.',
        category: catMap.get('dry-fruit-sweets'),
        productImages: [
          {
            url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=85',
            isPrimary: true,
          },
        ],
        basePrice: 1100,
        discountPercentage: 0,
        finalPrice: 1100,
        weightUnit: 'kg',
        variants: [
          { name: '1 Kg Box', weightOrPieces: 1, unit: 'kg', price: 1100, isDefault: true },
          { name: '500 gm Box', weightOrPieces: 0.5, unit: 'kg', price: 580 },
        ],
        bulkPricingTiers: [
          { minQty: 10, pricePerUnit: 980, unit: 'kg' },
        ],
        ingredients: ['Turkish Dried Figs (Anjeer)', 'Californian Almonds', 'Iranian Pistachios', 'A2 Desi Ghee'],
        shelfLife: '30 Days',
        dietary: 'VEG',
        isSugarFree: true,
        stockQuantity: 45,
        reservedStock: 0,
        lowStockThreshold: 10,
        minOrderQuantity: 1,
        availableForInstant: true,
        availableForAdvance: true,
        minAdvanceBookingDays: 2,
        isFeatured: true,
        isActive: true,
      },
      {
        productName: 'Cocktail Pyaz Kachori (Box of 8)',
        slug: 'cocktail-pyaz-kachori',
        description:
          'Flaky, crisp golden crust shells filled with spiced caramelised onions, hing, fennel, and crushed whole spices. Served with traditional mint chutney and sweet tamarind dip.',
        shortDescription: 'Authentic Jodhpur-style crispy spiced onion pastries.',
        category: catMap.get('snacks-savories'),
        productImages: [
          {
            url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85',
            isPrimary: true,
          },
        ],
        basePrice: 280,
        discountPercentage: 0,
        finalPrice: 280,
        weightUnit: 'box',
        variants: [
          { name: 'Box of 8 Pieces', weightOrPieces: 8, unit: 'pc', price: 280, isDefault: true },
          { name: 'Party Tray (24 Pieces)', weightOrPieces: 24, unit: 'pc', price: 780 },
        ],
        bulkPricingTiers: [
          { minQty: 10, pricePerUnit: 700, unit: 'box' },
        ],
        ingredients: ['Refined Flour', 'Spiced Onions', 'Hing (Asafoetida)', 'Fennel', 'Cold-pressed Groundnut Oil'],
        shelfLife: 'Same Day Best Consumed Hot',
        dietary: 'VEG',
        isSugarFree: false,
        stockQuantity: 80,
        reservedStock: 0,
        lowStockThreshold: 15,
        minOrderQuantity: 1,
        availableForInstant: true,
        availableForAdvance: true,
        minAdvanceBookingDays: 1,
        isFeatured: false,
        isActive: true,
      },
      {
        productName: 'The Maharaja Grand Festive Hamper',
        slug: 'maharaja-grand-festive-hamper',
        description:
          'A royal assortment presented in an opulent golden brass-embossed chest. Contains Kaju Katli (500g), Pista Rolls (250g), Roasted Salted Almonds (200g), Royal Cashews (200g), and Saffron Honey Dipper.',
        shortDescription: 'Luxurious gift chest with premium dry sweets, roasted nuts and honey.',
        category: catMap.get('royal-gift-hampers'),
        productImages: [
          {
            url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=85',
            isPrimary: true,
          },
        ],
        basePrice: 2499,
        discountPercentage: 15,
        finalPrice: 2124,
        weightUnit: 'box',
        variants: [
          { name: 'Standard Chest (1.15 Kg)', weightOrPieces: 1.15, unit: 'box', price: 2499, discountedPrice: 2124, isDefault: true },
        ],
        bulkPricingTiers: [
          { minQty: 10, maxQty: 50, pricePerUnit: 1950, unit: 'box' },
          { minQty: 51, pricePerUnit: 1800, unit: 'box' },
        ],
        ingredients: ['Kaju Katli', 'Pista Roll', 'Californian Almonds', 'Mangalore Cashews', 'Organic Honey'],
        shelfLife: '30 Days',
        dietary: 'VEG',
        isSugarFree: false,
        stockQuantity: 50,
        reservedStock: 5,
        lowStockThreshold: 10,
        minOrderQuantity: 1,
        availableForInstant: true,
        availableForAdvance: true,
        minAdvanceBookingDays: 3,
        isFeatured: true,
        isActive: true,
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);

    // 9. Banners
    console.log('[Seed] Creating Banners...');
    await Banner.insertMany([
      {
        title: 'Grand Heritage Confectionery & Sweets',
        subtitle: 'Crafted with centuries of royal recipes, pure Desi Cow Ghee and Kashmiri Saffron.',
        imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1600&q=85',
        buttonText: 'Order Fresh Now',
        link: '/shop',
        bannerType: 'HERO',
        displayOrder: 1,
        isActive: true,
      },
      {
        title: 'Weddings & Celebrations advance booking',
        subtitle: 'Bespoke sweet boxes, bulk tiered discounts, and white-glove event venue delivery.',
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=85',
        buttonText: 'Plan Your Event Order',
        link: '/event-booking',
        bannerType: 'HERO',
        displayOrder: 2,
        isActive: true,
      },
      {
        title: 'Festive Saffron Dry Fruit Collection',
        subtitle: 'Explore our handpicked gift hampers crafted for memorable occasions.',
        imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1200&q=85',
        buttonText: 'View Gift Boxes',
        link: '/categories/royal-gift-hampers',
        bannerType: 'PROMO',
        displayOrder: 1,
        isActive: true,
      },
    ]);

    // 10. Announcement Bar
    console.log('[Seed] Creating Announcement Bar...');
    await Announcement.create({
      text: '✨ Free Same-Day Express Delivery on Instant Orders Above ₹799 | Pre-book Wedding & Festive Hampers with only 30% Deposit!',
      link: '/event-booking',
      linkText: 'Book Event Now',
      isActive: true,
    });

    // 11. Coupons
    console.log('[Seed] Creating Coupons...');
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await Coupon.insertMany([
      {
        code: 'ROYAL10',
        description: 'Get 10% off up to ₹250 on orders above ₹500',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 250,
        minOrderValue: 500,
        startDate: new Date(),
        endDate: nextYear,
        isActive: true,
      },
      {
        code: 'FESTIVAL20',
        description: 'Flat ₹200 off on festive orders above ₹1,500',
        discountType: 'FIXED',
        discountValue: 200,
        minOrderValue: 1500,
        startDate: new Date(),
        endDate: nextYear,
        isActive: true,
      },
      {
        code: 'SWEET50',
        description: 'Instant ₹50 off on first order',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderValue: 350,
        startDate: new Date(),
        endDate: nextYear,
        isActive: true,
      },
    ]);

    // 12. CMS Content Pages
    console.log('[Seed] Creating CMS Pages...');
    await CMSPage.insertMany([
      {
        slug: 'about',
        title: 'Our Heritage & Tradition',
        content: `### A Legacy of Purity and Royal Flavors

Founded in 1952, Shree Mithai has stood as a bastion of authentic Indian artisanal confectionery. Every single piece of sweetmeat that leaves our kitchen is hand-fashioned by master halwais with over three generations of lineage.

#### Why Choose Shree Mithai?
- **100% Pure Desi Ghee**: We only use certified A2 Cow Ghee sourced directly from heritage gaushalas.
- **Finest Global Dry Fruits**: Hand-selected Goan cashews, Californian Mamra almonds, and deep green Iranian pistachios.
- **Zero Chemical Preservatives**: Freshly made every morning in hygienic, state-of-the-art kitchens.
- **Royal Wedding & Event Specialists**: From personalized engraved wooden chests to refrigerated banquet delivery, we ensure your auspicious occasions radiate grace.`,
        isActive: true,
      },
      {
        slug: 'event-booking-information',
        title: 'Advance Event Booking & Bulk Catering Information',
        content: `### Seamless Advance Bulk Orders for Auspicious Occasions

We specialize in large-scale confectionery catering for weddings, corporate galas, and religious poojas.

#### Booking Policy:
1. **Advance Notice**: Minimum 3 days advance notice required; orders can be booked up to 90 days ahead.
2. **Partial Deposit**: Secure your production slot and ingredient allocation with only **30% advance deposit**.
3. **Balance Payment**: The remaining 70% balance can be easily paid through your customer dashboard prior to dispatch.
4. **Bespoke Packaging**: Choose from luxury velvet boxes, wooden chests, or auspicious brass platters complete with custom calligraphy tags.`,
        isActive: true,
      },
      {
        slug: 'cancellation-policy',
        title: 'Cancellation & Refund Policy',
        content: `### Cancellation & Refund Policy

- **Instant Orders**: Can be cancelled within 15 minutes of placing or before the kitchen begins preparation.
- **Advance Event Bookings**: Full deposit refund if cancelled at least 7 days prior to scheduled delivery date. 50% deposit refund between 3 to 7 days.
- **Quality Guarantee**: If you receive damaged packaging or unsatisfactory items, notify us within 2 hours with photos for an immediate replacement or full refund.`,
        isActive: true,
      },
      {
        slug: 'delivery-policy',
        title: 'Delivery & Shipping Policy',
        content: `### Safe, Temperature-Controlled Delivery

- **Instant Delivery**: Same-day delivery across municipal limits within selected 2-hour slots.
- **Free Delivery**: Applicable on instant orders above ₹799.
- **Event Logistics**: For weddings and bulk orders exceeding 25 kg, dedicated air-conditioned delivery vans ensure your sweets arrive in pristine temperature and display condition.`,
        isActive: true,
      },
      {
        slug: 'terms',
        title: 'Terms & Conditions',
        content: `### Terms of Service

By accessing or purchasing from Shree Mithai, you agree to our terms regarding order placements, payment verifications via Razorpay, and scheduled slot delivery commitments.`,
        isActive: true,
      },
      {
        slug: 'privacy',
        title: 'Privacy Policy',
        content: `### Your Privacy is Sacred to Us

We do not sell, rent, or trade your personal contact details. Credit card and banking transactions are processed securely through certified Razorpay 256-bit encryption.`,
        isActive: true,
      },
    ]);

    // 13. Create a Sample Instant Order and Advance Booking for immediate testing
    console.log('[Seed] Creating Sample Orders...');
    const kajuKatli = insertedProducts[0];
    const motichoor = insertedProducts[1];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 14);

    await Order.create({
      orderNumber: 'ORD-2026-A1B2C3',
      user: customerUser._id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone,
      orderType: 'INSTANT',
      items: [
        {
          product: kajuKatli._id,
          productName: kajuKatli.productName,
          variantName: '1 Kg Box',
          unit: 'kg',
          quantity: 2,
          unitPrice: 810,
          subtotal: 1620,
          imageUrl: kajuKatli.productImages[0]?.url,
        },
      ],
      subtotal: 1620,
      discount: 0,
      deliveryFee: 0,
      tax: 81,
      grandTotal: 1701,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      deliveryMethod: 'DELIVERY',
      deliveryDate: tomorrow,
      deliverySlot: 'Evening (04:30 PM - 07:00 PM)',
      shippingAddress: {
        recipientName: 'Ananya Sharma',
        phone: '+91 98765 00002',
        houseOrFlat: 'Bungalow 14, Royal Palm Groves',
        street: 'Malviya Nagar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302017',
      },
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(Date.now() - 3600000),
          note: 'Order placed by customer.',
          updatedBy: 'Customer',
        },
        {
          status: 'Confirmed',
          timestamp: new Date(),
          note: 'Payment of ₹1701 received via Razorpay.',
          updatedBy: 'System',
        },
      ],
    });

    await AdvanceBooking.create({
      bookingNumber: 'EVT-2026-X9Y8Z7',
      user: customerUser._id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone,
      eventType: 'Wedding Celebration',
      eventName: 'Sharma & Verma Royal Wedding Reception',
      eventDate: eventDate,
      numberOfGuests: 350,
      deliveryDate: eventDate,
      deliverySlot: 'Morning (09:00 AM - 11:30 AM)',
      deliveryAddress: {
        recipientName: 'Kailash Sharma',
        phone: '+91 98765 00002',
        houseOrFlat: 'The Heritage Palace Grand Ballroom',
        street: 'Amer Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302002',
      },
      contactNumber: '+91 98765 00002',
      items: [
        {
          product: kajuKatli._id,
          productName: kajuKatli.productName,
          unit: 'kg',
          quantity: 25,
          unitPrice: 780, // bulk tier
          subtotal: 19500,
          imageUrl: kajuKatli.productImages[0]?.url,
        },
        {
          product: motichoor._id,
          productName: motichoor.productName,
          unit: 'kg',
          quantity: 25,
          unitPrice: 580, // bulk tier
          subtotal: 14500,
          imageUrl: motichoor.productImages[0]?.url,
        },
      ],
      packaging: {
        optionName: 'Royal Saffron Velvet Hamper',
        extraPrice: 150,
        packagingRef: packagingDocs[1]._id,
      },
      customRequirements: 'Golden ribbon with custom bride & groom monogram sticker on every box.',
      paymentPreference: 'DEPOSIT',
      totalAmount: 35850,
      advanceDepositRequired: 10755,
      advanceAmountPaid: 10755,
      balanceAmountDue: 25095,
      paymentStatus: 'Partial',
      bookingStatus: 'Advance Confirmed',
      statusHistory: [
        {
          status: 'Received',
          timestamp: new Date(Date.now() - 7200000),
          note: 'Event booking request submitted.',
          updatedBy: 'Customer',
        },
        {
          status: 'Advance Confirmed',
          timestamp: new Date(Date.now() - 3600000),
          note: '30% deposit of ₹10755 paid via Razorpay. Ingredients and kitchen slot reserved.',
          updatedBy: 'Administrator',
        },
      ],
    });

    console.log('[Seed] Database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('ADMIN USER:');
    console.log('  Email:    admin@mithai.com');
    console.log('  Password: Admin@123456');
    console.log('CUSTOMER USER:');
    console.log('  Email:    customer@mithai.com');
    console.log('  Password: Customer@123456');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
