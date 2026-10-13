import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import { isValidObjectId } from "../utils/objectId.js";
const comments = () => getDatabase().collection("comments");

export async function getComments(req, res) {
  const filter = {};
  for (const key of ["taskId", "createdBy"]) if (req.query[key]) {
    if (!isValidObjectId(req.query[key])) return res.status(400).json({ error: "Bad Request", message: `Invalid ${key}.` });
    filter[key] = req.query[key];
  }
  res.status(200).json(await comments().find(filter).sort({ createdAt: -1 }).toArray());
}
export async function getCommentById(req, res) {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad Request", message: "Invalid comment ID." });
  const comment = await comments().findOne({ _id: new ObjectId(req.params.id) });
  if (!comment) return res.status(404).json({ error: "Not Found", message: "Comment not found." });
  res.status(200).json(comment);
}
export async function createComment(req, res) {
  const { taskId, parentCommentId, ...fields } = req.validatedBody;
  const db = getDatabase();
  const task = await db.collection("tasks").findOne({ _id: new ObjectId(taskId) });
  if (!task) return res.status(400).json({ error: "Validation Error", message: "taskId does not reference an existing task." });
  if (parentCommentId) {
    const parent = await comments().findOne({ _id: new ObjectId(parentCommentId), taskId });
    if (!parent) return res.status(400).json({ error: "Validation Error", message: "parentCommentId must reference a comment on the same task." });
  }
  const now = new Date();
  const comment = { taskId, parentCommentId: parentCommentId ?? null, ...fields, createdBy: req.user._id.toString(), createdAt: now, updatedAt: now };
  const result = await comments().insertOne(comment);
  res.status(201).json({ ...comment, _id: result.insertedId });
}
export async function updateComment(req, res) {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad Request", message: "Invalid comment ID." });
  const existing = await comments().findOne({ _id: new ObjectId(req.params.id) });
  if (!existing) return res.status(404).json({ error: "Not Found", message: "Comment not found." });
  if (existing.createdBy !== req.user._id.toString()) return res.status(403).json({ error: "Forbidden", message: "You can only update your own comments." });
  const { taskId, parentCommentId, ...fields } = req.validatedBody;
  if (taskId) {
    const task = await getDatabase().collection("tasks").findOne({ _id: new ObjectId(taskId) });
    if (!task) return res.status(400).json({ error: "Validation Error", message: "taskId does not reference an existing task." });
  }
  const patch = { ...fields, updatedAt: new Date() };
  if (taskId !== undefined) patch.taskId = taskId;
  if (parentCommentId !== undefined) patch.parentCommentId = parentCommentId;
  const result = await comments().findOneAndUpdate({ _id: existing._id }, { $set: patch }, { returnDocument: "after" });
  res.status(200).json(result?.value ?? result);
}
export async function deleteComment(req, res) {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Bad Request", message: "Invalid comment ID." });
  const id = new ObjectId(req.params.id);
  const existing = await comments().findOne({ _id: id });
  if (!existing) return res.status(404).json({ error: "Not Found", message: "Comment not found." });
  if (existing.createdBy !== req.user._id.toString()) return res.status(403).json({ error: "Forbidden", message: "You can only delete your own comments." });
  await comments().deleteOne({ _id: id });
  res.status(204).send();
}
