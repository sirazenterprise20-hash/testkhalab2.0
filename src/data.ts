import { Product, Catalog } from './types';

export const INITIAL_CATALOGS: Catalog[] = [
  { id: "c1", name: "Premium Panjabi", slug: "premium-panjabi" },
  { id: "c2", name: "Polo Shirts", slug: "polo-shirts" },
  { id: "c3", name: "Classic Shirts", slug: "classic-shirts" },
  { id: "c4", name: "Denim & Chinos", slug: "denim-chinos" },
  { id: "c5", name: "Winter Wear", slug: "winter-wear" }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "KHALAB Signature Gold Panjabi",
    description: "Premium cotton blend fabric customized for exquisite comfort. Handcrafted stitching details around the collar and sleeves with premium metal buttons. Perfect for festivals and sophisticated evening setups.",
    price: 3250,
    originalPrice: 3800,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40112-large.mp4",
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
