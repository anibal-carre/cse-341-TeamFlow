import { describe, test, expect, beforeEach, afterAll } from "@jest/globals";
import request from "supertest";
import { ObjectId } from "mongodb";
import app from "../app.js";
import { setDatabaseForTests, clearDatabaseForTests } from "../config/database.js";

const projectId = new ObjectId("66b123456789012345678901");
const taskId = new ObjectId("66b223456789012345678901");
const project = { _id: projectId, name: "TeamFlow demo", description: "Test project", status: "active", visibility: "private" };
const task = { _id: taskId, projectId: projectId.toString(), title: "Write docs", description: "Document endpoints", status: "todo", priority: "high" };

function makeCollection(items) {
  return {
    find: (filter = {}) => ({
      sort: () => ({ toArray: async () => items.filter((item) => Object.entries(filter).every(([key, value]) => item[key] === value)) })
    }),
    findOne: async (filter) => items.find((item) => Object.entries(filter).every(([key, value]) => String(item[key]) === String(value))) || null
  };
}

beforeEach(() => {
  setDatabaseForTests({
    collection(name) {
      if (name === "projects") return makeCollection([project]);
      if (name === "tasks") return makeCollection([task]);
      throw new Error(`Unexpected collection ${name}`);
    }
  });
});

afterAll(() => clearDatabaseForTests());

describe("Projects GET endpoints", () => {
  test("GET /api/projects returns project list", async () => {
    const response = await request(app).get("/api/projects");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("TeamFlow demo");
  });

  test("GET /api/projects/:id returns one project", async () => {
    const response = await request(app).get(`/api/projects/${projectId}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("TeamFlow demo");
  });

  test("GET /api/projects/:id rejects invalid ID", async () => {
    const response = await request(app).get("/api/projects/not-an-id");
    expect(response.status).toBe(400);
  });
});

describe("Tasks GET endpoints", () => {
  test("GET /api/tasks returns task list", async () => {
    const response = await request(app).get("/api/tasks");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Write docs");
  });

  test("GET /api/tasks/:id returns one task", async () => {
    const response = await request(app).get(`/api/tasks/${taskId}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Write docs");
  });

  test("GET /api/tasks/:id rejects invalid ID", async () => {
    const response = await request(app).get("/api/tasks/not-an-id");
    expect(response.status).toBe(400);
  });

  test("GET /api/tasks rejects malformed projectId filter", async () => {
    const response = await request(app).get("/api/tasks?projectId=bad");
    expect(response.status).toBe(400);
  });
});
