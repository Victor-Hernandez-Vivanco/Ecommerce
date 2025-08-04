import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // ← Agregar esta línea
import { CategoriesProvider } from "./context/CategoriesContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frutos Secos",
  description: "Tienda de frutos secos y productos naturales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <CategoriesProvider>
              {children}
            </CategoriesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}