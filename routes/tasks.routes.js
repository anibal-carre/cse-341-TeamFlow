import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../middleware/validate.js";
import { validateTaskCreate, validateTaskUpdate } from "../validators/task.validator.js";
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from "../controllers/tasks.controller.js";

const router = Router();
router.get("/", asyncHandler(getTasks));
router.get("/:id", asyncHandler(getTaskById));
router.post("/", validateBody(validateTaskCreate), asyncHandler(createTask));
router.put("/:id", validateBody(validateTaskUpdate), asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));
export default router;