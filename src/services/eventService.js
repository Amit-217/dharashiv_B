import Event from "../models/eventModel.js";
import { generateEventId } from "../utils/generateIds.js";

export const createEventService = async (data) => {
  try {
    const {
      eventDate,
      startTime,
      endTime,
      address,
      maxTokens,
      createdBy
    } = data;

    /* ================= VALIDATION ================= */

    if (!createdBy) {
      throw new Error("Unauthorized: Admin not found in token");
    }

    if (!eventDate) {
      throw new Error("eventDate is required");
    }

    if (!startTime) {
      throw new Error("startTime is required");
    }

    if (!endTime) {
      throw new Error("endTime is required");
    }

    /* ================= CREATE EVENT ================= */

    const eventId = await generateEventId();

    const event = await Event.create({
      eventId,                // auto-generated (EVT000001)
      eventDate,
      startTime,
      endTime,
      address: address || null,
      maxTokens: maxTokens || 0,
      createdBy               // <-- ObjectId from req.user._id
    });

    return event;

  } catch (error) {
    // ❗ Service always throws, controller handles response
    throw error;
  }
};


/* =========================
   UPDATE EVENT
========================= */
export const updateEventService = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw error;
  }
};

/* =========================
   UPDATE EVENT STATUS
========================= */
export const updateEventStatusService = async (id, status) => {
  try {
    const allowedStatus = ["Announced", "Ongoing", "Completed", "Cancelled"];

    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid event status");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw error;
  }
};

/* =========================
   GET ALL EVENTS
========================= */
export const getAllEventsService = async () => {
  try {
    return await Event.find().sort({ eventDate: -1 });
  } catch (error) {
    throw error;
  }
};

/* =========================
   GET EVENT BY ID
========================= */
export const getEventByIdService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findById(id);

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw error;
  }
};

/* =========================
   DELETE EVENT
========================= */
export const deleteEventService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      throw new Error("Event not found");
    }

    return true;
  } catch (error) {
    throw error;
  }
};