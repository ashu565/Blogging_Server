const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/getuser", authController.protect, authController.getUser);
router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);
module.exports = router;
