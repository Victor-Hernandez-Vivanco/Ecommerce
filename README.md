# 🥜 Ecommerce de Frutos Secos

Una aplicación web moderna de comercio electrónico especializada en la venta de frutos secos, desarrollada con Next.js 14, React y MongoDB.

## 🚀 Características Principales

### 🛍️ Tienda Online

- **Catálogo de Productos**: Visualización completa con imágenes, descripciones y precios dinámicos
- **Selector de Gramaje**: Opciones múltiples (100g, 250g, 500g, 1kg) con precios por peso
- **Carrito de Compras**: Gestión completa con persistencia en localStorage
- **Proceso de Checkout**: Sistema completo de compra con información de envío
- **Carrusel Principal**: Productos destacados en la página principal
- **Productos Relacionados**: Recomendaciones dinámicas en cada producto
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop

### 👨‍💼 Panel de Administración

- **Dashboard Ejecutivo**: Resumen de negocio y accesos rápidos
- **Gestión de Productos**: CRUD completo con subida de imágenes
- **Control de Inventario**: Gestión de stock por gramaje
- **Categorías Múltiples**: Asignación de productos a múltiples categorías
- **Productos Destacados**: Configuración de carrusel principal
- **Autenticación Segura**: Sistema de tokens JWT para administradores
- **Notificaciones**: Sistema de alertas para tokens expirados

### 🔐 Sistema de Usuarios

- **Registro y Login**: Autenticación completa de usuarios
- **Perfiles de Usuario**: Gestión de información personal
- **Roles y Permisos**: Diferenciación entre usuarios y administradores

## 🛠️ Tecnologías Utilizadas

### Frontend

- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para mayor robustez
- **CSS Modules** - Estilos modulares y scoped
- **React Hot Toast** - Notificaciones elegantes
- **Context API** - Gestión de estado global

### Backend

- **Next.js API Routes** - API RESTful integrada
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas
- **Multer** - Subida de archivos

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **TypeScript** - Tipado estático
- **Git** - Control de versiones

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- MongoDB (local o MongoDB Atlas)

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd web_frutos_secos

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Configuración de Base de Datos

1. **MongoDB Local**: Asegúrate de tener MongoDB ejecutándose localmente
2. **MongoDB Atlas**: Crea una cuenta y obtén la URI de conexión
3. **Configuración**: La aplicación se conectará automáticamente a MongoDB

## 🌐 URLs de Acceso

- **Tienda Principal**: [http://localhost:3000](http://localhost:3000)
- **Panel Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Login Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 📱 Funcionalidades Detalladas

### 🏠 Página Principal

- Hero section con carrusel de productos destacados
- Navegación intuitiva con categorías
- Grid de productos recomendados
- Footer informativo

### 📦 Gestión de Productos

- **Catálogo Público**: Grid responsivo con filtros
- **Página Individual**: Galería de imágenes, selector de gramaje, información detallada
- **Admin - Lista**: Tabla completa con imagen, ID, nombre, descripción, categorías, precio, stock y acciones
- **Admin - Crear/Editar**: Formulario completo con subida múltiple de imágenes

### 🛒 Carrito y Checkout

- **Carrito**: Visualización, modificación de cantidades, cálculo de totales
- **Checkout**: Proceso paso a paso con información de envío y contacto
- **Persistencia**: Datos guardados en localStorage

### 👨‍💼 Panel de Administración

- **Dashboard**: Resumen ejecutivo con accesos rápidos
- **Gestión de Productos**: CRUD completo con interfaz intuitiva
- **Subida de Imágenes**: Sistema robusto con validaciones
- **Autenticación**: Login seguro con verificación de tokens

## 🎨 Estructura del Proyecto

web_frutos_secos/
├── src/
│ └── app/
│ ├── admin/ # Panel de administración
│ │ ├── dashboard/ # Dashboard principal
│ │ ├── login/ # Login de admin
│ │ └── productos/ # Gestión de productos
│ ├── api/ # API Routes
│ │ ├── admin/ # Endpoints de admin
│ │ ├── auth/ # Autenticación
│ │ ├── products/ # Gestión de productos
│ │ └── upload/ # Subida de archivos
│ ├── carrito/ # Carrito de compras
│ ├── checkout/ # Proceso de compra
│ ├── components/ # Componentes reutilizables
│ ├── context/ # Context providers
│ ├── hooks/ # Custom hooks
│ ├── login/ # Login de usuarios
│ ├── productos/ # Catálogo público
│ └── utils/ # Utilidades
├── src/lib/ # Configuraciones
├── src/models/ # Modelos de MongoDB
├── public/ # Archivos estáticos
│ └── uploads/ # Imágenes subidas
└── scripts/ # Scripts de utilidad

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción
npm run lint         # Linter de código

# Scripts de utilidad
node create-admin.js     # Crear usuario administrador
node create-products.js  # Poblar base de datos con productos
node clear-products.js   # Limpiar productos de la base de datos
```

## 🔧 Configuración Inicial

### Crear Administrador

```bash
node create-admin.js
```

### Poblar Base de Datos

```bash
node create-products.js
```

## 📊 Características Técnicas

### Seguridad

- Autenticación JWT con expiración
- Encriptación de contraseñas con bcrypt
- Validación de tokens en rutas protegidas
- Middleware de protección para rutas admin

### Performance

- Imágenes optimizadas con Next.js Image
- Lazy loading de componentes
- CSS Modules para estilos optimizados
- API Routes optimizadas

### UX/UI

- Diseño responsivo mobile-first
- Notificaciones toast elegantes
- Loading states en todas las operaciones
- Manejo de errores user-friendly

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Victor Hernández Vivanco**

- GitHub: [@Victor-Hernandez-Vivanco](https://github.com/Victor-Hernandez-Vivanco)

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda, no dudes en abrir un issue en el repositorio.

---

⭐ ¡No olvides dar una estrella al proyecto si te ha sido útil!
