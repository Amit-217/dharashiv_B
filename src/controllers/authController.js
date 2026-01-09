// src/controllers/authController.js

import {
  refreshAccessTokenService,
  logoutService
} from "../services/authService.js";

/* ================= REFRESH ACCESS TOKEN ================= */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const newAccessToken =
      await refreshAccessTokenService(refreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await logoutService(refreshToken);

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
