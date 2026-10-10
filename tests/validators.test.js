import { describe, test, expect } from "@jest/globals";
import { validateProjectCreate, validateProjectUpdate } from "../validators/project.validator.js";
import { validateTaskCreate, validateTaskUpdate } from "../validators/task.validator.js";

describe("Project validation", () => {
  test("accepts valid project", () => {
    expect(validateProjectCreate({ name: "Website", description: "Redesign" }).valid).toBe(true);
  });
  test("rejects missing required project fields", () => {
    expect(validateProjectCreate({ name: "" }).valid).toBe(false);
  });
  test("rejects unknown project fields", () => {
    expect(validateProjectCreate({ name: "X", description: "Y", ownerId: "spoofed" }).valid).toBe(false);
  });
  test("rejects due date before start date", () => {
    expect(validateProjectCreate({ name: "X", description: "Y", startDate: "2026-02-01", dueDate: "2026-01-01" }).valid).toBe(false);
  });
  test("rejects empty update", () => {
    expect(validateProjectUpdate({}).valid).toBe(false);
  });
});

describe("Task validation", () => {
  test("accepts valid task", () => {
    expect(validateTaskCreate({ projectId: "66b123456789012345678901", title: "Build API", description: "Create routes" }).valid).toBe(true);
  });
  test("rejects invalid project ID", () => {
    expect(validateTaskCreate({ projectId: "bad", title: "Build API", description: "Create routes" }).valid).toBe(false);
  });
  test("rejects invalid status", () => {
    expect(validateTaskCreate({ projectId: "66b123456789012345678901", title: "X", description: "Y", status: "finished-ish" }).valid).toBe(false);
  });
  test("rejects empty update", () => {
    expect(validateTaskUpdate({}).valid).toBe(false);
  });
});