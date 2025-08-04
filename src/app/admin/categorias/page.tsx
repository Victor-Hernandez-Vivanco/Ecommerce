"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./categorias.module.css";
import { useCategories } from "../../context/CategoriesContext";

export default function CategoriasAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error, 
    refreshCategories, 
    updateCategory 
  } = useCategories();

  const checkAdminAuth = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem("admin-token");
      if (!adminToken) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/verify", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("admin-token");
        router.push("/admin/login");
        return;
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploadingCategory(categoryId);

    try {
      const adminToken = localStorage.getItem("admin-token");
      if (!adminToken) {
        router.push("/admin/login");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("categoryId", categoryId);

      const response = await fetch("/api/upload/category-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar la categoría con la nueva imagen
        await updateCategory(categoryId, { image: data.imageUrl });
        
        alert("Imagen subida exitosamente");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error de conexión");
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleFileSelect = (
    categoryId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(categoryId, file);
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button onClick={refreshCategories} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin/dashboard" className={styles.backButton}>
              ← Volver al Dashboard
            </Link>
            <h1>Gestión de Categorías</h1>
            <p>Administra las categorías del sitio desde la base de datos</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.categoriesSection}>
          <h2>Categorías Activas ({categories.length})</h2>
          <p className={styles.sectionDescription}>
            Gestiona las categorías desde la base de datos. Los cambios se reflejan automáticamente en todo el sitio.
          </p>

          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <div key={category._id || category.slug} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <h3>{category.name}</h3>
                  <span
                    className={styles.colorBadge}
                    style={{ backgroundColor: category.color }}
                  >
                    {category.color}
                  </span>
                </div>

                <div className={styles.imageContainer}>
                  <div className={styles.imagePreview}>
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={200}
                      height={200}
                      className={styles.categoryImage}
                    />
                    <div className={styles.imageOverlay}>
                      <span className={styles.statusBadge}>
                        ✅ Imagen cargada
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.uploadSection}>
                  <input
                    type="file"
                    id={`upload-${category._id || category.slug}`}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(category._id || category.slug, e)}
                    className={styles.fileInput}
                    disabled={uploadingCategory === (category._id || category.slug)}
                  />
                  <label
                    htmlFor={`upload-${category._id || category.slug}`}
                    className={`${styles.uploadButton} ${
                      uploadingCategory === (category._id || category.slug)
                        ? styles.uploading
                        : ""
                    }`}
                  >
                    {uploadingCategory === (category._id || category.slug) ? (
                      <>🔄 Subiendo...</>
                    ) : (
                      <>🔄 Cambiar imagen</>
                    )}
                  </label>
                </div>

                <div className={styles.categoryInfo}>
                  <p>
                    <strong>ID:</strong> {category._id || 'N/A'}
                  </p>
                  <p>
                    <strong>Slug:</strong> {category.slug}
                  </p>
                  <p>
                    <strong>Orden:</strong> {category.order}
                  </p>
                  <p>
                    <strong>Activa:</strong> {category.isActive ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
