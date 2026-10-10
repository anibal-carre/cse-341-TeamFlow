import { getDatabase } from "../config/database.js";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "../utils/objectId.js";

const collection = () => getDatabase().collection("tasks");

export async function getTasks(req, res) {
  const filter = {};
  if (req.query.projectId) {
    if (!isValidObjectId(req.query.projectId)) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid projectId." });
    }
    filter.projectId = req.query.projectId;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedTo) {
    if (!isValidObjectId(req.query.assignedTo)) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid assignedTo." });
    }
    filter.assignedTo = req.query.assignedTo;
  }
  const tasks = await collection().find(filter).sort({ createdAt: -1 }).toArray();
  res.status(200).json(tasks);
}

export async function getTaskById(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid task ID." });
  }
  const task = await collection().findOne({ _id: new ObjectId(req.params.id) });
  if (!task) return res.status(404).json({ error: "Not Found", message: "Task not found." });
  res.status(200).json(task);
}

export async function createTask(req, res) {
  const project = await getDatabase().collection("projects").findOne({
    _id: new ObjectId(req.validatedBody.projectId)
  });
  if (!project) {
    return res.status(400).json({ error: "Validation Error", message: "projectId does not reference an existing project." });
  }

  const task = {
    ...req.validatedBody,
    createdBy: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const result = await collection().insertOne(task);
  res.status(201).json({ ...task, _id: result.insertedId });
}

export async function updateTask(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid task ID." });
  }
  if (req.validatedBody.projectId) {
    const project = await getDatabase().collection("projects").findOne({
      _id: new ObjectId(req.validatedBody.projectId)
    });
    if (!project) {
      return res.status(400).json({ error: "Validation Error", message: "projectId does not reference an existing project." });
    }
  }

  const result = await collection().findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { ...req.validatedBody, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  const task = result?.value ?? result;
  if (!task) return res.status(404).json({ error: "Not Found", message: "Task not found." });
  res.status(200).json(task);
}

export async function deleteTask(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid task ID." });
  }
  const result = await collection().deleteOne({ _id: new ObjectId(req.params.id) });
  if (!result.deletedCount) return res.status(404).json({ error: "Not Found", message: "Task not found." });
  res.status(204).send();
}