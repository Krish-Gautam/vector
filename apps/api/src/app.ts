import "dotenv/config";

import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import roadmapRoutes from "./modules/roadmap/roadmap.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import dailytaskRoutes from "./modules/dailytask/dailytask.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";

const app = express();


// Middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dailytask", dailytaskRoutes);
app.use("/api/profile", profileRoutes);
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
