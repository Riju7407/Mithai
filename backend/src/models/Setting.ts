import mongoose, { Schema, Document } from 'mongoose';
import { DEFAULT_SETTINGS } from '../../../shared/constants';

export interface ISetting extends Document {
  restaurantName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  currency: string;
  currencySymbol: string;
  gstRate: number;
  standardDeliveryFee: number;
  freeDeliveryThreshold: number;
  minAdvanceBookingDays: number;
  maxAdvanceBookingDays: number;
  advanceDepositPercentage: number;
  instantOrderCutoffTime: string;
  sameDaySlotCutoffValue: number;
  sameDaySlotCutoffUnit: 'hours' | 'minutes' | 'seconds';
  enableRazorpayTestMode: boolean;
  enableCashOnDelivery: boolean;

  // Homepage Hero Section
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroPrimaryBtnText: string;
  heroPrimaryBtnLink: string;
  heroSecondaryBtnText: string;
  heroSecondaryBtnLink: string;

  // Homepage Value Highlights / Features Banner
  feature1Title: string;
  feature1Subtitle: string;
  feature2Title: string;
  feature2Subtitle: string;
  feature3Title: string;
  feature3Subtitle: string;
  feature4Title: string;
  feature4Subtitle: string;

  // Homepage Royal Catalog Section
  catalogBadgeText: string;
  catalogTitle: string;
  catalogLinkText: string;

  // Footer Management
  footerBrandName: string;
  footerAboutText: string;
  footerPhone: string;
  footerEmail: string;
  footerAddress: string;
  footerOpeningHours: string;
  footerGheeBadge: string;
  footerFssaiBadge: string;
  footerCopyrightText: string;
  footerPaymentSecurity: string;
  footerPaymentMethods: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  socialYoutube: string;

  // Our Heritage Page Management
  heritageBadge: string;
  heritageHeroTitle: string;
  heritageHeroSubtitle: string;
  heritageHeroImageUrl: string;
  heritageStoryBadge: string;
  heritageStoryTitle: string;
  heritageStoryParagraph1: string;
  heritageStoryParagraph2: string;
  heritageStoryImageUrl: string;
  heritagePillar1Title: string;
  heritagePillar1Subtitle: string;
  heritagePillar2Title: string;
  heritagePillar2Subtitle: string;
  heritagePillar3Title: string;
  heritagePillar3Subtitle: string;
  heritageCtaText: string;
  heritageCtaLink: string;

  // Best Selling Hampers Section Settings
  hampersBadgeText: string;
  hampersTitle: string;
  hampersSubtitle: string;
  hampersLinkText: string;
  hampersLinkUrl: string;

  // Restaurant Food Page Management
  restaurantBadgeText: string;
  restaurantHeroTitle: string;
  restaurantHeroSubtitle: string;
  restaurantHeroImageUrl: string;
  restaurantOpeningHours: string;
  restaurantContactPhone: string;
  restaurantDiningNotice: string;
  restaurantFeature1Title: string;
  restaurantFeature1Subtitle: string;
  restaurantFeature2Title: string;
  restaurantFeature2Subtitle: string;
  restaurantFeature3Title: string;
  restaurantFeature3Subtitle: string;
  restaurantFeature4Title: string;
  restaurantFeature4Subtitle: string;

