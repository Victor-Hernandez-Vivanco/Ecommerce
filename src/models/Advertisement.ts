// Modelo para anuncios

import mongoose from "mongoose";

// Interfaz para imágenes del advertisement
interface IAdvertisementImage {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
}

// Esquema para imágenes del advertisement
const AdvertisementImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Limpiar modelo existente si existe
if (mongoose.models.Advertisement) {
  delete mongoose.models.Advertisement;
}

const AdvertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: false,
    maxlength: 200,
  },
  // Imagen subida al servidor
  image: {
    type: AdvertisementImageSchema,
    required: false,
  },
  // URL de imagen (externa o local)
  imageUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (url: string) {
        if (!url) return true; // Opcional

        // ✅ REGEX CORREGIDA: Acepta URLs externas Y rutas locales
        const externalUrlRegex =
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        const localPathRegex =
          /^\/[a-zA-Z0-9\/_\-\.]+\.(jpg|jpeg|png|webp|gif)$/i;

        return externalUrlRegex.test(url) || localPathRegex.test(url);
      },
      message:
        "URL de imagen no válida. Use una URL completa (https://...) o una ruta local (/uploads/...)",
    },
  },
  // URL de destino al hacer clic
  linkUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (url: string) {
        if (!url) return true; // Opcional

        // ✅ REGEX CORREGIDA: Acepta URLs externas Y rutas locales
        const externalUrlRegex =
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        const localPathRegex = /^\/[a-zA-Z0-9\/_\-\.]*$/;

        return externalUrlRegex.test(url) || localPathRegex.test(url);
      },
      message:
        "URL de destino no válida. Use una URL completa (https://...) o una ruta local (/productos/...)",
    },
  },
  // Orden de aparición en el carrusel
  order: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Estado activo/inactivo
  isActive: {
    type: Boolean,
    default: true,
  },
  // Tipo de advertisement
  type: {
    type: String,
    enum: ["product", "promotion", "external", "announcement"],
    default: "promotion",
  },
  // Fechas de vigencia
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  // Estadísticas
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ VALIDACIÓN CORREGIDA: Más flexible
AdvertisementSchema.pre("validate", function (next) {
  // Solo requerir imagen si no hay imageUrl Y no hay image
  if (!this.image && !this.imageUrl) {
    this.invalidate(
      "imageUrl",
      "Debe proporcionar una imagen subida o una URL de imagen"
    );
  }
  next();
});

// Actualizar updatedAt antes de guardar
AdvertisementSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Índices para optimizar consultas
AdvertisementSchema.index({ isActive: 1, order: 1 });
AdvertisementSchema.index({ startDate: 1, endDate: 1 });

export interface IAdvertisement extends mongoose.Document {
  title: string;
  description?: string;
  image?: IAdvertisementImage;
  imageUrl?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
  type: "product" | "promotion" | "external" | "announcement";
  startDate?: Date;
  endDate?: Date;
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export default mongoose.model<IAdvertisement>(
  "Advertisement",
  AdvertisementSchema
);
