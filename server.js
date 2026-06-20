require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// =========================
// ✅ CORS (UPDATED)
// =========================
app.use(cors({
  origin: process.env.NETLIFY_URL || "*"
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
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", saleRoutes);
app.use("/api/users", userRoutes);
app.use("/api", activityRoutes);
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