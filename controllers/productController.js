const Product = require("../models/Product");
const { cloudinary } = require("../middleware/uploadMiddleware");

// ============================
// ➕ ADD PRODUCT
// ============================
exports.addProduct = async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validation
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: "Name, price, and quantity are required" });
    }
    
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ error: "Price and quantity cannot be negative" });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      quantity: Number(quantity),
      imageUrl: req.file ? req.file.path : null,
      imageId: req.file ? req.file.filename : null
    });

    res.status(201).json({ message: "Product added", product });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product", details: err.message });
  }
};

// ============================
// 📦 GET ALL PRODUCTS
// ============================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); // Newest first
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
};

// ============================
// ✏️ UPDATE PRODUCT
// ============================
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative" });
    }

    // Prepare update object
    const updateData = {
      name: name ? name.trim() : undefined, 
      price: price !== undefined ? Number(price) : undefined, 
      quantity: quantity !== undefined ? Number(quantity) : undefined 
    };

    // Clean up undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Handle new image upload
    if (req.file) {
      // Find old product to delete old image
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.imageId) {
        await cloudinary.uploader.destroy(oldProduct.imageId);
      }
      
      updateData.imageUrl = req.file.path;
      updateData.imageId = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated", updatedProduct });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
};

// ============================
// 🗑 DELETE PRODUCT
// ============================
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete image from Cloudinary if it exists
    if (deletedProduct.imageId) {
      await cloudinary.uploader.destroy(deletedProduct.imageId);
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
};
