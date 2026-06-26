import { Response } from "express";
import { AuthRequest } from "../auth/auth.middleware.js";
import { dashboardService } from "./dashboard.service.js";

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.authUser!.id;

    const dashboard =
      await dashboardService.getDashboard(userId);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};