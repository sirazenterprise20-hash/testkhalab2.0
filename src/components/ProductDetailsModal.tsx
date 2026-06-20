import React, { useState } from 'react';
import { X, Star, Heart, Play, ShoppingBag, Radio, Shield, Send, Sparkles, MessageSquare } from 'lucide-react';
import { Product, Review } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  reviews: Review[];
  onSubmitReview: (productId: string, name: string, rating: number, comment: string) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  reviews,
  onSubmitReview
}: ProductDetailsModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(product.image);

  // Sync activeImage when product changes
  React.useEffect(() => {
    setActiveImage(product.image);
    setIsPlayingVideo(false);
  }, [product.id, product.image]);

  const allImages = [product.image, ...(product.images || [])].filter((img): img is string => typeof img === 'string' && img.trim() !== '');

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const averageRating = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 4.8; // default beautiful rating

  const isOutOfStock = product.stock <= 0;
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;
    onSubmitReview(product.id, reviewerName, rating, comment);
    setReviewerName('');
    setComment('');
    setRating(5);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
    }, 4000);
  };

  return (
    <div id="product-detail-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">
        {/* Close Button */}
        <button
          id="close-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Block */}
        <div className="w-full md:w-1/2 bg-gray-50 relative flex flex-col justify-center max-h-[40vh] md:max-h-full overflow-hidden">
          {isPlayingVideo && product.videoUrl ? (
            <div className="w-full h-full relative aspect-[4/5] bg-black">
              <video
                src={product.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
              <button
                id="stop-video-btn"
                onClick={() => setIsPlayingVideo(false)}
                className="absolute bottom-4 left-4 bg-white/90 text-black text-xs font-mono font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-all shadow-md cursor-pointer"
              >
                Show Image
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative aspect-[4/5] flex items-center">
              <img
                src={activeImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              
              {/* Product Gallery Thumbnails */}
              {!isPlayingVideo && allImages.length > 1 && (
                <div id="product-thumbnails" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto bg-black/40 backdrop-blur-md p-1.5 rounded-lg max-w-[90%] scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`w-12 h-12 rounded border-2 transition-all cursor-pointer overflow-hidden flex-shrink-0 ${
                        activeImage === img ? 'border-[var(--primary)] scale-105 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {product.videoUrl && (
                <button
                  id="play-video-btn"
                  onClick={() => setIsPlayingVideo(true)}
                  className="absolute inset-0 m-auto w-16 h-16 bg-white/90 hover:bg-[var(--primary)] hover:text-white text-black rounded-full flex items-center justify-center shadow-lg transition-all scale-95 hover:scale-100 group cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </button>
              )}
            </div>
          )}

          {/* Savings Badge */}
          {product.originalPrice > product.price && (
            <span className="absolute top-4 left-4 bg-[var(--accent)] text-white font-mono text-xs font-bold tracking-widest px-3 py-1 rounded">
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        {/* Content Details Block */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col h-[50vh] md:h-full">
          {/* Header */}
          <div className="mb-4">
            <span className="text-xs uppercase tracking-widest font-mono text-[var(--primary)] font-bold mb-1 block">
              {product.category.toUpperCase().replace("-", " ")}
            </span>
            <h1 className="font-serif text-2xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold font-mono text-gray-700">
              {averageRating.toFixed(1)} / 5.0
            </span>
            <span className="text-xs text-gray-400 font-sans">
              ({productReviews.length} authenticated reviews)
            </span>
          </div>

          {/* Price Block */}
          <div className="mb-5 bg-gray-50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 block font-mono">Special offer price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-gray-900">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through font-mono">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-wider">Inventory Status</span>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-500 font-mono">OUT OF STOCK</span>
              ) : product.stock <= 5 ? (
                <span className="text-xs font-bold text-red-500 font-mono animate-pulse">Low Stock ({product.stock} left)</span>
              ) : (
                <span className="text-xs font-bold text-emerald-600 font-mono">Available: {product.stock} Units</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-xs uppercase tracking-wider font-mono text-gray-400 mb-2">Description / Fabric Information</h4>
            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Selection of size */}
          {!isOutOfStock && product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-gray-700 uppercase tracking-wider">Select Available Sizes:</span>
                <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded">Standard Fit</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    id={`modal-size-${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-10 h-10 text-xs font-mono rounded-lg border font-bold flex items-center justify-center transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive actions */}
          <div className="flex gap-3 mb-6">
            <button
              id={`modal-fav-${product.id}`}
              onClick={() => onToggleFavorite(product.id)}
              className={`p-3.5 border rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                isFavorite 
                  ? 'border-red-200 bg-red-50 text-red-500' 
                  : 'border-gray-200 hover:border-gray-400 text-gray-500 bg-white'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
            <button
              id={`modal-add-to-cart`}
              onClick={() => onAddToCart(product, selectedSize)}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold tracking-wider transition-all uppercase cursor-pointer ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[var(--secondary)] hover:bg-[var(--primary)] text-white shadow-md'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Bag</span>
            </button>
          </div>

          <div className="flex items-center gap-5 justify-between py-3 border-t border-b border-gray-100 mb-8 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>100% Original KHALAB Wear</span>
            </div>
            <span>Home Delivery Across BD</span>
          </div>

          {/* Review Section */}
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-700" />
              <h3 className="font-serif text-lg font-bold text-gray-900">Customer feedback</h3>
            </div>

            {/* List reviews */}
            <div className="space-y-4 mb-6">
              {productReviews.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-xl text-center text-xs text-gray-500">
                  No feedback reviews yet. Be the first to express your purchase style support!
                </div>
              ) : (
                productReviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-sans text-xs font-bold text-gray-800">{review.customerName}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-3 h-3 ${index < review.rating ? 'fill-current' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Submit review */}
            <form onSubmit={handleReviewSubmit} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Post an Honest Review
              </h4>
              
              {reviewSuccess && (
                <div className="mb-3 bg-emerald-50 text-emerald-700 text-xs py-2 px-3 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Review cataloged successfully! Refresh or wait for sync.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakib Al Hasan"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ Excellent Fit (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ Great Texture (4/5)</option>
                    <option value="3">⭐⭐⭐ Good (3/5)</option>
                    <option value="2">⭐⭐ Fair (2/5)</option>
                    <option value="1">⭐ Poor Fit (1/5)</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-[10px] font-semibold text-gray-500 block mb-1">Review feedback text</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Tell others how it fit, how the fabric looks, etc."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--secondary)] hover:bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Review</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
