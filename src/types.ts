export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  videoUrl?: string;
  sizes: string[];
  stock: number;
  category: string;
  createdAt: string;
  featured?: boolean;
}

export interface Catalog {
  id: string;
  name: string;
  slug: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Credit Card' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Canceled';
  transactionId?: string;
  deliveryStatus: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Canceled';
  totalAmount: number;
  discountAmount: number;
  promoApplied?: string;
  trackingNumber?: string;
  isFakeCustomerReported?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FakeCustomer {
  id: string;
  phone: string;
  name: string;
  notes?: string;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
}

export interface SiteConfig {
  brandName: string;
  tagline: string;
  address: string;
  mobile: string;
  instagramPage: string;
  facebookPage: string;
  websiteLogoUrl: string; // or empty for raw text Logo
  selectedTemplate: 'luxury' | 'emerald' | 'royal' | 'crimson' | 'minimalist' | 'custom';
  
  // Custom colors or template values active
  themePrimary: string;
  themeSecondary: string;
  themeBg: string;
  themeText: string;
  themeAccent: string;

  // Banners
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroVideoUrl?: string;
  heroCtaText: string;
  
  promoBannerImage: string;
  promoBannerTitle: string;
  promoBannerSubtitle: string;
}
