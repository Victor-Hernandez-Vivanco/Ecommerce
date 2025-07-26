import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Frutos Secos de Calidad Premium</h1>
        <p>
          Descubre nuestra selección de frutos secos naturales, frescos y nutritivos. 
          Directamente del campo a tu mesa, con la mejor calidad garantizada.
        </p>
        <div className={styles.heroButtons}>
          <button className="btn btn-primary">Ver Catálogo</button>
          <button className="btn btn-secondary">Conocer Más</button>
        </div>
      </div>
    </section>
  )
}