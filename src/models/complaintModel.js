import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    filedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true
    },

    complainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainer",
      required: true
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    
    specification: {
      type: String,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "pdf", "audio"],
          
        },
        url: { type: String,  }
      }
    ],

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open"
    },

    /* ================= DISCUSSION / HISTORY ================= */
    history: [
      {
        message: {
          type: String,
          required: true,
          trim: true
        },

        by: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },

        byRole: {
          type: String,
          enum: ["user", "admin", "superadmin"],
          required: true
        },

        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
