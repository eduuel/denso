const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  productName: {
    type: String,
    required: true,
    trim: true
  },

  quantitySold: {
    type: Number,
    required: true,
    min: 1
  },

  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  profit: {
    type: Number,
    required: true
  }

}, {
  timestamps: true   // 🔥 THIS ADDS createdAt & updatedAt AUTOMATICALLY
});

module.exports = mongoose.model("Sale", saleSchema);