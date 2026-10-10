import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import projectsRoutes from "./routes/projects.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((item) => item.trim()) : true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    name: "TeamFlow API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/api/health"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "TeamFlow API", timestamp: new Date().toISOString() });
});

app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "TeamFlow API Documentation"
}));
app.get("/api-docs.json", (req, res) => res.status(200).json(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;