import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Order, Catalog, Review, FakeCustomer, PromoCode, SiteConfig } from "./src/types";

// Setup database file path
const DB_FILE = path.join(process.cwd(), "db.json");

// Default Pre-loaded items
const DEFAULT_CATALOGS: Catalog[] = [
  { id: "c1", name: "Premium Panjabi", slug: "premium-panjabi" },
  { id: "c2", name: "Polo Shirts", slug: "polo-shirts" },
  { id: "c3", name: "Classic Shirts", slug: "classic-shirts" },
  { id: "c4", name: "Denim & Chinos", slug: "denim-chinos" },
  { id: "c5", name: "Winter Wear", slug: "winter-wear" }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "KHALAB Signature Gold Panjabi",
    description: "Premium cotton blend fabric customized for exquisite comfort. Handcrafted stitching details around the collar and sleeves with premium metal buttons. Perfect for festivals and sophisticated evening setups.",
    price: 3250,
    originalPrice: 3800,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40112-large.mp4", // generic sample mp4 video
    sizes: ["M", "L", "XL", "XXL"],
    stock: 25,
    category: "premium-panjabi",
    createdAt: new Date().toISOString(),
    featured: true
  },
  {
    id: "p2",
    title: "Luxe Obsidian Mandarin Polo",
    description: "Crafted from double-mercerized Egyptian cotton, featuring a modern Mandarin/Chinese collar, customized logo badge, and classic dark highlights.",
    price: 1850,
    originalPrice: 2200,
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=600",
    sizes: ["S", "M", "L", "XL"],
    stock: 45,
    category: "polo-shirts",
    createdAt: new Date().toISOString(),
    featured: true
  },
  {
    id: "p3",
    title: "Royal Azure Casual Oxford Shirt",
    description: "Tailored to high precision with long staple premium yarn, lightweight, semi-formal style. Elevates your daily visual appeal with custom collar-stiff details.",
    price: 2150,
    originalPrice: 2600,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    sizes: ["M", "L", "XL"],
    stock: 18,
    category: "classic-shirts",
    createdAt: new Date().toISOString(),
    featured: false
  },
  {
    id: "p4",
    title: "Sandstone Stretch Chino Trouser",
    description: "High-flex modern chinos combining rich combed cotton with premium spandex. Seamless silhouette fits perfectly from hip to ankle.",
    price: 1950,
    originalPrice: 2400,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=600",
    sizes: ["30", "32", "34", "36"],
    stock: 5,
    category: "denim-chinos",
    createdAt: new Date().toISOString(),
    featured: true
  },
  {
    id: "p5",
    title: "Signature Cobalt Denim Jacket",
    description: "Rugged yet premium vintage washed denim comfort jacket featuring custom silver hardware and thermal comfort linings.",
    price: 2850,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600",
    sizes: ["M", "L", "XL"],
    stock: 12,
    category: "winter-wear",
    createdAt: new Date().toISOString(),
    featured: true
  },
  {
    id: "p6",
    title: "Minimalist Ivory Jersey Crew",
    description: "Pure ring-spun bio-washed heavyweight cotton tee. Delivers a thick, luxurious feel with soft rib cuffs and comfortable modern fit.",
    price: 990,
    originalPrice: 1200,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
    sizes: ["S", "M", "L", "XL"],
    stock: 32,
    category: "polo-shirts",
    createdAt: new Date().toISOString(),
    featured: false
  }
];

