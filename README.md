# 🥜 Ecommerce de Frutos Secos

Una aplicación web moderna de comercio electrónico especializada en la venta de frutos secos, desarrollada con Next.js 14 y React.

## 🚀 Características Principales

### Frontend
- **Catálogo de Productos**: Visualización completa de frutos secos con imágenes, precios y descripciones
- **Selector de Gramaje**: Opciones de 100g, 250g, 500g y 1kg con precios dinámicos
- **Carrito de Compras**: Gestión completa de productos seleccionados
- **Checkout Avanzado**: Proceso de compra con múltiples opciones de pago
- **Carrusel de Recomendaciones**: Productos sugeridos en cada página de producto
- **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop

### Backend
- **API RESTful**: Endpoints para productos y autenticación
- **Base de Datos**: Configuración con MongoDB
- **Autenticación**: Sistema de usuarios y sesiones
- **Gestión de Productos**: CRUD completo para el inventario

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework de React con App Router
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **CSS Modules** - Estilos modulares y scoped
- **Context API** - Gestión de estado global

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- MongoDB (local o Atlas)

### Instalación del Frontend

```bash
# Clonar el repositorio
git clone https://github.com/Victor-Hernandez-Vivanco/Ecommerce.git
cd web_frutos_secos

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Instalación del Backend

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar el servidor
npm start
```

### Variables de Entorno

Crea un archivo `.env` en el directorio backend:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/frutos_secos
JWT_SECRET=tu_jwt_secret_aqui
NODE_ENV=development
```

## 🌐 URLs de Acceso

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📱 Funcionalidades Detalladas

### Página Principal
- Hero section con productos destacados
- Navegación intuitiva
- Productos recomendados

### Catálogo de Productos
- Grid responsivo de productos
- Filtros y búsqueda
- Paginación

### Página de Producto Individual
- Galería de imágenes
- Selector de gramaje (100g, 250g, 500g, 1kg)
- Selector de cantidad
- Información nutricional
- Productos relacionados en carrusel

### Carrito de Compras
- Visualización de productos seleccionados
- Modificación de cantidades
- Cálculo automático de totales
- Eliminación de productos

### Proceso de Checkout
- **Paso 1**: Revisión del pedido
- **Paso 2**: Información de envío
  - Envío a domicilio
  - Retiro en tienda
- **Paso 3**: Métodos de pago
  - WebPay Plus
  - Mercado Pago
  - Transferencia bancaria

## 🎨 Estructura del Proyecto
