"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DELIVERY_SLOTS = exports.DEFAULT_PACKAGING_OPTIONS = exports.DEFAULT_EVENT_TYPES = exports.DEFAULT_SETTINGS = void 0;
exports.DEFAULT_SETTINGS = {
    restaurantName: "Shree Mithai & Royal Confectionery",
    tagline: "Pure Artisanal Sweets & Royal Savories Since 1952",
    contactEmail: "care@shreemithai.com",
    contactPhone: "+91 98765 43210",
    address: "Heritage Grand Boulevard, Civil Lines",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    currency: "INR",
    currencySymbol: "₹",
    gstRate: 5, // 5% GST on sweetmeat and restaurant takeaway
    standardDeliveryFee: 50,
    freeDeliveryThreshold: 799,
    minAdvanceBookingDays: 3,
    maxAdvanceBookingDays: 90,
    advanceDepositPercentage: 30, // 30% advance deposit for events
    instantOrderCutoffTime: "21:30",
    enableRazorpayTestMode: true,
    restaurantBadgeText: "Shree Mithai Royal Kitchen & Dining",
    restaurantHeroTitle: "Master Royal Dining & Artisanal Delicacies",
    restaurantHeroSubtitle: "Savor royal Awadhi & Rajputana gourmet dishes prepared fresh by master khansamas using fragrant hand-pounded spices, slow-dum clay handis, and pure A2 Desi Cow Ghee.",
    restaurantHeroImageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=85",
    restaurantOpeningHours: "11:00 AM – 11:00 PM Daily",
    restaurantContactPhone: "+91 98765 43210",
    restaurantDiningNotice: "Freshly prepared to order. Instant doorstep delivery within 35-45 mins or reserved dining at our Heritage Hall.",
    homeRestaurantBadge: "Chef's Gourmet Kitchen",
    homeRestaurantTitle: "Royal Restaurant Dining & Delicacies",
    homeRestaurantSubtitle: "Freshly prepared to order from our live tandoor and copper cauldrons — relish royal thalis, slow-cooked dal, and fragrant biryanis delivered piping hot.",
    homeRestaurantBtnText: "Explore Full Restaurant Menu",
    homeRestaurantBtnLink: "/restaurant",
    homeRestaurantBannerImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85",
    homeRestaurantNotice: "Instant Doorstep Delivery in 30-45 Mins • Fresh Upon Order",
};
exports.DEFAULT_EVENT_TYPES = [
    { name: "Wedding Celebration", description: "Royal sweet hampers, ceremonial packaging, and customized welcome boxes for weddings.", iconName: "HeartHandshake" },
    { name: "Corporate Gathering", description: "Executive branded gift boxes, conference refreshments, and festival employee distribution.", iconName: "Building2" },
    { name: "Birthday & Anniversary", description: "Artisanal party assortments, mini bite boxes, and bespoke sweet towers.", iconName: "Cake" },
    { name: "Engagement Ceremony", description: "Exquisite dry fruit platters, silver-leafed sweets, and auspicious trousseau boxes.", iconName: "Sparkles" },
    { name: "Religious & Pooja Occasion", description: "Pure Desi Ghee prasad laddoos, satvik sweets, and traditional thali accompaniments.", iconName: "Sun" },
    { name: "Diwali & Festival Gala", description: "Lavish festive hampers, assortment tins, and dry fruit combinations.", iconName: "Flame" },
    { name: "Cocktail & Private Party", description: "Savory mini kachoris, cocktail samosas, chaat bites, and luxury dessert platters.", iconName: "PartyPopper" },
    { name: "Other Celebration", description: "Custom quantities, tailored packaging, and flexible scheduled deliveries.", iconName: "Calendar" },
];
exports.DEFAULT_PACKAGING_OPTIONS = [
    {
        name: "Classic Heritage Box",
        description: "Eco-friendly premium food-grade gold foil embossed box with butter paper partition.",
        extraPrice: 0,
        isDefault: true,
    },
    {
        name: "Royal Saffron Velvet Hamper",
        description: "Handcrafted plush velvet rigid box with golden filigree locks, silk ribbon, and personalized calligraphy note.",
        extraPrice: 150,
    },
    {
        name: "Artisanal Wooden Keepsake Chest",
        description: "Carved seasoned sheesham wood chest with brass latches — an opulent keepsake for wedding guests.",
        extraPrice: 350,
    },
    {
        name: "Festive Golden Brass Thali Platter",
        description: "Traditional embossed brass platter with reusable decorative net cover and royal auspicious tassels.",
        extraPrice: 450,
    },
];
exports.DEFAULT_DELIVERY_SLOTS = [
    { title: "Morning (09:00 AM - 11:30 AM)", startTime: "09:00", endTime: "11:30", maxCapacity: 25, active: true, orderType: "ALL" },
    { title: "Midday (11:30 AM - 02:00 PM)", startTime: "11:30", endTime: "14:00", maxCapacity: 30, active: true, orderType: "ALL" },
    { title: "Afternoon (02:00 PM - 04:30 PM)", startTime: "14:00", endTime: "16:30", maxCapacity: 20, active: true, orderType: "ALL" },
    { title: "Evening (04:30 PM - 07:00 PM)", startTime: "16:30", endTime: "19:00", maxCapacity: 35, active: true, orderType: "ALL" },
    { title: "Night (07:00 PM - 09:30 PM)", startTime: "19:00", endTime: "21:30", maxCapacity: 25, active: true, orderType: "ALL" },
];
