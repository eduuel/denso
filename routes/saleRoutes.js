const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ============================
// 📊 SALES ROUTES
// ============================

// Anyone authenticated can record a sale (or maybe just admins? The user said non-admin users cannot add/edit/delete products, but didn't restrict selling. We will restrict selling to admin if we follow "access protected analytics". Let's restrict it to admin to be safe, but wait, the old code allowed anyone to sell? Actually, the user said "admin only can add products" in old App.js, but sell was allowed? No, sell was next to delete which had an admin check. So yes, admin only.)
router.post("/sell", auth, admin, saleController.createSale);

// Analytics and viewing history is protected
router.get("/sales", auth, saleController.getSales);
router.get("/profit", auth, admin, saleController.getProfit);

module.exports = router;