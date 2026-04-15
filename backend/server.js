const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Vite default port
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/shipments", require("./routes/shipments"));
app.use("/api/trucks", require("./routes/trucks"));
app.use("/api/trips", require("./routes/trips"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "TruckLink API is running ✅" });
});

// Connect MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
