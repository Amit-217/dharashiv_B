// routes/talukaRoute.js

import express from "express";
import {
  createTaluka,
  getAllTalukas,
  updateTaluka,
  deleteTaluka,
  resetTalukaCounter
} from "../controllers/talukaController.js";
import { auth, adminOnly,superAdminOnly } from "../middlewares/authMiddleware.js";


const router = express.Router();

// Create Taluka
router.post("/create", auth, superAdminOnly, createTaluka);

// Get All
router.get("/get-all", auth, getAllTalukas);

// Update
router.put("/update/:talukaId", auth, superAdminOnly, updateTaluka);

// Delete
router.delete("/delete/:talukaId", auth, superAdminOnly, deleteTaluka);

router.put("/reset-counter", auth, superAdminOnly, resetTalukaCounter);

export default router;
