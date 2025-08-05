"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./crear.module.css";

interface FormData {
  title: string;
  description: string;
  type: string;
  order: number;
  isActive: boolean;
  imageUrl: string;
  linkUrl: string;
}

interface FormErrors {
  title?: string;
  type?: string;
  order?: string;
  image?: string;
  linkUrl?: string;
}

// Componente seguro que no crashea
const SafeImagePreview = ({
  src,
  alt,
  width,
  height,
  className,
  onError,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  onError?: (error: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isLocalImage = src.startsWith("/");

  const handleImageError = (errorMsg: string) => {
    setImageError(true);
    setIsLoading(false);
    onError?.(errorMsg);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  if (imageError) {
    return (
      <div
        className={`${className} ${styles.errorPlaceholder}`}
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7fafc",
          border: "2px dashed #e2e8f0",
          borderRadius: "0.5rem",
          color: "#718096",
          fontSize: "0.875rem",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚫</div>
          <div>Error cargando imagen</div>
          <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
            URL no válida o dominio no permitido
          </div>
        </div>
      </div>
    );
  }

  if (isLocalImage) {
    return (
      <>
        {isLoading && (
          <div className={styles.loadingPlaceholder} style={{ width, height }}>
            <div className={styles.spinner}></div>
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          onLoad={handleImageLoad}
          onError={() => handleImageError("Error cargando imagen local")}
          style={{ display: isLoading ? "none" : "block" }}
        />
      </>
    );
  } else {
    return (
      <>
        {isLoading && (
          <div className={styles.loadingPlaceholder} style={{ width, height }}>
            <div className={styles.spinner}></div>
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={{
            objectFit: "cover",
            borderRadius: "0.5rem",
            border: "1px solid #e2e8f0",
            display: isLoading ? "none" : "block",
          }}
          onLoad={handleImageLoad}
          onError={() =>
            handleImageError("Dominio no permitido o imagen no accesible")
          }
          unoptimized // Add unoptimized prop for external URLs
        />
      </>
    );
  }
};

export default function CrearPublicidad() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    type: "",
    order: 1,
    isActive: true,
    imageUrl: "",
    linkUrl: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    } else if (formData.title.length < 3) {
      newErrors.title = "El título debe tener al menos 3 caracteres";
    } else if (formData.title.length > 100) {
      newErrors.title = "El título no puede exceder 100 caracteres";
    }

    if (!formData.type) {
      newErrors.type = "El tipo es requerido";
    }

    if (formData.order < 1) {
      newErrors.order = "El orden debe ser mayor a 0";
    }

    if (!formData.imageUrl && !imagePreview) {
      newErrors.image = "Debe proporcionar una imagen o URL";
    }

    if (formData.linkUrl && !isValidUrl(formData.linkUrl)) {
      newErrors.linkUrl = "La URL no es válida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Manejo de archivos
  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: "Formato no válido. Use JPG, PNG o WebP" });
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "El archivo debe ser menor a 5MB" });
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setErrors({ ...errors, image: undefined });
    };
    reader.readAsDataURL(file);

    // Simular upload
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simular progreso
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        throw new Error("Error subiendo archivo");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ ...errors, image: "Error subiendo la imagen" });
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const adminToken = localStorage.getItem("admin-token");

      const submitData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        order: formData.order,
        isActive: formData.isActive,
        ...(formData.imageUrl && { imageUrl: formData.imageUrl }),
        ...(formData.linkUrl && { linkUrl: formData.linkUrl }),
      };

      const response = await fetch("/api/admin/advertisements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push("/admin/carrusel?success=created");
      } else {
        const errorData = await response.json();
        setErrors({
          title: errorData.message || "Error creando la publicidad",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ title: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/carrusel" className={styles.backButton}>
          ← Volver a Carrusel
        </Link>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>Crear Nueva Publicidad</h1>
            <p>Agrega una nueva publicidad al carrusel principal</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información Básica */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Información Básica</h2>

            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Título *
                <span className={styles.charCount}>
                  {formData.title.length}/100
                </span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`${styles.input} ${
                  errors.title ? styles.error : ""
                }`}
                placeholder="Título de la publicidad"
                maxLength={100}
              />
              {errors.title && (
                <span className={styles.errorText}>{errors.title}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Descripción
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={styles.textarea}
                placeholder="Descripción opcional de la publicidad"
                rows={3}
                maxLength={300}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="type" className={styles.label}>
                  Tipo *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className={`${styles.select} ${
                    errors.type ? styles.error : ""
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="product">🛍️ Producto</option>
                  <option value="promotion">🎯 Promoción</option>
                  <option value="external">🌐 Externo</option>
                  <option value="announcement">📢 Anuncio</option>
                </select>
                {errors.type && (
                  <span className={styles.errorText}>{errors.type}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="order" className={styles.label}>
                  Orden *
                </label>
                <input
                  type="number"
                  id="order"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                  className={`${styles.input} ${
                    errors.order ? styles.error : ""
                  }`}
                  min="1"
                  max="100"
                />
                {errors.order && (
                  <span className={styles.errorText}>{errors.order}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Estado</label>
              <div className={styles.toggleContainer}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className={styles.toggle}
                />
                <label htmlFor="isActive" className={styles.toggleLabel}>
                  {formData.isActive ? "✅ Activa" : "❌ Inactiva"}
                </label>
              </div>
            </div>
          </section>

          {/* Imagen */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Imagen del Carrusel</h2>
            <p className={styles.imageInfo}>
              <strong>Dimensiones recomendadas:</strong> 1920x600px (ratio 16:5)
              <br />
              📁 <strong>Formatos:</strong> JPG, PNG, WebP |{" "}
              <strong>Tamaño máximo:</strong> 5MB
            </p>

            <div className={styles.imageOptions}>
              <button
                type="button"
                onClick={() => setUseExternalUrl(false)}
                className={`${styles.optionButton} ${
                  !useExternalUrl ? styles.active : ""
                }`}
              >
                Subir Archivo
              </button>
              <button
                type="button"
                onClick={() => setUseExternalUrl(true)}
                className={`${styles.optionButton} ${
                  useExternalUrl ? styles.active : ""
                }`}
              >
                URL Externa
              </button>
            </div>

            {!useExternalUrl ? (
              <div
                className={`${styles.dropZone} ${
                  dragActive ? styles.dragActive : ""
                } ${errors.image ? styles.error : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) =>
                    e.target.files && handleFileSelect(e.target.files[0])
                  }
                  className={styles.hiddenInput}
                />

                {imagePreview ? (
                  <div className={styles.imagePreview}>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={300}
                      height={94}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview("");
                        setFormData({ ...formData, imageUrl: "" });
                      }}
                      className={styles.removeButton}
                    >
                      🗑️ Cambiar
                    </button>
                  </div>
                ) : (
                  <div className={styles.dropContent}>
                    <div className={styles.dropIcon}>📤</div>
                    <p>
                      <strong>Arrastra una imagen aquí</strong>
                    </p>
                    <p>o haz clic para seleccionar</p>
                    <small>JPG, PNG, WebP - Máximo 5MB</small>
                  </div>
                )}

                {uploadProgress > 0 && (
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label htmlFor="imageUrl" className={styles.label}>
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className={styles.input}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.imageUrl && (
                  <div className={styles.urlPreview}>
                    <SafeImagePreview
                      src={formData.imageUrl}
                      alt="Preview URL"
                      width={300}
                      height={94}
                      className={styles.previewImage}
                      onError={(error) => {
                        setErrors({ ...errors, image: error });
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {errors.image && (
              <span className={styles.errorText}>{errors.image}</span>
            )}
          </section>

          {/* URL de Destino */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>URL de Destino</h2>
            <div className={styles.formGroup}>
              <label htmlFor="linkUrl" className={styles.label}>
                URL de Destino (Opcional)
              </label>
              <input
                type="url"
                id="linkUrl"
                value={formData.linkUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkUrl: e.target.value })
                }
                className={`${styles.input} ${
                  errors.linkUrl ? styles.error : ""
                }`}
                placeholder="https://ejemplo.com/destino"
              />
              {errors.linkUrl && (
                <span className={styles.errorText}>{errors.linkUrl}</span>
              )}
              <small className={styles.helpText}>
                URL a la que se redirigirá cuando se haga clic en la publicidad
              </small>
            </div>
          </section>

          {/* Botones */}
          <div className={styles.formActions}>
            <Link href="/admin/carrusel" className={styles.cancelButton}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Guardando...
                </>
              ) : (
                "Crear Publicidad"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
