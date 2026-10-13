const allowed = ["taskId", "body", "parentCommentId"];
export function validateComment(body, { partial = false } = {}) {
  const errors = [], value = {};
  if (!body || typeof body !== "object" || Array.isArray(body)) return { valid: false, errors: ["Request body must be a JSON object."], value };
  for (const key of Object.keys(body)) if (!allowed.includes(key)) errors.push(`Field '${key}' is not allowed.`);
  for (const key of (partial ? [] : ["taskId", "body"])) if (body[key] === undefined || body[key] === null || body[key] === "") errors.push(`'${key}' is required.`);
  for (const key of ["taskId", "parentCommentId"]) if (body[key] !== undefined) {
    if (body[key] === null && key === "parentCommentId") value[key] = null;
    else if (typeof body[key] !== "string" || !/^[a-f\d]{24}$/i.test(body[key])) errors.push(`'${key}' must be a valid MongoDB ObjectId string.`);
    else value[key] = body[key];
  }
  if (body.body !== undefined) {
    if (typeof body.body !== "string" || !body.body.trim() || body.body.trim().length > 3000) errors.push("'body' must be a non-empty string of at most 3000 characters.");
    else value.body = body.body.trim();
  }
  if (partial && !Object.keys(value).length && !errors.length) errors.push("Provide at least one valid field to update.");
  return { valid: !errors.length, errors, value };
}
export const validateCommentCreate = (body) => validateComment(body);
export const validateCommentUpdate = (body) => validateComment(body, { partial: true });
