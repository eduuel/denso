const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// 💰 GET TOTAL PROFIT
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    let totalProfit = 0;

    products.forEach(p => {
      totalProfit += p.price * p.quantity;
    });

    res.json({ totalProfit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;