import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../middleware/validate.js";
import { validateProjectCreate, validateProjectUpdate } from "../validators/project.validator.js";
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from "../controllers/projects.controller.js";

const router = Router();
router.get("/", asyncHandler(getProjects));
router.get("/:id", asyncHandler(getProjectById));
router.post("/", validateBody(validateProjectCreate), asyncHandler(createProject));
router.put("/:id", validateBody(validateProjectUpdate), asyncHandler(updateProject));
router.delete("/:id", asyncHandler(deleteProject));
export default router;