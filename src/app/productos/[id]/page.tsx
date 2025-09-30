"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import styles from "./producto.module.css";
import { useCart } from "../../context/CartContext";
import {
  FaWhatsapp,
  FaFacebookF,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaInstagram,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

// ✅ INTERFAZ ACTUALIZADA PARA EL NUEVO MODELO
interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePricePer100g?: number;
  pricesByWeight?: Array<{
    weight: number;
    price: number;
    stock: number;
  }>;
  totalStock?: number;
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  image?: string;
  featured: boolean;
  isMainCarousel?: boolean;
  discount: number;
  createdAt: string;
}

interface WeightOption {
  weight: number;
  price: number;
  stock: number;
  label: string;
}

// ✅ CONSTANTES PARA EL CARRUSEL - IGUAL QUE FEATUREDPRODUCTS
const SLIDES_TO_SHOW = {
  desktop: 3,
  tablet: 2,
  mobile: 1,
};
const AUTO_PLAY_INTERVAL = 4000;

export default function ProductoPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCartOptions, setShowCartOptions] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  
  // ✅ ESTADOS DEL CARRUSEL - IGUAL QUE FEATUREDPRODUCTS
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");

  // ✅ NUEVOS ESTADOS PARA GALERÍA
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  

  // ✅ FUNCIÓN PARA OBTENER IMAGEN CORRECTA
  const getCorrectImagePath = useCallback((product: Product) => {
    // Sistema nuevo: campo 'images' (array)
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img) => img.isPrimary);
      const imageUrl = primaryImage ? primaryImage.url : product.images[0].url;

      // Si ya es una URL completa (http o /uploads/), devolverla tal como está
      if (
        imageUrl &&
        (imageUrl.startsWith("http") || imageUrl.startsWith("/uploads/"))
      ) {
        return imageUrl;
      }

      // Si es solo el nombre del archivo, agregar la ruta completa
      if (imageUrl) {
        const fullPath = `/uploads/products/${imageUrl}`;
        return fullPath;
      }
    }

    // Sistema antiguo: campo 'image' (string)
    if (product.image) {
      // Si es una URL externa (Unsplash), devolverla tal como está
      if (product.image.startsWith("http")) {
        return product.image;
      }

      // Si ya tiene /uploads/, devolverla tal como está
      if (product.image.startsWith("/uploads/")) {
        return product.image;
      }

      // Si es solo el nombre del archivo, agregar la ruta completa
      const fullPath = `/uploads/products/${product.image}`;
      return fullPath;
    }

    // Fallback
    return "/placeholder-product.jpg";
  }, []);

  // ✅ FUNCIÓN HELPER PARA OBTENER IMAGEN PRINCIPAL - MEMOIZADA
  const getProductImage = useCallback(
    (product: Product) => {
      return getCorrectImagePath(product);
    },
    [getCorrectImagePath]
  );

  // ✅ FUNCIÓN PARA OBTENER TODAS LAS IMÁGENES - MEMOIZADA
  const getAllImages = useCallback(
    (product: Product) => {
      if (product.images && product.images.length > 0) {
        return product.images.map((img) => {
          const imageUrl = img.url;
          // Si es una ruta local, verificar que tenga la ruta completa
          if (
            imageUrl &&
            !imageUrl.startsWith("http") &&
            !imageUrl.startsWith("/uploads/")
          ) {
            return `/uploads/products/${imageUrl}`;
          }
          return imageUrl;
        });
      }
      return [getCorrectImagePath(product)];
    },
    [getCorrectImagePath]
  );

  // ✅ FUNCIÓN PARA OBTENER IMAGEN ACTUAL - MEMOIZADA
  const getCurrentImage = useCallback(() => {
    if (!product) return "/placeholder-product.jpg";
    const images = getAllImages(product);
    return images[currentImageIndex] || images[0];
  }, [product, currentImageIndex, getAllImages]);

  // ✅ NAVEGACIÓN DE IMÁGENES CON useCallback - DEPENDENCIAS CORREGIDAS
  const nextImage = useCallback(() => {
    if (!product) return;
    const images = getAllImages(product);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [product, getAllImages]);

  const prevImage = useCallback(() => {
    if (!product) return;
    const images = getAllImages(product);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [product, getAllImages]);

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // ✅ FUNCIÓN HELPER PARA OBTENER PRECIO
  const getProductPrice = (product: Product) => {
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight[0].price;
    }
    return product.basePricePer100g || 0;
  };

  // ✅ FUNCIÓN HELPER MEJORADA PARA OBTENER OPCIONES DE PESO - FILTRADA POR STOCK
  const getWeightOptions = (product: Product): WeightOption[] => {
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight
        .filter((option) => option.stock > 0) // ✅ FILTRAR SOLO OPCIONES CON STOCK
        .map((option) => ({
          weight: option.weight,
          price: option.price,
          stock: option.stock,
          label:
            option.weight >= 1000
              ? `${option.weight / 1000}kg`
              : `${option.weight}g`,
        }));
    }
    // ✅ FALLBACK: Si no hay pricesByWeight con stock, no crear opciones básicas
    return [];
  };

  // ✅ FUNCIÓN MEMOIZADA PARA CARGAR Los Favoritos de Frutos Secos Premium - OPCIÓN 2
  const loadRecommendedProducts = useCallback(async () => {
    if (!product) return;

    setLoadingRecommended(true);
    try {
      const response = await fetch(`/api/products/main-carousel`);
      if (response.ok) {
        const data = await response.json();
        // ✅ CORREGIDO: No filtrar el producto actual, mostrar todos los del carrusel
        setRecommendedProducts(data.slice(0, 10));
      }
    } catch (error) {
      console.error(
        "Error cargando Los Favoritos de Frutos Secos Premium:",
        error
      );
    } finally {
      setLoadingRecommended(false);
    }
  }, [product]);

  // ✅ FUNCIÓN MEMOIZADA MEJORADA PARA CARGAR PRODUCTO
  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);

        // ✅ CONFIGURAR PESO POR DEFECTO MEJORADO - SOLO CON STOCK
        const weightOptions = getWeightOptions(data);
        if (weightOptions.length > 0) {
          // Seleccionar la primera opción disponible con stock
          setSelectedWeight(weightOptions[0]);
        } else {
          console.warn(
            "No weight options with stock available for product:",
            data.name
          );
          setSelectedWeight(null);
        }
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Error cargando producto:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // ✅ FUNCIONES DEL CARRUSEL - IGUAL QUE FEATUREDPRODUCTS
  const getSlidesToShow = useCallback(() => {
    return SLIDES_TO_SHOW[screenSize];
  }, [screenSize]);

  const nextSlide = useCallback(() => {
    const slidesToShow = getSlidesToShow();
    const maxSlides = recommendedProducts.length - slidesToShow;
    setCurrentSlide((prev) => (prev >= maxSlides ? 0 : prev + 1));
  }, [recommendedProducts.length, getSlidesToShow]);

  const prevSlide = useCallback(() => {
    const slidesToShow = getSlidesToShow();
    const maxSlides = recommendedProducts.length - slidesToShow;
    setCurrentSlide((prev) => (prev <= 0 ? maxSlides : prev - 1));
  }, [recommendedProducts.length, getSlidesToShow]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // ✅ VARIABLES CALCULADAS - MOVIDAS DESPUÉS DE LAS FUNCIONES
  const weightOptions = product ? getWeightOptions(product) : [];
  const maxQuantity = selectedWeight ? selectedWeight.stock : 0;
  const isOutOfStock = !selectedWeight || selectedWeight.stock === 0;
  const slidesToShow = getSlidesToShow();
  const slideWidth = 100 / slidesToShow;
  const maxSlides = Math.max(0, recommendedProducts.length - slidesToShow);

  // ✅ FUNCIÓN addToCart MEJORADA CON LOGS
  const { addToCart: addToCartContext } = useCart();

  // ✅ FUNCIÓN addToCart ACTUALIZADA
  const addToCart = () => {
    if (!selectedWeight || !product) {
      console.warn("Cannot add to cart: missing selectedWeight or product");
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      image: getProductImage(product),
      weight: selectedWeight.weight,
      price: selectedWeight.price,
      quantity: quantity,
      stock: selectedWeight.stock,
    };

    // Usar el contexto para agregar al carrito
    addToCartContext(cartItem);

    // Mostrar mensaje de éxito
    setShowSuccess(true);
    setShowCartOptions(true);

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const continueShopping = () => {
    router.push("/productos");
  };

  const goToCart = () => {
    router.push("/carrito");
  };

  const goBack = () => {
    router.back();
  };

  const navigateToProduct = (productId: string) => {
    router.push(`/productos/${productId}`);
  };

  // ✅ NUEVO: useEffect para detectar el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize(); // Ejecutar al montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ AUTO-PLAY DEL CARRUSEL - IGUAL QUE FEATUREDPRODUCTS
  useEffect(() => {
    if (!isAutoPlaying || recommendedProducts.length <= slidesToShow) return;

    const interval = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoPlaying, recommendedProducts.length, slidesToShow, nextSlide]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    if (product) {
      loadRecommendedProducts();
    }
  }, [product, loadRecommendedProducts]);

  // ✅ NAVEGACIÓN CON TECLADO - DEPENDENCIAS CORREGIDAS
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") setShowZoomModal(false);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [nextImage, prevImage]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Cargando producto...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.notFound}>
              <h1>Producto no encontrado</h1>
              <p>El producto que buscas no existe o ha sido eliminado.</p>
              <button onClick={goBack} className={styles.backBtn}>
                ← Volver
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <button
              onClick={() => router.push("/")}
              className={styles.breadcrumbLink}
            >
              Inicio
            </button>
            <span> / </span>
            <button
              onClick={() => router.push("/productos")}
              className={styles.breadcrumbLink}
            >
              Productos
            </button>
            <span> / </span>
            <span>{product.name}</span>
          </nav>

          {/* Botón volver */}
          <button onClick={goBack} className={styles.backButton}>
            <i className="fas fa-arrow-left"></i>
            Volver
          </button>

          {/* ✅ MENSAJE DE ÉXITO */}
          {showSuccess && (
            <div className={styles.successMessage}>
              <i className="fas fa-check-circle"></i>
              ¡Producto agregado al carrito exitosamente!
            </div>
          )}

          {/* ✅ CONTENEDOR PRINCIPAL DEL PRODUCTO AGREGADO */}
          <div className={styles.productContainer}>
            {/* Contenedor del producto */}
            <div className={styles.productGrid}>
              {/* ✅ NUEVA SECCIÓN DE IMAGEN CON GALERÍA */}
              <div className={styles.productImageSection}>
                {/* Imagen principal con zoom */}
                <div className={styles.mainImageContainer}>
                  <div
                    className={styles.mainImage}
                    onClick={() => setShowZoomModal(true)}
                  >
                    <Image
                      src={getCurrentImage()}
                      alt={product.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onLoadingComplete={() => setIsImageLoading(false)}
                      onLoadStart={() => setIsImageLoading(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-product.jpg";
                      }}
                    />

                    {product.discount > 0 && (
                      <div className={styles.discountBadge}>
                        -{product.discount}%
                      </div>
                    )}

                    {isImageLoading && (
                      <div className={styles.imageLoader}>
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                    )}
                  </div>

                  {/* Flechas de navegación */}
                  {getAllImages(product).length > 1 && (
                    <>
                      <button
                        className={`${styles.navArrow} ${styles.navArrowLeft}`}
                        onClick={prevImage}
                        aria-label="Imagen anterior"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        className={`${styles.navArrow} ${styles.navArrowRight}`}
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </div>

                {/* Miniaturas */}
                {getAllImages(product).length > 1 && (
                  <div className={styles.thumbnailsContainer}>
                    <div className={styles.thumbnailsWrapper}>
                      {getAllImages(product).map((imageUrl, index) => (
                        <div
                          key={index}
                          className={`${styles.thumbnail} ${
                            index === currentImageIndex
                              ? styles.thumbnailActive
                              : ""
                          }`}
                          onClick={() => selectImage(index)}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${product.name} - imagen ${index + 1}`}
                            width={80}
                            height={80}
                            style={{ objectFit: "cover" }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className={styles.productInfo}>
                <div className={styles.productHeader}>
                  <h1 className={styles.productTitle}>{product.name}</h1>
                  <div className={styles.stockBadge}>
                    <span className={styles.availableBadge}>Disponible</span>
                  </div>
                </div>

                <div className={styles.priceSection}>
                  <div className={styles.mainPrice}>
                    $
                    {selectedWeight
                      ? selectedWeight.price.toLocaleString("es-CL")
                      : "0"}
                  </div>
                  {selectedWeight && (
                    <div className={styles.priceDetails}>
                      <span className={styles.weightInfo}>
                        Precio por {selectedWeight.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Selector de peso - Estilo compacto */}
                {weightOptions.length > 0 && (
                  <div className={styles.weightSection}>
                    <div className={styles.weightButtons}>
                      {weightOptions
                        .filter(
                          (option) =>
                            option.stock > 0 || weightOptions.length === 1
                        ) /* ✅ MOSTRAR AL MENOS UNA OPCIÓN */
                        .map((option) => (
                          <button
                            key={option.weight}
                            className={`${styles.weightButton} ${
                              selectedWeight?.weight === option.weight
                                ? styles.selected
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedWeight(option);
                            }}
                          >
                            {option.label}
                            {option.stock <= 0 && (
                              <span className={styles.outOfStock}>
                                {" "}
                                (Agotado)
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* ✅ SELECTOR DE CANTIDAD HORIZONTAL */}
                {!isOutOfStock && (
                  <div>
                    <label className={styles.quantityLabel}>CANTIDAD</label>
                    <div className={styles.quantitySelector}>
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={styles.quantityBtn}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <div className={styles.quantityDisplay}>
                        <span className={styles.quantity}>{quantity}</span>
                      </div>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(maxQuantity, quantity + 1))
                        }
                        className={styles.quantityBtn}
                        disabled={quantity >= maxQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {!isOutOfStock && (
                  <div className={styles.purchaseSection}>
                    <div className={styles.purchaseActions}>
                      <button
                        onClick={() => {
                          addToCart();
                        }}
                        className={styles.addToCartBtn}
                        disabled={!selectedWeight || selectedWeight.stock === 0}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ BOTONES SIEMPRE VISIBLES */}
                <div className={styles.actionButtons}>
                  <button 
                    onClick={continueShopping}
                    className={styles.continueShoppingBtn}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Seguir Comprando
                  </button>
                  <button 
                    onClick={goToCart}
                    className={styles.goToCartBtn}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Ir al Carrito
                  </button>
                </div>

                {/* ✅ DESCRIPCIÓN DEL PRODUCTO */}
                <div className={styles.productDescription}>
                  <h3>Descripción</h3>
                  <p>{product.description}</p>
                </div>

                {/* ✅ SECCIÓN DE COMPARTIR */}
                <div className={styles.shareProductTitle} >
                <h4>Compartir producto</h4>
                </div>
                
                <div className={styles.shareSection}>
                  
                  {/* Reemplazar toda la sección socialLinks */}
                  <div className={styles.socialLinks}>
                    {/* ✅ Facebook - Azul oficial */}
                    <a
                      href="https://facebook.com/frutossecoschile"
                      className={`${styles.socialLink} ${styles.facebook}`}
                      aria-label="Facebook"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFacebookF />
                    </a>

                    {/* ✅ Instagram - Gradiente oficial */}
                    <a
                      href="https://instagram.com/frutossecoschile"
                      className={`${styles.socialLink} ${styles.instagram}`}
                      aria-label="Instagram"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram />
                    </a>

                    {/* ✅ X (Twitter) - Negro oficial */}
                    <a
                      href="https://x.com/frutossecoschile"
                      className={`${styles.socialLink} ${styles.xTwitter}`}
                      aria-label="X (Twitter)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaXTwitter />
                    </a>

                    {/* ✅ WhatsApp - Verde oficial */}
                    <a
                      href="https://wa.me/56912345678?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20sus%20productos"
                      className={`${styles.socialLink} ${styles.whatsapp}`}
                      aria-label="WhatsApp"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ MODAL DE ZOOM */}
          {showZoomModal && (
            <div
              className={styles.zoomModal}
              // onClick={() => setShowZoomModal(false)}
            >
              <div
                className={styles.zoomContent}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.zoomClose}
                  onClick={() => setShowZoomModal(false)}
                >
                  <FaTimes />
                </button>

                <div className={styles.zoomImageContainer}>
                  <Image
                    src={getCurrentImage()}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-product.jpg";
                    }}
                  />

                  {/* ✅ NAVEGACIÓN EN MODAL DE ZOOM */}
                  {getAllImages(product).length > 1 && (
                    <>
                      <button
                        className={`${styles.zoomArrow} ${styles.zoomArrowLeft}`}
                        onClick={prevImage}
                        aria-label="Imagen anterior"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        className={`${styles.zoomArrow} ${styles.zoomArrowRight}`}
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </div>

                {/* ✅ INDICADORES DE IMAGEN */}
                {getAllImages(product).length > 1 && (
                  <div className={styles.zoomIndicators}>
                    {getAllImages(product).map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.zoomIndicator} ${
                          index === currentImageIndex
                            ? styles.zoomIndicatorActive
                            : ""
                        }`}
                        onClick={() => selectImage(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ SECCIÓN DE PRODUCTOS RECOMENDADOS - IGUAL QUE FEATUREDPRODUCTS */}
          {recommendedProducts.length > 0 && (
            <section className={styles.recommendedSection}>
              <div className={styles.recommendedHeader}>
                <h2 className={styles.recommendedTitle}>
                  Los Favoritos de{" "}
                  <Link href="/" className={styles.navLogo}>
                    <i className="fas fa-seedling"></i>
                    <span>Frutos Secos Premium</span>
                  </Link>
                </h2>
              </div>

              {/* ✅ INDICADOR DE CARGA PARA PRODUCTOS RECOMENDADOS */}
              {loadingRecommended ? (
                <div className={styles.loadingRecommended}>
                  <div className={styles.spinner}></div>
                  <p>Cargando productos recomendados...</p>
                </div>
              ) : (
                <div
                  className={styles.carouselContainer}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  <div className={styles.carouselWrapper}>
                    <div
                      className={styles.carouselTrack}
                      style={{
                        transform: `translateX(-${currentSlide * slideWidth}%)`,
                      }}
                    >
                      {recommendedProducts.map((recProduct, index) => (
                        <div
                          key={recProduct._id}
                          className={styles.carouselSlide}
                          style={{ width: `${slideWidth}%` }}
                        >
                          <div
                            className={styles.productCard}
                            onClick={() => navigateToProduct(recProduct._id)}
                          >
                            <div className={styles.productImageContainer}>
                              <Image
                                src={getProductImage(recProduct)}
                                alt={recProduct.name}
                                fill
                                style={{ objectFit: "cover" }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder-product.jpg";
                                }}
                              />
                              {recProduct.discount > 0 && (
                                <div className={styles.productDiscount}>
                                  -{recProduct.discount}%
                                </div>
                              )}
                              <div className={styles.hoverOverlay}>
                                Ver Producto
                              </div>
                            </div>
                            <div className={styles.productDetails}>
                              <h3 className={styles.productName}>
                                {recProduct.name}
                              </h3>
                              <div className={styles.productPrice}>
                                ${getProductPrice(recProduct).toLocaleString("es-CL")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controles del carrusel */}
                  {recommendedProducts.length > slidesToShow && (
                    <>
                      <button
                        className={`${styles.carouselBtn} ${styles.prevBtn}`}
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        className={`${styles.carouselBtn} ${styles.nextBtn}`}
                        onClick={nextSlide}
                        disabled={currentSlide >= maxSlides}
                      >
                        <FaChevronRight />
                      </button>

                      <div className={styles.carouselIndicators}>
                        {Array.from({ length: maxSlides + 1 }).map((_, index) => (
                          <button
                            key={index}
                            className={`${styles.indicator} ${
                              index === currentSlide ? styles.active : ""
                            }`}
                            onClick={() => goToSlide(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}