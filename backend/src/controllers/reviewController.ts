import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AuthenticatedRequest } from '../middlewares/auth';

// Helper to recalculate and update product rating
async function updateProductRatingStats(productId: mongoose.Types.ObjectId | string) {
  try {
    const reviews = await Review.find({ product: productId, status: 'APPROVED' });
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 5.0;
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: total,
    });
  } catch (err) {
    console.error('Failed to update product rating stats:', err);
  }
}

// 1. Submit a review for a product
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, orderId, rating, title, comment, reviewerName, reviewerLocation } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    if (!comment || comment.trim().length < 3) {
      res.status(400).json({ success: false, message: 'Please share a meaningful review (at least 3 characters).' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    let verifiedPurchase = false;
    let userId: mongoose.Types.ObjectId | undefined = undefined;
    let name = reviewerName?.trim() || 'Connoisseur Guest';
    let email: string | undefined = undefined;

    if (req.user) {
      userId = new mongoose.Types.ObjectId(req.user._id);
      name = req.user.name || name;
      email = req.user.email;

      // Check if user has a delivered order with this product
      const hasBought = await Order.findOne({
        user: userId,
        orderStatus: { $in: ['Delivered', 'Completed'] },
        'items.product': product._id,
      });
      if (hasBought) verifiedPurchase = true;
    }

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      verifiedPurchase = true;
    }

    const review = await Review.create({
      user: userId,
      product: product._id,
      order: orderId && mongoose.Types.ObjectId.isValid(orderId) ? new mongoose.Types.ObjectId(orderId) : undefined,
      reviewerName: name,
      reviewerEmail: email,
      reviewerLocation: reviewerLocation || (verifiedPurchase ? 'Verified Buyer' : 'Connoisseur Patron'),
      rating: numRating,
      title: title?.trim(),
      comment: comment.trim(),
      verifiedPurchase,
      status: 'APPROVED', // Approved by default, admin can manage/moderate
      showInCenturiesOfTrust: numRating === 5,
    });

    // Update product rating aggregate
    await updateProductRatingStats(product._id);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your royal review has been submitted successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get approved reviews for a specific product
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    let targetProductId = productId;
    // Check if productId is a slug
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const prod = await Product.findOne({ slug: productId }).select('_id');
      if (!prod) {
        res.status(404).json({ success: false, message: 'Product not found.' });
        return;
      }
      targetProductId = prod._id.toString();
    }

    const reviews = await Review.find({
      product: targetProductId,
      status: 'APPROVED',
    }).sort({ createdAt: -1 });

    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 5.0;

    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: Math.round(avg * 10) / 10,
          totalReviews: total,
          distribution,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get featured reviews for the "Centuries of Trust" homepage section
export const getCenturiesOfTrustReviews = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1st priority: Reviews specifically selected by admin with showInCenturiesOfTrust: true
    let reviews = await Review.find({
      status: 'APPROVED',
      showInCenturiesOfTrust: true,
    })
      .populate('product', 'productName slug productImages')
      .sort({ createdAt: -1 })
      .limit(6);

    // 2nd priority: If fewer than 3 specifically flagged, supplement with top 5-star approved reviews
    if (reviews.length < 3) {
      const needed = 6 - reviews.length;
      const existingIds = reviews.map((r) => r._id);
      const topReviews = await Review.find({
        status: 'APPROVED',
        rating: { $gte: 4 },
        _id: { $nin: existingIds },
      })
        .populate('product', 'productName slug productImages')
        .sort({ rating: -1, createdAt: -1 })
        .limit(needed);

      reviews = [...reviews, ...topReviews];
    }

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Check if current user has a delivered order with unreviewed items
export const getPendingOrderReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({ success: true, data: { hasPending: false } });
      return;
    }

    // Find latest delivered/completed order for this user
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      orderStatus: { $in: ['Delivered', 'Completed'] },
    }).sort({ updatedAt: -1 });

    if (!deliveredOrder || !deliveredOrder.items || deliveredOrder.items.length === 0) {
      res.status(200).json({ success: true, data: { hasPending: false } });
      return;
    }

    // Check which items from this order have already been reviewed by this user
    const existingReviews = await Review.find({
      user: req.user._id,
      order: deliveredOrder._id,
    }).select('product');

    const reviewedProductIds = new Set(existingReviews.map((r) => r.product.toString()));

    // Find the first unreviewed item
    const unreviewedItem = deliveredOrder.items.find(
      (item) => !reviewedProductIds.has(item.product.toString())
    );

    if (!unreviewedItem) {
      res.status(200).json({ success: true, data: { hasPending: false } });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        hasPending: true,
        order: {
          _id: deliveredOrder._id,
          orderNumber: deliveredOrder.orderNumber,
          createdAt: deliveredOrder.createdAt,
        },
        item: {
          productId: unreviewedItem.product,
          productName: unreviewedItem.productName,
          variantName: unreviewedItem.variantName,
          imageUrl: unreviewedItem.imageUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Admin: Get all reviews with filtering and pagination
export const getAdminReviews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, filter, search, page = '1', limit = '20' } = req.query;

    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (filter === 'centuries_of_trust') {
      query.showInCenturiesOfTrust = true;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { reviewerName: searchRegex },
        { reviewerEmail: searchRegex },
        { comment: searchRegex },
        { title: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('product', 'productName slug productImages basePrice finalPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
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

// 6. Admin: Update review status and toggle Centuries of Trust
export const updateReviewStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, showInCenturiesOfTrust, adminReply } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    if (status && ['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
      review.status = status;
    }

    if (typeof showInCenturiesOfTrust === 'boolean') {
      review.showInCenturiesOfTrust = showInCenturiesOfTrust;
    }

    if (typeof adminReply === 'string') {
      review.adminReply = adminReply;
    }

    await review.save();

    // Recalculate product rating
    await updateProductRatingStats(review.product);

    res.status(200).json({
      success: true,
      message: 'Review status updated successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Admin: Delete review
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    // Recalculate product rating
    await updateProductRatingStats(review.product);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
