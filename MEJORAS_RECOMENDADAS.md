# 📋 Mejoras Recomendadas para Revisión de Código Experto

## ✅ Ya Completado

- [x] Eliminación de console.log en producción
- [x] Headers de seguridad configurados en next.config.ts
- [x] Rate limiting implementado en middleware
- [x] Validación de tipos con TypeScript

---

## 🔴 PRIORIDAD CRÍTICA

### 1. Seguridad - Variables de Entorno

**Estado:** ⚠️ URGENTE

**Problemas encontrados:**

- ✓ Fallback hardcoded `"tu_jwt_secret"` en 10 archivos
- JWT_SECRET no validado en longitud/complejidad
- Sin validación centralizada de variables de entorno

**Solución implementada:**

- ✓ Creado `src/config/env.ts` para centralizar configuración
- ✓ Creado `.env.example` como template
- 🔧 **TODO:** Reemplazar todos los `process.env.JWT_SECRET || "tu_jwt_secret"` por `env.JWT_SECRET`

**Archivos a actualizar:**

```
src/app/api/auth/login/route.ts
src/app/api/auth/register/route.ts
src/app/api/admin/login/route.ts
src/lib/auth.ts
src/app/api/admin/verify-token/route.ts
src/app/api/admin/verify/route.ts
src/app/api/auth/verify/route.ts
```

---

### 2. Código Comentado - Eliminar Dead Code

**Estado:** 🟡 Alta Prioridad

**Archivos con código comentado:**

1. `src/lib/mongodb.ts` (líneas 1-41) - 41 líneas de código viejo comentado
2. `src/app/admin/dashboard/page.tsx` (líneas 138-173, 263-291) - Secciones comentadas

**Acción:** Eliminar completamente el código comentado

---

## 🟡 PRIORIDAD ALTA

### 3. Testing - Falta Cobertura de Tests

**Estado:** ❌ No implementado

**Problemas:**

- 0 tests unitarios
- 0 tests de integración
- 0 tests E2E

**Recomendación:** Implementar testing con Jest + React Testing Library

**Archivos críticos que necesitan tests:**

- `src/lib/mongodb.ts` - Conexión DB
- `src/app/api/auth/login/route.ts` - Autenticación
- `src/models/Product.ts` - Validación de modelos
- `src/context/CartContext.tsx` - Lógica de carrito

---

### 4. Validación de Datos - Sanitización de Entrada

**Estado:** ⚠️ Parcial

**Problemas:**

- Sin sanitización de HTML/XSS en campos de texto
- Sin validación de longitud máxima en campos
- Sin validación de formato de email consistente

**Recomendación:** Implementar librería de validación (Zod, Yup, o Joi)

**Ejemplo con Zod:**

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6).max(100),
});
```

---

### 5. Manejo de Errores - Inconsistente

**Estado:** ⚠️ Mejorable

**Problemas:**

- Diferentes formatos de respuesta de error
- Algunos endpoints usan `catch (error)`, otros `catch {}`
- Sin logger centralizado para errores

**Recomendación:** Crear utilidad centralizada

**Ejemplo:**

```typescript
// src/utils/apiError.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Log error pero no exponer detalles en producción
  console.error("Unexpected error:", error);

  return NextResponse.json(
    { success: false, message: "Error interno del servidor" },
    { status: 500 }
  );
}
```

---

## 🟢 PRIORIDAD MEDIA

### 6. Documentación - JSDoc

**Estado:** ❌ Falta documentación

**Recomendación:** Agregar JSDoc a funciones públicas y APIs

**Ejemplo:**

````typescript
/**
 * Conecta a la base de datos MongoDB usando Mongoose.
 * Reutiliza conexiones existentes en entornos con Hot Reload.
 *
 * @returns {Promise<Mongoose>} Instancia de Mongoose conectada
 * @throws {Error} Si MONGODB_URI no está definida o falla la conexión
 *
 * @example
 * ```typescript
 * import connectDB from '@/lib/mongodb';
 *
 * export async function GET() {
 *   await connectDB();
 *   // ... tu código
 * }
 * ```
 */
export async function connectDB(): Promise<Mongoose> {
  // ...
}
````

---

### 7. TypeScript - Tipos Más Estrictos

**Estado:** ⚠️ Mejorable

**Problemas encontrados:**

- Uso de `any` en varios lugares: `(global as any).mongoose`
- Interfaces duplicadas entre archivos
- Sin tipos compartidos centralizados

**Recomendación:** Crear directorio `src/types/`

**Ejemplo:**

```typescript
// src/types/models.ts
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  name: string;
  // ...
}

