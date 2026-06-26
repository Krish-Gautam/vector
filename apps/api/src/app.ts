

import "dotenv/config";

import express from "express";
import cors from "cors";
import roadmapRoutes from "./modules/roadmap/roadmap.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import dailytaskRoutes from "./modules/dailytask/dailytask.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import { supabase } from "./data/supabase.client.js";
import { createExecutionCircleRouter } from "./modules/executioncircle/executioncircle.routes.js";
import "./modules/executioncircle/weekly-refresh.job.js";

const app = express();

// ── CORS — must allow Authorization header ─────────────────
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001','https://wallpaper-identified-york-extend.trycloudflare.com'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],   // ← KEY FIX
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dailytask", dailytaskRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/execution-circle", createExecutionCircleRouter(supabase));

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;