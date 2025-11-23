import AppUser from "../models/appUserModel.js";
import { generateAppUserId } from "../utils/generateIds.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, phone, password, secretQuestion, secretAnswer } = req.body;

    const existing = await AppUser.findOne({ phone });
    if (existing) return res.status(400).json({ message: "Phone already exists" });

    const appUserId = await generateAppUserId();

    const hashedPass = await bcrypt.hash(password, 10);
    const hashedAns = await bcrypt.hash(secretAnswer, 10);

    const user = await AppUser.create({
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

    const user = await AppUser.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: "Login successful",
      appUserId: user.appUserId,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FORGOT PASSWORD → Step 1: check question
export const getSecretQuestion = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await AppUser.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ question: user.secretQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// FORGOT PASSWORD → Step 2: verify answer & reset password
export const resetPassword = async (req, res) => {
  try {
    const { phone, answer, newPassword } = req.body;

    const user = await AppUser.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const answerMatch = await bcrypt.compare(answer, user.secretAnswer);
    if (!answerMatch) return res.status(400).json({ message: "Wrong answer" });

    const hashedPass = await bcrypt.hash(newPassword, 10);

    user.password = hashedPass;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
