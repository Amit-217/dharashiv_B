import express from "express";
import {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    trackComplaint,
    getComplaintsByAppUser,
    getComplaintsByComplainer,
    getComplaintHistory,
    addChatMessage
} from "../controllers/complaintController.js";
import upload from "../middlewares/uploadMiddleware.js";
import { auth ,adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected Routes
// Protected Routes

router.post(
  "/complaints",
  auth,
  upload.array("media", 10), // 👈 always attach multer
  createComplaint
);

router.get("/", auth, adminOnly, getAllComplaints);
router.get("/user/:appUserId", auth, getComplaintsByAppUser);
router.get("/by-complainer/:complainerId", auth, getComplaintsByComplainer);
router.get("/:id", auth, getComplaintById);
router.put("/:id/status", auth, adminOnly, updateComplaintStatus);
// Public Routes
router.get("/track/:complaintId", auth ,trackComplaint);
router.get("/:id/history", auth, getComplaintHistory);
router.post("/:id/chat", auth, addChatMessage);



export default router;
