const express = require("express");
const authController = require("../controllers/authController");
const razorpayController = require("../controllers/razorpayController");

const router = express.Router();
router.post("/razorpay", authController.protect, razorpayController.orderId);

module.exports = router;
