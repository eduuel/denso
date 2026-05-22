const Sale = require("../models/Sale");
const Product = require("../models/Product");

// =========================
// 💸 RECORD A SALE
// =========================
exports.createSale = async (req, res) => {
  try {
    const { productId, quantitySold, sellingPrice } = req.body;

    // Validation
    if (!productId || quantitySold === undefined || sellingPrice === undefined) {
      return res.status(400).json({ error: "Product ID, quantity, and selling price are required" });
    }

    if (quantitySold <= 0 || sellingPrice < 0) {
      return res.status(400).json({ error: "Invalid quantity or selling price" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity < quantitySold) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    const totalAmount = quantitySold * sellingPrice;
    const costPrice = product.price;
    const profit = (sellingPrice - costPrice) * quantitySold;

    // Deduct stock
    product.quantity -= quantitySold;
    await product.save();

    const sale = await Sale.create({
      productId,
      productName: product.name,
      quantitySold: Number(quantitySold),
      sellingPrice: Number(sellingPrice),
      totalAmount,
      profit
    });

    res.status(201).json({ message: "Sale recorded", sale });

  } catch (err) {
    res.status(500).json({ error: "Failed to record sale", details: err.message });
  }
};

// =========================
// 📈 GET ALL SALES
// =========================
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales", details: err.message });
  }
};

// =========================
// 💰 GET TOTAL PROFIT
// =========================
exports.getProfit = async (req, res) => {
  try {
    const sales = await Sale.find();
    const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    res.json({ totalProfit });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate profit", details: err.message });
  }
};
