import AppUser from "../models/appUserModel.js";
import { generateAppUserId } from "../utils/generateIds.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, phone, password, secretQuestion, secretAnswer } = req.body;

    if (!name || !phone || !password || !secretQuestion || !secretAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await AppUser.findOne({ phone });
    if (existing)
      return res.status(409).json({ message: "Phone already exists" });

    const appUserId = await generateAppUserId();

    const hashedPass = await bcrypt.hash(password, 10);
    const hashedAns = await bcrypt.hash(secretAnswer, 10);

    await AppUser.create({
      appUserId,
      name,
      phone,
      password: hashedPass,
      secretQuestion,
      secretAnswer: hashedAns
    });

    res.status(201).json({ message: "User registered", appUserId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password)
      return res.status(400).json({ message: "Phone and password required" });

    const user = await AppUser.findOne({ phone });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid password" });

    const accessToken = await generateAccessToken({
      id: user.appUserId,
      role: "user"
    });

    const refreshToken =await generateRefreshToken({
      id: user.appUserId,
      role: "user"
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// FORGOT PASSWORD → Step 1: check question
export const getSecretQuestion = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ message: "Phone required" });

    const user = await AppUser.findOne({ phone });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ question: user.secretQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// FORGOT PASSWORD → Step 2: verify answer & reset password
export const resetPassword = async (req, res) => {
  try {
    const { phone, answer, newPassword } = req.body;

    if (!phone || !answer || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await AppUser.findOne({ phone });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const answerMatch = await bcrypt.compare(answer, user.secretAnswer);
    if (!answerMatch)
      return res.status(401).json({ message: "Wrong answer" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* ================= GET MY PROFILE (USER) ================= */
export const getMyProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE MY PROFILE (USER) ================= */
export const updateMyProfile = async (req, res) => {
  try {
    const { name, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await AppUser.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET ALL USERS (ADMIN) ================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await AppUser.find().select("-password -secretAnswer");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET USER BY ID (ADMIN) ================= */
export const getUserById = async (req, res) => {
  try {
    const user = await AppUser.findById(req.params.id)
      .select("-password -secretAnswer");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET USER BY PHONE (ADMIN) ================= */
export const getUserByPhone = async (req, res) => {
  try {
    const user = await AppUser.findOne({ phone: req.params.phone })
      .select("-password -secretAnswer");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE USER (ADMIN) ================= */
export const updateUserByAdmin = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (password)
      rest.password = await bcrypt.hash(password, 10);

    const user = await AppUser.findByIdAndUpdate(
      req.params.id,
      rest,
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE USER (ADMIN) ================= */
export const deleteUser = async (req, res) => {
  try {
    const user = await AppUser.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
