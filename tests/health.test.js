import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../app.js";

describe("GET /api/health", () => {
  test("returns a healthy response", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("TeamFlow API");
  });
});

describe("GET unknown route", () => {
  test("returns 404 JSON", async () => {
    const response = await request(app).get("/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Not Found");
  });
});