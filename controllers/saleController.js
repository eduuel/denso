const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const LedgerEntry = require("../models/LedgerEntry");
const { logActivity } = require("./activityController");

// =========================
// 💸 RECORD A SALE
// =========================
exports.createSale = async (req, res) => {
  try {
    const { productId, quantitySold, sellingPrice, customerId, paymentMethod, amountPaid, customerName } = req.body;

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

    // Customer validation for credit
    let customer = null;
    const finalPaymentMethod = paymentMethod || "Paid";
    
    if (finalPaymentMethod !== "Paid") {
      if (!customerId) {
        return res.status(400).json({ error: "Customer must be selected for Credit or Partial Payment" });
      }
      customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
    } else if (customerId) {
      customer = await Customer.findById(customerId);
    }

    const totalAmount = quantitySold * sellingPrice;
    const costPrice = product.price;
    const profit = (sellingPrice - costPrice) * quantitySold;
    
    let paid = finalPaymentMethod === "Paid" ? totalAmount : Number(amountPaid || 0);
    if (finalPaymentMethod === "Credit") paid = 0;
    
    let balanceAmount = totalAmount - paid;
    if (balanceAmount < 0) balanceAmount = 0; // Prevent negative balances from overpayment on sale

    // Deduct stock
    product.quantity -= quantitySold;
    await product.save();

    const sale = await Sale.create({
      productId,
      customerId: customer ? customer._id : null,
      customerName: customer ? customer.name : (customerName || "Guest"),
      paymentMethod: finalPaymentMethod,
      amountPaid: paid,
      balanceAmount: balanceAmount,
      productName: product.name,
      quantitySold: Number(quantitySold),
      sellingPrice: Number(sellingPrice),
      totalAmount,
      profit
    });

    // Ledger & Customer Balance logic
    if (customer && balanceAmount > 0) {
      customer.balance += balanceAmount;
      await customer.save();

      await LedgerEntry.create({
        customerId: customer._id,
        type: "SALE",
        description: `Sale of ${quantitySold}x ${product.name}`,
        debit: balanceAmount, // They owe us this much more now
        credit: 0,
        balance: customer.balance,
        refId: sale._id
      });
    }

    await logActivity(req.user?.email || "Unknown User", "SELL_PRODUCT", `Sold ${quantitySold}x ${product.name} for ${totalAmount} Birr. Method: ${finalPaymentMethod}`);

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
    const sales = await Sale.find().populate("customerId", "name phone").sort({ createdAt: -1 });
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
