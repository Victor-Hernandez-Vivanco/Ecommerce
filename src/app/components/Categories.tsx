"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Categories.module.css";

interface Category {
  name: string;
  slug: string;
  color: string;
  image: string;
  textColor: string;
}

const categories: Category[] = [
  {
    name: "* Frutos Secos *",
    slug: "FrutosSecos",
    color: "#4ECDC4",
    image: "/uploads/categories/frutos-secos.png",
    textColor: "#FFFFFF",
  },
  {
    name: "* Frutas Deshidratadas *",
    slug: "FrutasDeshidratadas",
    color: "#D4A574",
    image: "/uploads/categories/frutas-deshidratadas.png",
    textColor: "#FFFFFF",
  },
  {
    name: "* Despensa *",
    slug: "Despensa",
    color: "#E91E63",
    image: "/uploads/categories/despensa.png",
    textColor: "#FFFFFF",
  },
  {
    name: "* Semillas *",
    slug: "Semillas",
    color: "#8BC34A",
    image: "/uploads/categories/semillas.png",
    textColor: "#FFFFFF",
  },
  {
    name: "* Mix *",
    slug: "Mix",
    color: "#FF9800",
    image: "/uploads/categories/mix.png",
    textColor: "#FFFFFF",
  },
  {
    name: "* Cereales *",
    slug: "Cereales",
    color: "#8D6E63",
    image: "/uploads/categories/cereales.png",
    textColor: "#FFFFFF",
  },
  {
    name: "* Snack *",
    slug: "Snack",
    color: "#FF9800",
    image: "/uploads/categories/snack.png",
    textColor: "#FFFFFF",
  },
];

export default function Categories() {
  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        {/* <h2 className={styles.title}>Explora Nuestras Categorías</h2>
        <p className={styles.subtitle}>Encuentra exactamente lo que buscas</p> */}

        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/productos?categoria=${encodeURIComponent(category.slug)}`}
              className={styles.categoryCard}
            >
              <div
                className={styles.categoryCircle}
                style={{
                  backgroundColor: category.color,
                  borderColor: category.color,
                }}
              >
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

                {/* Texto curvado alrededor del círculo */}
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
