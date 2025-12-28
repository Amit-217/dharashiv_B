import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import AppUser from "../models/appUserModel.js";

/* ================= AUTH (USER + ADMIN + SUPERADMIN) ================= */
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Token required" });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 👤 APP USER
    if (decoded.role === "user") {
      const user = await AppUser.findOne({ appUserId: decoded.id });
      if (!user)
        return res.status(403).json({ message: "User not found" });

      req.user = user;
      req.role = "user";
    }

    // 🛡 ADMIN / 👑 SUPERADMIN
    else if (decoded.role === "admin" || decoded.role === "superadmin") {
      const admin = await Admin.findOne({ adminId: decoded.id });
      if (!admin)
        return res.status(403).json({ message: "Admin not found" });

      req.user = admin;
      req.role = decoded.role;
    }

    else {
      return res.status(403).json({ message: "Invalid role" });
    }

    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

/* ================= SUPER ADMIN ONLY ================= */
export const superAdminOnly = (req, res, next) => {
  if (req.role !== "superadmin")
    return res.status(403).json({ message: "SuperAdmin only" });
  next();
};

/* ================= ADMIN + SUPERADMIN ================= */
export const adminOnly = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.role))
    return res.status(403).json({ message: "Admin access only" });
  next();
};

/* ================= USER ONLY (LIMITED) ================= */
export const userOnly = (req, res, next) => {
  if (req.role !== "user")
    return res.status(403).json({ message: "User access only" });
  next();
};
