import mongoose from "mongoose";

interface ICategory {
  _id?: string; // ✅ Agregar _id opcional
  name: string;
  slug: string;
  color: string;
  image: string;
  textColor: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i,
    },
    image: {
      type: String,
      required: true,
    },
    textColor: {
      type: String,
      required: true,
      default: "#000000",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
export type { ICategory };
