import express from "express";
import {
  registerUser,
  loginUser,
  getSecretQuestion,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  getUserByPhone,
  updateUserByAdmin,
  deleteUser
} from "../controllers/appUserController.js";
import { auth, userOnly, adminOnly} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// forgot password
router.post("/forgot/question", getSecretQuestion);
router.post("/forgot/reset", resetPassword);


/* ================= USER ================= */

// My profile
router.get("/me", auth, userOnly, getMyProfile);

// Update my profile
router.put("/me", auth, userOnly, updateMyProfile);

/* ================= ADMIN ================= */

// Get all users
router.get("/", auth, adminOnly, getAllUsers);

// Get user by ID
router.get("/id/:id", auth, adminOnly, getUserById);

// Get user by phone
router.get("/phone/:phone", auth, adminOnly, getUserByPhone);

// Update user
router.put("/:id", auth, adminOnly, updateUserByAdmin);

// Delete user
router.delete("/:id", auth, adminOnly, deleteUser);


export default router;
