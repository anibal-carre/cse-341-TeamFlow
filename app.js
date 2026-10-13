import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import passport from "./config/passport.js";
import swaggerSpec from "./swagger.js";
import projectsRoutes from "./routes/projects.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import membershipsRoutes from "./routes/memberships.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((item) => item.trim()) : true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(session({
  name: "teamflow.sid",
  secret: process.env.SESSION_SECRET || "development-only-change-this-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 8
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.status(200).json({
  name: "TeamFlow API",
  version: "1.1.0",
  documentation: "/api-docs",
  health: "/api/health",
  authentication: "/auth/github"
}));
app.get("/api/health", (req, res) => res.status(200).json({
  status: "ok", service: "TeamFlow API", timestamp: new Date().toISOString()
}));

app.use("/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/memberships", membershipsRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true, customSiteTitle: "TeamFlow API Documentation"
}));
app.get("/api-docs.json", (req, res) => res.status(200).json(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);
export default app;
