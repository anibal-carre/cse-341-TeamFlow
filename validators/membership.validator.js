const allowed = ["projectId", "userId", "role", "status"];
const roles = ["owner", "admin", "member", "viewer"];
const statuses = ["invited", "active", "inactive"];
export function validateMembership(body, { partial = false } = {}) {
  const errors = [], value = {};
  if (!body || typeof body !== "object" || Array.isArray(body)) return { valid: false, errors: ["Request body must be a JSON object."], value };
  for (const key of Object.keys(body)) if (!allowed.includes(key)) errors.push(`Field '${key}' is not allowed.`);
  for (const key of (partial ? [] : ["projectId", "userId"])) if (body[key] === undefined || body[key] === null || body[key] === "") errors.push(`'${key}' is required.`);
  for (const key of ["projectId", "userId"]) if (body[key] !== undefined) {
    if (typeof body[key] !== "string" || !/^[a-f\d]{24}$/i.test(body[key])) errors.push(`'${key}' must be a valid MongoDB ObjectId string.`);
    else value[key] = body[key];
  }
  if (body.role !== undefined) {
    if (!roles.includes(body.role)) errors.push(`'role' must be one of: ${roles.join(", ")}.`);
    else value.role = body.role;
  }
  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) errors.push(`'status' must be one of: ${statuses.join(", ")}.`);
    else value.status = body.status;
  }
  if (!partial) { value.role ??= "member"; value.status ??= "active"; }
  if (partial && !Object.keys(value).length && !errors.length) errors.push("Provide at least one valid field to update.");
  return { valid: !errors.length, errors, value };
}
export const validateMembershipCreate = (body) => validateMembership(body);
export const validateMembershipUpdate = (body) => validateMembership(body, { partial: true });
