import { Response } from "express";

import { AuthRequest } from "../auth/auth.middleware.js";

import { RoadmapService } from "./roadmap.service.js";

export class RoadmapController {
  static async get(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const result = await RoadmapService.getRoadmap(userId);

      return res.json(result);
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  }

  static async generate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const result = await RoadmapService.generateRoadmap(userId, req.body);

      return res.json(result);
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  }
}
