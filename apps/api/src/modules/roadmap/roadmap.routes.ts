import { Router } from "express";
import {verifyUser} from "../auth/auth.middleware.js";

import { RoadmapController } from "./roadmap.controller.js";

const router = Router();

router.get("/", verifyUser, RoadmapController.get);

router.post("/generate", verifyUser, RoadmapController.generate);

export default router;
