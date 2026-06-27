import { Router } from "express";

import { verifyUser } from "../auth/auth.middleware.js";
import {
  completeDailyTask,
  ensureWeeklyPlan,
  generateWeeklyTasks,
  generateNextWeeklyPlan,
  getDailyTaskHistory,
} from "./dailytask.controller.js";

const router = Router();

router.get("/history", verifyUser, getDailyTaskHistory);

router.post("/:id/complete", verifyUser, completeDailyTask);

router.post("/generate-weekly", verifyUser, generateWeeklyTasks);

router.post("/generate-next-week", verifyUser, generateNextWeeklyPlan);

router.post("/ensure-weekly-plan", verifyUser, ensureWeeklyPlan);

export default router;
