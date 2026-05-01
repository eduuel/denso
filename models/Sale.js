const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  productName: String,
  quantitySold: Number,
  sellingPrice: Number,
  totalAmount: Number,
  profit: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Sale", saleSchema);