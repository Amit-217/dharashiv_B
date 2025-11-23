import jwt from "jsonwebtoken";
import { 
  generateAccessToken, 
  generateRefreshToken 
} from "../utils/token.js";

export const refreshTokens = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const newAccessToken = generateAccessToken({
      appUserId: decoded.appUserId,
    });

    const newRefreshToken = generateRefreshToken({
      appUserId: decoded.appUserId,
    });

    return res.json({
      message: "Tokens refreshed",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
