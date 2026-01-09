// src/services/authService.js

import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";
import { generateAccessToken } from "../utils/token.js";

/* ================= REFRESH ACCESS TOKEN ================= */
export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) {
    throw new Error("Invalid refresh token");
  }

  if (stored.expiresAt < Date.now()) {
    await stored.deleteOne();
    throw new Error("Refresh token expired");
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const newAccessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role
  });

  return newAccessToken;
};

/* ================= LOGOUT ================= */
export const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  await RefreshToken.deleteOne({ token: refreshToken });

  return true;
};
