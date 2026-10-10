const allowedFields = [
  "projectId", "title", "description", "assignedTo", "status", "priority", "dueDate"
];
const statuses = ["todo", "in_progress", "completed", "blocked"];
const priorities = ["low", "medium", "high", "urgent"];

export function validateTask(body, { partial = false } = {}) {
  const errors = [];
  const value = {};

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, errors: ["Request body must be a JSON object."], value };
  }

  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) errors.push(`Field '${key}' is not allowed.`);
  }
  for (const key of (partial ? [] : ["projectId", "title", "description"])) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      errors.push(`'${key}' is required.`);
    }
  }

  if (body.projectId !== undefined) {
    if (typeof body.projectId !== "string" || !/^[a-f\d]{24}$/i.test(body.projectId)) {
      errors.push("'projectId' must be a valid MongoDB ObjectId string.");
    } else value.projectId = body.projectId;
  }
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 150) {
      errors.push("'title' must be a non-empty string of at most 150 characters.");
    } else value.title = body.title.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.trim().length > 3000) {
      errors.push("'description' must be a string of at most 3000 characters.");
    } else value.description = body.description.trim();
  }
  if (body.assignedTo !== undefined) {
    if (body.assignedTo !== null && (typeof body.assignedTo !== "string" || !/^[a-f\d]{24}$/i.test(body.assignedTo))) {
      errors.push("'assignedTo' must be a valid user ObjectId string or null.");
    } else value.assignedTo = body.assignedTo;
  }
  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) errors.push(`'status' must be one of: ${statuses.join(", ")}.`);
    else value.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!priorities.includes(body.priority)) errors.push(`'priority' must be one of: ${priorities.join(", ")}.`);
    else value.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate === null) value.dueDate = null;
    else {
      const date = new Date(body.dueDate);
      if (typeof body.dueDate !== "string" || Number.isNaN(date.getTime())) {
        errors.push("'dueDate' must be a valid date string or null.");
      } else value.dueDate = date;
    }
  }

  if (!partial) {
    value.status ??= "todo";
    value.priority ??= "medium";
  }
  if (partial && Object.keys(value).length === 0 && errors.length === 0) {
    errors.push("Provide at least one valid field to update.");
  }

  return { valid: errors.length === 0, errors, value };
}
export const validateTaskCreate = (body) => validateTask(body);
export const validateTaskUpdate = (body) => validateTask(body, { partial: true });