import { Router } from "express";

import { getDashboard } from "./dashboard.controller.js";

import verifyUser from "../auth/auth.middleware.js";

const router = Router();

router.get("/", verifyUser, getDashboard);

export default router;