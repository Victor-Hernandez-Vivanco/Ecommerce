'use client'

import { useRouter } from 'next/navigation'
import styles from './Hero.module.css'

export default function Hero() {
  const router = useRouter()

  const goToProducts = () => {
    router.push('/productos')
  }

  const goToAbout = () => {
    router.push('/sobre-nosotros')
  }

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Frutos Secos de Calidad Premium</h1>
        <p>
          Descubre nuestra selección de frutos secos naturales, frescos y nutritivos. 
          Directamente del campo a tu mesa, con la mejor calidad garantizada.
        </p>
        <div className={styles.heroButtons}>
          {/* ✅ BOTÓN QUE REDIRIGE A LA PÁGINA DE PRODUCTOS */}
          <button 
            className="btn btn-primary"
            onClick={goToProducts}
          >
            Ver Catálogo
          </button>
          <button 
            className="btn btn-secondary"
            onClick={goToAbout}
          >
            Conocer Más
          </button>
        </div>
      </div>
    </section>
  )
}