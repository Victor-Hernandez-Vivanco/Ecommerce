'use client';
import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
// ✅ Importar React Icons
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function Footer() {

  // ✅ NUEVO: Función para abrir admin en nueva ventana
  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("/admin/login", "_blank", "noopener,noreferrer");
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Información de la empresa */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Frutos Secos Premium</h3>
            <p className={styles.description}>
              Tu tienda de confianza para frutos secos naturales y de la más
              alta calidad. Directamente del campo a tu mesa.
            </p>
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

          {/* Enlaces rápidos */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Enlaces Rápidos</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/" className={styles.footerLink}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className={styles.footerLink}>
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/blog" className={styles.footerLink}>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorías */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Categorías</h4>
            <ul className={styles.linkList}>
              <li>
                <Link
                  href="/productos?categoria=almendras"
                  className={styles.footerLink}
                >
                  Almendras
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=nueces"
                  className={styles.footerLink}
                >
                  Nueces
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=pistachos"
                  className={styles.footerLink}
                >
                  Pistachos
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=avellanas"
                  className={styles.footerLink}
                >
                  Avellanas
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=deshidratados"
                  className={styles.footerLink}
                >
                  Frutos Deshidratados
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Contacto</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <i className="fas fa-map-marker-alt"></i>
                <span>Providencia, Región Metropolitana, Chile</span>
              </div>
              <div className={styles.contactItem}>
                <i className="fas fa-phone"></i>
                <span>+1 234 567 8900</span>
              </div>
              <div className={styles.contactItem}>
                <i className="fas fa-envelope"></i>
                <span>info@frutossecos.com</span>
              </div>
              <div className={styles.contactItem}>
                <i className="fas fa-clock"></i>
                <span>Lun - Sab 9:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className={styles.footerDivider}></div>

        {/* Footer inferior */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>
              &copy; 2025 Frutos Secos Premium. Todos los derechos reservados.
            </p>
            <p>Scope .</p>
          </div>
          <div className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>
              Política de Privacidad
            </a>
            <a href="#" className={styles.legalLink}>
              Términos y Condiciones
            </a>
            <a href="#" className={styles.legalLink}>
              Política de Cookies
            </a>

            {/* ✅ MODIFICADO: Botón de admin que abre en nueva ventana */}
            <button
              onClick={handleAdminClick}
              className={styles.adminButton}
              title="Abrir Panel de Administración"
              aria-label="Abrir Panel de Administración en nueva ventana"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
