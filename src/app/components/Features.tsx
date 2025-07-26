'use client'

import styles from './Features.module.css'

const features = [
  {
    icon: 'fas fa-leaf',
    title: '100% Natural',
    description: 'Sin conservantes ni aditivos artificiales'
  },
  {
    icon: 'fas fa-shipping-fast',
    title: 'Envío Rápido',
    description: 'Entrega en 24-48 horas'
  },
  {
    icon: 'fas fa-award',
    title: 'Calidad Premium',
    description: 'Selección cuidadosa de los mejores productos'
  }
]

export default function Features() {
  return (
    <div className={styles.featuresContainer}>
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <i className={feature.icon}></i>
            </div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}