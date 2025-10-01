/**
 * Tipos compartidos para modelos de datos
 * Centraliza las interfaces para mantener consistencia
 */

/**
 * Usuario del sistema
 */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Precio por peso de producto
 */
export interface IPriceByWeight {
  weight: number;
  price: number;
  stock: number;
}

/**
 * Imagen de producto
 */
export interface IProductImage {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  isPrimary: boolean;
}

/**
 * Producto
 */
export interface IProduct {
  _id: string;
  name: string;
  description: string;
  pricesByWeight: IPriceByWeight[];
  pricePerKilo: number;
  images: IProductImage[];
  image?: string;
  basePricePer100g?: number;
  category: string;
  categories?: string[];
  totalStock: number;
  featured: boolean;
  isAdvertisement?: boolean;
  isMainCarousel?: boolean;
  discount: number;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    fats?: number;
    carbs?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Categoría
 */
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color?: string;
  isActive: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Publicidad/Advertisement
 */
export interface IAdvertisement {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  link?: string;
  type: "banner" | "carousel" | "popup";
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item del carrito
 */
export interface ICartItem {
  productId: string;
  name: string;
  image: string;
  weight: number;
  price: number;
  quantity: number;
  stock: number;
}

/**
 * Estado del carrito
 */
export interface ICartState {
  items: ICartItem[];
  total: number;
}
