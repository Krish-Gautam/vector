import { Response } from "express";
import { AuthRequest } from "./auth.middleware.js";

export const getProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};