  // Homepage Restaurant Section
  homeRestaurantBadge: string;
  homeRestaurantTitle: string;
  homeRestaurantSubtitle: string;
  homeRestaurantBtnText: string;
  homeRestaurantBtnLink: string;
  homeRestaurantBannerImage: string;
  homeRestaurantNotice: string;

  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    restaurantName: { type: String, default: DEFAULT_SETTINGS.restaurantName },
    tagline: { type: String, default: DEFAULT_SETTINGS.tagline },
    contactEmail: { type: String, default: DEFAULT_SETTINGS.contactEmail },
    contactPhone: { type: String, default: DEFAULT_SETTINGS.contactPhone },
    address: { type: String, default: DEFAULT_SETTINGS.address },
    city: { type: String, default: DEFAULT_SETTINGS.city },
    state: { type: String, default: DEFAULT_SETTINGS.state },
    pincode: { type: String, default: DEFAULT_SETTINGS.pincode },
    currency: { type: String, default: DEFAULT_SETTINGS.currency },
    currencySymbol: { type: String, default: DEFAULT_SETTINGS.currencySymbol },
    gstRate: { type: Number, default: DEFAULT_SETTINGS.gstRate },
    standardDeliveryFee: { type: Number, default: DEFAULT_SETTINGS.standardDeliveryFee },
    freeDeliveryThreshold: { type: Number, default: DEFAULT_SETTINGS.freeDeliveryThreshold },
    minAdvanceBookingDays: { type: Number, default: DEFAULT_SETTINGS.minAdvanceBookingDays },
    maxAdvanceBookingDays: { type: Number, default: DEFAULT_SETTINGS.maxAdvanceBookingDays },
    advanceDepositPercentage: { type: Number, default: DEFAULT_SETTINGS.advanceDepositPercentage },
    instantOrderCutoffTime: { type: String, default: DEFAULT_SETTINGS.instantOrderCutoffTime },
    sameDaySlotCutoffValue: { type: Number, default: DEFAULT_SETTINGS.sameDaySlotCutoffValue ?? 1 },
    sameDaySlotCutoffUnit: {
      type: String,
      enum: ['hours', 'minutes', 'seconds'],
      default: DEFAULT_SETTINGS.sameDaySlotCutoffUnit ?? 'hours',
    } as any,
    enableRazorpayTestMode: { type: Boolean, default: DEFAULT_SETTINGS.enableRazorpayTestMode },
    enableCashOnDelivery: { type: Boolean, default: DEFAULT_SETTINGS.enableCashOnDelivery ?? false },

    // Homepage Hero Section
    heroBadgeText: { type: String, default: DEFAULT_SETTINGS.heroBadgeText },
    heroTitle: { type: String, default: DEFAULT_SETTINGS.heroTitle },
    heroSubtitle: { type: String, default: DEFAULT_SETTINGS.heroSubtitle },
    heroImageUrl: { type: String, default: DEFAULT_SETTINGS.heroImageUrl },
    heroPrimaryBtnText: { type: String, default: DEFAULT_SETTINGS.heroPrimaryBtnText },
    heroPrimaryBtnLink: { type: String, default: DEFAULT_SETTINGS.heroPrimaryBtnLink },
    heroSecondaryBtnText: { type: String, default: DEFAULT_SETTINGS.heroSecondaryBtnText },
    heroSecondaryBtnLink: { type: String, default: DEFAULT_SETTINGS.heroSecondaryBtnLink },

    // Homepage Value Highlights / Features Banner
    feature1Title: { type: String, default: DEFAULT_SETTINGS.feature1Title },
    feature1Subtitle: { type: String, default: DEFAULT_SETTINGS.feature1Subtitle },
    feature2Title: { type: String, default: DEFAULT_SETTINGS.feature2Title },
    feature2Subtitle: { type: String, default: DEFAULT_SETTINGS.feature2Subtitle },
    feature3Title: { type: String, default: DEFAULT_SETTINGS.feature3Title },
    feature3Subtitle: { type: String, default: DEFAULT_SETTINGS.feature3Subtitle },
    feature4Title: { type: String, default: DEFAULT_SETTINGS.feature4Title },
    feature4Subtitle: { type: String, default: DEFAULT_SETTINGS.feature4Subtitle },

    // Homepage Royal Catalog Section
    catalogBadgeText: { type: String, default: DEFAULT_SETTINGS.catalogBadgeText },
    catalogTitle: { type: String, default: DEFAULT_SETTINGS.catalogTitle },
    catalogLinkText: { type: String, default: DEFAULT_SETTINGS.catalogLinkText },

