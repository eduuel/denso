const Customer = require("../models/Customer");
const LedgerEntry = require("../models/LedgerEntry");
const { logActivity } = require("./activityController");

// =========================
// CREATE CUSTOMER
// =========================
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, company, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and Phone are required" });
    }

    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ error: "Customer with this phone number already exists" });
    }

    const customer = new Customer({
      name, phone, email, address, company, notes
    });

    await customer.save();
    await logActivity(req.user?.email || "Unknown", "CREATE_CUSTOMER", `Created customer ${name}`);

    res.status(201).json({ message: "Customer created successfully", customer });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// =========================
// GET ALL CUSTOMERS
// =========================
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// =========================
// GET CUSTOMER BY ID
// =========================
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// =========================
// UPDATE CUSTOMER
// =========================
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, company, notes, status } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, address, company, notes, status },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer updated successfully", customer });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// =========================
// DELETE CUSTOMER
// =========================
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    if (customer.balance > 0) {
      return res.status(400).json({ error: "Cannot delete customer with outstanding balance" });
    }

    await Customer.findByIdAndDelete(req.params.id);
    
    // Optionally delete ledger entries, but keeping them might be good for history.
    // For now, let's delete them to avoid orphaned data.
    await LedgerEntry.deleteMany({ customerId: req.params.id });

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// =========================
// RECEIVE PAYMENT
// =========================
exports.receivePayment = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const customerId = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Process payment
    customer.balance -= Number(amount);
    await customer.save();

    // Create Ledger Entry
    const ledgerEntry = new LedgerEntry({
      customerId: customer._id,
      type: "PAYMENT",
      description: description || "Payment Received",
      debit: 0,
      credit: Number(amount),
      balance: customer.balance
    });
    
    await ledgerEntry.save();
    
    await logActivity(req.user?.email || "Unknown", "RECEIVE_PAYMENT", `Received ${amount} from ${customer.name}`);

    res.json({ message: "Payment received successfully", customer, ledgerEntry });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// =========================
// GET CUSTOMER LEDGER
// =========================
exports.getCustomerLedger = async (req, res) => {
  try {
    const ledger = await LedgerEntry.find({ customerId: req.params.id })
      .sort({ date: -1, createdAt: -1 });
    res.json(ledger);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
