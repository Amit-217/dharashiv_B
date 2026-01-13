import mongoose from "mongoose";
import Complainer from "../models/complainerModel.js";
import { generateComplainerId } from "../utils/generateIds.js";

// ==========================
// Create Complainer
// ==========================
export const createComplainerService = async ({
  name,
  phone,
  taluka,
  village,
  addedBy
}) => {
  if (!name || !taluka || !village) {
    throw new Error("Name, Taluka and Village are required.");
  }

  if (!addedBy) {
    throw new Error("addedBy user is required.");
  }

  if (
    !mongoose.Types.ObjectId.isValid(taluka) ||
    !mongoose.Types.ObjectId.isValid(village) ||
    !mongoose.Types.ObjectId.isValid(addedBy)
  ) {
    throw new Error("Invalid ObjectId provided.");
  }

  const complainerId = await generateComplainerId();

  const complainer = await Complainer.create({
    complainerId,
    name,
    phone: phone || null,
    taluka,
    village,
    addedBy
  });

  return complainer;
};

// ==========================
// Get All Complainers
// ==========================
export const getAllComplainersService = async () => {
  return await Complainer.find()
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");
};

// ==========================
// Get Complainer by Mongo _id
// ==========================
export const getComplainerByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  const complainer = await Complainer.findById(id)
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");

  if (!complainer) {
    throw new Error("Complainer not found.");
  }

  return complainer;
};

// ==========================
// Get Complainers by AppUser
// ==========================
export const getComplainersByAppUserService = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  return await Complainer.find({ addedBy: userId })
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");
};

// ==========================
// Update Complainer
// ==========================
export const updateComplainerService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  const updated = await Complainer.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!updated) {
    throw new Error("Complainer not found.");
  }

  return updated;
};

// ==========================
// Delete Complainer
// ==========================
export const deleteComplainerService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  const deleted = await Complainer.findByIdAndDelete(id);

  if (!deleted) {
    throw new Error("Complainer not found.");
  }

  return true;
};
