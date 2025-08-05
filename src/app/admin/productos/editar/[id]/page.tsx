'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './editar.module.css';

interface PriceByWeight {
  weight: number;
  price: number;
  stock: number;
}

interface ProductImage {
  file?: File;
  preview?: string;
  url?: string;
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
  const [newImages, setNewImages] = useState<ProductImage[]>([]);
  
  // Función para formatear números al estilo chileno
  const formatChileanNumber = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  
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

  // ✅ USAR useCallback PARA loadProduct
  const loadProduct = useCallback(async () => {
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
  }, [productId, router]); // ✅ INCLUIR DEPENDENCIAS

  useEffect(() => {
    loadProduct();
  }, [loadProduct]); // ✅ INCLUIR loadProduct EN DEPENDENCIAS

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

  // ✅ MANEJAR MÚLTIPLES IMÁGENES NUEVAS
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const totalImages = formData.images.length + newImages.length + files.length;
    if (totalImages > 6) {
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
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          uploadDate: new Date(),
          isPrimary: formData.images.length === 0 && newImages.length === 0 && index === 0
        };
        
        setNewImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Limpiar error
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  // ✅ ELIMINAR IMAGEN EXISTENTE
  const removeExistingImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    
    // Si eliminamos la imagen principal, hacer principal la primera disponible
    if (formData.images[index].isPrimary) {
      if (newImages.length > 0) {
        newImages[0].isPrimary = true;
      } else if (newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  // ✅ ELIMINAR IMAGEN NUEVA
  const removeNewImage = (index: number) => {
    const updatedNewImages = newImages.filter((_, i) => i !== index);
    
    // Si eliminamos la imagen principal nueva, hacer principal la primera disponible
    if (newImages[index].isPrimary) {
      if (formData.images.length > 0) {
        const updatedExistingImages = formData.images.map((img, i) => ({
          ...img,
          isPrimary: i === 0
        }));
        setFormData(prev => ({ ...prev, images: updatedExistingImages }));
      } else if (updatedNewImages.length > 0) {
        updatedNewImages[0].isPrimary = true;
      }
    }
    
    setNewImages(updatedNewImages);
  };

  // ✅ ESTABLECER IMAGEN PRINCIPAL (EXISTENTE)
  const setPrimaryExistingImage = (index: number) => {
    const updatedImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    
    const updatedNewImages = newImages.map(img => ({
      ...img,
      isPrimary: false
    }));
    
    setFormData(prev => ({ ...prev, images: updatedImages }));
    setNewImages(updatedNewImages);
  };

  // ✅ ESTABLECER IMAGEN PRINCIPAL (NUEVA)
  const setPrimaryNewImage = (index: number) => {
    const updatedExistingImages = formData.images.map(img => ({
      ...img,
      isPrimary: false
    }));
    
    const updatedNewImages = newImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    
    setFormData(prev => ({ ...prev, images: updatedExistingImages }));
    setNewImages(updatedNewImages);
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

      // ✅ SUBIR NUEVAS IMÁGENES SI LAS HAY
      let uploadedImages: any[] = [];
      if (newImages.length > 0) {
        const formDataImages = new FormData();
        newImages.forEach((imageData) => {
          if (imageData.file) {
            formDataImages.append('images', imageData.file);
          }
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          body: formDataImages
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          uploadedImages = uploadResult.images.map((img: any, index: number) => ({
            ...img,
            isPrimary: newImages[index].isPrimary
          }));
        } else {
          throw new Error('Error al subir las nuevas imágenes');
        }
      }

      // Calcular stock total
      const totalStock = formData.pricesByWeight.reduce((sum, item) => sum + item.stock, 0);

      // ✅ COMBINAR IMÁGENES EXISTENTES Y NUEVAS
      const allImages = [...formData.images, ...uploadedImages];

      const productData = {
        name: formData.name,
        description: formData.description,
        pricePerKilo: formData.pricePerKilo,
        pricesByWeight: formData.pricesByWeight,
        images: allImages,
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
            <div className={styles.headerTitle}>
              <h1>Editar Producto</h1>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formContainer}>
          <form id="productForm" onSubmit={handleSubmit} className={styles.productForm}>
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
                    <div className={styles.pricesHeader}>
                      <span className={styles.headerLabel}>Peso</span>
                      <span className={styles.headerLabel}>Precio</span>
                      <span className={styles.headerLabel}>Stock</span>
                    </div>
                    {formData.pricesByWeight.map((priceWeight, index) => (
                      <div key={index} className={styles.priceRow}>
                        <div className={styles.weightInfo}>
                          <span className={styles.weightLabel}>
                            {AVAILABLE_WEIGHTS.find(w => w.value === priceWeight.weight)?.label}
                          </span>
                        </div>
                        <div className={styles.priceDisplay}>
                          <span className={styles.calculatedPrice}>
                            ${formatChileanNumber(priceWeight.price)}
                          </span>
                        </div>
                        <div className={styles.stockInput}>
                          <input
                            type="number"
                            placeholder="Stock"
                            value={priceWeight.stock}
                            onChange={(e) => handleStockChange(index, parseInt(e.target.value) || 0)}
                            className={styles.stockInputField}
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
                      <span>Mostrar en anuncios del carrusel principal</span>
                    </label>
                    
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isMainCarousel"
                        checked={formData.isMainCarousel}
                        onChange={handleInputChange}
                        className={styles.checkbox}
                      />
                      <span>Mostrar en el carrusel principal</span>
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

                {/* ✅ PREVIEW DE IMÁGENES EXISTENTES */}
                {formData.images.length > 0 && (
                  <div className={styles.imagesGrid}>
                    <label className={styles.label}>Imágenes Existentes ({formData.images.length}/6)</label>
                    <div className={styles.imagesList}>
                      {formData.images.map((imageData, index) => (
                        <div key={index} className={styles.imageItem}>
                          <div className={styles.imageContainer}>
                            <Image
                              src={imageData.url || '/placeholder-image.jpg'}
                              alt={`Imagen ${index + 1}`}
                              width={150}
                              height={100}
                              className={styles.previewImage}
                            />
                            {imageData.isPrimary && (
                              <span className={styles.primaryBadge}>Principal</span>
                            )}
                          </div>
                          <div className={styles.imageInfo}>
                            <span className={styles.imageName}>{imageData.originalName}</span>
                            <span className={styles.imageSize}>({(imageData.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <div className={styles.imageActions}>
                            {!imageData.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryExistingImage(index)}
                                className={styles.primaryBtn}
                                title="Establecer como imagen principal"
                              >
                                ⭐
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className={styles.removeBtn}
                              title="Eliminar imagen"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ PREVIEW DE NUEVAS IMÁGENES */}
                {newImages.length > 0 && (
                  <div className={styles.imagesGrid}>
                    <label className={styles.label}>Nuevas Imágenes ({newImages.length}/6)</label>
                    <div className={styles.imagesList}>
                      {newImages.map((imageData, index) => (
                        <div key={`new-${index}`} className={styles.imageItem}>
                          <div className={styles.imageContainer}>
                            <Image
                              src={imageData.preview || '/placeholder-image.jpg'}
                              alt={`Nueva imagen ${index + 1}`}
                              width={150}
                              height={100}
                              className={styles.previewImage}
                            />
                            {imageData.isPrimary && (
                              <span className={styles.primaryBadge}>Principal</span>
                            )}
                          </div>
                          <div className={styles.imageInfo}>
                            <span className={styles.imageName}>{imageData.originalName}</span>
                            <span className={styles.imageSize}>({(imageData.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <div className={styles.imageActions}>
                            {!imageData.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryNewImage(index)}
                                className={styles.primaryBtn}
                                title="Establecer como imagen principal"
                              >
                                ⭐
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className={styles.removeBtn}
                              title="Eliminar imagen"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ PLACEHOLDER CUANDO NO HAY IMÁGENES */}
                {formData.images.length === 0 && newImages.length === 0 && (
                  <div className={styles.noImages}>
                    <span>📷</span>
                    <p>No hay imágenes subidas</p>
                    <small>Selecciona archivos para ver la vista previa</small>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ BOTONES DE ACCIÓN */}
            <div className={styles.submitSection}>
              <Link href="/admin/productos" className={styles.cancelBtn}>
                Cancelar
              </Link>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}