    // Footer Management
    footerBrandName: { type: String, default: DEFAULT_SETTINGS.footerBrandName },
    footerAboutText: { type: String, default: DEFAULT_SETTINGS.footerAboutText },
    footerPhone: { type: String, default: DEFAULT_SETTINGS.footerPhone },
    footerEmail: { type: String, default: DEFAULT_SETTINGS.footerEmail },
    footerAddress: { type: String, default: DEFAULT_SETTINGS.footerAddress },
    footerOpeningHours: { type: String, default: DEFAULT_SETTINGS.footerOpeningHours },
    footerGheeBadge: { type: String, default: DEFAULT_SETTINGS.footerGheeBadge },
    footerFssaiBadge: { type: String, default: DEFAULT_SETTINGS.footerFssaiBadge },
    footerCopyrightText: { type: String, default: DEFAULT_SETTINGS.footerCopyrightText },
    footerPaymentSecurity: { type: String, default: DEFAULT_SETTINGS.footerPaymentSecurity },
    footerPaymentMethods: { type: String, default: DEFAULT_SETTINGS.footerPaymentMethods },
    socialInstagram: { type: String, default: DEFAULT_SETTINGS.socialInstagram },
    socialFacebook: { type: String, default: DEFAULT_SETTINGS.socialFacebook },
    socialTwitter: { type: String, default: DEFAULT_SETTINGS.socialTwitter },
    socialYoutube: { type: String, default: DEFAULT_SETTINGS.socialYoutube },

