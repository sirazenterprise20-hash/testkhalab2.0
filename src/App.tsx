import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Heart, User, Settings, Info, 
  MapPin, Phone, Facebook, Instagram, ShieldCheck, X, 
  Check, ArrowRight, Truck, RefreshCw, Award, Ticket, 
  Bell, Star, Play, Flame, ExternalLink, ShieldAlert, KeyRound, CheckCircle2, Lock
} from 'lucide-react';
import { Product, Catalog, Order, Review, FakeCustomer, PromoCode, SiteConfig } from './types';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import AdminPanel from './components/AdminPanel';
import { INITIAL_PRODUCTS, INITIAL_CATALOGS } from './data';
import { 
  syncUserProfile, 
  getUserProfile, 
  saveOrderToFirebase, 
  getOrdersByPhoneFromFirebase,
  getSiteConfigFromFirebase,
  saveSiteConfigToFirebase,
  getProductsFromFirebase,
  saveProductToFirebase,
  deleteProductFromFirebase,
  getCatalogsFromFirebase,
  saveCatalogToFirebase,
  deleteCatalogFromFirebase,
  getPromosFromFirebase,
  savePromoToFirebase,
  deletePromoFromFirebase,
  getFakeCustomersFromFirebase,
  saveFakeCustomerToFirebase,
  deleteFakeCustomerFromFirebase,
  getReviewsFromFirebase,
  saveReviewToFirebase
} from './lib/firebase';