const DEFAULT_CONFIG: SiteConfig = {
  brandName: "KHALAB",
  tagline: "Make your self premium.",
  address: "Shuvadda, South Keraniganj, Dhaka, Bangladesh.",
  mobile: "+880171941040",
  instagramPage: "https://www.instagram.com/khalabfashion",
  facebookPage: "https://www.facebook.com/khalabfashion",
  websiteLogoUrl: "", // blank sets textual high-fidelity logo brand name
  selectedTemplate: "luxury",
  themePrimary: "#D4AF37", // Gold
  themeSecondary: "#1E1E1E", // Dark Charcoal
  themeBg: "#FCFCFD", // Luxurious off-white
  themeText: "#111111", // Pitch Dark
  themeAccent: "#8A252C", // Royal Red
  heroTitle: "FALL IN LOVE WITH PREMIUM FIT",
  heroSubtitle: "Handcrafted signature menswear tailoring from Dhaka's finest. Order now for secure bKash, Nagad, Rocket or Cash On Delivery (COD) services across Bangladesh.",
  heroImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=1400",
  heroCtaText: "Explore Premium Wear",
  promoBannerTitle: "ELEGANT DISCOUNTS RUNNING",
  promoBannerSubtitle: "Get instant 15% discount site-wide. Use code KHALAB15 at checkout checkout screen.",
  promoBannerImage: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=1200"
};

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "p1",
    customerName: "Imran Khan",
    rating: 5,
    comment: "Excellent quality! The stitching on KHALAB Panjabi is flawless, fits true to size. Delivery to South Keraniganj was made within 24 hours.",
    createdAt: new Date().toISOString()
  },
  {
    id: "r2",
    productId: "p1",
    customerName: "Tariqul Islam",
    rating: 5,
    comment: "This is premium stuff. Strongly recommended for anyone trying to look sleek. The fabric feels really heavy and comfortable.",
    createdAt: new Date().toISOString()
  },
  {
    id: "r3",
    productId: "p2",
    customerName: "Asif Rahman",
    rating: 4,
    comment: "Very elegant polo shirt. Color stays fast after three washes. Will buy again from KHALAB fashion.",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_PROMO_CODES: PromoCode[] = [
  { id: "promo1", code: "KHALAB15", discountPercent: 15, active: true },
  { id: "promo2", code: "PREMIUM10", discountPercent: 10, active: true }
];

const DEFAULT_FAKE_CUSTOMERS: FakeCustomer[] = [
  {
    id: "fake1",
    phone: "+8801900000000",
    name: "Spammer Jack",
    notes: "Repeated COD booking with fake address",
    createdAt: new Date().toISOString()
  },
  {
    id: "fake2",
    phone: "01700000000",
    name: "Canceled Boy",
    notes: "Spammed fake COD requests, refused on call.",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-98214",
    items: [
      {
        productId: "p1",
        title: "KHALAB Signature Gold Panjabi",
        price: 3250,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
        quantity: 1,
        selectedSize: "XL"
      }
    ],
    customerName: "Shafiqul Ahsan",
    customerPhone: "01859341203",
    customerAddress: "Zinzira Bazar, Keraniganj, Dhaka",
    paymentMethod: "bKash",
    paymentStatus: "Paid",
    transactionId: "BKASH_9X031B08C",
    deliveryStatus: "Shipped",
    totalAmount: 2762.5, // applying 15% discount
    discountAmount: 487.5,
    promoApplied: "KHALAB15",
    trackingNumber: "KR-783912",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper database load & save
interface DbSchema {
  config: SiteConfig;
  products: Product[];
  catalogs: Catalog[];
  orders: Order[];
  reviews: Review[];
  promoCodes: PromoCode[];
  fakeCustomers: FakeCustomer[];
}

function loadDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data) as DbSchema;
      // Merge with default keys to make sure any updates are clean
      return {
        config: { ...DEFAULT_CONFIG, ...parsed.config },
        products: parsed.products || DEFAULT_PRODUCTS,
        catalogs: parsed.catalogs || DEFAULT_CATALOGS,
        orders: parsed.orders || DEFAULT_ORDERS,
        reviews: parsed.reviews || DEFAULT_REVIEWS,
        promoCodes: parsed.promoCodes || DEFAULT_PROMO_CODES,
        fakeCustomers: parsed.fakeCustomers || DEFAULT_FAKE_CUSTOMERS,
      };
    }
  } catch (error) {
    console.error("Error reading database file, using defaults:", error);
  }

  // Save default DB on first startup
  const initialDb: DbSchema = {
    config: DEFAULT_CONFIG,
    products: DEFAULT_PRODUCTS,
    catalogs: DEFAULT_CATALOGS,
    orders: DEFAULT_ORDERS,
    reviews: DEFAULT_REVIEWS,
    promoCodes: DEFAULT_PROMO_CODES,
    fakeCustomers: DEFAULT_FAKE_CUSTOMERS,
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize DB
  let db = loadDb();

  // --- API Endpoints ---

  // Site Configuration API
  app.get("/api/config", (req, res) => {
    res.json(db.config);
  });

  app.put("/api/config", (req, res) => {
    db.config = { ...db.config, ...req.body };
    saveDb(db);
    res.json({ success: true, config: db.config });
  });

  // Catalogs / Categories API
  app.get("/api/catalogs", (req, res) => {
    res.json(db.catalogs);
  });

  app.post("/api/catalogs", (req, res) => {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Name and Slug are required" });
    }
    const newCatalog: Catalog = {
      id: "cat_" + Date.now(),
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
    db.catalogs.push(newCatalog);
    saveDb(db);
    res.status(201).json(newCatalog);
  });

  app.delete("/api/catalogs/:id", (req, res) => {
    db.catalogs = db.catalogs.filter((c) => c.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Products API
  app.get("/api/products", (req, res) => {
    res.json(db.products);
  });

  app.post("/api/products", (req, res) => {
    const pData = req.body;
    if (!pData.title || !pData.price || !pData.category) {
      return res.status(400).json({ error: "Title, Price, and Category are required" });
    }

    const newProduct: Product = {
      id: "p_" + Date.now(),
      title: pData.title,
      description: pData.description || "",
      price: Number(pData.price),
      originalPrice: Number(pData.originalPrice || pData.price),
      image: pData.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600",
      videoUrl: pData.videoUrl || "",
      sizes: Array.isArray(pData.sizes) ? pData.sizes : ["M", "L", "XL"],
      stock: Number(pData.stock !== undefined ? pData.stock : 10),
      category: pData.category,
      createdAt: new Date().toISOString(),
      featured: !!pData.featured,
    };

    db.products.push(newProduct);
    saveDb(db);
    res.status(201).json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const pData = req.body;
    db.products[index] = {
      ...db.products[index],
      title: pData.title,
      description: pData.description,
      price: Number(pData.price),
      originalPrice: Number(pData.originalPrice || pData.price),
      image: pData.image,
      videoUrl: pData.videoUrl || "",
      sizes: Array.isArray(pData.sizes) ? pData.sizes : db.products[index].sizes,
      stock: Number(pData.stock !== undefined ? pData.stock : db.products[index].stock),
      category: pData.category,
      featured: !!pData.featured,
    };

    saveDb(db);
    res.json({ success: true, product: db.products[index] });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.products = db.products.filter((p) => p.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Orders API (Place, Update, Verify)
  app.get("/api/orders", (req, res) => {
    res.json(db.orders);
  });

  app.post("/api/orders", (req, res) => {
    const { items, customerName, customerPhone, customerAddress, paymentMethod, transactionId, promoApplied, totalAmount, discountAmount, notes } = req.body;
    
    if (!items || !items.length || !customerName || !customerPhone || !customerAddress || !paymentMethod) {
      return res.status(400).json({ error: "Mandatory checkout details are missing." });
    }

    // Dynamic stock validation & reservation
    for (const item of items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product '${item.title}' was not found in active inventory.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.title}. Only ${product.stock} left in inventory.` });
      }
    }

    // Check if customer phone or name is on the Fake Customers list
    const isFakePhone = db.fakeCustomers.some((f) => {
      const cleanPhone = f.phone.replace(/[^0-9]/g, "");
      const cleanCustomerPhone = customerPhone.replace(/[^0-9]/g, "");
      return cleanPhone !== "" && (cleanPhone.includes(cleanCustomerPhone) || cleanCustomerPhone.includes(cleanPhone));
    });
    
    const isFakeName = db.fakeCustomers.some((f) => 
      f.name.toLowerCase().trim() === customerName.toLowerCase().trim()
    );

    const isFakeMarked = isFakePhone || isFakeName;

    // Deduct stock in real-time
    for (const item of items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    const newOrder: Order = {
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      items,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      transactionId: transactionId || "",
      deliveryStatus: "Pending",
      totalAmount: Number(totalAmount),
      discountAmount: Number(discountAmount || 0),
      promoApplied,
      isFakeCustomerReported: isFakeMarked,
      notes: notes || (isFakeMarked ? " flagged: MATCHED RECORD IN FAKE CUSTOMER REGISTRY" : ""),
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDb(db);
    res.status(201).json({ success: true, order: newOrder });
  });

  app.put("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const { deliveryStatus, paymentStatus, trackingNumber, isFakeCustomerReported } = req.body;
    
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    // If status is changed to Canceled, return the stock to inventory!
    const oldStatus = db.orders[index].deliveryStatus;
    if (deliveryStatus === "Canceled" && oldStatus !== "Canceled") {
      for (const item of db.orders[index].items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
    } else if (oldStatus === "Canceled" && deliveryStatus !== "Canceled" && deliveryStatus !== undefined) {
      // If reactivating a canceled order, check stock availability and deduct
      for (const item of db.orders[index].items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product && product.stock >= item.quantity) {
          product.stock -= item.quantity;
        }
      }
    }

    db.orders[index] = {
      ...db.orders[index],
      deliveryStatus: deliveryStatus || db.orders[index].deliveryStatus,
      paymentStatus: paymentStatus || db.orders[index].paymentStatus,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : db.orders[index].trackingNumber,
      isFakeCustomerReported: isFakeCustomerReported !== undefined ? isFakeCustomerReported : db.orders[index].isFakeCustomerReported,
    };

    saveDb(db);
    res.json({ success: true, order: db.orders[index] });
  });

  // Reviews API
  app.get("/api/reviews", (req, res) => {
    res.json(db.reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { productId, customerName, rating, comment } = req.body;
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ error: "A unique name, rating and comment are required." });
    }

    const newReview: Review = {
      id: "r_" + Date.now(),
      productId,
      customerName,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    db.reviews.push(newReview);
    saveDb(db);
    res.status(201).json(newReview);
  });

  // Fake Customers API
  app.get("/api/fake-customers", (req, res) => {
    res.json(db.fakeCustomers);
  });

  app.post("/api/fake-customers", (req, res) => {
    const { phone, name, notes } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ error: "Customer name and phone number is required" });
    }

    const newFake: FakeCustomer = {
      id: "fc_" + Date.now(),
      phone,
      name,
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };

    db.fakeCustomers.push(newFake);
    
    // Also update any pre-existing orders from this phone number to let admin know they are fake in real-time
    db.orders.forEach((o) => {
      const isFakePhone = o.customerPhone.replace(/[^0-9]/g, "").includes(phone.replace(/[^0-9]/g, ""));
      const isFakeName = o.customerName.toLowerCase().trim() === name.toLowerCase().trim();
      if (isFakePhone || isFakeName) {
        o.isFakeCustomerReported = true;
      }
    });

    saveDb(db);
    res.status(201).json(newFake);
  });

  app.delete("/api/fake-customers/:id", (req, res) => {
    const targetFake = db.fakeCustomers.find(fc => fc.id === req.params.id);
    if (targetFake) {
      db.fakeCustomers = db.fakeCustomers.filter((fc) => fc.id !== req.params.id);
      
      // Also unflag existing orders if they are no longer matched with other fake customers
      db.orders.forEach((o) => {
        const stillFakePhone = db.fakeCustomers.some((f) => o.customerPhone.replace(/[^0-9]/g, "").includes(f.phone.replace(/[^0-9]/g, "")));
        const stillFakeName = db.fakeCustomers.some((f) => o.customerName.toLowerCase().trim() === f.name.toLowerCase().trim());
        if (!stillFakePhone && !stillFakeName) {
          o.isFakeCustomerReported = false;
        }
      });

      saveDb(db);
    }
    res.json({ success: true });
  });

  // Promo Codes API
  app.get("/api/promos", (req, res) => {
    res.json(db.promoCodes);
  });

  app.post("/api/promos", (req, res) => {
    const { code, discountPercent, active } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ error: "Code and discount values are required" });
    }

    const newPromo: PromoCode = {
      id: "pr_" + Date.now(),
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      active: active !== undefined ? !!active : true,
    };

    db.promoCodes.push(newPromo);
    saveDb(db);
    res.status(201).json(newPromo);
  });

  app.delete("/api/promos/:id", (req, res) => {
    db.promoCodes = db.promoCodes.filter((p) => p.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // --- End API Endpoints ---

  // Vite middleware setup for assets/front-end rendering
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KHALAB Express Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
