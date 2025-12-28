import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";
import { generateAccessToken } from "../utils/token.js";

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token required" });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored)
      return res.status(403).json({ message: "Invalid refresh token" });

    if (stored.expiresAt < Date.now()) {
      await stored.deleteOne();
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    await RefreshToken.deleteOne({ token: refreshToken });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
