const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ""
  },
  address: {
    type: String,
    trim: true,
    default: ""
  },
  company: {
    type: String,
    trim: true,
    default: ""
  },
  notes: {
    type: String,
    trim: true,
    default: ""
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Customer", customerSchema);
