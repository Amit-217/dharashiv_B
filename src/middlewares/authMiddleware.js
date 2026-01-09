// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import AppUser from "../models/appUserModel.js";

/* ================= AUTH (USER + ADMIN + SUPERADMIN) ================= */
export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify access token (expiry auto handled by JWT)
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 3️⃣ Role-based user fetch

    // 👤 APP USER
    if (decoded.role === "user") {
      const user = await AppUser.findOne({
        appUserId: decoded.id
      });

      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      req.user = user;
      req.role = "user";
    }

    // 🛡 ADMIN / 👑 SUPERADMIN
    else if (decoded.role === "admin" || decoded.role === "superadmin") {
      const admin = await Admin.findOne({
        adminId: decoded.id
      });

      if (!admin) {
        return res.status(403).json({ message: "Admin not found" });
      }

      req.user = admin;
      req.role = decoded.role;
    }

    // ❌ Unknown role
    else {
      return res.status(403).json({ message: "Invalid role in token" });
    }

    next();
  } catch (err) {
    // 🔐 Token errors (exactly matching current setup)
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid access token" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
};

/* ================= SUPER ADMIN ONLY ================= */
export const superAdminOnly = (req, res, next) => {
  if (req.role !== "superadmin") {
    return res.status(403).json({ message: "SuperAdmin only" });
  }
  next();
};

/* ================= ADMIN + SUPERADMIN ================= */
export const adminOnly = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.role)) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/* ================= USER ONLY ================= */
export const userOnly = (req, res, next) => {
  if (req.role !== "user") {
    return res.status(403).json({ message: "User access only" });
  }
  next();
};
