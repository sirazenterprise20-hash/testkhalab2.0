import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Edit2, Check, Settings, ShoppingBag, 
  Tag, Compass, PhoneCall, AlertTriangle, RefreshCw, Palette, 
  MapPin, Image, Video, Globe2, UserMinus, ToggleLeft, ToggleRight,Eye
} from 'lucide-react';
import { Product, Catalog, Order, Review, FakeCustomer, PromoCode, SiteConfig } from '../types';

interface AdminPanelProps {
  config: SiteConfig;
  onUpdateConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  products: Product[];
  onAddProduct: (p: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  catalogs: Catalog[];
  onAddCatalog: (c: { name: string; slug: string }) => Promise<void>;
  onDeleteCatalog: (id: string) => Promise<void>;
  orders: Order[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  fakeCustomers: FakeCustomer[];
  onAddFakeCustomer: (fc: { phone: string; name: string; notes?: string }) => Promise<void>;
  onDeleteFakeCustomer: (id: string) => Promise<void>;
  promos: PromoCode[];
  onAddPromo: (promo: { code: string; discountPercent: number; active: boolean }) => Promise<void>;
  onDeletePromo: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function AdminPanel({
  config,
  onUpdateConfig,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  catalogs,
  onAddCatalog,
  onDeleteCatalog,
  orders,
  onUpdateOrder,
  fakeCustomers,
  onAddFakeCustomer,
  onDeleteFakeCustomer,
  promos,
  onAddPromo,
  onDeletePromo,
  onClose
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'catalogs' | 'orders' | 'promos' | 'fake' | 'branding' | 'theme'>('orders');

  // Product Edit/Add form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Temp state for product
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pOriginalPrice, setPOriginalPrice] = useState(0);
  const [pImage, setPImage] = useState('');
  const [pVideo, setPVideo] = useState('');
  const [pSizes, setPSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [pStock, setPStock] = useState(10);
  const [pCategory, setPCategory] = useState('');
  const [pFeatured, setPFeatured] = useState(false);

  // New Catalog form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // New Promo form state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState(10);

  // New Fake Customer form state
  const [newFakeName, setNewFakeName] = useState('');
  const [newFakePhone, setNewFakePhone] = useState('');
  const [newFakeNotes, setNewFakeNotes] = useState('');

  // Branding config state
  const [brandName, setBrandName] = useState(config.brandName);
  const [tagline, setTagline] = useState(config.tagline);
  const [address, setAddress] = useState(config.address);
  const [mobile, setMobile] = useState(config.mobile);
  const [facebookPage, setFacebookPage] = useState(config.facebookPage);
  const [instagramPage, setInstagramPage] = useState(config.instagramPage);
  const [websiteLogoUrl, setWebsiteLogoUrl] = useState(config.websiteLogoUrl);
  // Banners state
  const [heroTitle, setHeroTitle] = useState(config.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(config.heroSubtitle);
  const [heroImage, setHeroImage] = useState(config.heroImage);
  const [heroVideoUrl, setHeroVideoUrl] = useState(config.heroVideoUrl || '');
  const [heroCtaText, setHeroCtaText] = useState(config.heroCtaText || 'Shop Now');
  const [promoBannerTitle, setPromoBannerTitle] = useState(config.promoBannerTitle || '');
  const [promoBannerSubtitle, setPromoBannerSubtitle] = useState(config.promoBannerSubtitle || '');
  const [promoBannerImage, setPromoBannerImage] = useState(config.promoBannerImage || '');

  // Theme configuration template loader
  const handleTemplateSelection = (templateName: SiteConfig['selectedTemplate']) => {
    let updates: Partial<SiteConfig> = { selectedTemplate: templateName };
    if (templateName === 'luxury') {
      updates.themePrimary = '#D4AF37'; // gold
      updates.themeSecondary = '#111111'; // black
      updates.themeBg = '#FCFCFD';
      updates.themeText = '#1A1A1A';
      updates.themeAccent = '#8B0000';
    } else if (templateName === 'emerald') {
      updates.themePrimary = '#059669'; // emerald
      updates.themeSecondary = '#0F172A'; // dark blue slate
      updates.themeBg = '#F8FAFC';
      updates.themeText = '#0F172A';
      updates.themeAccent = '#D97706';
    } else if (templateName === 'royal') {
      updates.themePrimary = '#2563EB'; // indigo/royal-blue
      updates.themeSecondary = '#1E293B';
      updates.themeBg = '#FFF';
      updates.themeText = '#1E293B';
      updates.themeAccent = '#EC4899';
    } else if (templateName === 'crimson') {
      updates.themePrimary = '#DC2626'; // crimson
      updates.themeSecondary = '#18181B';
      updates.themeBg = '#FAFAFA';
      updates.themeText = '#18181B';
      updates.themeAccent = '#4F46E5';
    } else if (templateName === 'minimalist') {
      updates.themePrimary = '#111111'; // pure charcoal black style
      updates.themeSecondary = '#6B7280';
      updates.themeBg = '#FFFFFF';
      updates.themeText = '#111111';
      updates.themeAccent = '#374151';
    }
    onUpdateConfig(updates);
  };

  // Function to save general branding settings
  const handleBrandingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateConfig({
      brandName,
      tagline,
      address,
      mobile,
      facebookPage,
      instagramPage,
      websiteLogoUrl,
      heroTitle,
      heroSubtitle,
      heroImage,
      heroVideoUrl,
      heroCtaText,
      promoBannerTitle,
      promoBannerSubtitle,
      promoBannerImage
    });
    alert("Branding parameters saved successfully!");
  };

  const openProductForm = (p: Product | null) => {
    if (p) {
      setEditingProduct(p);
      setPTitle(p.title);
      setPDesc(p.description);
      setPPrice(p.price);
      setPOriginalPrice(p.originalPrice);
      setPImage(p.image);
      setPVideo(p.videoUrl || '');
      setPSizes(p.sizes || []);
      setPStock(p.stock);
      setPCategory(p.category || (catalogs[0]?.slug || ""));
      setPFeatured(!!p.featured);
    } else {
      setEditingProduct(null);
      setPTitle('');
      setPDesc('');
      setPPrice(1500);
      setPOriginalPrice(1800);
      setPImage('');
      setPVideo('');
      setPSizes(['M', 'L', 'XL']);
      setPStock(15);
      setPCategory(catalogs[0]?.slug || "premium-panjabi");
      setPFeatured(false);
    }
    setIsProductModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("Image should be under 15MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("Image should be under 15MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setWebsiteLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("Image should be under 15MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHeroImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("Image should be under 15MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPromoBannerImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pCategory) {
      alert("Please select or add a category first.");
      return;
    }
    const productPayload = {
      title: pTitle,
      description: pDesc,
      price: pPrice,
      originalPrice: pOriginalPrice,
      image: pImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
      videoUrl: pVideo,
      sizes: pSizes,
      stock: pStock,
      category: pCategory,
      featured: pFeatured
    };

    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productPayload);
    } else {
      await onAddProduct(productPayload);
    }
    setIsProductModalOpen(false);
  };

  const handleCatalogAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    await onAddCatalog({ name: newCatName, slug: newCatSlug });
    setNewCatName('');
    setNewCatSlug('');
  };

  const handlePromoAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoPercent) return;
    await onAddPromo({ code: newPromoCode, discountPercent: Number(newPromoPercent), active: true });
    setNewPromoCode('');
    setNewPromoPercent(10);
  };

