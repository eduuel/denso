const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/profit", require("./routes/profitRoutes"));
/* =========================
   MongoDB Connection
========================= */
mongoose.connect("mongodb+srv://eden21alex_db_user:denso1234@cluster0.jag1l54.mongodb.net/densoDB?appName=Cluster0")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

/* =========================
   ROUTES (ADD THIS HERE)
========================= */
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

app.use("/api", authRoutes);
app.use("/api", productRoutes);
const saleRoutes = require("./routes/saleRoutes");
app.use("/api", saleRoutes);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Denso backend is working 🚀");
});

/* =========================
   START SERVER
========================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});