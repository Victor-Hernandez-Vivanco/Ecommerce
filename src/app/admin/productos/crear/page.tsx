'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../productos.module.css';

interface PriceByWeight {
  weight: number;
  price: number;
  stock: number;
}

interface ProductImage {
  file: File;
  preview: string;
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
  // ✅ NUEVOS CAMPOS PARA CARRUSELES
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

export default function CrearProducto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    // ✅ NUEVOS CAMPOS INICIALIZADOS
    isAdvertisement: false,
    isMainCarousel: false,
    discount: 0
  });

  // ✅ MANEJAR SELECCIÓN MÚLTIPLE DE CATEGORÍAS
  const handleCategoryChange = (category: string, isChecked: boolean) => {
    if (isChecked) {
      // Agregar categoría
      const newCategories = [...formData.categories, category];
      setFormData(prev => ({
        ...prev,
        categories: newCategories,
        category: newCategories[0] // La primera será la principal
      }));
    } else {
      // Remover categoría
      const newCategories = formData.categories.filter(cat => cat !== category);
      setFormData(prev => ({
        ...prev,
        categories: newCategories,
        category: newCategories[0] || 'Frutos Secos' // Fallback si se queda vacío
      }));
    }
  };

  // ✅ PESOS ESTÁNDAR DISPONIBLES
  const AVAILABLE_WEIGHTS = [
    { value: 100, label: '100g' },
    { value: 250, label: '250g' },
    { value: 500, label: '500g' },
    { value: 1000, label: '1kg' }
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // ✅ MANEJAR MÚLTIPLES IMÁGENES
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.images.length + files.length > 6) {
      setErrors(prev => ({ ...prev, images: 'Máximo 6 imágenes permitidas' }));
      return;
    }

    files.forEach((file, index) => {
      // Validar tipo de archivo
      const allowedTypes = ['image/svg+xml', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, images: 'Tipo de archivo no válido. Use SVG, JPG, PNG o WebP.' }));
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'Archivo demasiado grande. Máximo 5MB por imagen.' }));
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ProductImage = {
          file,
          preview: e.target?.result as string,
          isPrimary: formData.images.length === 0 && index === 0
        };
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
      };
      reader.readAsDataURL(file);
    });

    // Limpiar error
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  // ✅ ELIMINAR IMAGEN
  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    
    // Si eliminamos la imagen principal, hacer principal la primera
    if (formData.images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  // ✅ ESTABLECER IMAGEN PRINCIPAL
  const setPrimaryImage = (index: number) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setFormData(prev => ({ ...prev, images: newImages }));
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
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ VALIDACIÓN MEJORADA PARA MÚLTIPLES CATEGORÍAS
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
  
    // ✅ VALIDAR CATEGORÍAS MÚLTIPLES
    if (formData.categories.length === 0) {
      newErrors.categories = 'Debe seleccionar al menos una categoría';
    }
  
    // Validar que al menos un peso tenga stock
    const hasStock = formData.pricesByWeight.some(p => p.stock > 0);
    if (!hasStock) {
      newErrors.stock = 'Debe especificar stock para al menos un peso';
    }
  
    // Validar imágenes
    if (formData.images.length === 0) {
      newErrors.images = 'Debe subir al menos una imagen';
    }
  
    if (formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = 'El descuento debe estar entre 0 y 100';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SUBIR MÚLTIPLES IMÁGENES Y CREAR PRODUCTO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const adminToken = localStorage.getItem('admin-token');
      
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      // ✅ SUBIR TODAS LAS IMÁGENES
      const uploadedImages = [];
      
      for (const imageData of formData.images) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageData.file);
        formDataUpload.append('productName', formData.name);

        const uploadResponse = await fetch('/api/upload/product-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          body: formDataUpload
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedImages.push({
            url: uploadData.imageUrl,
            originalName: imageData.file.name,
            size: imageData.file.size,
            mimeType: imageData.file.type,
            uploadDate: new Date(),
            isPrimary: imageData.isPrimary
          });
        } else {
          throw new Error(`Error al subir imagen: ${imageData.file.name}`);
        }
      }

      // ✅ CREAR PRODUCTO CON NUEVOS CAMPOS
      const productData = {
        name: formData.name,
        description: formData.description,
        pricePerKilo: formData.pricePerKilo,
        pricesByWeight: formData.pricesByWeight,
        images: uploadedImages,
        category: formData.category,
        categories: formData.categories,
        featured: formData.featured,
        // ✅ NUEVOS CAMPOS PARA CARRUSELES
        isAdvertisement: formData.isAdvertisement,
        isMainCarousel: formData.isMainCarousel,
        discount: formData.discount
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        router.push('/admin/productos');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo crear el producto'}`);
      }
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin/productos" className={styles.backBtn}>
              ← Volver a Productos
            </Link>
            <h1>➕ Crear Nuevo Producto</h1>
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

                {/* ✅ PRECIO POR KILO CON STEP DE 10 */}
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
                    placeholder="Ej: 15000"
                    min="0"
                    step="10"
                  />
                  {errors.pricePerKilo && <span className={styles.errorText}>{errors.pricePerKilo}</span>}
                  <small className={styles.helpText}>
                    Los precios para otros gramajes se calcularán automáticamente
                  </small>
                </div>

                {/* ✅ PRECIOS CALCULADOS AUTOMÁTICAMENTE */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Precios Calculados y Stock *
                  </label>
                  <div className={styles.pricesContainer}>
                    {formData.pricesByWeight.map((priceWeight, index) => (
                      <div key={index} className={styles.priceRow}>
                        <div className={styles.weightInfo}>
                          <span className={styles.weightLabel}>
                            {AVAILABLE_WEIGHTS.find(w => w.value === priceWeight.weight)?.label}
                          </span>
                        </div>
                        <div className={styles.priceDisplay}>
                          <span className={styles.calculatedPrice}>
                            ${priceWeight.price.toLocaleString()} CLP
                          </span>
                        </div>
                        <div className={styles.stockInput}>
                          <input
                            type="number"
                            placeholder="Stock"
                            value={priceWeight.stock}
                            onChange={(e) => handleStockChange(index, parseInt(e.target.value) || 0)}
                            className={styles.input}
                            min="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.stock && <span className={styles.errorText}>{errors.stock}</span>}
                </div>

                {/* ✅ NUEVA SECCIÓN PARA MÚLTIPLES CATEGORÍAS */}
                <div className={styles.formRow}>
                  {/* ✅ REEMPLAZAR EL SELECT POR SELECTOR MÚLTIPLE */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Categorías * (Selecciona una o más)
                    </label>
                    <div className={styles.categoriesGrid}>
                      {categories.map(category => (
                        <label key={category} className={styles.categoryCheckbox}>
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(category)}
                            onChange={(e) => handleCategoryChange(category, e.target.checked)}
                            className={styles.checkbox}
                          />
                          <span className={styles.categoryLabel}>{category}</span>
                        </label>
                      ))}
                    </div>
                    {formData.categories.length === 0 && (
                      <span className={styles.errorText}>Debe seleccionar al menos una categoría</span>
                    )}
                    {errors.categories && <span className={styles.errorText}>{errors.categories}</span>}
                    <small className={styles.helpText}>
                      Categoría principal: <strong>{formData.category}</strong>
                    </small>
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
                      <span>Agregar como publicidad (carrusel del home)</span>
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
                {/* ✅ MÚLTIPLES IMÁGENES */}
                <div className={styles.formGroup}>
                  <label htmlFor="images" className={styles.label}>
                    Imágenes del Producto * (Máximo 6)
                  </label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept=".svg,.jpg,.jpeg,.png,.webp,image/svg+xml,image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className={`${styles.fileInput} ${errors.images ? styles.inputError : ''}`}
                  />
                  {errors.images && <span className={styles.errorText}>{errors.images}</span>}
                  <small className={styles.helpText}>
                    Formatos: SVG, JPG, PNG, WebP. Máximo 5MB por imagen.
                  </small>
                </div>

                {/* ✅ PREVIEW DE IMÁGENES */}
                {formData.images.length > 0 && (
                  <div className={styles.imagesGrid}>
                    <label className={styles.label}>Imágenes Subidas ({formData.images.length}/6)</label>
                    <div className={styles.imagesList}>
                      {formData.images.map((imageData, index) => (
                        <div key={index} className={styles.imageItem}>
                          <div className={styles.imagePreview}>
                            <Image
                              src={imageData.preview}
                              alt={`Imagen ${index + 1}`}
                              width={150}
                              height={100}
                              style={{ objectFit: 'cover' }}
                            />
                            {imageData.isPrimary && (
                              <span className={styles.primaryBadge}>Principal</span>
                            )}
                          </div>
                          <div className={styles.imageActions}>
                            {!imageData.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className={styles.setPrimaryBtn}
                                title="Establecer como imagen principal"
                              >
                                ⭐
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className={styles.removeImageBtn}
                              title="Eliminar imagen"
                            >
                              🗑️
                            </button>
                          </div>
                          <small className={styles.imageInfo}>
                            {imageData.file.name}
                            <br />
                            ({(imageData.file.size / 1024 / 1024).toFixed(2)} MB)
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.images.length === 0 && (
                  <div className={styles.noImagesPlaceholder}>
                    <span>📷</span>
                    <p>No hay imágenes subidas</p>
                    <small>Selecciona archivos para ver la vista previa</small>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className={styles.formActions}>
              <Link href="/admin/productos" className={styles.cancelBtn}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? '🔄 Creando...' : '✅ Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}