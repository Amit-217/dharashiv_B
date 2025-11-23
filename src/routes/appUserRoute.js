import express from "express";
import {
  registerUser,
  loginUser,
  getSecretQuestion,
  resetPassword
} from "../controllers/appUserController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// forgot password
router.post("/forgot/question", getSecretQuestion);
router.post("/forgot/reset", resetPassword);

export default router;
