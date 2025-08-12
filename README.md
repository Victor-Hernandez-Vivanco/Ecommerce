# 🥜 Ecommerce de Frutos Secos

Una aplicación web moderna de comercio electrónico especializada en la venta de frutos secos, desarrollada con Next.js 15, React 18 y MongoDB Atlas.

## 🚀 Características Principales

### 🛍️ Tienda Online

- **Catálogo de Productos**: Visualización completa con imágenes, descripciones y precios dinámicos
- **Selector de Gramaje**: Opciones múltiples (100g, 250g, 500g, 1kg) con precios por peso
- **Carrito de Compras**: Gestión completa con persistencia en localStorage
- **Proceso de Checkout**: Sistema completo de compra con información de envío
- **Carrusel Principal**: Productos destacados en la página principal
- **Productos Relacionados**: Recomendaciones dinámicas en cada producto
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop
- **Categorías Dinámicas**: Sistema de categorías con imágenes y colores personalizados

### 👨‍💼 Panel de Administración

- **Dashboard Ejecutivo**: Resumen de negocio y accesos rápidos
- **Gestión de Productos**: CRUD completo con subida múltiple de imágenes
- **Control de Inventario**: Gestión de stock por gramaje
- **Gestión de Categorías**: Administración completa de categorías con imágenes
- **Sistema de Carrusel**: Configuración de anuncios y productos destacados
- **Productos Destacados**: Configuración de productos principales
- **Autenticación Segura**: Sistema de tokens JWT para administradores
- **Notificaciones**: Sistema de alertas y confirmaciones

### 🔐 Sistema de Usuarios

- **Registro y Login**: Autenticación completa de usuarios
- **Perfiles de Usuario**: Gestión de información personal
- **Roles y Permisos**: Diferenciación entre usuarios y administradores
- **Verificación de Tokens**: Sistema robusto de autenticación

## 🛠️ Tecnologías Utilizadas

### Frontend

- **Next.js 15** - Framework React con App Router
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript 5** - Tipado estático para mayor robustez
- **CSS Modules** - Estilos modulares y scoped
- **React Hot Toast** - Notificaciones elegantes
- **React Icons** - Iconografía moderna
- **Context API** - Gestión de estado global

### Backend

- **Next.js API Routes** - API RESTful integrada
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas
- **Multer** - Subida de archivos e imágenes

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **TypeScript** - Tipado estático
- **Git** - Control de versiones
- **Vercel** - Plataforma de deployment

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Cuenta en MongoDB Atlas (para producción)
- Cuenta en Vercel (para deployment)

## 🌐 URLs de Acceso

### Desarrollo Local

- **Tienda Principal**: [http://localhost:3000](http://localhost:3000)
- **Panel Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Login Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Producción

- **Tienda Principal**: [https://tu-dominio.vercel.app](https://tu-dominio.vercel.app)
- **Panel Admin**: [https://tu-dominio.vercel.app/admin](https://tu-dominio.vercel.app/admin)

### Seguridad

- Autenticación JWT con expiración automática
- Encriptación de contraseñas con bcrypt (salt rounds: 12)
- Validación de tokens en rutas protegidas
- Middleware de protección para rutas admin
- Validación de entrada en todos los endpoints
- Headers de seguridad configurados

### Deployment

- **Plataforma**: Vercel
- **Base de Datos**: MongoDB Atlas
- **CDN**: Vercel Edge Network
- **SSL**: Certificado automático
- **Dominio**: Personalizable

## 🔄 Flujo de Desarrollo

1. **Desarrollo Local**: Usa MongoDB local para desarrollo
2. **Testing**: Pruebas en entorno local
3. **Build**: Construcción optimizada para producción
4. **Deploy**: Deployment automático en Vercel
5. **Producción**: Conectado a MongoDB Atlas

### Próximas Funcionalidades

- [ ] Sistema de pagos integrado
- [ ] Gestión de pedidos
- [ ] Sistema de reviews y calificaciones
- [ ] Programa de fidelización
- [ ] Chat de soporte en vivo
- [ ] App móvil nativa

### Mejoras Técnicas

- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Optimización de imágenes avanzada
- [ ] PWA (Progressive Web App)
- [ ] Internacionalización (i18n)

---

## 🚀 Workflow de Desarrollo Directo

```bash
# Desarrollar localmente
npm run dev

# 1. Sincronizar todo a Atlas
npm run sync:to-atlas

# 2. Verificar sincronización
npm run verify:sync

# 3. O hacer ambos de una vez
npm run deploy:full

# Deploy a producción
git add .
git commit -m "New features"
git push origin main
```
