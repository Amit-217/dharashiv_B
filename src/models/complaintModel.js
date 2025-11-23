import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainer",
      required: true
    },
    createdByAppUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true
    },
    department: {
      type: String,
      required: true
    },
    issue: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Forwarded", "In Progress", "Resolved", "Closed"],
      default: "Pending"
    },
    attachmentUrl: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
