import { Response } from "express";
import { AuthRequest } from "../auth/auth.middleware.js";
import { ProfileService } from "./profile.service.js";

export class ProfileController {
  static async get(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const data = await ProfileService.getProfileData(userId);
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { username, bio, avatarUrl, targetRole } = req.body;
      const data = await ProfileService.updateProfile(userId, { username, bio, avatarUrl, targetRole });
      res.json(data);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
