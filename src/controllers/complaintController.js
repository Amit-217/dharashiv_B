import Complaint from "../models/complaintModel.js";
import AppUser from "../models/appUserModel.js";
import Complainer from "../models/complainerModel.js";
import Counter from "../models/counterModel.js";

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

    // Mongo ObjectId from auth middleware
    const filedBy = req.user._id;

    // Ownership check
    const complainerDoc = await Complainer.findById(complainer);
    if (!complainerDoc) {
      return res.status(404).json({ message: "Complainer not found" });
    }

    // ✅ FIXED FIELD NAME
    if (complainerDoc.addedBy.toString() !== filedBy.toString()) {
      return res.status(403).json({ message: "You cannot use this complainer" });
    }

    // Media handling
    let media = [];
    if (req.files?.length) {
      media = req.files.map(file => {
        let type = "image";
        if (file.mimetype.startsWith("video/")) type = "video";
        else if (file.mimetype === "application/pdf") type = "pdf";
        else if (file.mimetype.startsWith("audio/")) type = "audio";


        return {
          type,
          url: `/api/uploads/${file.filename}`
        };
      });
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
          byRole: "user"
        }
      ]
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint
    });
  } catch (err) {
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
      .populate("complainer", "name complainerId")
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
      .populate("complainer", "name complainerId")
      .populate("department", "name");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE STATUS / ADD MESSAGE (ADMIN) ================= */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (status) {
      complaint.status = status;
    }

    if (message) {
      complaint.history.push({
        message,
        by: req.user._id,
        byRole: req.role // admin / superadmin
      });
    }

    await complaint.save();

    res.json({
      message: "Complaint updated successfully",
      complaint
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
