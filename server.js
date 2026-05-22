require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// =========================
// ✅ CORS (UPDATED)
// =========================
app.use(cors({
  origin: "*"
}));

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());

// =========================
// ROUTES
// =========================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");

app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", saleRoutes);

// =========================
// MONGODB CONNECTION
// =========================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// =========================
// TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("Denso backend is working 🚀");
});

// =========================
// ✅ PORT FIX (IMPORTANT FOR DEPLOY)
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});