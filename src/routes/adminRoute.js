// routes/admin.routes.js
import express from "express";
import {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  resendOtp,
  getAdminById,
  getAdminByPhone,
  getAllAdmins,
  updateAdmin,
  deleteAdmin
} from "../controllers/adminController.js";

const router = express.Router();

// Auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);

// CRUD
router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.get("/phone/:phone", getAdminByPhone);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
