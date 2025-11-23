import mongoose from "mongoose";

const complainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      default: null
    },
    taluka: {
      type: String,
      required: true
    },
    village: {
      type: String,
      required: true
    },
    address: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Complainer", complainerSchema);
