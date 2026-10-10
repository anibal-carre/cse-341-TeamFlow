import { getDatabase } from "../config/database.js";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "../utils/objectId.js";

const collection = () => getDatabase().collection("projects");

export async function getProjects(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.visibility) filter.visibility = req.query.visibility;
  const projects = await collection().find(filter).sort({ createdAt: -1 }).toArray();
  res.status(200).json(projects);
}

export async function getProjectById(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid project ID." });
  }
  const project = await collection().findOne({ _id: new ObjectId(req.params.id) });
  if (!project) return res.status(404).json({ error: "Not Found", message: "Project not found." });
  res.status(200).json(project);
}

export async function createProject(req, res) {
  const now = new Date();
  const project = {
    ...req.validatedBody,
    ownerId: null,
    createdAt: now,
    updatedAt: now
  };
  const result = await collection().insertOne(project);
  res.status(201).json({ ...project, _id: result.insertedId });
}

export async function updateProject(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid project ID." });
  }
  const result = await collection().findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { ...req.validatedBody, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  const project = result?.value ?? result;
  if (!project) return res.status(404).json({ error: "Not Found", message: "Project not found." });
  res.status(200).json(project);
}

export async function deleteProject(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid project ID." });
  }
  const id = new ObjectId(req.params.id);
  const existing = await collection().findOne({ _id: id });
  if (!existing) return res.status(404).json({ error: "Not Found", message: "Project not found." });

  // Week 05: tasks are also removed to avoid orphaned task records.
  await getDatabase().collection("tasks").deleteMany({ projectId: id.toString() });
  await collection().deleteOne({ _id: id });
  res.status(204).send();
}