export default function App() {
  // Database States loaded from Server API
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('khalab_site_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      brandName: "KHALAB",
      tagline: "Make your self premium.",
      address: "Shuvadda, South Keraniganj, Dhaka, Bangladesh.",
      mobile: "+880171941040",
      instagramPage: "https://www.instagram.com/khalabfashion",
      facebookPage: "https://www.facebook.com/khalabfashion",
      websiteLogoUrl: "",
      selectedTemplate: "luxury",
      themePrimary: "#D4AF37",
      themeSecondary: "#1E1E1E",
      themeBg: "#FCFCFD",
      themeText: "#111111",
      themeAccent: "#8A252C",
      heroTitle: "FALL IN LOVE WITH PREMIUM FIT",
      heroSubtitle: "Handcrafted signature menswear tailoring from Dhaka's finest. Order now with bKash, Nagad, Rocket or COD services across Bangladesh.",
      heroImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=1400",
      heroCtaText: "Explore Premium Wear"
    };
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('khalab_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [catalogs, setCatalogs] = useState<Catalog[]>(() => {
    try {
      const saved = localStorage.getItem('khalab_catalogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CATALOGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('khalab_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('khalab_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [promos, setPromos] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('khalab_promos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [fakeCustomers, setFakeCustomers] = useState<FakeCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('khalab_fake_customers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Local/UI states
  const [cart, setCart] = useState<{ product: Product; size: string; quantity: number }[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('khalab_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Sorting & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'featured'>('default');

  // Modals state
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSocialLoginOpen, setIsSocialLoginOpen] = useState(false);

  // Form input stats
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [socialUser, setSocialUser] = useState<{ name: string; avatar: string; email: string; phone?: string; address?: string } | null>(() => {
    const saved = localStorage.getItem('khalab_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Phone Login State fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginMode, setLoginMode] = useState<'signin' | 'signup'>('signin');

  // Checkout form fields State
  const [checkoutName, setCheckoutName] = useState(socialUser?.name || '');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState(config.address ? "Dhaka, Bangladesh" : '');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad' | 'Rocket' | 'Credit Card'>('COD');
  const [checkoutTransId, setCheckoutTransId] = useState('');
  const [checkoutPromoInput, setCheckoutPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<Order | null>(null);

  // Personalized Recommendation Engine (Browsing history tracking)
  const [browsingHistory, setBrowsingHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('khalab_browsing_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Push notifications queue state
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: 'success' | 'info' | 'promo' }[]>([]);

  // Fetch initial database items from Express REST APIs and direct Firestore as absolute backup
  const fetchAllData = async () => {
    const safeFetch = async (url: string) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        const contentType = r.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await r.json();
        }
        return null;
      } catch (e) {
        console.error(`Network error on ${url}:`, e);
        return null;
      }
    };

    try {
      // 1. Fetch from Firestore first for robust persistent storage
      const [fireConfig, fireProducts, fireCatalogs, firePromos, fireFakes, fireReviews] = await Promise.all([
        getSiteConfigFromFirebase(),
        getProductsFromFirebase(),
        getCatalogsFromFirebase(),
        getPromosFromFirebase(),
        getFakeCustomersFromFirebase(),
        getReviewsFromFirebase()
      ]).catch(e => {
        console.warn("Firestore collection loading failure, using local rest apis fallback:", e);
        return [null, null, null, null, null, null];
      });

      // 2. Fetch from standard local REST server APIs
      const [resConfig, resProducts, resCatalogs, resOrders, resReviews, resPromos, resFakes] = await Promise.all([
        safeFetch('/api/config'),
        safeFetch('/api/products'),
        safeFetch('/api/catalogs'),
        safeFetch('/api/orders'),
        safeFetch('/api/reviews'),
        safeFetch('/api/promos'),
        safeFetch('/api/fake-customers')
      ]);

      // --- 3. MERGE STATE / PRIORITIZE FIRESTORE WITH BACKUP REST FALLBACKS ---
      
      // CONFIG
      const activeConfig = fireConfig || resConfig;
      if (activeConfig) {
        setConfig(activeConfig);
        localStorage.setItem('khalab_site_config', JSON.stringify(activeConfig));
      }

      // PRODUCTS
      let activeProducts = products;
      if (fireProducts && fireProducts.length > 0) {
        activeProducts = fireProducts;
      } else if (resProducts && resProducts.length > 0) {
        activeProducts = resProducts;
        // On first boot, synchronize default items to firestore so they are backed up
        resProducts.forEach(async (p) => {
          await saveProductToFirebase(p);
        });
      }
      if (activeProducts && activeProducts.length > 0) {
        setProducts(activeProducts);
        localStorage.setItem('khalab_products', JSON.stringify(activeProducts));
      }

      // CATALOGS
      let activeCatalogs = catalogs;
      if (fireCatalogs && fireCatalogs.length > 0) {
        activeCatalogs = fireCatalogs;
      } else if (resCatalogs && resCatalogs.length > 0) {
        activeCatalogs = resCatalogs;
        resCatalogs.forEach(async (c) => {
          await saveCatalogToFirebase(c);
        });
      }
      if (activeCatalogs && activeCatalogs.length > 0) {
        setCatalogs(activeCatalogs);
        localStorage.setItem('khalab_catalogs', JSON.stringify(activeCatalogs));
      }

      // ORDERS
      const activeOrders = resOrders || [];
      if (activeOrders) {
        setOrders(activeOrders);
        localStorage.setItem('khalab_orders', JSON.stringify(activeOrders));
      }

      // PROMO CODES
      let activePromos = promos;
      if (firePromos && firePromos.length > 0) {
        activePromos = firePromos;
      } else if (resPromos && resPromos.length > 0) {
        activePromos = resPromos;
        resPromos.forEach(async (pr) => {
          await savePromoToFirebase(pr);
        });
      }
      if (activePromos) {
        setPromos(activePromos);
        localStorage.setItem('khalab_promos', JSON.stringify(activePromos));
      }

      // BLOCKED CUSTOMERS
      let activeFakes = fakeCustomers;
      if (fireFakes && fireFakes.length > 0) {
        activeFakes = fireFakes;
      } else if (resFakes && resFakes.length > 0) {
        activeFakes = resFakes;
        resFakes.forEach(async (fc) => {
          await saveFakeCustomerToFirebase(fc);
        });
      }
      if (activeFakes) {
        setFakeCustomers(activeFakes);
        localStorage.setItem('khalab_fake_customers', JSON.stringify(activeFakes));
      }

      // REVIEWS
      let activeReviews = reviews;
      if (fireReviews && fireReviews.length > 0) {
        activeReviews = fireReviews;
      } else if (resReviews && resReviews.length > 0) {
        activeReviews = resReviews;
        resReviews.forEach(async (rv) => {
          await saveReviewToFirebase(rv);
        });
      }
      if (activeReviews) {
        setReviews(activeReviews);
        localStorage.setItem('khalab_reviews', JSON.stringify(activeReviews));
      }

    } catch (err) {
      console.error("Critical: Could not load real-time dataset from server or Firestore", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll data every 4 seconds to maintain true real-time inventory and customer status!
    const timer = setInterval(fetchAllData, 4000);
    return () => clearInterval(timer);
  }, []);

  // Sync brand theme colors as reactive native CSS variables instantly
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', config.themePrimary);
    root.style.setProperty('--secondary', config.themeSecondary);
    root.style.setProperty('--bg', config.themeBg);
    root.style.setProperty('--text', config.themeText);
    root.style.setProperty('--accent', config.themeAccent);
  }, [config]);

  // Sync favorites to localstorage
  useEffect(() => {
    localStorage.setItem('khalab_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync social username into checkout fields
  useEffect(() => {
    if (socialUser) {
      setCheckoutName(socialUser.name);
      if (socialUser.phone) {
        setCheckoutPhone(socialUser.phone);
      }
      if (socialUser.address) {
        setCheckoutAddress(socialUser.address);
      }
    }
  }, [socialUser]);

  // Function to drop a stylish Push Notification flyout
  const triggerNotification = (title: string, message: string, type: 'success' | 'info' | 'promo' = 'info') => {
    const newNotif = {
      id: Math.random().toString(),
      title,
      message,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);

    // play premium subtle notification sound if allowed, or just fade out in 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  // Track product browsing history to fed recommendation algorithms
  const logProductView = (product: Product) => {
    setBrowsingHistory(prev => {
      const filtered = prev.filter(id => id !== product.id);
      const updated = [product.id, ...filtered].slice(0, 8); // Keep last 8 unique items
      localStorage.setItem('khalab_browsing_history', JSON.stringify(updated));
      return updated;
    });
    setSelectedProductForModal(product);
  };

  // Toggle favorite listings
  const handleToggleFavorite = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(fId => fId !== id));
      triggerNotification("Removed from Wishlist", `"${product.title}" has been taken off your custom checklist.`);
    } else {
      setFavorites(prev => [...prev, id]);
      triggerNotification("Added to Whislist", `"${product.title}" saved. We'll alert you if inventory drops!`, "success");
    }
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product: Product, size: string) => {
    if (product.stock <= 0) {
      triggerNotification("Cannot add item", "This specific size layout is currently out of stock.", "info");
      return;
    }
    
    setCart(prev => {
      const matchIndex = prev.findIndex(item => item.product.id === product.id && item.size === size);
      if (matchIndex > -1) {
        const currentQty = prev[matchIndex].quantity;
        if (currentQty + 1 > product.stock) {
          triggerNotification("Stock Limit Reached", `Could not add. Only ${product.stock} units are currently inside real-time stock.`, "info");
          return prev;
        }
        const updated = [...prev];
        updated[matchIndex].quantity += 1;
        triggerNotification("Cart updated", `Increased count of "${product.title}" (${size}) inside cart.`, "success");
        return updated;
      } else {
        triggerNotification("Bag Count Incremented", `"${product.title}" (${size}) added directly to your bag.`, "success");
        return [...prev, { product, size, quantity: 1 }];
      }
    });
  };

  // Calculate shopping cart values
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountMultiplier = appliedPromo ? (100 - appliedPromo.discountPercent) / 100 : 1;
  const discountValue = appliedPromo ? cartSubtotal * (appliedPromo.discountPercent / 100) : 0;
  const cartTotal = cartSubtotal - discountValue;

  // Apply Coupon Promo Matcher
  const handleApplyPromoCode = () => {
    const codeClean = checkoutPromoInput.toUpperCase().trim();
    const matched = promos.find(p => p.code === codeClean && p.active);
    if (matched) {
      setAppliedPromo(matched);
      triggerNotification("Coupon active!", `${matched.discountPercent}% instant discount applied successfully!`, "promo");
    } else {
      alert("Invalid or stale promotional code. Try KHALAB15 for 15% discount!");
      setAppliedPromo(null);
    }
  };

  // Submit dynamic review in real-time
  const handleSubmitReview = async (productId: string, name: string, rating: number, comment: string) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, customerName: name, rating, comment })
      });
      if (res.ok) {
        fetchAllData();
        const product = products.find(p => p.id === productId);
        triggerNotification("Feedback Cataloged", `Thank you ${name} for grading the premium ${product?.title || "clothing"}!`, "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Onboard users with quick simulated social accounts
  const handleSocialLoginSelect = (provider: 'Facebook' | 'Google') => {
    const mockUser = provider === 'Facebook' 
      ? { name: "Adnan Chowdhury", email: "adnan.premium@gmail.com", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" }
      : { name: "Sara Islam", email: "sara.khalab@outlook.com", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" };

    setSocialUser(mockUser);
    localStorage.setItem('khalab_user', JSON.stringify(mockUser));
    setIsSocialLoginOpen(false);
    triggerNotification("Onboard success!", `Welcome ${mockUser.name}. Checkout forms populated with secure single-click.`, "success");
  };

  const handleLogout = () => {
    setSocialUser(null);
    localStorage.removeItem('khalab_user');
    triggerNotification("Logged out", "Social profile credentials cleared from browser session.");
  };

  const handlePhoneLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      alert("Please supply a valid phone number.");
      return;
    }
    
    if (loginMode === 'signin') {
      triggerNotification("Connecting...", "Checking secure KHALAB Firebase directory...", "info");
      try {
        const profile = await getUserProfile(loginPhone.trim());
        if (profile) {
          const loggedUser = {
            name: profile.name,
            email: profile.phone + "@khalab.com",
            phone: profile.phone,
            address: profile.address || "Dhaka, Bangladesh",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
          };
          setSocialUser(loggedUser);
          localStorage.setItem('khalab_user', JSON.stringify(loggedUser));
          setIsSocialLoginOpen(false);
          setLoginPhone('');
          
          // Fetch historical orders from Firebase for this phone !
          const firebaseOrders = await getOrdersByPhoneFromFirebase(profile.phone);
          if (firebaseOrders && firebaseOrders.length > 0) {
            // Merge firebase orders into the current orders list if they aren't already there!
            setOrders(prev => {
              const merged = [...prev];
              firebaseOrders.forEach(fo => {
                if (!merged.some(o => o.id === fo.id)) {
                  merged.unshift(fo);
                }
              });
              return merged;
            });
          }
          
          triggerNotification("Welcome back!", `Signed in as ${profile.name}. Order history loaded!`, "success");
        } else {
          alert("No existing customer profile was found with this phone number. Place your 1st order to auto-register, or toggle register mode!");
        }
      } catch (err) {
        console.error(err);
        alert("Could not access Firebase server registry.");
      }
    } else {
      if (!loginName.trim()) {
        alert("Please provide your name for registration.");
        return;
      }
      triggerNotification("Registering...", "Creating new profile in KHALAB Firebase directory...", "info");
      try {
        const profile = await syncUserProfile(loginPhone.trim(), loginName.trim(), "Dhaka, Bangladesh");
        if (profile) {
          const loggedUser = {
            name: profile.name,
            email: profile.phone + "@khalab.com",
            phone: profile.phone,
            address: profile.address || "Dhaka, Bangladesh",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
          };
          setSocialUser(loggedUser);
          localStorage.setItem('khalab_user', JSON.stringify(loggedUser));
          setIsSocialLoginOpen(false);
          setLoginPhone('');
          setLoginName('');
          triggerNotification("Profile Created!", `Account successfully registered for ${profile.name}!`, "success");
        }
      } catch (err) {
        console.error(err);
        alert("Could not create Firebase server registry profile.");
      }
    }
  };

  // Place custom checkout order with anti-fraud scanner
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutAddress.trim()) {
      alert("Please provide valid Delivery Name, Phone and Street Address.");
      return;
    }

    // Require transaction ID if using digital mobile money gateways
    if (checkoutPaymentMethod !== 'COD' && !checkoutTransId.trim()) {
      alert(`Please supply your Transaction ID for validating your secure ${checkoutPaymentMethod} transfer.`);
      return;
    }

    // Map checkout order payload
    const orderPayload = {
      items: cart.map(it => ({
        productId: it.product.id,
        title: it.product.title,
        price: it.product.price,
        image: it.product.image,
        quantity: it.quantity,
        selectedSize: it.size
      })),
      customerName: checkoutName,
      customerPhone: checkoutPhone,
      customerAddress: checkoutAddress,
      paymentMethod: checkoutPaymentMethod,
      transactionId: checkoutTransId || '',
      promoApplied: appliedPromo ? appliedPromo.code : '',
      discountAmount: discountValue,
      totalAmount: cartTotal,
      notes: checkoutNotes
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutSuccessOrder(data.order);
        setCart([]); // Clear shopping bag
        setAppliedPromo(null);
        setCheckoutPromoInput('');
        setCheckoutTransId('');
        fetchAllData(); // Refresh stock immediately in real-time!
        
        // Auto sign up/in Firebase integration after placing first order by their number
        try {
          await syncUserProfile(checkoutPhone.trim(), checkoutName.trim(), checkoutAddress.trim());
          await saveOrderToFirebase({
            id: data.order.id,
            customerPhone: checkoutPhone.trim(),
            customerName: checkoutName.trim(),
            customerAddress: checkoutAddress.trim(),
            paymentMethod: checkoutPaymentMethod,
            paymentStatus: data.order.paymentStatus || 'Pending',
            deliveryStatus: data.order.deliveryStatus || 'Pending',
            totalAmount: Number(data.order.totalAmount),
            discountAmount: Number(data.order.discountAmount || 0),
            items: orderPayload.items,
            createdAt: data.order.createdAt
          });

          const loggedUser = {
            name: checkoutName.trim(),
            email: checkoutPhone.trim() + "@khalab.com",
            phone: checkoutPhone.trim(),
            address: checkoutAddress.trim(),
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
          };
          setSocialUser(loggedUser);
          localStorage.setItem('khalab_user', JSON.stringify(loggedUser));
          triggerNotification("Auto-Registered Account!", `Your profile is linked to ${checkoutPhone.trim()}. Saved details in secure Firebase space.`, "success");
        } catch (fbErr) {
          console.error("Firebase sync exception: ", fbErr);
        }

        triggerNotification(
          "Order Registered!", 
          `Registered ORD-${data.order.id}. Delivery dispatch assigned to South Keraniganj.`, 
          "success"
        );
      } else {
        alert(data.error || "Order failed due to real-time inventory validation.");
      }
    } catch (err) {
      console.error(err);
      alert("Network server error while submitting checkout.");
    }
  };

  // Track parcel order status
  const handleTrackParcel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackingNumberInput.trim().toUpperCase();
    const found = orders.find(o => o.id === cleanId || (o.trackingNumber && o.trackingNumber.toUpperCase() === cleanId));
    if (found) {
      setTrackedOrder(found);
    } else {
      alert("Tracking record not found on KHALAB logistics database. Check your order receipt.");
      setTrackedOrder(null);
    }
  };

  // Administrator Login Validation
  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === '1234' && adminPass === '1234') {
      setIsAdminLoginOpen(false);
      setIsAdminPanelOpen(true);
      setAdminUser('');
      setAdminPass('');
      triggerNotification("Admin Authorized", "Welcome back controller. Secure credentials matched successfully.", "success");
    } else {
      alert("Access Denied. Pin or Key is invalid.");
    }
  };

  // Admin Dashboard API actions with double-write Firebase Firestore synchronization
  const handleUpdateConfig = async (newConfig: Partial<SiteConfig>) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      // Save to standard express backend
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      // Synchronize in Firestore globally
      await saveSiteConfigToFirebase(updatedConfig);
      
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (pPayload: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pPayload)
      });
      if (res.ok) {
        const createdProduct = await res.json();
        // Keep in Firestore
        await saveProductToFirebase(createdProduct);
        fetchAllData();
        triggerNotification("Stock catalog extended", pPayload.title + " introduced into physical collection.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (id: string, pPayload: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pPayload)
      });
      if (res.ok) {
        const bodyData = await res.json();
        if (bodyData.product) {
          // Keep in Firestore
          await saveProductToFirebase(bodyData.product);
        }
        fetchAllData();
        triggerNotification("Specifications synchronized", pPayload.title + " database values edited.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      // Remove from Firestore
      await deleteProductFromFirebase(id);
      if (res.ok) {
        fetchAllData();
        triggerNotification("Item catalog erased", "Stock unit deleted from live inventory.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCatalog = async (cPayload: { name: string; slug: string }) => {
    try {
      const res = await fetch('/api/catalogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cPayload)
      });
      if (res.ok) {
        const createdCatalog = await res.json();
        // Keep in Firestore
        await saveCatalogToFirebase(createdCatalog);
        fetchAllData();
        triggerNotification("Section directory mapped", `Catalog /${cPayload.slug} is now live.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCatalog = async (id: string) => {
    try {
      const res = await fetch(`/api/catalogs/${id}`, { method: 'DELETE' });
      // Remove from Firestore
      await deleteCatalogFromFirebase(id);
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      // Update in Firestore
      const targetOrder = orders.find(o => o.id === id);
      if (targetOrder) {
        const synchronizedOrder = { ...targetOrder, ...updates };
        await saveOrderToFirebase(synchronizedOrder);
      }

      if (res.ok) {
        fetchAllData();
        triggerNotification("Order Log Dispatch", `State of purchase ${id} updated to ${updates.deliveryStatus || 'altered'}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFakeCustomer = async (fcPayload: { phone: string; name: string; notes?: string }) => {
    try {
      const res = await fetch('/api/fake-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fcPayload)
      });
      if (res.ok) {
        const createdFc = await res.json();
        // Link to Firestore
        await saveFakeCustomerToFirebase(createdFc);
        fetchAllData();
        triggerNotification("Fraud record created", `Phone blocklisted: ${fcPayload.phone}`, "info");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFakeCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/fake-customers/${id}`, { method: 'DELETE' });
      // Remove from Firestore
      await deleteFakeCustomerFromFirebase(id);
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPromo = async (prPayload: { code: string; discountPercent: number; active: boolean }) => {
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prPayload)
      });
      if (res.ok) {
        const createdPromo = await res.json();
        // Save to Firestore
        await savePromoToFirebase(createdPromo);
        fetchAllData();
        triggerNotification("New discount launched", `Coupon ${prPayload.code} (${prPayload.discountPercent}%) active!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      const res = await fetch(`/api/promos/${id}`, { method: 'DELETE' });
      // Remove from Firestore
      await deletePromoFromFirebase(id);
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter and sort computation
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return 0; // Default ordering
  });

  // Calculate recommendation lists based on browsing history
  // If user has history, recommend items in same category that are not currently the active item and have stock
  const recommendedProducts = (() => {
    if (browsingHistory.length === 0) {
      // Fallback with featured items
      return products.slice(0, 4);
    }
    const lastViewedId = browsingHistory[0];
    const lastViewedProduct = products.find(p => p.id === lastViewedId);
    if (!lastViewedProduct) return products.slice(0, 4);

    return products
      .filter(p => p.id !== lastViewedId && p.category === lastViewedProduct.category && p.stock > 0)
      .slice(0, 4);
  })();

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* 1. TOP STATUS / PROMO TICKER BAR */}
      <div className="bg-gray-900 text-white text-xs py-2 px-4 flex flex-col sm:flex-row justify-between items-center gap-1.5 z-30 font-mono tracking-wide relative">
        <div className="flex items-center gap-1.5">
          <span className="bg-[var(--primary)] text-black px-1.5 py-0.5 rounded font-bold uppercase text-[9px] font-sans">PROMO CODE ACTIVE</span>
          <span className="text-[11px] text-gray-300">Use coupon <strong className="text-white bg-white/20 px-1 rounded">KHALAB15</strong> at checkout for sitewide 15% discount limit!</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-gray-400 hidden md:inline">🕒 Live Inventory Syncing </span>
          <a href={config.facebookPage} target="_blank" rel="noreferrer" className="hover:text-[var(--primary)] flex items-center gap-1">
            <Facebook className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">KHALAB FB</span>
          </a>
          <button 
            id="admin-dashboard-trigger"
            onClick={() => setIsAdminLoginOpen(true)}
            className="text-[var(--primary)] font-bold flex items-center gap-1 hover:underline cursor-pointer bg-transparent"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin Control Panel (1234)</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-25 py-3.5 px-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo or Name Customizer */}
          <div className="flex items-center gap-2">
            {config.websiteLogoUrl ? (
              <img 
                src={config.websiteLogoUrl} 
                alt={config.brandName} 
                referrerPolicy="no-referrer"
                className="h-10 object-contain"
              />
            ) : (
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-black tracking-tighter text-gray-900 flex items-center gap-1">
                  {config.brandName || "KHALAB"}
                  <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full"></span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400 font-bold leading-none">
                  {config.tagline || "Make your self premium."}
                </span>
              </div>
            )}
          </div>

          {/* Search bar inside header */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search premium Traditional Panjabi, Polos, Linen Shirts, Chinos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent text-gray-800"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>

          {/* Header Widgets */}
          <div className="flex items-center gap-3.5">
            {/* Track Order Trigger */}
            <button
              id="track-order-header-btn"
              onClick={() => {
                setTrackedOrder(null);
                setTrackingNumberInput('');
                setIsTrackingOpen(true);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-full text-xs font-semibold tracking-wider flex items-center gap-1 transition-all cursor-pointer"
              title="Track Parcel Delivery"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">Track Express Package</span>
            </button>

            {/* User Onboarding On-Click Display */}
            {socialUser ? (
              <div className="flex items-center gap-2 bg-gray-50 border p-1 rounded-full pr-3">
                <img 
                  src={socialUser.avatar} 
                  alt="" 
                  className="w-6 h-6 rounded-full"
                />
                <div className="text-left leading-none">
                  <span className="text-[10px] text-gray-400 block">Logged In</span>
                  <strong className="text-[11px] font-sans text-gray-800">{socialUser.name.split(' ')[0]}</strong>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] text-red-500 font-bold ml-1 hover:underline cursor-pointer bg-transparent border-none"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="social-login-trigger"
                onClick={() => setIsSocialLoginOpen(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Onboard Login</span>
              </button>
            )}

            {/* Shopping Bag Button with real count */}
            <button
              id="shopping-cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="bg-gray-900 text-white p-2.5 rounded-full relative cursor-pointer hover:bg-[var(--primary)] hover:text-black transition-colors"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. FLUID CATEGORY NAVIGATION BAR */}
      <nav className="bg-gray-50 border-b border-gray-100 overflow-x-auto py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex gap-1.5 justify-start md:justify-center items-center no-scrollbar">
          <button
            id="cat-tab-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all uppercase tracking-wider ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
            }`}
          >
            All Collections
          </button>
          
          {catalogs.map((cat) => (
            <button
              key={cat.id}
              id={`cat-tab-${cat.slug}`}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all uppercase tracking-wider ${
                selectedCategory === cat.slug
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* 4. REAL-TIME FLIGHT NOTIFICATION STACK */}
      <div id="push-notifications-stack" className="fixed top-20 right-4 z-40 space-y-2.5 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className="pointer-events-auto bg-gray-900 text-white/95 p-4 rounded-xl shadow-xl flex items-start gap-3 border border-white/20 animate-slide-in relative overflow-hidden"
          >
            {/* Visual background indicator */}
            <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              n.type === 'success' ? 'bg-emerald-400' : 
              n.type === 'promo' ? 'bg-amber-400' : 'bg-blue-400'
            }`}></span>
            
            <Bell className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="font-sans text-xs font-extrabold uppercase tracking-wide text-white">{n.title}</h4>
              <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="text-gray-400 hover:text-white cursor-pointer ml-auto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 5. HERO BANNER HEADER SECTOR */}
      <section className="relative overflow-hidden bg-gray-950 text-white py-16 sm:py-24 px-6">
        {/* Banner image backing */}
        <div className="absolute inset-0 z-0">
          <img
            src={config.heroImage}
            alt=""
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Banner words */}
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            <span className="bg-[var(--primary)] text-black font-mono text-xs font-bold tracking-widest px-3 py-1 rounded inline-block uppercase">
              {config.tagline || "MAKE YOUR SELF PREMIUM"}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase max-w-3xl">
              {config.heroTitle || "FALL IN LOVE WITH PREMIUM FIT"}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-sans max-w-2xl leading-relaxed">
              {config.heroSubtitle || "Handcrafted signature menswear tailoring from Dhaka's finest. Order now with secure bKash, Nagad, Rocket or Cash On Delivery (COD) services across Bangladesh."}
            </p>
            
            {/* Contact details callout on hero */}
            <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start pt-2 text-xs font-mono text-gray-200">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[var(--primary)]" /> {config.address}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[var(--primary)]" /> WhatsApp: {config.mobile}</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-start pt-4">
              <button
                id="hero-cta-scroll"
                onClick={() => {
                  const el = document.getElementById('clothing-grid-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  triggerNotification("Exploring wear", "Scroll initiated to core products catalogue.");
                }}
                className="bg-[var(--primary)] hover:bg-[#C5A030] text-black font-serif text-xs font-bold uppercase tracking-wider py-3.5 px-7 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>{config.heroCtaText || "Explore Premium Wear"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-fb-direct-btn"
                onClick={() => window.open(config.facebookPage, '_blank')}
                className="bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-medium py-3.5 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-white/10"
              >
                <Facebook className="w-4 h-4 text-blue-400 fill-current" />
                <span>Visit facebook page</span>
              </button>
            </div>
          </div>

          {/* Side Highlighting Promotion Box */}
          {config.promoBannerTitle && (
            <div className="lg:col-span-4 bg-white/5 border border-white/15 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
              <img
                src={config.promoBannerImage}
                alt=""
                className="w-full h-32 object-cover rounded-lg mb-4 opacity-80"
              />
              <h3 className="font-serif text-sm font-bold text-[var(--primary)] border-b border-white/10 pb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                {config.promoBannerTitle}
              </h3>
              <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
                {config.promoBannerSubtitle}
              </p>
              
              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-gray-400 pt-2 border-t border-white/5">
                <span>Free delivery on 2+ items</span>
                <span className="text-[var(--primary)] font-bold">LIMITED TIME</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. CLOTHING CORE CATALOG GRID */}
      <main id="clothing-grid-section" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 scroll-mt-20">
        
        {/* Dynamic header and sorting parameters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-serif text-2xl font-extrabold text-gray-900 tracking-tight">
                {selectedCategory === 'all' ? 'All Traditional Outfits' : catalogs.find(c => c.slug === selectedCategory)?.name}
              </h2>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {sortedProducts.length} Items Live
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans">Crafted stitch by stitch. Experience 100% genuine export quality fabrics.</p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
            
            {/* Search Input on Mobile header */}
            <div className="flex-1 relative md:hidden">
              <input
                type="text"
                placeholder="Search outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none text-gray-800"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
            </div>

            {/* Sorting mechanism */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-gray-700 cursor-pointer"
            >
              <option value="default">Default Catalog Ranking</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="featured">🔥 Recommended / Featured</option>
            </select>
          </div>
        </div>

        {/* Outer Grid loop */}
        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-gray-400 max-w-md mx-auto">
            <Info className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-sans font-medium text-gray-650">No clothing items match current filter criteria.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-xs text-[var(--primary)] font-bold uppercase tracking-wider block mx-auto mt-4 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              // compute product average ratings
              const prodReviews = reviews.filter(r => r.productId === product.id);
              const avg = prodReviews.length 
                ? prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length
                : 4.8;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={logProductView}
                  onAddToCart={handleAddToCart}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                  averageRating={avg}
                />
              );
            })}
          </div>
        )}

        {/* 7. PERSONALIZED RECOMMENDATION SECTION BASED ON CUSTOMER VIEWS */}
        <section className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8 mt-16">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="bg-[var(--primary)] text-black p-1.5 rounded-lg">
              <Flame className="w-4.5 h-4.5 text-red-600 animate-bounce" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-950 uppercase tracking-tight">KHALAB Custom Suggestions For You</h3>
              <p className="text-xs text-gray-500 font-sans">Our smart visual engine computes recommendations based on your unique browsing history.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.map((product) => (
              <div 
                key={`recom-${product.id}`}
                onClick={() => logProductView(product)}
                className="bg-white p-3 rounded-lg border border-gray-100 hover:border-[var(--primary)] transition-all flex items-center gap-3.5 cursor-pointer relative group"
              >
                <img
                  src={product.image}
                  alt=""
                  className="w-12 h-16 object-cover rounded bg-gray-50"
                />
                <div className="min-w-0">
                  <h4 className="font-serif text-xs font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors truncate">
                    {product.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 block font-mono">{product.category.replace("-", " ")}</span>
                  <div className="text-xs font-bold font-mono text-gray-700 mt-0.5">৳{product.price.toLocaleString()}</div>
                </div>
                <div className="absolute top-2 right-2 text-[9px] bg-amber-50 text-[var(--primary)] px-1 rounded font-mono font-bold">
                  Recommended
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 8. FOOTER WITH MAP, CONTACTS AND ADDRESS */}
      <footer className="bg-gray-950 text-gray-400 border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <span className="font-serif text-2xl font-bold tracking-tight text-white block">
              {config.brandName || "KHALAB"}
              <span className="text-[var(--primary)]">.</span>
            </span>
            <p className="text-xs font-sans leading-relaxed text-gray-400">
              High fidelity cotton and stitched traditional apparel for modern gentlemen. Crafted to perfection in South Keraniganj, Dhaka, Bangladesh.
            </p>
            <p className="text-sm text-white font-mono font-semibold">
              Tagline: {config.tagline || "Make your self premium."}
            </p>
          </div>

          {/* Custom store location address details */}
          <div className="space-y-3.5">
            <h4 className="font-serif text-sm font-semibold text-white tracking-widest uppercase">Physical Shop Address</h4>
            <div className="text-xs leading-relaxed space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <span>{config.address || "Shuvadda, South Keraniganj, Dhaka, Bangladesh."}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--primary)]" />
                <span>Mobile: {config.mobile || "+880171941040"}</span>
              </div>
            </div>
          </div>

          {/* Social Profiles Grid */}
          <div className="space-y-3.5">
            <h4 className="font-serif text-sm font-semibold text-white tracking-widest uppercase">Connect With KHALAB</h4>
            <p className="text-xs">Follow us on Facebook & Instagram for real-time drop launches of Panjabi & Polos.</p>
            <div className="flex gap-2 pt-1">
              <a 
                href={config.facebookPage} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-white/5 hover:bg-white/10 p-2.5 rounded-lg text-white transition-all flex items-center gap-1 text-xs font-mono"
              >
                <Facebook className="w-4 h-4 text-blue-500 fill-current" />
                <span>Facebook</span>
              </a>
              <a 
                href={config.instagramPage} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-white/5 hover:bg-white/10 p-2.5 rounded-lg text-white transition-all flex items-center gap-1 text-xs font-mono"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick links & Policies assurance badge */}
          <div className="space-y-3.5">
            <h4 className="font-serif text-sm font-semibold text-white tracking-widest uppercase">Guaranty Badges</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500" /> <span>Premium Export Quality Fabric</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> <span>Secure Mobile Wallet Transfers</span></div>
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-500" /> <span>Direct Home Delivery across BD</span></div>
            </div>
            <div className="pt-2">
              <span className="text-[10px] text-gray-500 font-mono block">STORE CLOCK: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800/80 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <span>&copy; {new Date().getFullYear()} {config.brandName || "KHALAB"} Fashion. All Rights Reserved.</span>
          <div className="flex gap-4">
            <span>Keraniganj Logistics Port</span>
            <span>COD Providers Verified</span>
          </div>
        </div>
      </footer>


      {/* --- ALL OVERLAY MODALS REGISTRY --- */}

      {/* A. PRODUCT SPECIAL SPECS VIEW MODAL */}
      {selectedProductForModal && (
        <ProductDetailsModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onAddToCart={(p, sz) => {
            handleAddToCart(p, sz);
            setSelectedProductForModal(null);
          }}
          isFavorite={favorites.includes(selectedProductForModal.id)}
          onToggleFavorite={handleToggleFavorite}
          reviews={reviews}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* B. SECURE SHOPPING CART & PAYMENT GATE OVERLAY DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-55 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Header bag */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-serif text-base font-bold">Your Premium Shopping Bag ({cart.length})</h3>
              </div>
              <button
                id="close-cart-btn"
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success screen once order is placed */}
            {checkoutSuccessOrder ? (
              <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-center items-center text-center space-y-4">
                <div className="bg-emerald-50 p-4 rounded-full text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900 uppercase">Checkout Confirmed!</h3>
                <p className="text-gray-600 text-sm max-w-sm">
                  Thank you for shopping at <strong>{config.brandName}</strong>. Your physical parcel booking ORD-<strong>{checkoutSuccessOrder.id}</strong> has been logged in real-time.
                </p>
                <div className="bg-gray-50 border p-4 rounded-xl text-left font-mono w-full text-xs space-y-1">
                  <div>Order ID: <strong className="text-gray-950 font-bold">{checkoutSuccessOrder.id}</strong></div>
                  <div>Delivery Address: <span>{checkoutSuccessOrder.customerAddress}</span></div>
                  <div>Phone Contact: <strong>{checkoutSuccessOrder.customerPhone}</strong></div>
                  <div>Total Payable: <strong className="text-gray-950">৳{checkoutSuccessOrder.totalAmount.toLocaleString()}</strong></div>
                  {checkoutSuccessOrder.isFakeCustomerReported ? (
                    <div className="bg-red-50 text-red-600 text-[10px] p-2 leading-tight rounded border border-red-200 mt-2">
                      ⚠️ Fraud Warning Flagged: matched blocklisted record threat index. Our Keraniganj dispatch calling agent will verify manually before shipment release.
                    </div>
                  ) : (
                    <div className="text-emerald-600 font-bold text-[10px] mt-1 text-center">✓ 100% Genuine COD / Mobil Transfer Booking Approved</div>
                  )}
                </div>

                <div className="pt-4 w-full">
                  <button
                    id="order-success-reset-btn"
                    onClick={() => {
                      setCheckoutSuccessOrder(null);
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Return to Boutique
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Product rows list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 border-b">
                  {cart.length === 0 ? (
                    <div className="h-44 flex flex-col justify-center items-center text-center text-gray-400">
                      <ShoppingBag className="w-8 h-8 mb-2 text-gray-300" />
                      <p className="text-xs">Your shopping bag is currently empty.</p>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs text-[var(--primary)] font-bold uppercase mt-2 hover:underline cursor-pointer"
                      >
                        Start Exploring Wear
                      </button>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex gap-3 flex-row relative">
                        <img
                          src={item.product.image}
                          alt=""
                          className="w-12 h-16 object-cover rounded bg-white border"
                        />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-serif text-xs font-bold text-gray-950 truncate">{item.product.title}</h4>
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5">SIZE: {item.size} • CATEGORY: {item.product.category}</span>
                          <div className="text-xs font-bold text-gray-800 font-mono mt-1">
                            ৳{item.product.price} <span className="text-gray-400 font-normal">x {item.quantity}</span>
                          </div>
                        </div>

                        {/* Quantity management buttons */}
                        <div className="flex flex-col justify-between items-end">
                          <button
                            id={`remove-item-${idx}`}
                            onClick={() => {
                              setCart(prev => prev.filter((_, i) => i !== idx));
                              triggerNotification("Removed Item", `"${item.product.title}" deleted from bag.`);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-1.5 rounded cursor-pointer border"
                            title="Remove completely"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Stock status validation label */}
                          {item.product.stock <= item.quantity && (
                            <span className="text-[8px] bg-amber-50 text-amber-700 font-mono font-bold px-1 rounded">
                              Max Stock
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Submittable Secure Checkout parameters */}
                {cart.length > 0 && (
                  <form onSubmit={handlePlaceOrder} className="p-4 bg-gray-50/50 border-t space-y-4 overflow-y-auto max-h-[55vh] text-xs">
                    
                    {/* User info */}
                    <div>
                      <h4 className="font-serif text-xs font-bold text-gray-900 border-b pb-1 mb-2 tracking-wider">
                        1. SHIPPING LOGISTICS DIRECTIONS
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Shakib Al Hasan"
                            value={checkoutName}
                            onChange={(e) => setCheckoutName(e.target.value)}
                            className="bg-white w-full border rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Active Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +880171XXXXXXX"
                            value={checkoutPhone}
                            onChange={(e) => setCheckoutPhone(e.target.value)}
                            className="bg-white w-full border rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono text-[11px]"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Home Delivery Street Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. House 45, Road 12, Shuvadda South Keraniganj, Dhaka"
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          className="bg-white w-full border rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none text-[11px]"
                        />
                      </div>
                      <div className="mt-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Custom Order/Size Remarks (Optional)</label>
                        <input
                          type="text"
                          placeholder="Provide custom remarks e.g. Call before delivery"
                          value={checkoutNotes}
                          onChange={(e) => setCheckoutNotes(e.target.value)}
                          className="bg-white w-full border rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Promo coupon input */}
                    <div className="bg-white p-3 rounded-xl border">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">PROMO COUPON CODE</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="KHALAB15 or custom coupon"
                          value={checkoutPromoInput}
                          onChange={(e) => setCheckoutPromoInput(e.target.value)}
                          className="w-full bg-white border rounded-lg py-1.5 px-3 focus:outline-none uppercase font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromoCode}
                          className="bg-gray-900 text-white px-3 rounded-lg hover:bg-[var(--primary)] hover:text-black font-semibold text-[11px] uppercase transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Secure payment method selector */}
                    <div>
                      <h4 className="font-serif text-xs font-bold text-gray-900 border-b pb-1 mb-2 tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>2. SECURE PAYMENT CHANNEL SELECTOR</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
                        Choose any secure Bangladeshi checkout operator. Verification coordinates will be validated on receipt.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 font-mono text-[10px]">
                        {[
                          { id: 'COD', label: '🚚 COD (Cash/Receive)', desc: 'Inspect outfit' },
                          { id: 'bKash', label: '💳 bKash wallet', desc: 'Money check' },
                          { id: 'Nagad', label: '💳 Nagad wallet', desc: 'Secure transfer' },
                          { id: 'Rocket', label: '💳 Rocket DBBL', desc: 'Fast deposit' },
                          { id: 'Credit Card', label: '💳 Credit Card', desc: 'Visa/Master' }
                        ].map((method) => (
                          <div 
                            key={method.id}
                            onClick={() => setCheckoutPaymentMethod(method.id as any)}
                            className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-center min-h-[50px] ${
                              checkoutPaymentMethod === method.id
                                ? 'border-[var(--primary)] bg-amber-50/50 font-bold'
                                : 'border-gray-200 hover:border-gray-400 bg-white'
                            }`}
                          >
                            <span className="block text-[11px] font-sans truncate">{method.label}</span>
                            <span className="text-[8px] text-gray-400">{method.desc}</span>
                          </div>
                        ))}
                      </div>

                      {/* Display Mobile Money Send Instructions if chosen */}
                      {checkoutPaymentMethod !== 'COD' && (
                        <div className="mt-3 bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl space-y-2 text-[11px] font-sans text-amber-900">
                          <p className="font-semibold text-xs text-amber-950 flex items-center gap-1">
                            <span>How to complete {checkoutPaymentMethod} transfer:</span>
                          </p>
                          <ol className="list-decimal list-inside space-y-1 font-sans text-[11.5px] leading-relaxed">
                            <li>Open your {checkoutPaymentMethod} app or dial USSD system.</li>
                            <li>Select <strong>Send Money</strong> to merchant address: <strong className="font-mono bg-white/80 p-0.5 rounded">{config.mobile}</strong>.</li>
                            <li>Input secure amount: <strong>৳{cartTotal.toLocaleString()}</strong>.</li>
                            <li>Copy and enter the resulting Transaction ID below to submit.</li>
                          </ol>
                          <div className="pt-1">
                            <label className="text-[9px] font-bold text-gray-600 block mb-0.5">PASTE {checkoutPaymentMethod.toUpperCase()} TRANSACTION ID *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. BKASH_8X091BC or similar"
                              value={checkoutTransId}
                              onChange={(e) => setCheckoutTransId(e.target.value)}
                              className="bg-white w-full border rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono text-xs text-gray-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-gray-100 p-4 rounded-xl font-mono text-[11px]">
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span>Items subtotal</span>
                        <span>৳{cartSubtotal.toLocaleString()}</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-emerald-600 mb-1 font-sans">
                          <span className="flex items-center gap-0.5"><Ticket className="w-3.5 h-3.5" /> Coupon discount ({appliedPromo.discountPercent}%)</span>
                          <span>-৳{discountValue.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span>Delivery to South Keraniganj/Dhaka</span>
                        <span className="text-emerald-600 font-bold uppercase">⚡ FREE INCLUDED</span>
                      </div>
                      <div className="flex justify-between text-gray-900 font-bold text-sm border-t border-gray-300 pt-2 mt-2">
                        <span>ESTIMATED TOTAL TO PAY</span>
                        <span>৳{cartTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Fraud Prevention Disclaimer */}
                    <p className="text-[10px] text-gray-400 italic text-center">
                      ✓ Real-time inventory check is performed. Stock reserved for 1.5 hours pending review.
                    </p>

                    <button
                      type="submit"
                      className="w-full bg-gray-950 hover:bg-[var(--primary)] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      SECURELY PLACE ORDER NOW
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* C. TRACK ORDER PROCESS MODAL */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-xs">
            
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-serif text-sm font-bold uppercase">KHALAB Express Package Tracking</h3>
              <button
                id="close-tracking-modal"
                onClick={() => setIsTrackingOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <form onSubmit={handleTrackParcel} className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase font-mono">
                  Enter order ID to find package location status:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-98214"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    className="w-full bg-gray-50 border rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono uppercase text-gray-800"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Track
                  </button>
                </div>
              </form>

              {trackedOrder ? (
                <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                  <div className="font-mono text-[11px] text-gray-400 flex justify-between border-b pb-2">
                    <span>Order Profile: #{trackedOrder.id}</span>
                    <span>Placed on: {new Date(trackedOrder.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Visual custom tracking steps */}
                    {[
                      { status: 'Pending', heading: '🕒 Booking Registered', desc: 'Inventory verified and stock reserved.' },
                      { status: 'Confirmed', heading: '✓ Packaging Completed', desc: 'Outfit has passed quality scan and is packed.' },
                      { status: 'Shipped', heading: '🚚 Dispatched Out', desc: 'Parcel sorted from South Keraniganj to delivery agent.' },
                      { status: 'Delivered', heading: '🎉 Parcel Delivered', desc: 'Outfit delivered and hand-verified.' }
                    ].map((step, stepIdx, stepsArr) => {
                      // Figure out active layout
                      const statusHierarchy = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
                      const currentTrackIdx = statusHierarchy.indexOf(trackedOrder.deliveryStatus);
                      const myIdx = statusHierarchy.indexOf(step.status);
                      
                      const isCompleted = myIdx <= currentTrackIdx && trackedOrder.deliveryStatus !== 'Canceled';
                      const isActive = myIdx === currentTrackIdx && trackedOrder.deliveryStatus !== 'Canceled';

                      return (
                        <div key={stepIdx} className="flex gap-3 relative">
                          {stepIdx < stepsArr.length - 1 && (
                            <span className={`absolute left-2.5 top-5 w-0.5 h-10 ${
                              myIdx < currentTrackIdx ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}></span>
                          )}

                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isActive ? 'bg-[var(--primary)] text-black font-extrabold animate-pulse shadow-sm' : 
                            isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {isCompleted ? "✓" : stepIdx + 1}
                          </span>

                          <div className="text-left font-sans">
                            <h4 className={`text-xs font-bold leading-tight ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.heading}
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Canceled block */}
                    {trackedOrder.deliveryStatus === 'Canceled' && (
                      <div className="bg-red-50 text-red-700 p-2 text-center rounded-lg font-bold border border-red-200">
                        ⚠️ Shipment has been CANCELLED. Outfits have been returned to inventory stock.
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-3 rounded border text-[11px] leading-relaxed pt-3 space-y-1">
                    <div>Receiver: <strong>{trackedOrder.customerName}</strong></div>
                    <div>Address: <span>{trackedOrder.customerAddress}</span></div>
                    {trackedOrder.trackingNumber && (
                      <div className="font-mono text-xs text-[var(--accent)] font-bold">Courier tracking #: {trackedOrder.trackingNumber}</div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 font-mono">
                  Input ORD-98214 to see a live package sorting track demo!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* D. SOCIAL LOGIN CHIP */}
      {isSocialLoginOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden text-xs">
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-serif text-sm font-bold uppercase text-[11px] tracking-wider">Fast Customer Onboarding</h3>
              <button
                onClick={() => setIsSocialLoginOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                Sign in to automatically sync shipping addresses and track your live cash-on-delivery orders from KHALAB's Firebase directory.
              </p>

              {/* Mobile Phone Authentication Form */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex justify-around border-b pb-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setLoginMode('signin')}
                    className={`pb-1 px-4 font-bold text-xs cursor-pointer transition-all ${
                      loginMode === 'signin' 
                        ? 'border-b-2 border-[var(--primary)] text-gray-900 font-black' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Mobile Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode('signup')}
                    className={`pb-1 px-4 font-bold text-xs cursor-pointer transition-all ${
                      loginMode === 'signup' 
                        ? 'border-b-2 border-[var(--primary)] text-gray-900 font-black' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Quick Register
                  </button>
                </div>

                <form onSubmit={handlePhoneLoginSubmit} className="space-y-3">
                  {loginMode === 'signup' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Ahmed"
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[var(--primary)] text-xs text-gray-800"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0171941040"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono text-xs text-gray-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-gray-800 py-2 rounded-lg font-bold transition-colors text-[11px] uppercase tracking-wider cursor-pointer"
                  >
                    {loginMode === 'signin' ? "Verify & Retrieve History" : "Register Profile"}
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 font-mono">
                <span className="w-full border-b border-gray-100"></span>
                <span className="px-2 uppercase whitespace-nowrap">Or Social Login</span>
                <span className="w-full border-b border-gray-100"></span>
              </div>

              <button
                id="social-login-fb"
                onClick={() => handleSocialLoginSelect('Facebook')}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold cursor-pointer transition-colors text-[11px] uppercase tracking-wider shadow-sm"
              >
                <Facebook className="w-4 h-4 fill-current" />
                <span>Onboard With Facebook</span>
              </button>

              <button
                id="social-login-google"
                onClick={() => handleSocialLoginSelect('Google')}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold border cursor-pointer transition-colors text-[11px] uppercase tracking-wider shadow-xs"
              >
                <span className="text-red-500 text-sm font-black">G</span>
                <span>Onboard With Google</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E. ADMINISTRATOR LOGIN DIALOG */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden text-xs">
            
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center border-b border-gray-800">
              <h3 className="font-serif text-sm font-bold">Sign In to KHALAB HQ</h3>
              <button
                onClick={() => setIsAdminLoginOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSignIn} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">HQ Security User PIN *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1234"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full bg-gray-50 border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">HQ System Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-gray-50 border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono text-xs text-gray-900"
                />
              </div>

              <div className="bg-amber-50 rounded-lg p-2 text-[10px] text-amber-700 font-mono">
                ℹ️ Defaults: User: <strong>1234</strong> / Pass: <strong>1234</strong>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-lg transition-colors cursor-pointer"
              >
                Authenticate controller
              </button>
            </form>
          </div>
        </div>
      )}

      {/* F. ACTIVE FULL PORTAL MANAGEMENT PANEL OVERLAY */}
      {isAdminPanelOpen && (
        <AdminPanel
          config={config}
          onUpdateConfig={handleUpdateConfig}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          catalogs={catalogs}
          onAddCatalog={handleAddCatalog}
          onDeleteCatalog={handleDeleteCatalog}
          orders={orders}
          onUpdateOrder={handleUpdateOrder}
          fakeCustomers={fakeCustomers}
          onAddFakeCustomer={handleAddFakeCustomer}
          onDeleteFakeCustomer={handleDeleteFakeCustomer}
          promos={promos}
          onAddPromo={handleAddPromo}
          onDeletePromo={handleDeletePromo}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

    </div>
  );
}
