import Complaint from "../models/complaintModel.js";
import AppUser from "../models/appUserModel.js";
import Complainer from "../models/complainerModel.js";
import Counter from "../models/counterModel.js";
import Admin from "../models/adminModel.js";
import cloudinary from "../config/cloudinary.js";
/* ================= GENERATE COMPLAINT ID ================= */
/*
 Format: CMP-{USER_LAST4}-{COMPLAINER_LAST4}-{SEQ}
 Example: CMP-0123-0456-001
*/
const generateComplaintId = async (filedByMongoId, complainerMongoId) => {
  const user = await AppUser.findById(filedByMongoId);
  const complainer = await Complainer.findById(complainerMongoId);

  if (!user || !complainer) {
    throw new Error("Invalid AppUser or Complainer");
  }

  const userPart = user.appUserId.slice(-4);
  const compPart = complainer.complainerId.slice(-4);

  const counter = await Counter.findByIdAndUpdate(
    "complaintId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter.seq.toString().padStart(3, "0");

  return `CMP-${userPart}-${compPart}-${seq}`.toUpperCase();
};

/* ================= CREATE COMPLAINT (APP USER) ================= */

export const createComplaint = async (req, res) => {
  try {
    const { complainer, department, subject, description, specification } = req.body;

    if (!complainer || !department || !subject || !description) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const filedBy = req.user._id;

    const complainerDoc = await Complainer.findById(complainer);
    if (!complainerDoc) {
      return res.status(404).json({ message: "Complainer not found" });
    }

    if (complainerDoc.addedBy.toString() !== filedBy.toString()) {
      return res.status(403).json({ message: "You cannot use this complainer" });
    }

    let media = [];

    if (req.files?.length) {
      for (const file of req.files) {
        let type = "image";
        let resourceType = "image";

        if (file.mimetype.startsWith("video/")) {
          type = "video";
          resourceType = "auto";
        } else if (file.mimetype.startsWith("audio/")) {
          type = "audio";
          resourceType = "auto";
        } else if (file.mimetype === "application/pdf") {
          type = "pdf";
          resourceType = "raw";
        }

        const uploadResult = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: "complaints",
            resource_type: resourceType,
          }
        );

        media.push({
          type,
          url: uploadResult.secure_url,
        });
      }
    }

    const complaintId = await generateComplaintId(filedBy, complainer);

    const complaint = await Complaint.create({
      complaintId,
      filedBy,
      complainer,
      department,
      specification,
      subject,
      description,
      media,
      history: [
        {
          message: "Complaint registered",
          by: filedBy,
          byRole: "user",
        },
      ],
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });

  } catch (err) {
    console.error("Create complaint error:", err);
    res.status(500).json({ error: err.message });
  }
};



/* ================= GET ALL COMPLAINTS (ADMIN / SUPERADMIN) ================= */
export const getAllComplaints = async (req, res) => {
  try {
    const { status, department, filedBy } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (department) filter.department = department;
    if (filedBy) filter.filedBy = filedBy;

    const complaints = await Complaint.find(filter)
      .populate("filedBy", "name phone appUserId")
      .populate("complainer", "name complainerId taluka village")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET SINGLE COMPLAINT ================= */
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("filedBy", "name phone appUserId")
      .populate("complainer", "name complainerId taluka village")
      .populate("department", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getComplaintsByComplainer = async (req, res) => {
  try {
    const { complainerId } = req.params;

    // Check complainer exist & permission (ownership check)
    const complainer = await Complainer.findById(complainerId);
    if (!complainer) {
      return res.status(404).json({ message: "Complainer not found" });
    }

    // App User can only view his own complainers complaints
    if (req.role === "user" && complainer.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed for this complainer" });
    }

    const complaints = await Complaint.find({ complainer: complainerId })
      .populate("department", "name")
      .populate("filedBy", "name appUserId")
      .populate("complainer", "name complainerId taluka village")
      .sort({ createdAt: -1 });

    res.json(complaints);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





/* ================= UPDATE STATUS / ADD MESSAGE (ADMIN) ================= */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 🛑 Only admin/superadmin allowed to update status
    if (req.role !== "admin" && req.role !== "superadmin") {
      return res.status(403).json({ message: "Only admin can update status" });
    }

    // 🔄 Status update
    complaint.status = status;
    await complaint.save();

    return res.json({
      message: "Complaint status updated successfully",
      complaint
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


/* ================= PUBLIC TRACKING (NO LOGIN) ================= */
export const trackComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId })
      .select("complaintId status subject description history createdAt updatedAt")
      .populate("department", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= USER: MY COMPLAINTS ================= */
export const getComplaintsByAppUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({ filedBy: req.user._id })
      .populate("complainer", "name")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const getComplaintHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .select("history filedBy");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // User access block if not owner
    if (req.role === "user" && complaint.filedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to view this complaint" });
    }

    const formattedHistory = [];

    for (const msg of complaint.history) {
      let senderData = { _id: msg.by, name: "Unknown", role: msg.byRole };

      if (msg.byRole === "user") {
        const user = await AppUser.findById(msg.by).select("name");
        if (user) senderData.name = user.name;
      } 
      else { // admin / superadmin
        const admin = await Admin.findById(msg.by).select("name");
        if (admin) senderData.name = admin.name;
      }

      formattedHistory.push({
        message: msg.message,
        by: senderData,
        timestamp: msg.timestamp
      });
    }

    res.json(formattedHistory);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const addChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const complaint = await Complaint.findById(id)
      .select("history filedBy");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 🔐 Permission check for USER — only complaint created by same user
    if (req.role === "user" && complaint.filedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to chat on this complaint" });
    }

    // 📝 Push message
    complaint.history.push({
      message,
      by: req.user._id,
      byRole: req.role, // "user" or "admin"
      timestamp: new Date()
    });

    await complaint.save();

    res.json({ message: "Message sent successfully", history: complaint.history });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
