const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { optimizeRoute } = require("../controllers/routeController");

// POST /api/routes/optimize
// Body: { origin, destination, truckType, priority }
router.post("/optimize", protect, optimizeRoute);

module.exports = router;
