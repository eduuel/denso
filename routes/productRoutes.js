const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ============================
// 📦 PRODUCT ROUTES
// ============================

// Public/View-Only routes (Requires authentication only)
router.get("/products", auth, productController.getProducts);

// Admin-Only routes (Requires authentication AND admin role)
router.post("/products", auth, admin, productController.addProduct);
router.put("/products/:id", auth, admin, productController.updateProduct);
router.delete("/products/:id", auth, admin, productController.deleteProduct);

module.exports = router;