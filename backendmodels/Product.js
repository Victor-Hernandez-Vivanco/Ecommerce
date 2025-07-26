import mongoose from "mongoose";

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
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Frutos Secos", "Semillas", "Deshidratados", "Mixes", "Otros"],
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  featured: {
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
});
export default mongoose.model("Product", ProductSchema);
