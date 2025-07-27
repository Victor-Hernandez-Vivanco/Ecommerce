'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { user } = useAuth();

  // ✅ Debug logs (remover después)
  console.log('Usuario en Footer:', user);
  console.log('Es admin?:', user?.role === 'admin');

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Información de la empresa */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Frutos Secos Premium</h3>
            <p className={styles.description}>
              Tu tienda de confianza para frutos secos naturales y de la más alta calidad. 
              Directamente del campo a tu mesa.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className={styles.socialLink} aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Enlaces Rápidos</h4>
            <ul className={styles.linkList}>
              <li><Link href="/" className={styles.footerLink}>Inicio</Link></li>
              <li><Link href="/productos" className={styles.footerLink}>Productos</Link></li>
              <li><Link href="/about" className={styles.footerLink}>Sobre Nosotros</Link></li>
              <li><Link href="/contact" className={styles.footerLink}>Contacto</Link></li>
              <li><Link href="/blog" className={styles.footerLink}>Blog</Link></li>
            </ul>
          </div>

          {/* Categorías */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Categorías</h4>
            <ul className={styles.linkList}>
              <li><Link href="/productos?categoria=almendras" className={styles.footerLink}>Almendras</Link></li>
              <li><Link href="/productos?categoria=nueces" className={styles.footerLink}>Nueces</Link></li>
              <li><Link href="/productos?categoria=pistachos" className={styles.footerLink}>Pistachos</Link></li>
              <li><Link href="/productos?categoria=avellanas" className={styles.footerLink}>Avellanas</Link></li>
              <li><Link href="/productos?categoria=deshidratados" className={styles.footerLink}>Frutos Deshidratados</Link></li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Contacto</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <i className="fas fa-map-marker-alt"></i>
                <span>Calle Principal 123, Ciudad, País</span>
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
                <span>Lun - Vie: 9:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className={styles.footerDivider}></div>

        {/* Footer inferior */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>&copy; 2024 Frutos Secos Premium. Todos los derechos reservados.</p>
          </div>
          <div className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>Política de Privacidad</a>
            <a href="#" className={styles.legalLink}>Términos y Condiciones</a>
            <a href="#" className={styles.legalLink}>Política de Cookies</a>
            
            {/* ✅ Botón de admin - SIEMPRE VISIBLE */}
            <Link href="/admin/login" className={styles.adminButton}>
              ⚙️
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}