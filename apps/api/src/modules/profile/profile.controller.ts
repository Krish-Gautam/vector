import { Response } from "express";
import { AuthRequest } from "../auth/auth.middleware.js";
import { ProfileService } from "./profile.service.js";
import { supabase } from "../../data/supabase.client.js";

export class ProfileController {
  static async get(req: AuthRequest, res: Response) {
    try {
      const userId = req.authUser!.id;
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
      const userId = req.authUser!.id;

      const { username, bio, targetRole } = req.body;

      let avatarUrl: string | undefined;

      if (req.file) {
        const extension = req.file.originalname.split(".").pop();

        const fileName = `${userId}.${extension}`;

        const { error } = await supabase.storage
          .from("avatars")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (error) throw error;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = data.publicUrl;
      }

      const result = await ProfileService.updateProfile(userId, {
        username,
        bio,
        targetRole,
        avatarUrl,
      });

      res.json(result);
    } catch (error: any) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  static async getRoadmapStatus(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const result =
      await ProfileService.getRoadmapStatus(userId);

    return res.json(result);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
}
