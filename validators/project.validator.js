const allowedFields = [
  "name", "description", "status", "startDate", "dueDate", "visibility"
];
const statuses = ["planning", "active", "completed", "archived"];
const visibilities = ["private", "public"];

export function validateProject(body, { partial = false } = {}) {
  const errors = [];
  const value = {};

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, errors: ["Request body must be a JSON object."], value };
  }

  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) errors.push(`Field '${key}' is not allowed.`);
  }

  const required = partial ? [] : ["name", "description"];
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      errors.push(`'${key}' is required.`);
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100) {
      errors.push("'name' must be a non-empty string of at most 100 characters.");
    } else value.name = body.name.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.trim().length > 2000) {
      errors.push("'description' must be a string of at most 2000 characters.");
    } else value.description = body.description.trim();
  }
  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) errors.push(`'status' must be one of: ${statuses.join(", ")}.`);
    else value.status = body.status;
  }
  if (body.visibility !== undefined) {
    if (!visibilities.includes(body.visibility)) errors.push(`'visibility' must be one of: ${visibilities.join(", ")}.`);
    else value.visibility = body.visibility;
  }
  for (const key of ["startDate", "dueDate"]) {
    if (body[key] !== undefined) {
      const date = new Date(body[key]);
      if (typeof body[key] !== "string" || Number.isNaN(date.getTime())) {
        errors.push(`'${key}' must be a valid date string.`);
      } else value[key] = date;
    }
  }
  if (value.startDate && value.dueDate && value.dueDate < value.startDate) {
    errors.push("'dueDate' must be on or after 'startDate'.");
  }

  if (!partial) {
    value.status ??= "planning";
    value.visibility ??= "private";
    value.startDate ??= new Date();
  }
  if (partial && Object.keys(value).length === 0 && errors.length === 0) {
    errors.push("Provide at least one valid field to update.");
  }

  return { valid: errors.length === 0, errors, value };
}

export const validateProjectCreate = (body) => validateProject(body);
export const validateProjectUpdate = (body) => validateProject(body, { partial: true });