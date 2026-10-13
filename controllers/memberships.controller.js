import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import { isValidObjectId } from "../utils/objectId.js";
const memberships = () => getDatabase().collection("memberships");

export async function getMemberships(req, res) {
  const filter = {};
  for (const key of ["projectId", "userId"]) if (req.query[key]) {
    if (!isValidObjectId(req.query[key])) return res.status(400).json({ error: "Bad Request", message: `Invalid ${key}.` });
    filter[key] = req.query[key];
  }
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  res.status(200).json(await memberships().find(filter).sort({ createdAt: -1 }).toArray());
}
export async function getMembershipById(req, res) {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad Request", message: "Invalid membership ID." });
  const membership = await memberships().findOne({ _id: new ObjectId(req.params.id) });
  if (!membership) return res.status(404).json({ error: "Not Found", message: "Membership not found." });
  res.status(200).json(membership);
}
export async function createMembership(req, res) {
  const { projectId, userId, ...fields } = req.validatedBody;
  const db = getDatabase();
  const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) });
  if (!project) return res.status(400).json({ error: "Validation Error", message: "projectId does not reference an existing project." });
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!user) return res.status(400).json({ error: "Validation Error", message: "userId does not reference an existing user." });
  const now = new Date();
  const membership = { projectId, userId, ...fields, createdBy: req.user._id.toString(), createdAt: now, updatedAt: now };
  try {
    const result = await memberships().insertOne(membership);
    res.status(201).json({ ...membership, _id: result.insertedId });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Conflict", message: "This user already has a membership for this project." });
    throw error;
  }
}
export async function updateMembership(req, res) {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad Request", message: "Invalid membership ID." });
  const id = new ObjectId(req.params.id);
  const existing = await memberships().findOne({ _id: id });
  if (!existing) return res.status(404).json({ error: "Not Found", message: "Membership not found." });
  const canManage = existing.createdBy === req.user._id.toString() || existing.userId === req.user._id.toString();
  if (!canManage) return res.status(403).json({ error: "Forbidden", message: "You cannot update this membership." });
  const { projectId, userId, ...fields } = req.validatedBody;
  if (projectId) {
    const project = await getDatabase().collection("projects").findOne({ _id: new ObjectId(projectId) });
    if (!project) return res.status(400).json({ error: "Validation Error", message: "projectId does not reference an existing project." });
  }
  if (userId) {
    const user = await getDatabase().collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(400).json({ error: "Validation Error", message: "userId does not reference an existing user." });
  }
  const patch = { ...fields, updatedAt: new Date() };
  if (projectId !== undefined) patch.projectId = projectId;
  if (userId !== undefined) patch.userId = userId;
  try {
    const result = await memberships().findOneAndUpdate({ _id: id }, { $set: patch }, { returnDocument: "after" });
    res.status(200).json(result?.value ?? result);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Conflict", message: "This user already has a membership for this project." });
    throw error;
  }
}
export async function deleteMembership(req, res) {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad Request", message: "Invalid membership ID." });
  const id = new ObjectId(req.params.id);
  const existing = await memberships().findOne({ _id: id });
  if (!existing) return res.status(404).json({ error: "Not Found", message: "Membership not found." });
  if (existing.createdBy !== req.user._id.toString() && existing.userId !== req.user._id.toString()) {
    return res.status(403).json({ error: "Forbidden", message: "You cannot delete this membership." });
  }
  await memberships().deleteOne({ _id: id });
  res.status(204).send();
}