// src/types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

---

### 8. Performance - Optimizaciones

**Estado:** ⚠️ Mejorable

**Áreas de mejora:**

1. **Imágenes:**

   - Implementar lazy loading consistente
   - Usar next/image en todos lados
   - Considerar servir WebP/AVIF

2. **Caché:**

   - Implementar React Query o SWR para caché de API
   - Cache-Control headers en respuestas API

3. **Bundle Size:**
   - Analizar con `@next/bundle-analyzer`
   - Code splitting adicional

**Ejemplo Next.js config:**

```typescript
// next.config.ts
const nextConfig = {
  // ...
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
};
```

---

### 9. Accesibilidad (a11y)

**Estado:** ⚠️ Mejorable

**Checklist:**

- [ ] Atributos ARIA en elementos interactivos
- [ ] Alt text en todas las imágenes
- [ ] Navegación por teclado funcional
- [ ] Contraste de colores WCAG AA
- [ ] Etiquetas semánticas HTML5

**Herramientas recomendadas:**

```bash
npm install -D eslint-plugin-jsx-a11y
npm install -D @axe-core/react
```

---

### 10. Código Duplicado - DRY Principle

**Estado:** ⚠️ Mejorable

**Código duplicado identificado:**

1. **Funciones de precio:** `getProductPrice()` aparece en múltiples archivos
2. **Lógica de autenticación:** `verifyAdminToken()` duplicada
3. **Validación de peso:** Lógica similar en varios componentes

**Recomendación:** Crear utilidades compartidas

```typescript
// src/utils/product.ts
export function getProductPrice(product: Product): number {
  if (product.basePricePer100g) return product.basePricePer100g;
  if (product.pricesByWeight?.length > 0) {
    return Math.min(...product.pricesByWeight.map((p) => p.price));
  }
  return 0;
}

// src/utils/auth.ts
export function verifyAdminToken(request: NextRequest) {
  // Implementación única reutilizable
}
```

---

## 📊 Métricas de Calidad de Código

### Antes de mejoras:

- ✅ Console.log eliminados: 100%
- ⚠️ Cobertura de tests: 0%
- ⚠️ TypeScript strict mode: No
- ⚠️ ESLint warnings: ~15
- ⚠️ Variables de entorno seguras: 60%
- ⚠️ Documentación JSDoc: 10%

### Meta después de mejoras:

- ✅ Console.log eliminados: 100%
- 🎯 Cobertura de tests: >70%
- 🎯 TypeScript strict mode: Sí
- 🎯 ESLint warnings: 0
- 🎯 Variables de entorno seguras: 100%
- 🎯 Documentación JSDoc: >80%

---

## 🚀 Plan de Acción Sugerido

### Semana 1 (CRÍTICO):

1. ✅ Implementar `src/config/env.ts` (HECHO)
2. Reemplazar todos los `"tu_jwt_secret"` por configuración centralizada
3. Eliminar código comentado
4. Generar JWT_SECRET seguro en producción

### Semana 2 (ALTA):

5. Implementar suite de testing básica (Jest + RTL)
6. Agregar validación con Zod en endpoints críticos
7. Centralizar manejo de errores

### Semana 3 (MEDIA):

8. Agregar JSDoc a funciones principales
9. Refactorizar tipos TypeScript
10. Implementar utilidades compartidas (DRY)

### Semana 4 (BAJA):

11. Optimizaciones de performance
12. Mejoras de accesibilidad
13. Documentación adicional

---

## 🛠️ Comandos Útiles

```bash
# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Analizar bundle size
npm install -D @next/bundle-analyzer
ANALYZE=true npm run build

# Lint + Fix
npm run lint -- --fix

# Type check completo
npx tsc --noEmit

# Verificar vulnerabilidades
npm audit
npm audit fix
```

---

## 📚 Recursos Recomendados

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Zod Validation](https://zod.dev/)

---

**Última actualización:** 2025-01-06
**Responsable:** Equipo de Desarrollo
**Prioridad General:** 🔴 CRÍTICA → 🟡 ALTA → 🟢 MEDIA
