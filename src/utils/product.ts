/**
 * Utilidades compartidas para operaciones con productos
 * Centraliza la lógica común para evitar duplicación
 */

// Usar tipos flexibles para compatibilidad
type ProductLike = {
  basePricePer100g?: number;
  pricesByWeight?: Array<{
    weight: number;
    price: number;
    stock: number;
  }>;
  totalStock?: number;
  discount?: number;
  image?: string;
  images?: Array<{
    url: string;
    isPrimary?: boolean;
    [key: string]: any;
  }>;
};

/**
 * Interfaz para opciones de peso con stock
 */
export interface WeightOption {
  weight: number;
  price: number;
  stock: number;
  label: string;
}

/**
 * Calcula el precio base de un producto
 * Devuelve el precio más bajo disponible o basePricePer100g
 *
 * @param product - Producto del cual calcular el precio
 * @returns Precio base del producto
 *
 * @example
 * ```typescript
 * const price = getProductPrice(product);
 * console.log(`$${price.toLocaleString()}`);
 * ```
 */
export function getProductPrice(product: ProductLike): number {
  // Prioridad 1: Precio base por 100g (ya calculado)
  if (product.basePricePer100g) {
    return product.basePricePer100g;
  }

  // Prioridad 2: Precio mínimo de los precios por peso
  if (product.pricesByWeight && product.pricesByWeight.length > 0) {
    return Math.min(...product.pricesByWeight.map((p) => p.price));
  }

  // Fallback: Sin precio
  return 0;
}

/**
 * Calcula el stock total de un producto
 * Suma el stock de todas las opciones de peso disponibles
 *
 * @param product - Producto del cual calcular el stock
 * @returns Stock total disponible
 *
 * @example
 * ```typescript
 * const stock = getProductStock(product);
 * if (stock === 0) {
 *   console.log('Producto sin stock');
 * }
 * ```
 */
export function getProductStock(product: ProductLike): number {
  // Prioridad 1: Stock total (ya calculado)
  if (product.totalStock !== undefined) {
    return product.totalStock;
  }

  // Prioridad 2: Sumar stock de cada opción de peso
  if (product.pricesByWeight && product.pricesByWeight.length > 0) {
    return product.pricesByWeight.reduce(
      (total, p) => total + (p.stock || 0),
      0
    );
  }

  // Fallback: Sin stock
  return 0;
}

/**
 * Obtiene las opciones de peso disponibles para un producto
 * Filtra solo las opciones que tienen stock disponible
 *
 * @param product - Producto del cual obtener opciones
 * @param includeOutOfStock - Si true, incluye opciones sin stock (default: false)
 * @returns Array de opciones de peso con stock
 *
 * @example
 * ```typescript
 * const options = getWeightOptions(product);
 * options.forEach(opt => {
 *   console.log(`${opt.label}: $${opt.price} (Stock: ${opt.stock})`);
 * });
 * ```
 */
export function getWeightOptions(
  product: ProductLike,
  includeOutOfStock: boolean = false
): WeightOption[] {
  if (!product.pricesByWeight || product.pricesByWeight.length === 0) {
    return [];
  }

  const options = product.pricesByWeight.map((pw) => ({
    weight: pw.weight,
    price: pw.price,
    stock: pw.stock,
    label: `${pw.weight}g`,
  }));

  // Filtrar opciones sin stock si no se especifica lo contrario
  if (includeOutOfStock) {
    return options;
  }

  return options.filter((opt) => opt.stock > 0);
}

/**
 * Calcula el precio con descuento aplicado
 *
 * @param product - Producto con posible descuento
 * @returns Precio con descuento aplicado
 *
 * @example
 * ```typescript
 * const finalPrice = getDiscountedPrice(product);
 * const savings = getProductPrice(product) - finalPrice;
 * ```
 */
export function getDiscountedPrice(product: ProductLike): number {
  const originalPrice = getProductPrice(product);
  const discount = product.discount || 0;
  return Math.round(originalPrice * (1 - discount / 100));
}

/**
 * Calcula el ahorro generado por el descuento
 *
 * @param product - Producto con descuento
 * @returns Cantidad ahorrada
 */
export function getSavings(product: ProductLike): number {
  const originalPrice = getProductPrice(product);
  const discountedPrice = getDiscountedPrice(product);
  return originalPrice - discountedPrice;
}

/**
 * Verifica si un producto tiene stock disponible
 *
 * @param product - Producto a verificar
 * @returns true si tiene stock, false en caso contrario
 */
export function hasStock(product: ProductLike): boolean {
  return getProductStock(product) > 0;
}

/**
 * Formatea el precio para mostrar en la UI
 *
 * @param price - Precio a formatear
 * @param currency - Símbolo de moneda (default: '$')
 * @returns Precio formateado
 *
 * @example
 * ```typescript
 * formatPrice(12500) // "$12.500"
 * ```
 */
export function formatPrice(price: number, currency: string = "$"): string {
  return `${currency}${price.toLocaleString("es-CL")}`;
}

/**
 * Obtiene la imagen principal de un producto
 *
 * @param product - Producto del cual obtener imagen
 * @returns URL de la imagen principal o fallback
 */
export function getProductMainImage(product: ProductLike): string {
  // Sistema nuevo: campo 'images' (array)
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find((img) => img.isPrimary);
    const imageUrl = primaryImage ? primaryImage.url : product.images[0].url;

    // Si ya es una URL completa, devolverla tal como está
    if (
      imageUrl &&
      (imageUrl.startsWith("http") || imageUrl.startsWith("/uploads/"))
    ) {
      return imageUrl;
    }

    // Si es solo el nombre del archivo, agregar la ruta completa
    if (imageUrl) {
      return `/uploads/products/${imageUrl}`;
    }
  }

  // Sistema antiguo: campo 'image' (string)
  if (product.image) {
    // Si es una URL externa, devolverla tal como está
    if (product.image.startsWith("http")) {
      return product.image;
    }

    // Si ya tiene /uploads/, devolverla tal como está
    if (product.image.startsWith("/uploads/")) {
      return product.image;
    }

    // Si es solo el nombre del archivo, agregar la ruta completa
    return `/uploads/products/${product.image}`;
  }

  // Fallback
  return "/placeholder-product.jpg";
}
