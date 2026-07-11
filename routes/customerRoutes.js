const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (require auth)
router.use(authMiddleware);

// CRUD
router.post("/customers", customerController.createCustomer);
router.get("/customers", customerController.getCustomers);
router.get("/customers/:id", customerController.getCustomerById);
router.put("/customers/:id", customerController.updateCustomer);
router.delete("/customers/:id", customerController.deleteCustomer);

// Ledger & Payment
router.get("/customers/:id/ledger", customerController.getCustomerLedger);
router.post("/customers/:id/payment", customerController.receivePayment);

module.exports = router;
