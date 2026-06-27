import { Response } from "express";

import { AuthRequest } from "../auth/auth.middleware.js";
import { dailyTaskService } from "./dailytask.service.js";

export const completeDailyTask =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const userId = req.authUser!.id;

      const taskId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result =
        await dailyTaskService.completeDailyTask(
          taskId,
          userId,
        );

      res.json(result);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to complete daily task",
      });
    }
  };

export const generateWeeklyTasks =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const userId = req.authUser!.id;

      const result =
        await dailyTaskService.generateWeeklyTasks(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to generate weekly tasks",
      });
    }
  };

export const ensureWeeklyPlan =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const userId = req.authUser!.id;

      const result =
        await dailyTaskService.ensureWeeklyPlan(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to ensure weekly plan",
      });
    }
  };

export const generateNextWeeklyPlan =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const userId = req.authUser!.id;

      const result =
        await dailyTaskService.generateNextWeeklyPlan(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate next weekly plan",
      });
    }
  };

export const getDailyTaskHistory =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const userId = req.authUser!.id;

      const result =
        await dailyTaskService.getDailyTaskHistory(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to retrieve daily task history",
      });
    }
  };