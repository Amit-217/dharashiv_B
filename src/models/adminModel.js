import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    otp: {
      type: String
    },

    otpExpiry: {
      type: Date
    },

    assignedTaluka: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Taluka",
        required: true
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);