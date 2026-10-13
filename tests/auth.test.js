import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../app.js";

describe("OAuth and protected mutations", () => {
  test("GET /auth/me rejects anonymous users", async () => {
    const response = await request(app).get("/auth/me");
    expect(response.status).toBe(401);
  });
  test("POST /api/projects requires authentication", async () => {
    const response = await request(app).post("/api/projects").send({ name: "Demo", description: "Demo project" });
    expect(response.status).toBe(401);
  });
  test("PUT /api/tasks/:id requires authentication before validation", async () => {
    const response = await request(app).put("/api/tasks/66b223456789012345678901").send({ title: "Changed" });
    expect(response.status).toBe(401);
  });
});
