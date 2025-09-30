import mongoose from "mongoose";

// Interfaz para precios por peso
interface IPriceByWeight {
  weight: number;
  price: number;
  stock: number;
}

// Interfaz para imágenes del producto
interface IProductImage {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  isPrimary: boolean;
}

// Esquema para precios por peso
const PriceByWeightSchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

// Esquema para imágenes del producto
const ProductImageSchema = new mongoose.Schema(
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
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// ✅ LIMPIAR MODELO EXISTENTE
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  pricesByWeight: {
    type: [PriceByWeightSchema],
    required: true,
    validate: {
      validator: function (prices: IPriceByWeight[]) {
        return prices && prices.length > 0;
      },
      message: "Debe tener al menos un precio por peso",
    },
  },
  pricePerKilo: {
    type: Number,
    required: true,
    min: 0,
  },
  images: {
    type: [ProductImageSchema],
    required: true,
    validate: {
      validator: function (images: IProductImage[]) {
        return images && images.length > 0 && images.length <= 6;
      },
      message: "Debe tener entre 1 y 6 imágenes",
    },
  },
  // ✅ CAMPOS CALCULADOS - NO REQUERIDOS
  image: {
    type: String,
    required: false,
  },
  basePricePer100g: {
    type: Number,
    required: false,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Frutos Secos",
      "Frutas Deshidratadas",
      "Despensa",
      "Semillas",
      "Mix",
      "Cereales",
      "Snack",
      "Full",
      "Box",
    ],
  },
  // ✅ NUEVO CAMPO PARA MÚLTIPLES CATEGORÍAS
  categories: {
    type: [String],
    required: false,
    validate: {
      validator: function (categories: string[]) {
        const validCategories = [
          "Frutos Secos",
          "Frutas Deshidratadas",
          "Despensa",
          "Semillas",
          "Mix",
          "Cereales",
          "Snack",
          "Full",
          "Box",
        ];
        return categories.every((cat) => validCategories.includes(cat));
      },
      message: "Una o más categorías no son válidas",
    },
  },
  totalStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  // ✅ NUEVOS CAMPOS PARA CARRUSELES
  isAdvertisement: {
    type: Boolean,
    default: false,
  },
  isMainCarousel: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fats: Number,
    carbs: Number,
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

// ✅ MIDDLEWARE PRE-VALIDATE: Calcular campos antes de validación
ProductSchema.pre("validate", function (next) {
  // Calcular precio base por 100g
  if (this.pricePerKilo) {
    this.basePricePer100g = Math.round((this.pricePerKilo * 100) / 1000);
  }

  // Establecer imagen principal
  if (this.images && this.images.length > 0) {
    const primaryImage = this.images.find(
      (img: IProductImage) => img.isPrimary
    );
    this.image = primaryImage ? primaryImage.url : this.images[0].url;
  }

  next();
});

// ✅ MIDDLEWARE PRE-SAVE: Calcular precios y stock
ProductSchema.pre("save", function (next) {
  // Calcular precios automáticamente
  if (this.pricePerKilo && this.pricesByWeight) {
    this.pricesByWeight.forEach((item) => {
      item.price = Math.round((this.pricePerKilo * item.weight) / 1000);
    });

    // Calcular stock total
    this.totalStock = this.pricesByWeight.reduce(
      (total: number, item) => total + item.stock,
      0
    );
  }

  this.updatedAt = new Date();
  next();
});

// ✅ EXPORTAR MODELO LIMPIO
export default mongoose.model("Product", ProductSchema);
