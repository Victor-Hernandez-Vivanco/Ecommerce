"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./categorias.module.css";

interface Category {
  name: string;
  slug: string;
  color: string;
  image: string;
  textColor: string;
  hasImage: boolean;
}

const categories: Category[] = [
  {
    name: "* Frutos Secos *",
    slug: "Frutos Secos",
    color: "#4ECDC4",
    image: "/uploads/categories/frutos-secos.png",
    textColor: "#FFFFFF",
    hasImage: false,
  },
  {
    name: "* Frutas Deshidratadas *",
    slug: "Frutas Deshidratadas",
    color: "#D4A574",
    image: "/uploads/categories/frutas-deshidratadas.png",
    textColor: "#FFFFFF",
    hasImage: false,
  },
  {
    name: "* Despensa *",
    slug: "Despensa",
    color: "#E91E63",
    image: "/uploads/categories/despensa-des.png",
    textColor: "#FFFFFF",
    hasImage: false,
  },
  {
    name: "* Semillas *",
    slug: "Semillas",
    color: "#8BC34A",
    image: "/uploads/categories/semillas.png",
    textColor: "#FFFFFF",
    hasImage: false,
  },
  {
    name: "* Mix *",
    slug: "Mix",
    color: "#FF9800",
    image: "/uploads/categories/mix.png",
    textColor: "#FFFFFF",
    hasImage: false,
  },
  {
    name: "* Cereales *",
    slug: "Cereales",
    color: "#8D6E63",
    image: "/uploads/categories/cereales.png",
    textColor: "#FFFFFF",
    hasImage: false,
  },
  {
    name: "* Snack *",
    slug: "Snack",
    color: "#8D6E63",
    image: "/uploads/categories/snack.png",
    textColor: "#FFFFFF",
    hasImage: false,
  },
];

export default function CategoriasAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categoriesState, setCategoriesState] =
    useState<Category[]>(categories);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(
    null
  );

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

  const checkExistingImages = useCallback(async () => {
    const updatedCategories = await Promise.all(
      categories.map(async (category) => {
        try {
          const response = await fetch(category.image, { method: "HEAD" });
          return {
            ...category,
            hasImage: response.ok,
          };
        } catch {
          return {
            ...category,
            hasImage: false,
          };
        }
      })
    );
    setCategoriesState(updatedCategories);
  }, []);

  useEffect(() => {
    checkAdminAuth();
    checkExistingImages();
  }, [checkAdminAuth, checkExistingImages]);

  const handleImageUpload = async (category: Category, file: File) => {
    setUploadingCategory(category.slug);

    try {
      const adminToken = localStorage.getItem("admin-token");
      if (!adminToken) {
        router.push("/admin/login");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("categoryName", category.slug);

      const response = await fetch("/api/upload/category-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Actualizar el estado de la categoría
        setCategoriesState((prev) =>
          prev.map((cat) =>
            cat.slug === category.slug
              ? { ...cat, hasImage: true, image: data.imageUrl }
              : cat
          )
        );

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
    category: Category,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(category, file);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Verificando acceso...</p>
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
            <p>Administra las imágenes de las categorías del sitio</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.categoriesSection}>
          <h2>Imágenes de Categorías</h2>
          <p className={styles.sectionDescription}>
            Sube las imágenes para cada categoría. Las imágenes deben ser
            cuadradas (recomendado: 300x300px) y en formato JPG, PNG o WebP.
          </p>

          <div className={styles.categoriesGrid}>
            {categoriesState.map((category) => (
              <div key={category.slug} className={styles.categoryCard}>
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
                  {category.hasImage ? (
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
                  ) : (
                    <div className={styles.placeholderImage}>
                      <div className={styles.placeholderIcon}>📷</div>
                      <p>Sin imagen</p>
                    </div>
                  )}
                </div>

                <div className={styles.uploadSection}>
                  <input
                    type="file"
                    id={`upload-${category.slug}`}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(category, e)}
                    className={styles.fileInput}
                    disabled={uploadingCategory === category.slug}
                  />
                  <label
                    htmlFor={`upload-${category.slug}`}
                    className={`${styles.uploadButton} ${
                      uploadingCategory === category.slug
                        ? styles.uploading
                        : ""
                    }`}
                  >
                    {uploadingCategory === category.slug ? (
                      <>🔄 Subiendo...</>
                    ) : category.hasImage ? (
                      <>🔄 Cambiar imagen</>
                    ) : (
                      <>📤 Subir imagen</>
                    )}
                  </label>
                </div>

                <div className={styles.categoryInfo}>
                  <p>
                    <strong>Slug:</strong> {category.slug}
                  </p>
                  <p>
                    <strong>Ruta:</strong> {category.image}
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
