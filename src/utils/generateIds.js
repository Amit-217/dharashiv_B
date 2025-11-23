import Counter from "../models/counterModel.js";

export async function generateAppUserId() {
  const counter = await Counter.findByIdAndUpdate(
    "appUserId",           // counter key name
    { $inc: { seq: 1 } }, // increase sequence
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(7, "0");
  return `A${padded}`;   // Example => A0000001
}
