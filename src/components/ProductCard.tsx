import React from 'react';
import { Heart, ShoppingBag, Star, Play } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  averageRating: number;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  averageRating
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = React.useState<string>(product.sizes[0] || 'M');
  const isOutOfStock = product.stock <= 0;
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div 
      id={`prod-card-${product.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {isOutOfStock ? (
          <span className="bg-red-500 text-white font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase">
            Out of Stock
          </span>
        ) : (
          <>
            {product.featured && (
              <span className="bg-[var(--primary)] text-[var(--secondary)] font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-sm uppercase">
                Featured
              </span>
            )}
            {product.originalPrice > product.price && (
              <span className="bg-[var(--accent)] text-white font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase">
                Save {discountPercent}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Favorite Circle */}
      <button
        id={`fav-btn-${product.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full cursor-pointer transition-colors duration-300 ${
          isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/80 hover:bg-white text-gray-500'
        } shadow-xs`}
        aria-label="Add to Wishlist"
      >
        <Heart className="w-4 h-4 fill-current" />
      </button>

      {/* Product Image Area */}
      <div 
        className="aspect-[4/5] overflow-hidden bg-gray-50 relative cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Subtle Video Badge */}
        {product.videoUrl && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 p-1.5 rounded-full text-white">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-black font-sans text-xs font-semibold px-4 py-2 rounded-full shadow-sm scale-90 group-hover:scale-100 transition-all duration-300">
            View Details
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.round(averageRating) ? 'fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-500 font-mono">({averageRating.toFixed(1)})</span>
        </div>

        {/* Title */}
        <h3 
          className="font-serif text-sm font-medium text-gray-900 group-hover:text-[var(--primary)] transition-colors duration-300 line-clamp-1 mb-1 cursor-pointer"
          onClick={() => onViewDetails(product)}
        >
          {product.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-3 flex-grow leading-relaxed">
          {product.description}
        </p>

        {/* Sizes Selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400">Select Size:</span>
              <span className="text-[10px] font-mono font-medium text-gray-600">{selectedSize}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  id={`size-btn-${product.id}-${size}`}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-7 h-7 text-[10px] font-mono rounded border flex items-center justify-center transition-all cursor-pointer ${
                    selectedSize === size
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white font-bold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock status for low inventory */}
        {!isOutOfStock && product.stock <= 5 && (
          <div className="mb-2 text-[10px] font-sans text-red-500 font-semibold flex items-center gap-1 bg-red-50 py-0.5 px-2 rounded">
            ⚠️ Only {product.stock} items left in stock!
          </div>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
          <div className="flex flex-col">
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-gray-400 line-through font-mono leading-none mb-0.5">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-sm font-bold font-mono text-gray-900 leading-none">
              ৳{product.price.toLocaleString()}
            </span>
          </div>

          <button
            id={`add-cart-btn-${product.id}`}
            onClick={() => onAddToCart(product, selectedSize)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--secondary)] text-white hover:bg-[var(--primary)] hover:text-white shadow-xs'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
