const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Product = require("../models/Product");

/* =========================
   CREATE SALE
========================= */
router.post("/sell", async (req, res) => {
  try {
    const { productId, quantitySold, sellingPrice } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity < quantitySold) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    const totalAmount = quantitySold * sellingPrice;
    const costPrice = product.price;
    const profit = (sellingPrice - costPrice) * quantitySold;

    product.quantity -= quantitySold;
    await product.save();

    const sale = await Sale.create({
      productId,
      productName: product.name,
      quantitySold,
      sellingPrice,
      totalAmount,
      profit
    });

    res.json({ message: "Sale recorded", sale });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET ALL SALES
========================= */
router.get("/sales", async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   TOTAL PROFIT
========================= */
router.get("/profit", async (req, res) => {
  try {
    const sales = await Sale.find();
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    res.json({ totalProfit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DAILY SALES
========================= */
router.get("/sales/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
      date: { $gte: today }
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   MONTHLY PROFIT
========================= */
router.get("/profit/month", async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
      date: { $gte: start }
    });

    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

    res.json({ monthlyProfit: totalProfit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   EXPORT
========================= */
module.exports = router;