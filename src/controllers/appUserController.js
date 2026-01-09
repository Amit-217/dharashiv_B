// src/controllers/appUserController.js

import * as appUserService from "../services/appUserService.js";

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const result = await appUserService.registerUserService(req.body);
    res.status(201).json({ message: "User registered", ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const tokens = await appUserService.loginUserService(req.body);
    res.json({ message: "Login successful", ...tokens });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const getSecretQuestion = async (req, res) => {
  try {
    const data = await appUserService.getSecretQuestionService(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await appUserService.resetPasswordService(req.body);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= PROFILE ================= */
export const getMyProfile = async (req, res) => {
  res.json(req.user);
};

export const updateMyProfile = async (req, res) => {
  try {
    const user = await appUserService.updateMyProfileService(
      req.user._id,
      req.body
    );
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= ADMIN ================= */
export const getAllUsers = async (req, res) => {
  const users = await appUserService.getAllUsersService();
  res.json(users);
};

export const getUserById = async (req, res) => {
  try {
    const user = await appUserService.getUserByIdService(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserByPhone = async (req, res) => {
  try {
    const user = await appUserService.getUserByPhoneService(req.params.phone);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await appUserService.updateUserByAdminService(
      req.params.id,
      req.body
    );
    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await appUserService.deleteUserService(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