  const handleFakeCustomerAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFakePhone || !newFakeName) return;
    await onAddFakeCustomer({ phone: newFakePhone, name: newFakeName, notes: newFakeNotes });
    setNewFakePhone('');
    setNewFakeName('');
    setNewFakeNotes('');
  };

  // Toggle fake customer report directly from order table
  const handleToggleReportFakeFromOrder = async (order: Order) => {
    if (order.isFakeCustomerReported) {
      // Find the fake entry and delete it, then set reported status to false
      const matched = fakeCustomers.find(f => f.phone.replace(/[^0-9]/g, "").includes(order.customerPhone.replace(/[^0-9]/g, "")));
      if (matched) {
        await onDeleteFakeCustomer(matched.id);
      }
      await onUpdateOrder(order.id, { isFakeCustomerReported: false });
    } else {
      // Add fake entry and set reported status on order
      await onAddFakeCustomer({ 
        phone: order.customerPhone, 
        name: order.customerName, 
        notes: "Marked as fake directly from Order " + order.id 
      });
      await onUpdateOrder(order.id, { isFakeCustomerReported: true });
    }
  };

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 md:p-6">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[95vh] md:h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--primary)] text-black p-2 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold">KHALAB Command Center</h1>
              <span className="text-[10px] font-mono tracking-wider text-gray-400">ADMIN CONTROL PANEL • ALL PARAMS MODIFIABLE IN REAL-TIME</span>
            </div>
          </div>
          <button
            id="close-admin-panel"
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Grid and Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left quick navigation rail */}
          <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 flex flex-col gap-1 overflow-y-auto">
            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 px-3 py-1 mb-2 block">MANAGEMENT SYSTEMS</span>
            
            <button
              id="admin-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`p-3 rounded-xl text-xs font-semibold cursor-pointer text-left flex items-center justify-between border transition-all ${
                activeTab === 'orders'
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 border-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[var(--primary)]" />
                <span>Orders Registry ({orders.length})</span>
              </div>
              <span className="bg-amber-500 text-[10px] text-black font-semibold px-2 py-0.5 rounded-full font-mono">
                {orders.filter(o => o.deliveryStatus === 'Pending').length} Pending
              </span>
            </button>

            <button
              id="admin-tab-products"
              onClick={() => setActiveTab('products')}
              className={`p-3 rounded-xl text-xs font-semibold cursor-pointer text-left flex items-center gap-2.5 border transition-all ${
                activeTab === 'products'
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 border-gray-100 text-gray-700'
              }`}
            >
              <Compass className="w-4 h-4 text-[var(--primary)]" />
              <span>Products Catalog ({products.length})</span>
            </button>

            <button
              id="admin-tab-catalogs"
              onClick={() => setActiveTab('catalogs')}
              className={`p-3 rounded-xl text-xs font-semibold cursor-pointer text-left flex items-center gap-2.5 border transition-all ${
                activeTab === 'catalogs'
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 border-gray-100 text-gray-700'
              }`}
            >
              <Tag className="w-4 h-4 text-[var(--primary)]" />
              <span>Catalogs/Categories ({catalogs.length})</span>
            </button>

            <button
              id="admin-tab-promos"
              onClick={() => setActiveTab('promos')}
              className={`p-3 rounded-xl text-xs font-semibold cursor-pointer text-left flex items-center gap-2.5 border transition-all ${
                activeTab === 'promos'
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 border-gray-100 text-gray-700'
              }`}
            >
              <Globe2 className="w-4 h-4 text-[var(--primary)]" />
              <span>Coupon Discounter ({promos.length})</span>
            </button>

            <button
              id="admin-tab-fake"
              onClick={() => setActiveTab('fake')}
              className={`p-3 rounded-xl text-xs font-semibold cursor-pointer text-left flex items-center gap-2.5 border transition-all ${
                activeTab === 'fake'
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 border-gray-100 text-gray-700'
              }`}
            >
              <UserMinus className="w-4 h-4 text-[var(--accent)]" />
              <span className="flex-1">Anti-Fraud Spammers ({fakeCustomers.length})</span>
            </button>

            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 px-3 py-1 mt-4 mb-2 block">SITE CONFIGURATION</span>

            <button
              id="admin-tab-branding"
              onClick={() => setActiveTab('branding')}
              className={`p-3 rounded-xl text-xs font-semibold cursor-pointer text-left flex items-center gap-2.5 border transition-all ${
                activeTab === 'branding'
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 border-gray-100 text-gray-700'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-[var(--primary)]" />
              <span>Identity, Socials & Hero Settings</span>
            </button>

            <button
              id="admin-tab-theme"
              onClick={() => setActiveTab('theme')}
              className={`p-3 rounded-xl text-xs font-semibold cursor-pointer text-left flex items-center gap-2.5 border transition-all ${
                activeTab === 'theme'
                  ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 border-gray-100 text-gray-700'
              }`}
            >
              <Palette className="w-4 h-4 text-[var(--primary)]" />
              <span>Site Themes & Custom Colors</span>
            </button>

            <div className="mt-auto bg-gray-900/5 p-3 rounded-xl border border-gray-200/20 text-center text-[10px] text-gray-500 font-mono flex flex-col gap-1">
              <span>STORE IDENTITY: <strong>{config.brandName || "KHALAB"}</strong></span>
              <span>DEV PLATFORM ENVIROMENT: <strong>DURABLE</strong></span>
            </div>
          </div>

          {/* Main dashboard content area */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* ORDERS REGISTRY TAB */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-gray-900">Registered Customer Orders</h2>
                    <p className="text-xs text-gray-500 font-sans">Toggle payment status, dispatch tracking, update delivery states, and report spammers here.</p>
                  </div>
                  <div className="flex gap-2 font-mono text-[11px] bg-gray-50 p-2 rounded-xl">
                    <span className="text-gray-500">Unprocessed Checkouts:</span>
                    <strong className="text-amber-600">{orders.filter(o => o.deliveryStatus === 'Pending').length}</strong>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-900 text-white font-mono uppercase tracking-wider text-[10px]">
                        <th className="p-3.5">ID / Date</th>
                        <th className="p-3.5">Customer & Contacts</th>
                        <th className="p-3.5">Items Ordered</th>
                        <th className="p-3.5">Value Breakdown</th>
                        <th className="p-3.5">Method & Payment</th>
                        <th className="p-3.5">Delivery State</th>
                        <th className="p-3.5">Tracking #</th>
                        <th className="p-3.5 text-center">Threat Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-400">
                            No custom checkout bookings registered on database yet.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => {
                          const isFake = order.isFakeCustomerReported;
                          return (
                            <tr key={order.id} className={`hover:bg-gray-50/80 transition-colors ${isFake ? 'bg-red-50/50' : ''}`}>
                              {/* ID AND DATE */}
                              <td className="p-3.5 font-mono">
                                <div className="font-bold text-gray-900">{order.id}</div>
                                <div className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                              </td>

                              {/* CUSTOMER DETAILS */}
                              <td className="p-3.5">
                                <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                                  {order.customerName}
                                  {isFake && (
                                    <span className="bg-red-500 text-white text-[9px] font-mono px-1 rounded font-bold animate-pulse">SPAMMING FRAUD THREAT</span>
                                  )}
                                </div>
                                <div className="text-gray-600 font-mono font-medium">{order.customerPhone}</div>
                                <div className="text-gray-400 text-[10px] line-clamp-1 max-w-[150px]" title={order.customerAddress}>
                                  {order.customerAddress}
                                </div>
                                {order.notes && (
                                  <div className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded inline-block mt-1 font-mono">
                                    ⚠️ {order.notes}
                                  </div>
                                )}
                              </td>

                              {/* ITEMS */}
                              <td className="p-3.5">
                                <div className="space-y-1 font-sans">
                                  {order.items.map((it, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-gray-700">
                                      <span className="bg-gray-100 text-gray-700 px-1 rounded text-[10px] font-mono font-bold">x{it.quantity}</span>
                                      <span className="font-medium line-clamp-1 max-w-[120px]">{it.title}</span>
                                      <span className="text-[10px] text-gray-400">({it.selectedSize})</span>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              {/* AMOUNT */}
                              <td className="p-3.5 font-mono">
                                <div className="font-bold text-gray-900">৳{order.totalAmount.toLocaleString()}</div>
                                {order.discountAmount > 0 && (
                                  <div className="text-[10px] text-emerald-600">
                                    -৳{order.discountAmount.toLocaleString()} ({order.promoApplied})
                                  </div>
                                )}
                              </td>

                              {/* METHOD & PAYMENT STATUS */}
                              <td className="p-3.5 font-sans">
                                <div className="font-mono text-[10px] font-bold text-gray-600 mb-1">{order.paymentMethod}</div>
                                <select
                                  value={order.paymentStatus}
                                  onChange={(e) => onUpdateOrder(order.id, { paymentStatus: e.target.value as any })}
                                  className={`p-1 text-[10px] font-bold rounded cursor-pointer leading-none ${
                                    order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 
                                    order.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  <option value="Pending">🕒 Pending</option>
                                  <option value="Paid">✅ Paid</option>
                                  <option value="Canceled">❌ Canceled</option>
                                </select>
                                {order.transactionId && (
                                  <div className="text-[8px] font-mono text-gray-400 mt-1">TxID: {order.transactionId}</div>
                                )}
                              </td>

                              {/* DELIVERY STATUS */}
                              <td className="p-3.5">
                                <select
                                  value={order.deliveryStatus}
                                  onChange={(e) => onUpdateOrder(order.id, { deliveryStatus: e.target.value as any })}
                                  className={`p-1.5 text-[11px] font-bold rounded cursor-pointer ${
                                    order.deliveryStatus === 'Delivered' ? 'bg-emerald-500 text-white' : 
                                    order.deliveryStatus === 'Shipped' ? 'bg-indigo-500 text-white' : 
                                    order.deliveryStatus === 'Confirmed' ? 'bg-cyan-500 text-white' : 
                                    order.deliveryStatus === 'Canceled' ? 'bg-gray-400 text-white' : 'bg-amber-500 text-black'
                                  }`}
                                >
                                  <option value="Pending">🕒 Pending Review</option>
                                  <option value="Confirmed">✅ Ready (Confirmed)</option>
                                  <option value="Shipped">🚚 Shipped Out</option>
                                  <option value="Delivered">🎉 Delivered</option>
                                  <option value="Canceled">❌ Canceled (Restock)</option>
                                </select>
                              </td>

                              {/* TRACKING NUMBER */}
                              <td className="p-3.5 font-mono">
                                <input
                                  type="text"
                                  placeholder="tracking-id"
                                  value={order.trackingNumber || ''}
                                  onChange={(e) => onUpdateOrder(order.id, { trackingNumber: e.target.value })}
                                  className="w-24 bg-white border border-gray-200 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                />
                              </td>

                              {/* THREAT FLAGGERS */}
                              <td className="p-3.5 text-center">
                                <button
                                  id={`threat-toggle-btn-${order.id}`}
                                  onClick={() => handleToggleReportFakeFromOrder(order)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wider flex items-center gap-1 mx-auto cursor-pointer border ${
                                    isFake 
                                      ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                                      : 'bg-white hover:bg-red-50 text-red-600 border-red-100 shadow-3xs'
                                  }`}
                                  title="Flag buyer as high fraud threat"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{isFake ? "FLAGGED" : "MARK FAKE"}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-gray-900">Active Inventory Manager</h2>
                    <p className="text-xs text-gray-500 font-sans">Configure photos, real-time stock, prices, clothing videos, sizes & product titles.</p>
                  </div>
                  <button
                    id="add-p-admin-btn"
                    onClick={() => openProductForm(null)}
                    className="bg-gray-950 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[var(--primary)] hover:text-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADD CLOTHING ITEM</span>
                  </button>
                </div>

                {/* Product List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 flex gap-4 hover:border-gray-300 transition-all">
                      <img
                        src={product.image}
                        alt=""
                        className="w-16 h-20 object-cover rounded-lg border bg-white"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] bg-gray-200 text-gray-700 font-mono px-2 py-0.5 rounded truncate uppercase">
                              {product.category}
                            </span>
                            {product.featured && (
                              <span className="text-[9px] bg-[var(--primary)] text-black font-semibold font-mono px-1.5 rounded uppercase">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-sm font-semibold text-gray-800 truncate mt-1">{product.title}</h3>
                          <div className="text-xs font-bold text-gray-600 mt-0.5 font-mono">
                            ৳{product.price}
                            {product.originalPrice > product.price && (
                              <span className="text-[10px] text-gray-400 line-through ml-1.5">৳{product.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex gap-1.5 mt-1">
                            {product.sizes.map((s) => (
                              <span key={s} className="text-[9px] bg-white border font-mono px-1 rounded">{s}</span>
                            ))}
                          </div>
                        </div>

                        {/* Real-time STOCK updates */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 mt-2">
                          <div className="text-[10px] font-mono">
                            <span>Stock: </span>
                            <strong className={product.stock <= 5 ? 'text-red-500 font-bold' : 'text-emerald-600'}>
                              {product.stock} Units
                            </strong>
                          </div>
                          {product.videoUrl && (
                            <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-100 font-mono px-1 rounded flex items-center gap-0.5">
                              <Video className="w-2.5 h-2.5" /> Video Enabled
                            </span>
                          )}
                          <div className="flex gap-1">
                            <button
                              id={`edit-p-btn-${product.id}`}
                              onClick={() => openProductForm(product)}
                              className="bg-white hover:bg-gray-200 text-gray-700 p-1.5 rounded-lg border text-[10px] cursor-pointer"
                              title="Edit product specs"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              id={`delete-p-btn-${product.id}`}
                              onClick={() => {
                                if(confirm(`Clean erase '${product.title}' from system?`)) {
                                  onDeleteProduct(product.id);
                                }
                              }}
                              className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 p-1.5 rounded-lg border border-red-100 text-[10px] cursor-pointer"
                              title="Erase item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATALOGS TAB */}
            {activeTab === 'catalogs' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-bold text-gray-900">Custom Catalog Categories</h2>
                  <p className="text-xs text-gray-500">Edit and add the categories displayed on website navigation headers to sort physical clothing.</p>
                </div>

                <form onSubmit={handleCatalogAdd} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-3 mb-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">CATEGORY DISPLAY NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Traditional Panjabi"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div className="w-48">
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">SLUG (URL PREFIX)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. traditional-panjabi"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all tracking-wider cursor-pointer"
                    >
                      Create
                    </button>
                  </div>
                </form>

                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-xs">
                  <div className="bg-gray-900 text-white p-3 font-mono text-[10px] uppercase font-bold tracking-wider flex justify-between">
                    <span>Category Slug Identifier</span>
                    <span>Control Action</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {catalogs.map((cat) => (
                      <div key={cat.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <strong className="text-gray-800 text-sm font-serif">{cat.name}</strong>
                          <span className="font-mono text-gray-400 block text-[10px]">Slug ID: /{cat.slug}</span>
                        </div>
                        <button
                          id={`delete-c-btn-${cat.id}`}
                          onClick={() => {
                            if (confirm(`Erase catalog category '${cat.name}'? Clothing products tied to this catalog won't be deleted but will loose direct catalog association.`)) {
                              onDeleteCatalog(cat.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 px-3 py-1.5 rounded-lg border border-red-100 text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          Erase Catalog
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === 'promos' && (
              <div className="max-w-xl">
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-bold text-gray-900">Direct Coupon Discounter</h2>
                  <p className="text-xs text-gray-500">Create promotional codes for instant checkout discounts that buyers can input globally.</p>
                </div>

                <form onSubmit={handlePromoAdd} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 mb-6 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">COUPON CODE (UPPERCASE)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUMMER15"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[var(--primary)] uppercase font-mono outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">DISCOUNT %</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={99}
                      value={newPromoPercent}
                      onChange={(e) => setNewPromoPercent(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all tracking-wider cursor-pointer"
                  >
                    ADD CODE
                  </button>
                </form>

                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-900 text-white font-mono text-[10px]">
                      <tr>
                        <th className="p-3">COUPON</th>
                        <th className="p-3">DISCOUNT RATE</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {promos.map((promo) => (
                        <tr key={promo.id}>
                          <td className="p-3 font-bold text-gray-800">{promo.code}</td>
                          <td className="p-3 text-emerald-600 font-bold">{promo.discountPercent}% OFF</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                              Active
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              id={`delete-prm-btn-${promo.id}`}
                              onClick={() => onDeletePromo(promo.id)}
                              className="text-red-500 hover:text-red-700 font-semibold text-[10px] cursor-pointer"
                            >
                              Eraser
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FRAUD CONTROL TAB */}
            {activeTab === 'fake' && (
              <div>
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-bold text-gray-900">Anti-Fraud Spammers & Fake Customers Guard</h2>
                  <p className="text-xs text-gray-500">Add phone numbers or buyer names known for spamming COD orders. The checkout engine automatically flags any incoming match instantly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <form onSubmit={handleFakeCustomerAdd} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-3.5 h-fit">
                    <h3 className="font-serif font-bold text-sm text-gray-900 border-b pb-2 mb-1">Add Fraud Record Player</h3>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">SPAMMER PHONE (e.g. +8801900000000)</label>
                      <input
                        type="text"
                        required
                        placeholder="+8801XXXXX or partial block"
                        value={newFakePhone}
                        onChange={(e) => setNewFakePhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">SPAMMER KNOWN NAME</label>
                      <input
                        type="text"
                        required
                        placeholder="Name they might checkout with"
                        value={newFakeName}
                        onChange={(e) => setNewFakeName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">SPAM MODUS OPERANDI / NOTES</label>
                      <textarea
                        rows={3}
                        placeholder="E.g. Booked 3 items using cash on delivery to Keraniganj and rejected receiving parcel on purpose."
                        value={newFakeNotes}
                        onChange={(e) => setNewFakeNotes(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      REGISTER SPAMMER THREAT
                    </button>
                  </form>

                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-xs">
                      <div className="bg-red-500 text-white p-3 font-mono text-[10px] uppercase font-bold tracking-wider flex justify-between">
                        <span>Threat Database ({fakeCustomers.length} Records)</span>
                        <span>Control action</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {fakeCustomers.length === 0 ? (
                          <div className="p-6 text-center text-gray-400">
                            Zero blocklisted fraud threat customer records reported. COD systems are open.
                          </div>
                        ) : (
                          fakeCustomers.map((fc) => (
                            <div key={fc.id} className="p-4 flex justify-between items-start hover:bg-gray-50">
                              <div>
                                <span className="bg-red-100 text-red-700 text-[9px] font-bold tracking-wider font-mono px-2 py-0.5 rounded mb-1.5 inline-block uppercase">
                                  Threat: {fc.name}
                                </span>
                                <div className="text-sm font-bold text-gray-800 font-mono">{fc.phone}</div>
                                {fc.notes && (
                                  <p className="text-gray-500 text-xs italic mt-1 leading-relaxed">
                                    "{fc.notes}"
                                  </p>
                                )}
                                <span className="text-[9px] text-gray-400 block font-mono mt-1">Logged on: {new Date(fc.createdAt).toLocaleDateString()}</span>
                              </div>
                              <button
                                id={`delete-fc-btn-${fc.id}`}
                                onClick={() => {
                                  if (confirm(`Erase fake blocklist on '${fc.name}'?`)) {
                                    onDeleteFakeCustomer(fc.id);
                                  }
                                }}
                                className="bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 border p-1 rounded transition-all cursor-pointer"
                                title="Remove threat flag"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* IDENTITY TAB */}
            {activeTab === 'branding' && (
              <form onSubmit={handleBrandingSave} className="max-w-4xl space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-900">Brand Identity & Social Media Links</h2>
                  <p className="text-xs text-gray-500">Edit business contact details, address coordinates, brand taglines, social profiles and banners.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">BRAND NAME</label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">BRAND TAGLINE</label>
                    <input
                      type="text"
                      required
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">MOBILE / WHATSAPP NUMBER</label>
                    <input
                      type="text"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">ADDRESS</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">FACEBOOK PAGE URL</label>
                    <input
                      type="url"
                      required
                      value={facebookPage}
                      onChange={(e) => setFacebookPage(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">INSTAGRAM PAGE URL</label>
                    <input
                      type="url"
                      required
                      value={instagramPage}
                      onChange={(e) => setInstagramPage(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">WEBSITE LOGO IMAGE (SELECT FILE OR PASTE URL)</label>
                    <div className="flex gap-4 items-center bg-gray-50 p-2 border border-gray-100 rounded-xl mb-2">
                      {websiteLogoUrl ? (
                        <div className="relative group w-12 h-12 bg-white rounded border overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={websiteLogoUrl}
                            alt=""
                            className="max-w-full max-h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setWebsiteLogoUrl('')}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 cursor-pointer text-[9px] font-bold"
                          >
                            Reset
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                          <Image className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white text-[9px] font-bold font-mono tracking-wider rounded cursor-pointer transition-colors">
                          <Plus className="w-3 h-3" />
                          <span>SELECT FILE</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[8px] text-gray-400 leading-none">Accepts JPG, PNG, WEBP files.</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={websiteLogoUrl}
                      onChange={(e) => setWebsiteLogoUrl(e.target.value)}
                      placeholder="https://... or base64 data"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-serif font-bold text-sm text-gray-900 mb-3">Hero Section Banners</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">HERO TITLE HEADER</label>
                      <input
                        type="text"
                        required
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">HERO SUBTITLE DESCR</label>
                      <input
                        type="text"
                        required
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">HERO IMAGE BACKGROUND (SELECT FILE OR PASTE URL) *</label>
                      <div className="flex gap-4 items-center bg-gray-50 p-2.5 border border-gray-100 rounded-xl mb-2">
                        {heroImage ? (
                          <div className="relative group w-20 h-12 bg-white rounded border overflow-hidden flex-shrink-0">
                            <img
                              src={heroImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setHeroImage('')}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 cursor-pointer text-[9px] font-bold"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-12 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                            <Image className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white text-[9px] font-bold font-mono tracking-wider rounded cursor-pointer transition-colors">
                            <Plus className="w-3 h-3" />
                            <span>SELECT HERO BG</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleHeroFileChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[8px] text-gray-400 leading-none">Cover photo size (JPG, WEBP).</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        required
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        placeholder="https://... or base64 data"
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">HERO INTRO CLOTHING MP4 VIDEO URL (OPTIONAL)</label>
                      <input
                        type="text"
                        value={heroVideoUrl}
                        onChange={(e) => setHeroVideoUrl(e.target.value)}
                        placeholder="https://example.com/slide.mp4"
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">HERO CTA BUTTON TEXT</label>
                      <input
                        type="text"
                        required
                        value={heroCtaText}
                        onChange={(e) => setHeroCtaText(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-serif font-bold text-sm text-gray-900 mb-3">Special Offer Promo Banner</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">PROMO TITLE</label>
                      <input
                        type="text"
                        value={promoBannerTitle}
                        onChange={(e) => setPromoBannerTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">PROMO SUBTITLE</label>
                      <input
                        type="text"
                        value={promoBannerSubtitle}
                        onChange={(e) => setPromoBannerSubtitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">PROMO IMAGE BANNER (SELECT FILE OR PASTE URL)</label>
                      <div className="flex gap-4 items-center bg-gray-50 p-2.5 border border-gray-100 rounded-xl mb-2">
                        {promoBannerImage ? (
                          <div className="relative group w-20 h-12 bg-white rounded border overflow-hidden flex-shrink-0">
                            <img
                              src={promoBannerImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPromoBannerImage('')}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 cursor-pointer text-[9px] font-bold"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-12 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                            <Image className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white text-[9px] font-bold font-mono tracking-wider rounded cursor-pointer transition-colors">
                            <Plus className="w-3 h-3" />
                            <span>SELECT PROMO BANNER</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePromoFileChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[8px] text-gray-400 leading-none">Landscape layout (JPG, PNG, WEBP).</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={promoBannerImage}
                        onChange={(e) => setPromoBannerImage(e.target.value)}
                        placeholder="https://... or base64 data"
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-[var(--primary)] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  SAVE ALL BRANDING CONFIGURATION
                </button>
              </form>
            )}

            {/* COLOR AND THEME SETTINGS TAB */}
            {activeTab === 'theme' && (
              <div className="max-w-3xl space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-900">Professional Visual Color Templates</h2>
                  <p className="text-xs text-gray-500">Pick any of the 5 custom luxury design modes crafted to make your boutique look cohesive immediately, or configure custom RGB Hex parameters.</p>
                </div>

                {/* Grid theme templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* LUXURY GOLD */}
                  <div 
                    onClick={() => handleTemplateSelection('luxury')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-102 hover:shadow-md bg-white ${
                      config.selectedTemplate === 'luxury' ? 'border-[var(--primary)] shadow-sm' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-serif text-xs font-bold text-gray-900">Luxury Gold & Ash</span>
                      {config.selectedTemplate === 'luxury' && <span className="bg-amber-500 text-[8px] text-black px-1.5 rounded font-mono font-bold">ACTIVE</span>}
                    </div>
                    <div className="flex gap-1.5 h-6 rounded overflow-hidden">
                      <span className="bg-[#D4AF37] flex-1"></span>
                      <span className="bg-[#111111] flex-1"></span>
                      <span className="bg-[#FCFCFD] flex-1 border border-gray-100"></span>
                      <span className="bg-[#8B0000] flex-1"></span>
                    </div>
                  </div>

                  {/* EMERALD BOTANICAL */}
                  <div 
                    onClick={() => handleTemplateSelection('emerald')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-102 hover:shadow-md bg-white ${
                      config.selectedTemplate === 'emerald' ? 'border-[var(--primary)] shadow-sm' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-serif text-xs font-bold text-gray-900">Emerald Jade Botanical</span>
                      {config.selectedTemplate === 'emerald' && <span className="bg-amber-500 text-[8px] text-black px-1.5 rounded font-mono font-bold">ACTIVE</span>}
                    </div>
                    <div className="flex gap-1.5 h-6 rounded overflow-hidden">
                      <span className="bg-[#059669] flex-1"></span>
                      <span className="bg-[#0F172A] flex-1"></span>
                      <span className="bg-[#F8FAFC] flex-1 border border-gray-100"></span>
                      <span className="bg-[#D97706] flex-1"></span>
                    </div>
                  </div>

                  {/* ROYAL COBALT */}
                  <div 
                    onClick={() => handleTemplateSelection('royal')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-102 hover:shadow-md bg-white ${
                      config.selectedTemplate === 'royal' ? 'border-[var(--primary)] shadow-sm' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-serif text-xs font-bold text-gray-900">Royal Cobalt Sapphire</span>
                      {config.selectedTemplate === 'royal' && <span className="bg-amber-500 text-[8px] text-black px-1.5 rounded font-mono font-bold">ACTIVE</span>}
                    </div>
                    <div className="flex gap-1.5 h-6 rounded overflow-hidden">
                      <span className="bg-[#2563EB] flex-1"></span>
                      <span className="bg-[#1E293B] flex-1"></span>
                      <span className="bg-white flex-1 border"></span>
                      <span className="bg-[#EC4899] flex-1"></span>
                    </div>
                  </div>

                  {/* CRIMSON & INDIGO */}
                  <div 
                    onClick={() => handleTemplateSelection('crimson')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-102 hover:shadow-md bg-white ${
                      config.selectedTemplate === 'crimson' ? 'border-[var(--primary)] shadow-sm' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-serif text-xs font-bold text-gray-900">Crimson Burgundy Style</span>
                      {config.selectedTemplate === 'crimson' && <span className="bg-amber-500 text-[8px] text-black px-1.5 rounded font-mono font-bold">ACTIVE</span>}
                    </div>
                    <div className="flex gap-1.5 h-6 rounded overflow-hidden">
                      <span className="bg-[#DC2626] flex-1"></span>
                      <span className="bg-[#18181B] flex-1"></span>
                      <span className="bg-[#FAFAFA] flex-1 border border-gray-100"></span>
                      <span className="bg-[#4F46E5] flex-1"></span>
                    </div>
                  </div>

                  {/* MINIMALIST CONTEMPORARY */}
                  <div 
                    onClick={() => handleTemplateSelection('minimalist')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-102 hover:shadow-md bg-white ${
                      config.selectedTemplate === 'minimalist' ? 'border-[var(--primary)] shadow-sm' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-serif text-xs font-bold text-gray-900">Minimalist Charcoal Mono</span>
                      {config.selectedTemplate === 'minimalist' && <span className="bg-amber-500 text-[8px] text-black px-1.5 rounded font-mono font-bold">ACTIVE</span>}
                    </div>
                    <div className="flex gap-1.5 h-6 rounded overflow-hidden">
                      <span className="bg-[#111111] flex-1"></span>
                      <span className="bg-[#6B7280] flex-1"></span>
                      <span className="bg-white flex-1 border"></span>
                      <span className="bg-[#374151] flex-1"></span>
                    </div>
                  </div>
                </div>

                {/* Custom Color Overrides Form */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-4 b-border pb-2 border-b">
                    <Palette className="w-5 h-5 text-gray-700" />
                    <h3 className="font-serif text-sm font-bold text-gray-900">Custom Brand Color overrides (HEX code settings)</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">PRIMARY ACCENT</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={config.themePrimary}
                          onChange={(e) => onUpdateConfig({ themePrimary: e.target.value, selectedTemplate: 'custom' })}
                          className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.themePrimary}
                          onChange={(e) => onUpdateConfig({ themePrimary: e.target.value, selectedTemplate: 'custom' })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[10px] font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">SECONDARY (DARK)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={config.themeSecondary}
                          onChange={(e) => onUpdateConfig({ themeSecondary: e.target.value, selectedTemplate: 'custom' })}
                          className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.themeSecondary}
                          onChange={(e) => onUpdateConfig({ themeSecondary: e.target.value, selectedTemplate: 'custom' })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[10px] font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">BG BASE</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={config.themeBg}
                          onChange={(e) => onUpdateConfig({ themeBg: e.target.value, selectedTemplate: 'custom' })}
                          className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.themeBg}
                          onChange={(e) => onUpdateConfig({ themeBg: e.target.value, selectedTemplate: 'custom' })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[10px] font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">TITLE TEXT</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={config.themeText}
                          onChange={(e) => onUpdateConfig({ themeText: e.target.value, selectedTemplate: 'custom' })}
                          className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.themeText}
                          onChange={(e) => onUpdateConfig({ themeText: e.target.value, selectedTemplate: 'custom' })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[10px] font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">SAVINGS TAG</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={config.themeAccent}
                          onChange={(e) => onUpdateConfig({ themeAccent: e.target.value, selectedTemplate: 'custom' })}
                          className="w-8 h-8 rounded border-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.themeAccent}
                          onChange={(e) => onUpdateConfig({ themeAccent: e.target.value, selectedTemplate: 'custom' })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[10px] font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLOTHING PRODUCT MODAL ADD/UPDATE OVERLAY */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-sm">
                {editingProduct ? `Edit ${editingProduct.title}` : 'Add Premium Clothing Product'}
              </h3>
              <button 
                id="close-prod-form"
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">CLOTHING ITEM TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Hand-stitched Cotton Panjabi"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-sans font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 font-mono">DESCRIPTION & COTTON MATERIAL DETAILS *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Fabric specs, sewing detail, design focus, styling tips..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-sans"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">PRICE (৳ TAKA) *</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">ORIGINAL COMPACT COMPARISON PRICE (৳ TAKA)</label>
                  <input
                    type="number"
                    required
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">REAL-TIME STOCK (UNITS) *</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-2">CATEGORY CLASSIFIER *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono"
                  >
                    {catalogs.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">PRODUCT IMAGE (IMAGE URL OR LOCAL FILE UPLOAD) *</label>
                
                <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-2">
                  {pImage ? (
                    <div className="relative group w-16 h-20 bg-white rounded-lg border overflow-hidden flex-shrink-0">
                      <img
                        src={pImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPImage('')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 cursor-pointer text-[10px] font-bold"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-20 bg-gray-200 rounded-lg border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                      <Image className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-semibold font-mono">Upload Local File:</span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-[var(--primary)] text-white hover:text-black font-semibold text-[10px] font-mono tracking-wider rounded-lg cursor-pointer transition-colors max-w-fit">
                      <Plus className="w-3" />
                      <span>SELECT IMAGE FILE</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[9px] text-gray-400 font-sans">Accepts PNG, JPG, JPEG, WEBP files.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-mono block">OR PASTE DIRECT WEB URL:</span>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/... or base64 data"
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono text-[10px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">PRODUCT VIDEO REEL MP4 URL (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="https://assets.mixkit.co/..."
                  value={pVideo}
                  onChange={(e) => setPVideo(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">AVAILABLE CLOTHING SIZES (COMMA SEPARATED)</label>
                <input
                  type="text"
                  placeholder="M, L, XL, XXL"
                  value={pSizes.join(', ')}
                  onChange={(e) => setPSizes(e.target.value.split(',').map(s => s.trim()).filter(s => s !== ""))}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--primary)] outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod-featured"
                  checked={pFeatured}
                  onChange={(e) => setPFeatured(e.target.checked)}
                  className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)] rounded cursor-pointer"
                />
                <label htmlFor="prod-featured" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Feature this item in home highlight banner list
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase py-2.5 rounded-lg transition-all cursor-pointerUnified"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-[var(--primary)] hover:text-black text-white text-xs font-bold uppercase py-2.5 rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Save specs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
