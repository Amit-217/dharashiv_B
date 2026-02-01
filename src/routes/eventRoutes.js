import express from "express";
import {
  createEvent,
  updateEvent,
  updateEventStatus,
  getAllEvents,
  getEventById,
  deleteEvent,
  getLimitedEvents
} from "../controllers/eventController.js";
import { auth,adminOnly, superAdminOnly } from "../middlewares/authMiddleware.js";

// agar auth middleware hai to yahan lagana
// import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =========================
   CREATE EVENT
========================= */
router.post(
  "/", auth, superAdminOnly,
  createEvent
);

/* =========================
   UPDATE EVENT (full update)
========================= */
router.put(
  "/:id",
  auth,
  adminOnly,
  updateEvent
);

/* =========================
   UPDATE EVENT STATUS
========================= */
router.patch(
  "/:id/status",
  auth,
  adminOnly,
  updateEventStatus
);

/* =========================
   GET ALL EVENTS
========================= */
router.get(
  "/",
  getAllEvents
);

/* =========================
   GET EVENT BY ID
========================= */
router.get(
  "/:id",
  getEventById
);

/* =========================
   DELETE EVENT
========================= */
router.delete(
  "/:id",
  auth,
  adminOnly,
  deleteEvent
);

router.get(
  "/limited/events",
  getLimitedEvents
);

export default router;