    // Our Heritage Page Management
    heritageBadge: { type: String, default: (DEFAULT_SETTINGS as any).heritageBadge || 'Since 1952' },
    heritageHeroTitle: { type: String, default: (DEFAULT_SETTINGS as any).heritageHeroTitle || 'Seven Decades of Royal Culinary Confectionery' },
    heritageHeroSubtitle: { type: String, default: (DEFAULT_SETTINGS as any).heritageHeroSubtitle || 'Honoring royal Rajputana and Bengali halwai lineages through uncompromised purity, heritage copper cauldrons, and certified A2 Desi Cow Ghee.' },
    heritageHeroImageUrl: { type: String, default: (DEFAULT_SETTINGS as any).heritageHeroImageUrl || 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1600&q=85' },
    heritageStoryBadge: { type: String, default: (DEFAULT_SETTINGS as any).heritageStoryBadge || 'The Genesis' },
    heritageStoryTitle: { type: String, default: (DEFAULT_SETTINGS as any).heritageStoryTitle || 'Preserving Royal Recipes Passed Through Generations' },
    heritageStoryParagraph1: { type: String, default: (DEFAULT_SETTINGS as any).heritageStoryParagraph1 || 'Shree Mithai began in the walled city of Jaipur with a simple oath: sweets should never compromise on purity. While modern confectioners turned to palm oil and synthetic colors, our kitchen remained faithful to traditional brass kadhais and hand-stirred mawa.' },
    heritageStoryParagraph2: { type: String, default: (DEFAULT_SETTINGS as any).heritageStoryParagraph2 || 'Every morning at 4:00 AM, fresh cow milk is brought in from certified local farms to craft fresh chenna for our Rasmalai and Gulab Jamuns.' },
    heritageStoryImageUrl: { type: String, default: (DEFAULT_SETTINGS as any).heritageStoryImageUrl || 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80' },
    heritagePillar1Title: { type: String, default: (DEFAULT_SETTINGS as any).heritagePillar1Title || '100% Pure A2 Cow Ghee' },
    heritagePillar1Subtitle: { type: String, default: (DEFAULT_SETTINGS as any).heritagePillar1Subtitle || 'We never use vanaspati or hydrogenated fats. Pure clarified butter gives our laddoos their sacred golden warmth.' },
    heritagePillar2Title: { type: String, default: (DEFAULT_SETTINGS as any).heritagePillar2Title || 'Zero Preservatives' },
    heritagePillar2Subtitle: { type: String, default: (DEFAULT_SETTINGS as any).heritagePillar2Subtitle || 'No artificial chemical stabilisers or artificial fragrances. What you taste is pure saffron, cardamom, and Goan cashews.' },
    heritagePillar3Title: { type: String, default: (DEFAULT_SETTINGS as any).heritagePillar3Title || 'Grand Celebrations' },
    heritagePillar3Subtitle: { type: String, default: (DEFAULT_SETTINGS as any).heritagePillar3Subtitle || 'Over 2,500 royal weddings and state galas catered with bespoke velvet chests and white-glove delivery.' },
    heritageCtaText: { type: String, default: (DEFAULT_SETTINGS as any).heritageCtaText || 'Experience Our Sweets' },
    heritageCtaLink: { type: String, default: (DEFAULT_SETTINGS as any).heritageCtaLink || '/shop' },

    // Best Selling Hampers Section Settings
    hampersBadgeText: { type: String, default: (DEFAULT_SETTINGS as any).hampersBadgeText || 'Curated Luxury' },
    hampersTitle: { type: String, default: (DEFAULT_SETTINGS as any).hampersTitle || 'Best Selling Hampers' },
    hampersSubtitle: { type: String, default: (DEFAULT_SETTINGS as any).hampersSubtitle || 'Bespoke velvet gift chests, wedding thalis, and royal festive assortments selected for connoisseurs.' },
    hampersLinkText: { type: String, default: (DEFAULT_SETTINGS as any).hampersLinkText || 'Explore All Hampers' },
    hampersLinkUrl: { type: String, default: (DEFAULT_SETTINGS as any).hampersLinkUrl || '/shop?search=hamper' },

    // Restaurant Food Page Management
    restaurantBadgeText: { type: String, default: (DEFAULT_SETTINGS as any).restaurantBadgeText || 'Shree Mithai Royal Kitchen & Dining' },
    restaurantHeroTitle: { type: String, default: (DEFAULT_SETTINGS as any).restaurantHeroTitle || 'Master Royal Dining & Artisanal Delicacies' },
    restaurantHeroSubtitle: { type: String, default: (DEFAULT_SETTINGS as any).restaurantHeroSubtitle || 'Savor royal Awadhi & Rajputana gourmet dishes prepared fresh by master khansamas using fragrant hand-pounded spices, slow-dum clay handis, and pure A2 Desi Cow Ghee.' },
    restaurantHeroImageUrl: { type: String, default: (DEFAULT_SETTINGS as any).restaurantHeroImageUrl || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=85' },
    restaurantOpeningHours: { type: String, default: (DEFAULT_SETTINGS as any).restaurantOpeningHours || '11:00 AM – 11:00 PM Daily' },
    restaurantContactPhone: { type: String, default: (DEFAULT_SETTINGS as any).restaurantContactPhone || '+91 98765 43210' },
    restaurantDiningNotice: { type: String, default: (DEFAULT_SETTINGS as any).restaurantDiningNotice || 'Freshly prepared to order. Instant doorstep delivery within 35-45 mins or reserved dining at our Heritage Hall.' },
    restaurantFeature1Title: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature1Title || 'Live Clay Tandoor' },
    restaurantFeature1Subtitle: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature1Subtitle || 'Charcoal smoked breads & kebabs' },
    restaurantFeature2Title: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature2Title || 'Slow-Dum Handi' },
    restaurantFeature2Subtitle: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature2Subtitle || '24-hr gentle simmered gravies' },
    restaurantFeature3Title: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature3Title || '100% Desi Cow Ghee' },
    restaurantFeature3Subtitle: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature3Subtitle || 'Pure certified A2 clarified butter' },
    restaurantFeature4Title: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature4Title || 'Express Hot Delivery' },
    restaurantFeature4Subtitle: { type: String, default: (DEFAULT_SETTINGS as any).restaurantFeature4Subtitle || 'Piping hot in thermal insulated bags' },

    // Homepage Restaurant Section
    homeRestaurantBadge: { type: String, default: (DEFAULT_SETTINGS as any).homeRestaurantBadge || "Chef's Gourmet Kitchen" },
    homeRestaurantTitle: { type: String, default: (DEFAULT_SETTINGS as any).homeRestaurantTitle || 'Royal Restaurant Dining & Delicacies' },
    homeRestaurantSubtitle: { type: String, default: (DEFAULT_SETTINGS as any).homeRestaurantSubtitle || 'Freshly prepared to order from our live tandoor and copper cauldrons — relish royal thalis, slow-cooked dal, and fragrant biryanis delivered piping hot.' },
    homeRestaurantBtnText: { type: String, default: (DEFAULT_SETTINGS as any).homeRestaurantBtnText || 'Explore Full Restaurant Menu' },
    homeRestaurantBtnLink: { type: String, default: (DEFAULT_SETTINGS as any).homeRestaurantBtnLink || '/restaurant' },
    homeRestaurantBannerImage: { type: String, default: (DEFAULT_SETTINGS as any).homeRestaurantBannerImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85' },
    homeRestaurantNotice: { type: String, default: (DEFAULT_SETTINGS as any).homeRestaurantNotice || 'Instant Doorstep Delivery in 30-45 Mins • Fresh Upon Order' },
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>('Setting', SettingSchema);
