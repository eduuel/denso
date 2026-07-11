const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ["SALE", "PAYMENT"],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  debit: {
    type: Number,
    default: 0
  },
  credit: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can point to Sale ID or just be null for manual payments
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
