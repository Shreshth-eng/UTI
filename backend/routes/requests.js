const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth");
const {
  sendRequest,
  getMyRequests,
  respondToRequest,
  ownerConfirmRequest,
} = require("../controllers/requestController");

router.post("/", protect, sendRequest); // Sender → Driver request
router.get("/", protect, getMyRequests); // Apni requests dekho (role based)
router.patch("/:id/respond", protect, respondToRequest); // Driver accept/reject
router.patch("/:id/confirm", protect, ownerConfirmRequest); // Owner confirm

module.exports = router;
