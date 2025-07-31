'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './carrusel.module.css';

interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  type: string;
  order: number;
  isActive: boolean;
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

// Componente seguro para imágenes
const SafeImagePreview = ({ src, alt, width, height, className }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isLocalImage = src.startsWith('/');
  
  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };
  
  if (imageError) {
    return (
      <div 
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7fafc',
          border: '2px dashed #e2e8f0',
          borderRadius: '0.25rem',
          color: '#718096',
          fontSize: '0.75rem',
          textAlign: 'center'
        }}
      >
        🚫
      </div>
    );
  }
  
  if (isLocalImage) {
    return (
      <>
        {isLoading && (
          <div style={{ width, height, backgroundColor: '#f0f0f0', borderRadius: '0.25rem' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</div>
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      </>
    );
  } else {
    return (
      <>
        {isLoading && (
          <div style={{ width, height, backgroundColor: '#f0f0f0', borderRadius: '0.25rem' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</div>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={{ 
            objectFit: 'cover',
            borderRadius: '0.25rem',
            border: '1px solid #e2e8f0',
            display: isLoading ? 'none' : 'block'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </>
    );
  }
};

export default function CarruselAdmin() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const loadAdvertisements = useCallback(async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('admin-token');
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('isActive', filter === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`/api/admin/advertisements?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdvertisements(data.advertisements);
      } else {
        console.error('Error cargando advertisements');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('admin-token');
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      await loadAdvertisements();
    } catch (error) {
      console.error('Error:', error);
      router.push('/admin/login');
    }
  }, [router, loadAdvertisements]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [checkAuthAndLoadData]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const adminToken = localStorage.getItem('admin-token');
      
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        await loadAdvertisements();
      } else {
        console.error('Error actualizando estado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteAdvertisement = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicidad?')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('admin-token');
      
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        await loadAdvertisements();
      } else {
        console.error('Error eliminando advertisement');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredAdvertisements = advertisements.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ad.description && ad.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando publicidades...</p>
      </div>
    );
  }

  // ... resto del código JSX sin cambios ...
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin/dashboard" className={styles.backButton}>
              ← Volver al Dashboard
            </Link>
            <h1>Gestión de Carrusel</h1>
            <p>Administra las publicidades del carrusel principal</p>
          </div>
          <div className={styles.headerRight}>
            <Link href="/admin/carrusel/crear" className={styles.createButton}>
              ➕ Nueva Publicidad
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Filtros y búsqueda */}
        <section className={styles.filtersSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar publicidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas ({advertisements.length})
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
              onClick={() => setFilter('active')}
            >
              Activas ({advertisements.filter(ad => ad.isActive).length})
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'inactive' ? styles.active : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactivas ({advertisements.filter(ad => !ad.isActive).length})
            </button>
          </div>
        </section>

        {/* Lista de publicidades */}
        <section className={styles.advertisementsSection}>
          {filteredAdvertisements.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎨</div>
              <h3>No hay publicidades</h3>
              <p>Crea tu primera publicidad para el carrusel</p>
              <Link href="/admin/carrusel/crear" className={styles.createButton}>
                ➕ Crear Publicidad
              </Link>
            </div>
          ) : (
            <div className={styles.advertisementsList}>
              <div className={styles.listHeader}>
                <div className={styles.headerCell}>Imagen</div>
                <div className={styles.headerCell}>Información</div>
                <div className={styles.headerCell}>Tipo</div>
                <div className={styles.headerCell}>Orden</div>
                <div className={styles.headerCell}>Estado</div>
                <div className={styles.headerCell}>Estadísticas</div>
                <div className={styles.headerCell}>Acciones</div>
              </div>
              
              {filteredAdvertisements.map((ad) => (
                <div key={ad._id} className={styles.listRow}>
                  <div className={styles.listCell}>
                    {ad.imageUrl && (
                      <SafeImagePreview
                        src={ad.imageUrl}
                        alt={ad.title}
                        width={80}
                        height={40}
                        className={styles.advertisementImage}
                      />
                    )}
                  </div>
                  
                  <div className={styles.listCell}>
                    <div className={styles.advertisementInfo}>
                      <h4 className={styles.advertisementTitle}>{ad.title}</h4>
                      {ad.description && (
                        <p className={styles.advertisementDescription}>
                          {ad.description.length > 60 
                            ? `${ad.description.substring(0, 60)}...` 
                            : ad.description
                          }
                        </p>
                      )}
                      {ad.linkUrl && (
                        <a 
                          href={ad.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.advertisementLink}
                        >
                          🔗 {ad.linkUrl.length > 30 ? `${ad.linkUrl.substring(0, 30)}...` : ad.linkUrl}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.listCell}>
                    <span className={`${styles.typeTag} ${styles[ad.type]}`}>
                      {ad.type === 'product' && '🛍️ Producto'}
                      {ad.type === 'promotion' && '🎯 Promoción'}
                      {ad.type === 'external' && '🌐 Externo'}
                      {ad.type === 'announcement' && '📢 Anuncio'}
                    </span>
                  </div>
                  
                  <div className={styles.listCell}>
                    <span className={styles.orderNumber}>{ad.order}</span>
                  </div>
                  
                  <div className={styles.listCell}>
                    <button
                      onClick={() => toggleActive(ad._id, ad.isActive)}
                      className={`${styles.statusButton} ${ad.isActive ? styles.active : styles.inactive}`}
                    >
                      {ad.isActive ? '✅ Activa' : '❌ Inactiva'}
                    </button>
                  </div>
                  
                  <div className={styles.listCell}>
                    <div className={styles.stats}>
                      <span>👁️ {ad.views}</span>
                      <span>👆 {ad.clicks}</span>
                    </div>
                  </div>
                  
                  <div className={styles.listCell}>
                    <div className={styles.actions}>
                      <Link 
                        href={`/admin/carrusel/editar/${ad._id}`}
                        className={styles.editButton}
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => deleteAdvertisement(ad._id)}
                        className={styles.deleteButton}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}