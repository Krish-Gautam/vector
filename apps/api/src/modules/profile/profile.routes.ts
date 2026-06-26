import { Router } from "express";
import {verifyUser} from "../auth/auth.middleware.js";
import { ProfileController } from "./profile.controller.js";
import { upload } from "./multer.middleware.js";

const router = Router();

router.get("/", verifyUser, ProfileController.get);

router.put(
    "/",
    verifyUser,
    upload.single("avatar"),
    ProfileController.update
);

export default router;