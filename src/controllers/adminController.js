
// controllers/admin.controller.js
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAdminId } from "../utils/generateAdminId.js";

/* ================= REGISTER ================= */
export const registerAdmin = async (req, res) => {
  try {
    const { name, phone, email, password, assignedTaluka } = req.body;

    const exists = await Admin.findOne({ $or: [{ phone }, { email }] });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminId = await generateAdminId();

    const admin = await Admin.create({
      adminId,
      name,
      phone,
      email,
      password: hashedPassword,
      assignedTaluka
    });

    res.status(201).json({ message: "Admin registered", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= LOGIN ================= */
export const loginAdmin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const admin = await Admin.findOne({ phone });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, adminId: admin.adminId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= FORGOT PASSWORD (SEND OTP) ================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await admin.save();

    // 🔔 integrate email service here
    console.log("OTP:", otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({ email, otp });
    if (!admin) return res.status(400).json({ message: "Invalid OTP" });

    if (admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = null;
    admin.otpExpiry = null;

    await admin.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= RESEND OTP ================= */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000;
    await admin.save();

    console.log("Resent OTP:", otp);
    res.json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET ADMIN ================= */
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate("assignedTaluka");
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminByPhone = async (req, res) => {
  try {
    const admin = await Admin.findOne({ phone: req.params.phone });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate("assignedTaluka");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json({ message: "Admin updated", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
