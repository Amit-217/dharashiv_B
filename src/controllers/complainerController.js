import {
  createComplainerService,
  getAllComplainersService,
  getComplainerByIdService,
  getComplainersByAppUserService,
  updateComplainerService,
  deleteComplainerService
} from "../services/complainerService.js";

// CREATE
export const createComplainer = async (req, res) => {
  try {
    const addedBy = req.body.addedBy || req.user?._id;

    const complainer = await createComplainerService({
      ...req.body,
      addedBy
    });

    res.status(201).json({
      message: "Complainer created successfully",
      data: complainer
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL
export const getAllComplainers = async (req, res) => {
  try {
    const data = await getAllComplainersService();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE
export const getComplainerById = async (req, res) => {
  try {
    const data = await getComplainerByIdService(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// GET BY USER
export const getComplainersByAppUser = async (req, res) => {
  try {
    const data = await getComplainersByAppUserService(req.params.userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
export const updateComplainer = async (req, res) => {
  try {
    const data = await updateComplainerService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Complainer updated successfully",
      data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteComplainer = async (req, res) => {
  try {
    await deleteComplainerService(req.params.id);
    res.status(200).json({
      message: "Complainer deleted successfully"
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
