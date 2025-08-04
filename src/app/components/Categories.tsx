"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Categories.module.css";
import { useCategories } from "../context/CategoriesContext";

export default function Categories() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando categorías...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <p>Error al cargar categorías: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/productos?categoria=${encodeURIComponent(category.slug)}`}
              className={styles.categoryCard}
              style={{ '--category-index': index } as React.CSSProperties}
            >
              <div className={styles.categoryCircle}>
                <div className={styles.imageContainer}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={120}
                    height={120}
                    className={styles.categoryImage}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>

                <div className={styles.curvedText}>
                  <svg className={styles.textSvg} viewBox="0 0 200 200">
                    <defs>
                      <path
                        id={`circle-${category.slug}`}
                        d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                      />
                    </defs>
                    <text
                      className={styles.circleText}
                      style={{ fill: category.textColor }}
                    >
                      <textPath
                        href={`#circle-${category.slug}`}
                        startOffset="0%"
                      >
                        {category.name.toUpperCase()}
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}