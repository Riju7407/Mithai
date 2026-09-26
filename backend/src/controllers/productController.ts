import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AdminAuditLog } from '../models/AdminAuditLog';
import { cloudinary } from '../config/cloudinary';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      search,
      category,
      foodCategory,
      isRestaurantFood,
      isChefSpecial,
      spiceLevel,
      dietary,
      isSugarFree,
      availableForInstant,
      availableForAdvance,
      minPrice,
      maxPrice,
      sort = 'featured',
      includeInactive,
    } = req.query;

    const query: any = {};
    if (includeInactive === 'true' || req.query.all === 'true') {
      // do not enforce isActive: true
    } else if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    } else {
      query.isActive = true;
    }

    if (isRestaurantFood !== undefined) {
      query.isRestaurantFood = isRestaurantFood === 'true';
    }

    if (foodCategory && typeof foodCategory === 'string' && foodCategory !== 'All') {
      query.foodCategory = new RegExp(`^${foodCategory.trim()}$`, 'i');
    }

    if (isChefSpecial === 'true') {
      query.isChefSpecial = true;
    }

    if (spiceLevel && typeof spiceLevel === 'string' && spiceLevel !== 'All') {
      query.spiceLevel = spiceLevel;
    }

    // Text or regex search across name, category, and description
    if (search && typeof search === 'string' && search.trim() !== '') {
      const safeSearch = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(safeSearch, 'i');

      const matchedCats = await Category.find({
        isActive: true,
        $or: [{ name: searchRegex }, { description: searchRegex }],
      }).select('_id');
      const matchedCatIds = matchedCats.map((c) => c._id);

      query.$or = [
        { productName: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { ingredients: searchRegex },
      ];

      if (matchedCatIds.length > 0) {
        query.$or.push({ category: { $in: matchedCatIds } });
      }
    }

    // Category filter
    if (category && typeof category === 'string') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.category = cat._id;
        }
      }
    }

    // Dietary filter
    if (dietary && (dietary === 'VEG' || dietary === 'NON_VEG')) {
      query.dietary = dietary;
    }

    // Sugar free
    if (isSugarFree === 'true') {
      query.isSugarFree = true;
    }

    // Instant vs Advance availability
    if (availableForInstant === 'true') {
      query.availableForInstant = true;
    }
    if (availableForAdvance === 'true') {
      query.availableForAdvance = true;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.finalPrice.$lte = parseFloat(maxPrice as string);
    }

    // Sorting
    let sortQuery: any = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortQuery = { finalPrice: 1 };
    else if (sort === 'price_desc') sortQuery = { finalPrice: -1 };
    else if (sort === 'newest') sortQuery = { createdAt: -1 };
    else if (sort === 'popular' || sort === 'best_selling') sortQuery = { isFeatured: -1, stockQuantity: -1 };
    else if (sort === 'featured') sortQuery = { isFeatured: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully.',
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 })
      .limit(16);

    // Fallback if admin hasn't marked any as featured yet
    if (!products || products.length === 0) {
      products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(8);
    }

    res.status(200).json({
      success: true,
      message: 'Featured products retrieved successfully.',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getBestSellerHampers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let hampers = await Product.find({ isActive: true, isBestSeller: true })
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 })
      .limit(16);

    // Fallback if none selected: find products matching hamper/gift/box or high-tier confections
    if (!hampers || hampers.length === 0) {
      hampers = await Product.find({
        isActive: true,
        $or: [
          { productName: { $regex: /hamper|box|thali|gift|pack|assorted/i } },
          { description: { $regex: /hamper|gift box|assortment/i } },
        ],
      })
        .populate('category', 'name slug')
        .limit(8);

      if (!hampers || hampers.length === 0) {
        hampers = await Product.find({ isActive: true })
          .populate('category', 'name slug')
          .sort({ finalPrice: -1 })
          .limit(8);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Best selling hampers retrieved successfully.',
      data: hampers,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugOrId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slugOrId } = req.params;

    let query: any = { slug: slugOrId };
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      query = { $or: [{ _id: slugOrId }, { slug: slugOrId }] };
    }

    const product = await Product.findOne(query).populate('category', 'name slug');
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
      return;
    }

    // Related products in same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select('productName slug finalPrice basePrice discountPercentage productImages weightUnit dietary isSugarFree');

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully.',
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Product
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body;

    // Generate slug if not given
    const slug = body.slug
      ? body.slug
      : body.productName
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

    const existingSlug = await Product.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const product = await Product.create({
      ...body,
      slug: finalSlug,
    });

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'CREATE_PRODUCT',
      resource: 'PRODUCT',
      resourceId: product._id.toString(),
      details: { productName: product.productName, finalPrice: product.finalPrice },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Product
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, { ...req.body }, { new: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'UPDATE_PRODUCT',
      resource: 'PRODUCT',
      resourceId: product._id.toString(),
      details: req.body,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Product
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await AdminAuditLog.create({
      admin: req.user!._id,
      adminEmail: req.user!.email,
      action: 'DELETE_PRODUCT',
      resource: 'PRODUCT',
      resourceId: id,
      details: { productName: product.productName },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Upload Image (Cloudinary or buffer fallback)
export const uploadProductImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded.' });
      return;
    }

    const cloudName = cloudinary.config().cloud_name;
    const apiKey = cloudinary.config().api_key;

    // Upload to Cloudinary if properly configured and not default demo placeholders
    if (cloudName && apiKey && cloudName !== 'demo' && apiKey !== '123456789012345') {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'mithai/products',
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
        });

        res.status(200).json({
          success: true,
          message: 'Image uploaded to Cloudinary successfully.',
          data: {
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url,
          },
        });
        return;
      } catch (cloudErr) {
        console.warn('Cloudinary upload error, falling back to data URI storage:', cloudErr);
      }
    }

    // Fallback: high-res data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    res.status(200).json({
      success: true,
      message: 'Image processed successfully.',
      data: {
        publicId: `img_${Date.now()}`,
        url: dataURI,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      res.status(200).json({
        success: true,
        data: { categories: [], products: [] },
      });
      return;
    }

    const safeRegex = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(safeRegex, 'i');

    // 1. Search matching categories (by name or description)
    const matchingCategories = await Category.find({
      isActive: true,
      $or: [{ name: regex }, { description: regex }],
    })
      .select('name slug image description')
      .limit(4);

    const matchingCatIds = matchingCategories.map((c) => c._id);

    // 2. Search matching products (by name, description, shortDescription, or matched category)
    const productQuery: any = {
      isActive: true,
      $or: [
        { productName: regex },
        { shortDescription: regex },
        { description: regex },
        { ingredients: regex },
      ],
    };

    if (matchingCatIds.length > 0) {
      productQuery.$or.push({ category: { $in: matchingCatIds } });
    }

    const matchingProducts = await Product.find(productQuery)
      .populate('category', 'name slug')
      .select('productName slug basePrice finalPrice productImages category shortDescription description dietary isSugarFree')
      .limit(8);

    const formattedCategories = matchingCategories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.image?.url || '',
      description: cat.description || '',
      type: 'category',
    }));

    const formattedProducts = matchingProducts.map((prod) => {
      let matchedReason: 'name' | 'category' | 'description' = 'name';
      if (regex.test(prod.productName)) {
        matchedReason = 'name';
      } else if (prod.category && regex.test((prod.category as any).name)) {
        matchedReason = 'category';
      } else if (regex.test(prod.shortDescription || '') || regex.test(prod.description || '')) {
        matchedReason = 'description';
      }

      const primaryImg =
        prod.productImages?.find((img) => img.isPrimary)?.url ||
        prod.productImages?.[0]?.url ||
        'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80';

      return {
        _id: prod._id,
        productName: prod.productName,
        slug: prod.slug,
        finalPrice: prod.finalPrice,
        basePrice: prod.basePrice,
        imageUrl: primaryImg,
        category: prod.category,
        shortDescription: prod.shortDescription,
        dietary: prod.dietary,
        isSugarFree: prod.isSugarFree,
        matchedReason,
        type: 'product',
      };
    });

    res.status(200).json({
      success: true,
      data: {
        categories: formattedCategories,
        products: formattedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const DEFAULT_RESTAURANT_DISHES = [
  {
    productName: 'Maharaja Grand Royal Thali',
    slug: 'maharaja-grand-royal-thali',
    description: 'An opulent Rajputana banquet served in traditional brass thali style: Paneer Lababdar, Dal Makhani Bukhara, Rajasthani Gatta Curry, Shahi Pulao, 2 Butter Laccha Parathas, Kesari Phirni, Warm Gulab Jamun, Roasted Papad, Mint Raita, and Chutney.',
    shortDescription: 'Multi-course royal feast with 3 curries, laccha parathas, pulao & sweets.',
    basePrice: 650,
    discountPercentage: 15,
    finalPrice: 550,
    weightUnit: 'thali',
    variants: [
      { name: 'Single Thali', weightOrPieces: 1, unit: 'thali', price: 650, discountedPrice: 550, isDefault: true },
      { name: 'Twin Royal Feast (2 Thalis)', weightOrPieces: 2, unit: 'thali', price: 1250, discountedPrice: 1050 },
    ],
    ingredients: ['Cottage Cheese', 'Urad Dal', 'Gram Flour', 'Aged Basmati', 'A2 Desi Cow Ghee', 'Saffron', 'Whole Spices'],
    shelfLife: 'Best consumed fresh within 3 hours',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 50,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Royal Thalis',
    spiceLevel: 'Medium',
    preparationTime: '25-30 mins',
    servingSize: 'Serves 1-2',
    isChefSpecial: true,
    averageRating: 5.0,
    totalReviews: 42,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Shahi Awadhi Dum Biryani (Clay Handi)',
    slug: 'shahi-awadhi-dum-biryani',
    description: 'Fragrant aged Dehradun basmati rice sealed with soft dough in a clay handi and slow-cooked over gentle charcoal embers with marinated vegetables, golden paneer cubes, pure saffron strands, kewra essence, and roasted cashews. Served with Burani Raita and Salan.',
    shortDescription: 'Slow-dum cooked aromatic saffron basmati in sealed earthen pot.',
    basePrice: 420,
    discountPercentage: 10,
    finalPrice: 380,
    weightUnit: 'handi',
    variants: [
      { name: 'Regular Handi (Serves 1-2)', weightOrPieces: 1, unit: 'handi', price: 420, discountedPrice: 380, isDefault: true },
      { name: 'Family Handi (Serves 3-4)', weightOrPieces: 2, unit: 'handi', price: 790, discountedPrice: 699 },
    ],
    ingredients: ['Aged Basmati Rice', 'Malai Paneer', 'Kashmiri Saffron', 'Kewra Water', 'Cashews', 'Brown Onions', 'A2 Desi Ghee'],
    shelfLife: 'Best consumed fresh within 4 hours',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 60,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Biryani & Rice',
    spiceLevel: 'Medium',
    preparationTime: '25-30 mins',
    servingSize: 'Serves 2',
    isChefSpecial: true,
    averageRating: 4.9,
    totalReviews: 38,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Paneer Tikka Angara (Smoked Charcoal)',
    slug: 'paneer-tikka-angara',
    description: 'Fresh farm malai paneer cubes steeped in hung spiced curd, mustard oil, Kashmiri deghi mirch, and hand-ground garam masala, skewered with bell peppers and roasted to smoky charred perfection over live coal tandoor.',
    shortDescription: 'Smoked live tandoor cottage cheese cubes with spicy mint chutney.',
    basePrice: 350,
    discountPercentage: 9,
    finalPrice: 320,
    weightUnit: 'portion',
    variants: [
      { name: 'Standard Platter (6 Pcs)', weightOrPieces: 6, unit: 'pcs', price: 350, discountedPrice: 320, isDefault: true },
      { name: 'Large Platter (10 Pcs)', weightOrPieces: 10, unit: 'pcs', price: 550, discountedPrice: 490 },
    ],
    ingredients: ['Farm Fresh Paneer', 'Hung Curd', 'Mustard Oil', 'Degi Mirch', 'Bell Peppers', 'Chaat Masala', 'Fresh Mint'],
    shelfLife: 'Best consumed hot immediately',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 80,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Starters & Kebabs',
    spiceLevel: 'Spicy',
    preparationTime: '15-20 mins',
    servingSize: '6 Pieces (Serves 2)',
    isChefSpecial: true,
    averageRating: 4.9,
    totalReviews: 29,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Shahi Dal Makhani Bukhara (24-Hour Simmered)',
    slug: 'shahi-dal-makhani-bukhara',
    description: 'Black whole urad lentils and rajma slow-simmered over glowing charcoal embers for over 24 continuous hours with fresh vine tomatoes, aromatic royal spices, and finished with a generous swirl of churned white makhan and sweet cream.',
    shortDescription: 'Legendary 24-hour slow simmered black lentils with churned butter & cream.',
    basePrice: 380,
    discountPercentage: 11,
    finalPrice: 340,
    weightUnit: 'bowl',
    variants: [
      { name: 'Single Bowl (500ml)', weightOrPieces: 1, unit: 'bowl', price: 380, discountedPrice: 340, isDefault: true },
      { name: 'Family Handi (1000ml)', weightOrPieces: 2, unit: 'bowl', price: 680, discountedPrice: 599 },
    ],
    ingredients: ['Black Urad Dal', 'Kashmiri Rajma', 'Churned White Butter', 'Fresh Cream', 'Tomato Puree', 'A2 Desi Cow Ghee'],
    shelfLife: 'Best consumed hot upon arrival',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 90,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Main Course',
    spiceLevel: 'Mild',
    preparationTime: '15 mins',
    servingSize: 'Serves 2-3',
    isChefSpecial: true,
    averageRating: 5.0,
    totalReviews: 54,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Amritsari Paneer Chur Chur Naan Platter',
    slug: 'amritsari-paneer-chur-chur-naan',
    description: 'Crispy flaky crushed tandoori naan richly stuffed with spiced paneer, roasted ajwain, and chopped coriander, basted with pure Desi Ghee. Accompanied by slow-simmered Pindi Chana, Boondi Raita, and spicy pickled onions.',
    shortDescription: 'Flaky crushed tandoori stuffed naan with Pindi Chana and Boondi Raita.',
    basePrice: 320,
    discountPercentage: 9,
    finalPrice: 290,
    weightUnit: 'platter',
    variants: [
      { name: 'Platter (2 Naans + Sides)', weightOrPieces: 2, unit: 'platter', price: 320, discountedPrice: 290, isDefault: true },
    ],
    ingredients: ['Wheat Flour', 'Spiced Paneer', 'Ajwain', 'A2 Desi Cow Ghee', 'Kabuli Chana', 'Fresh Curd'],
    shelfLife: 'Best consumed piping hot',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 70,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: false,
    isBestSeller: true,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Tandoor & Breads',
    spiceLevel: 'Medium',
    preparationTime: '15-20 mins',
    servingSize: 'Serves 1-2',
    isChefSpecial: false,
    averageRating: 4.8,
    totalReviews: 24,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Dahi Bhalla Papdi Chaat Royale',
    slug: 'dahi-bhalla-papdi-chaat-royale',
    description: 'Pillowy soft lentil dumplings submerged in thick, chilled sweetened curd, crowned with crispy flour papdis, roasted cumin dust, tart saunth tamarind glaze, spicy mint salsa, and ruby pomegranate pearls.',
    shortDescription: 'Velvety lentil dumplings with sweet chilled yogurt, crisps and chutneys.',
    basePrice: 200,
    discountPercentage: 10,
    finalPrice: 180,
    weightUnit: 'portion',
    variants: [
      { name: 'Standard Bowl', weightOrPieces: 1, unit: 'portion', price: 200, discountedPrice: 180, isDefault: true },
    ],
    ingredients: ['Urad Dal Dumplings', 'Sweetened Yogurt', 'Crisp Papdi', 'Tamarind Sonth', 'Mint Chutney', 'Pomegranate'],
    shelfLife: 'Consume chilled immediately',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 65,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Chaats & Street Food',
    spiceLevel: 'Mild',
    preparationTime: '10 mins',
    servingSize: '1 Generous Bowl',
    isChefSpecial: false,
    averageRating: 4.9,
    totalReviews: 31,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Kesar Pista Malai Kulfi Falooda',
    slug: 'kesar-pista-malai-kulfi-falooda',
    description: 'Slow-churned artisanal whole milk kulfi infused with Kashmiri saffron threads and Iranian pistachios, presented over silky handmade cornstarch falooda noodles, chilled rabdi, sweet basil seeds, and pure damask rose drizzle.',
    shortDescription: 'Royal saffron-pistachio kulfi with handmade falooda and rose rabdi.',
    basePrice: 250,
    discountPercentage: 12,
    finalPrice: 220,
    weightUnit: 'portion',
    variants: [
      { name: 'Tall Glass Sundae', weightOrPieces: 1, unit: 'portion', price: 250, discountedPrice: 220, isDefault: true },
    ],
    ingredients: ['A2 Reduced Whole Milk', 'Kashmiri Saffron', 'Pistachios', 'Handmade Falooda', 'Sabja Seeds', 'Damask Rose Syrup'],
    shelfLife: 'Consume frozen/chilled immediately',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 50,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Desserts',
    spiceLevel: 'None',
    preparationTime: '10 mins',
    servingSize: '1 Tall Goblet',
    isChefSpecial: true,
    averageRating: 5.0,
    totalReviews: 45,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Royal Kesari Dry Fruit Lassi (Matka Kulhad)',
    slug: 'royal-kesari-dry-fruit-lassi',
    description: 'Extra thick, velvety fresh curd hand-churned in wooden mathani with saffron milk and crushed green cardamom, topped with thick malai cream and slivered Californian almonds and pistachios, served in traditional unglazed terracotta kulhad.',
    shortDescription: 'Thick hand-churned saffron yogurt drink served in traditional clay kulhad.',
    basePrice: 180,
    discountPercentage: 11,
    finalPrice: 160,
    weightUnit: 'kulhad',
    variants: [
      { name: '400ml Kulhad', weightOrPieces: 1, unit: 'kulhad', price: 180, discountedPrice: 160, isDefault: true },
    ],
    ingredients: ['Fresh Churned Curd', 'Saffron Milk', 'Green Cardamom', 'Almonds', 'Pistachios', 'Clotted Malai'],
    shelfLife: 'Best enjoyed chilled fresh',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 90,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: false,
    isBestSeller: true,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Beverages & Lassi',
    spiceLevel: 'None',
    preparationTime: '10 mins',
    servingSize: '400ml Terracotta Kulhad',
    isChefSpecial: false,
    averageRating: 4.9,
    totalReviews: 61,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Kadhai Paneer Peshawari',
    slug: 'kadhai-paneer-peshawari',
    description: 'Handmade cottage cheese cubes and crisp bell peppers stir-fried in a traditional iron kadhai with pounded coriander seeds, dry red chillies, and ginger juliennes in a tangy, robust spiced tomato-onion gravy.',
    shortDescription: 'Wok-tossed cottage cheese with crunchy bell peppers and roasted spices.',
    basePrice: 360,
    discountPercentage: 8,
    finalPrice: 330,
    weightUnit: 'portion',
    variants: [
      { name: 'Regular Portion', weightOrPieces: 1, unit: 'portion', price: 360, discountedPrice: 330, isDefault: true },
    ],
    ingredients: ['Fresh Paneer', 'Bell Peppers', 'Whole Pounded Coriander', 'Dried Red Chillies', 'Ginger Juliennes', 'A2 Desi Cow Ghee'],
    shelfLife: 'Best consumed fresh upon delivery',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 75,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Main Course',
    spiceLevel: 'Spicy',
    preparationTime: '20 mins',
    servingSize: 'Serves 2',
    isChefSpecial: false,
    averageRating: 4.8,
    totalReviews: 19,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
  {
    productName: 'Tandoori Soya Malai Chaap Tikka',
    slug: 'tandoori-soya-malai-chaap-tikka',
    description: 'Juicy layered soya chaap skewers marinated in silky cashew paste, crushed black pepper, green cardamom, and fresh dairy cream, lightly roasted in clay tandoor until delicately caramelized and tender.',
    shortDescription: 'Melt-in-mouth creamy soya chaap skewers roasted in clay oven.',
    basePrice: 310,
    discountPercentage: 10,
    finalPrice: 280,
    weightUnit: 'portion',
    variants: [
      { name: 'Standard (6 Pcs)', weightOrPieces: 6, unit: 'pcs', price: 310, discountedPrice: 280, isDefault: true },
      { name: 'Large (10 Pcs)', weightOrPieces: 10, unit: 'pcs', price: 490, discountedPrice: 440 },
    ],
    ingredients: ['Soya Chaap', 'Cashew Paste', 'Fresh Cream', 'Black Pepper', 'Cardamom', 'Mint Dip'],
    shelfLife: 'Best consumed hot immediately',
    dietary: 'VEG',
    isSugarFree: false,
    stockQuantity: 80,
    availableForInstant: true,
    availableForAdvance: true,
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    isRestaurantFood: true,
    foodCategory: 'Starters & Kebabs',
    spiceLevel: 'Mild',
    preparationTime: '15-20 mins',
    servingSize: '6 Pieces (Serves 2)',
    isChefSpecial: false,
    averageRating: 4.8,
    totalReviews: 22,
    productImages: [
      {
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=85',
        isPrimary: true,
      },
    ],
  },
];

async function seedDefaultRestaurantDishesHelper() {
  try {
    let restaurantCategory = await Category.findOne({ slug: 'restaurant-food' });
    if (!restaurantCategory) {
      restaurantCategory = await Category.create({
        name: 'Restaurant Food & Dining',
        slug: 'restaurant-food',
        description: 'Authentic royal culinary delicacies prepared fresh in live clay tandoor and copper handis.',
        image: { url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80' },
        displayOrder: 10,
        isActive: true,
      });
    }

    for (const item of DEFAULT_RESTAURANT_DISHES) {
      const exists = await Product.findOne({ slug: item.slug });
      if (!exists) {
        await Product.create({
          ...item,
          category: restaurantCategory._id,
        });
      }
    }
  } catch (err) {
    console.error('Failed to auto-seed restaurant dishes:', err);
  }
}

export const getRestaurantFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, dietary, chefSpecial, search, limit } = req.query;

    const query: any = { isActive: true, isRestaurantFood: true };

    if (category && typeof category === 'string' && category !== 'All') {
      query.foodCategory = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (dietary && (dietary === 'VEG' || dietary === 'NON_VEG')) {
      query.dietary = dietary;
    }

    if (chefSpecial === 'true') {
      query.isChefSpecial = true;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const safeSearch = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { productName: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { ingredients: searchRegex },
        { foodCategory: searchRegex },
      ];
    }

    let limitNum = limit ? parseInt(limit as string, 10) : 50;

    let foods = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ isChefSpecial: -1, isFeatured: -1, createdAt: -1 })
      .limit(limitNum);

    // If zero restaurant food items exist yet, auto-seed and reload
    if (foods.length === 0 && (!category || category === 'All') && !search && !dietary && !chefSpecial) {
      await seedDefaultRestaurantDishesHelper();
      foods = await Product.find(query)
        .populate('category', 'name slug')
        .sort({ isChefSpecial: -1, isFeatured: -1, createdAt: -1 })
        .limit(limitNum);
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant foods retrieved successfully.',
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

export const seedRestaurantFoods = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await seedDefaultRestaurantDishesHelper();
    const foods = await Product.find({ isRestaurantFood: true }).populate('category', 'name slug');
    res.status(200).json({
      success: true,
      message: 'Restaurant foods seeded successfully.',
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

