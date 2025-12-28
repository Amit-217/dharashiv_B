import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";

/* ================= ACCESS TOKEN ================= */
export const generateAccessToken = ({ id, role }) =>
  jwt.sign(
    { id, role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m" }
  );

/* ================= REFRESH TOKEN ================= */
export const generateRefreshToken = async ({ id, role }) => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRE || "7d";
  const expireDays = Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS || 7);

  const token = jwt.sign(
    { id, role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn }
  );

  await RefreshToken.create({
    token,
    userId: id,
    role,
    expiresAt: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000)
  });

  return token;
};
