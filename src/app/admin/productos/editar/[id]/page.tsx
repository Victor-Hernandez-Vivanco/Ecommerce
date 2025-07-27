'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../productos.module.css';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  discount: number;
}

export default function EditarProducto() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'Frutos Secos',
    stock: 0,
    featured: false,
    discount: 0
  });
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Frutos Secos',
    'Semillas',
    'Deshidratados',
    'Mixes',
    'Otros'
  ];

  useEffect(() => {
    loadProduct();
  }, );

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
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          featured: product.featured || false,
          discount: product.discount || 0
        });
        setImagePreview(product.image);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Preview de imagen
      if (name === 'image') {
        setImagePreview(value);
      }
    }
    
    // Limpiar error del campo
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

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'La URL de la imagen es requerida';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    if (formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = 'El descuento debe estar entre 0 y 100';
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

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
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

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price" className={styles.label}>
                      Precio (CLP) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                    {errors.price && <span className={styles.errorText}>{errors.price}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="stock" className={styles.label}>
                      Stock *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={`${styles.input} ${errors.stock ? styles.inputError : ''}`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock && <span className={styles.errorText}>{errors.stock}</span>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category" className={styles.label}>
                      Categoría *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
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

                <div className={styles.formGroup}>
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
                </div>
              </div>

              {/* Columna derecha - Imagen */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="image" className={styles.label}>
                    URL de la Imagen *
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.image ? styles.inputError : ''}`}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {errors.image && <span className={styles.errorText}>{errors.image}</span>}
                </div>

                {/* Preview de imagen */}
                <div className={styles.imagePreview}>
                  <label className={styles.label}>Vista Previa</label>
                  <div className={styles.previewContainer}>
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Vista previa"
                        width={300}
                        height={200}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span>📷</span>
                        <p>Vista previa de la imagen</p>
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