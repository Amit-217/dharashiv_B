import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAdminId } from "../utils/generateIds.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
// Import your email services
import { 
  sendWelcomeEmail, 
  sendOtpEmail, 
  sendPasswordChangedEmail 
} from "../utils/email.js";

/* ================= REGISTER ================= */
export const registerAdmin = async (req, res) => {
  try {
    const { name, phone, email, password, role, assignedTaluka } = req.body;

    if (!role)
      return res.status(400).json({ message: "Role is required" });

    const exists = await Admin.findOne({ $or: [{ phone }, { email }] });
    if (exists)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      adminId: await generateAdminId(),
      name,
      phone,
      email,
      password: hashedPassword,
      role, // 👈 BODY SE AAYA
      assignedTaluka
    });

    await sendWelcomeEmail(email, name, role );

    res.status(201).json({
      message: "Admin registered successfully",
      adminId: admin.adminId,
      role: admin.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = await generateAccessToken({
      id: admin.adminId,
      role: admin.role
    });

    const refreshToken = await generateRefreshToken({
      id: admin.adminId,
      role: admin.role
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      role: admin.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000;

    // 👇 ye line fix hai — validation skip
    await admin.save({ validateBeforeSave: false });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({ email, otp });
    if (!admin) return res.status(400).json({ message: "Invalid OTP" });

    if (admin.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    await sendPasswordChangedEmail(email);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000;
    await admin.save();

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getAdminById = async (req, res) => {
  const admin = await Admin.findById(req.params.id).populate("assignedTaluka");
  res.json(admin);
};

export const getAdminByPhone = async (req, res) => {
  const admin = await Admin.findOne({ phone: req.params.phone });
  res.json(admin);
};

export const getAllAdmins = async (req, res) => {
  const admins = await Admin.find().populate("assignedTaluka");
  res.json(admins);
};

export const updateAdmin = async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Admin updated", admin });
};

export const deleteAdmin = async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.json({ message: "Admin deleted" });
};
