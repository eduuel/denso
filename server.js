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
const profitRoutes = require("./routes/profitRoutes");

app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", saleRoutes);
app.use("/api/profit", profitRoutes);

// =========================
// MONGODB CONNECTION
// =========================
mongoose.connect(
  "mongodb+srv://eden21alex_db_user:denso1234@cluster0.jag1l54.mongodb.net/densoDB?appName=Cluster0"
)
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