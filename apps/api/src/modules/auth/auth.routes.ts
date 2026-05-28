import express from "express";
import verifyUser from "./auth.middleware.js";
import { getProfile } from "./auth.controller.js";

const router = express.Router();

router.get("/profile", verifyUser, getProfile);

export default router;