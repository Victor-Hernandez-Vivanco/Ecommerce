'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../productos.module.css';

interface PriceByWeight {
  weight: number;
  price: number;
  stock: number;
}

interface ProductImage {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  isPrimary: boolean;
}

interface ProductForm {
  name: string;
  description: string;
  pricePerKilo: number;
  pricesByWeight: PriceByWeight[];
  images: ProductImage[];
  category: string;
  categories: string[];
  featured: boolean;
  isAdvertisement: boolean;
  isMainCarousel: boolean;
  discount: number;
}

// ✅ CATEGORÍAS ACTUALIZADAS
const categories = [
  'Frutos Secos',
  'Frutas Deshidratadas',
  'Despensa',
  'Semillas',
  'Mix',
  'Cereales',
  'Snack',
  'Full',
  'Box'
];

export default function EditarProducto() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    pricePerKilo: 0,
    pricesByWeight: [
      { weight: 100, price: 0, stock: 0 },
      { weight: 250, price: 0, stock: 0 },
      { weight: 500, price: 0, stock: 0 },
      { weight: 1000, price: 0, stock: 0 }
    ],
    images: [],
    category: 'Frutos Secos',
    categories: ['Frutos Secos'],
    featured: false,
    isAdvertisement: false,
    isMainCarousel: false,
    discount: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ PESOS ESTÁNDAR DISPONIBLES
  const AVAILABLE_WEIGHTS = [
    { value: 100, label: '100g' },
    { value: 250, label: '250g' },
    { value: 500, label: '500g' },
    { value: 1000, label: '1kg' }
  ];

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const adminToken = localStorage.getItem('admin-token');
      
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/products/${productId}`);
      
      if (response.ok) {
        const product = await response.json();
        setFormData({
          name: product.name,
          description: product.description,
          pricePerKilo: product.pricePerKilo || 0,
          pricesByWeight: product.pricesByWeight || [
            { weight: 100, price: 0, stock: 0 },
            { weight: 250, price: 0, stock: 0 },
            { weight: 500, price: 0, stock: 0 },
            { weight: 1000, price: 0, stock: 0 }
          ],
          images: product.images || [],
          category: product.category,
          categories: product.categories || [product.category],
          featured: product.featured || false,
          isAdvertisement: product.isAdvertisement || false,
          isMainCarousel: product.isMainCarousel || false,
          discount: product.discount || 0
        });
      } else {
        alert('Producto no encontrado');
        router.push('/admin/productos');
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      alert('Error al cargar el producto');
      router.push('/admin/productos');
    } finally {
      setLoading(false);
    }
  };

  // ✅ MANEJAR SELECCIÓN MÚLTIPLE DE CATEGORÍAS
  const handleCategoryChange = (category: string, isChecked: boolean) => {
    if (isChecked) {
      const newCategories = [...formData.categories, category];
      setFormData(prev => ({
        ...prev,
        categories: newCategories,
        category: newCategories[0]
      }));
    } else {
      const newCategories = formData.categories.filter(cat => cat !== category);
      setFormData(prev => ({
        ...prev,
        categories: newCategories,
        category: newCategories[0] || 'Frutos Secos'
      }));
    }
  };

  // ✅ CALCULAR PRECIOS AUTOMÁTICAMENTE
  const calculatePrices = (pricePerKilo: number) => {
    const newPrices = formData.pricesByWeight.map(item => ({
      ...item,
      price: Math.round((pricePerKilo * item.weight) / 1000)
    }));
    setFormData(prev => ({ ...prev, pricesByWeight: newPrices }));
  };

  // ✅ MANEJAR CAMBIO DE PRECIO POR KILO
  const handlePricePerKiloChange = (value: number) => {
    setFormData(prev => ({ ...prev, pricePerKilo: value }));
    calculatePrices(value);
  };

  // ✅ MANEJAR CAMBIOS EN STOCK
  const handleStockChange = (index: number, stock: number) => {
    const newPrices = [...formData.pricesByWeight];
    newPrices[index] = { ...newPrices[index], stock };
    setFormData(prev => ({ ...prev, pricesByWeight: newPrices }));
  };

  // ✅ MANEJAR CAMBIOS EN INPUTS
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      
      if (name === 'pricePerKilo') {
        handlePricePerKiloChange(numValue);
      } else {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.pricePerKilo <= 0) {
      newErrors.pricePerKilo = 'El precio por kilo debe ser mayor a 0';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'Debe seleccionar al menos una categoría';
    }

    if (formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = 'El descuento debe estar entre 0 y 100';
    }

    const totalStock = formData.pricesByWeight.reduce((sum, item) => sum + item.stock, 0);
    if (totalStock <= 0) {
      newErrors.stock = 'Debe tener stock en al menos un peso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const adminToken = localStorage.getItem('admin-token');
      
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      // Calcular stock total
      const totalStock = formData.pricesByWeight.reduce((sum, item) => sum + item.stock, 0);

      const productData = {
        name: formData.name,
        description: formData.description,
        pricePerKilo: formData.pricePerKilo,
        pricesByWeight: formData.pricesByWeight,
        images: formData.images,
        category: formData.category,
        categories: formData.categories,
        totalStock,
        featured: formData.featured,
        isAdvertisement: formData.isAdvertisement,
        isMainCarousel: formData.isMainCarousel,
        discount: formData.discount
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        alert('✅ Producto actualizado exitosamente');
        router.push('/admin/productos');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo actualizar el producto'}`);
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin/productos" className={styles.backBtn}>
              ← Volver a Productos
            </Link>
            <h1>✏️ Editar Producto</h1>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.productForm}>
            <div className={styles.formGrid}>
              {/* Columna izquierda */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Ej: Almendras Premium"
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.label}>
                    Descripción *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                    placeholder="Describe el producto..."
                    rows={4}
                  />
                  {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                </div>

                {/* ✅ PRECIO POR KILO CON STEP=10 */}
                <div className={styles.formGroup}>
                  <label htmlFor="pricePerKilo" className={styles.label}>
                    Precio por Kilo (CLP) *
                  </label>
                  <input
                    type="number"
                    id="pricePerKilo"
                    name="pricePerKilo"
                    value={formData.pricePerKilo}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.pricePerKilo ? styles.inputError : ''}`}
                    placeholder="0"
                    min="0"
                    step="10"
                  />
                  {errors.pricePerKilo && <span className={styles.errorText}>{errors.pricePerKilo}</span>}
                </div>

                {/* ✅ PRECIOS CALCULADOS Y STOCK */}
                <div className={styles.pricesSection}>
                  <h3 className={styles.sectionTitle}>💰 Precios Calculados y Stock</h3>
                  <div className={styles.pricesGrid}>
                    {formData.pricesByWeight.map((item, index) => (
                      <div key={item.weight} className={styles.priceItem}>
                        <div className={styles.weightLabel}>
                          {AVAILABLE_WEIGHTS.find(w => w.value === item.weight)?.label}
                        </div>
                        <div className={styles.priceValue}>
                          ${item.price.toLocaleString()} CLP
                        </div>
                        <div className={styles.stockInput}>
                          <label>Stock:</label>
                          <input
                            type="number"
                            value={item.stock}
                            onChange={(e) => handleStockChange(index, parseInt(e.target.value) || 0)}
                            className={styles.input}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ✅ SELECCIÓN MÚLTIPLE DE CATEGORÍAS */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Categorías * (Selecciona una o más)</label>
                  <div className={styles.categoriesGrid}>
                    {categories.map(category => (
                      <label key={category} className={styles.categoryItem}>
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={(e) => handleCategoryChange(category, e.target.checked)}
                          className={styles.categoryCheckbox}
                        />
                        <span className={styles.categoryLabel}>{category}</span>
                      </label>
                    ))}
                  </div>
                  {errors.categories && <span className={styles.errorText}>{errors.categories}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="discount" className={styles.label}>
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.discount ? styles.inputError : ''}`}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  {errors.discount && <span className={styles.errorText}>{errors.discount}</span>}
                </div>

                {/* ✅ OPCIONES DE VISUALIZACIÓN */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Opciones de Visualización</label>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className={styles.checkbox}
                      />
                      <span>Marcar como producto destacado</span>
                    </label>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isAdvertisement"
                        checked={formData.isAdvertisement}
                        onChange={handleInputChange}
                        className={styles.checkbox}
                      />
                      <span>Agregar como publicidad (carrusel del inicio)</span>
                    </label>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isMainCarousel"
                        checked={formData.isMainCarousel}
                        onChange={handleInputChange}
                        className={styles.checkbox}
                      />
                      <span>Agregar al carrusel del producto principal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Imágenes */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Imágenes del Producto</label>
                  <div className={styles.imagesSection}>
                    {formData.images.length > 0 && (
                      <div className={styles.imagesList}>
                        {formData.images.map((image, index) => (
                          <div key={index} className={styles.imageItem}>
                            <div className={styles.imagePreview}>
                              <Image
                                src={image.url}
                                alt={`Imagen ${index + 1}`}
                                width={150}
                                height={150}
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.jpg';
                                }}
                              />
                              {image.isPrimary && (
                                <div className={styles.primaryBadge}>Principal</div>
                              )}
                            </div>
                            <div className={styles.imageInfo}>
                              <p className={styles.imageName}>{image.originalName}</p>
                              <p className={styles.imageSize}>
                                {(image.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.images.length === 0 && (
                      <div className={styles.noImages}>
                        <span>📷</span>
                        <p>No hay imágenes cargadas</p>
                        <p className={styles.note}>Las imágenes se gestionan desde la creación del producto</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className={styles.formActions}>
              <Link href="/admin/productos" className={styles.cancelBtn}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={styles.submitBtn}
              >
                {saving ? '🔄 Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}