const express = require("express");
const router = express.Router();

const Product = require("../models/Product");


// ============================
// ADD PRODUCT
// ============================
router.post("/products", async (req, res) =>  {
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
// GET ALL PRODUCTS
// ============================
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// DELETE PRODUCT
// ============================
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await Product.findByIdAndDelete(id);

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// UPDATE PRODUCT
// ============================
router.put("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, quantity },
      { new: true } // return updated data
    );

    res.json({ message: "Product updated", updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;