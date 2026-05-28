import { Router } from "express";
import verifyUser from "../auth/auth.middleware.js";
import { ProfileController } from "./profile.controller.js";

const router = Router();

router.get("/", verifyUser, ProfileController.get);
router.put("/", verifyUser, ProfileController.update);

export default router;
