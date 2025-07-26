import express from "express";
import Product from "../backendmodels/Product.js"; // ✅ Agregar .js
const router = express.Router();

// @route   GET api/products
// @desc    Obtener todos los productos
// @access  Public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// @route   GET api/products/:id
// @desc    Obtener un producto por ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.status(500).send("Error del servidor");
  }
});

// @route   GET api/products/category/:category
// @desc    Obtener productos por categoría
// @access  Public
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// @route   GET api/products/featured
// @desc    Obtener productos destacados
// @access  Public
router.get("/featured/items", async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// @route   POST api/products
// @desc    Crear un nuevo producto
// @access  Private (solo admin)
router.post("/", async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    category,
    stock,
    featured,
    discount,
    nutritionalInfo,
  } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category,
      stock,
      featured,
      discount,
      nutritionalInfo,
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// @route   PUT api/products/:id
// @desc    Actualizar un producto
// @access  Private (solo admin)
router.put("/:id", async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.status(500).send("Error del servidor");
  }
});

// @route   DELETE api/products/:id
// @desc    Eliminar un producto
// @access  Private (solo admin)
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    await product.remove();
    res.json({ msg: "Producto eliminado" });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.status(500).send("Error del servidor");
  }
});

// Al final del archivo, cambiar:
export default router; // ✅ Cambiar de module.exports
