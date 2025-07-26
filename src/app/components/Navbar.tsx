'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  
  const { user, isAuthenticated, login, register, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.navLogo} onClick={closeMenu}>
            <i className="fas fa-seedling"></i>
            <span>Frutos Secos Premium</span>
          </Link>
          
          <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink} onClick={closeMenu}>
                Inicio
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/productos" className={styles.navLink} onClick={closeMenu}>
                Productos
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/sobre-nosotros" className={styles.navLink} onClick={closeMenu}>
                Sobre Nosotros
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/contacto" className={styles.navLink} onClick={closeMenu}>
                Contacto
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/carrito" className={`${styles.navLink} ${styles.cartLink}`} onClick={closeMenu}>
                <i className="fas fa-shopping-cart"></i>
                <span className={styles.cartCount}>{cartCount}</span>
              </Link>
            </li>
          </ul>
          
          <div className={styles.authSection}>
            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <span className={styles.welcomeText}>
                  <i className="fas fa-user"></i>
                  Hola, {user?.name}
                </span>
                <button 
                  className={`${styles.authBtn} ${styles.logoutBtn}`}
                  onClick={logout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <>
                <button 
                  className={`${styles.authBtn} ${styles.loginBtn}`}
                  onClick={() => setShowLoginModal(true)}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Iniciar Sesión</span>
                </button>
                <button 
                  className={`${styles.authBtn} ${styles.registerBtn}`}
                  onClick={() => setShowRegisterModal(true)}
                >
                  <i className="fas fa-user-plus"></i>
                  <span>Registrarse</span>
                </button>
              </>
            )}
          </div>
          
          <div 
            className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
            onClick={toggleMenu}
          >
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={login}
        onSwitchToRegister={handleSwitchToRegister}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={register}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  )
}