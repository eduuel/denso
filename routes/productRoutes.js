const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");


// ============================
// ➕ ADD PRODUCT (PROTECTED)
// ============================
router.post("/products", auth, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    const product = await Product.create({
      name,
      price,
      quantity
    });

    res.json({ message: "Product added", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// 📦 GET ALL PRODUCTS (PROTECTED)
// ============================
router.get("/products", auth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// 🗑 DELETE PRODUCT (PROTECTED)
// ============================
router.delete("/products/:id", auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// ✏️ UPDATE PRODUCT (PROTECTED)
// ============================
router.put("/products/:id", auth, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity },
      { new: true }
    );

    res.json({ message: "Product updated", updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// EXPORT ROUTER
// ============================
module.exports = router;