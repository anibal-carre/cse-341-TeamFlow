import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TeamFlow API",
      version: "1.0.0",
      description: "CSE 341 TeamFlow API. Week 05 implements Projects and Tasks CRUD. OAuth and authorization will be added in a later project phase."
    },
    servers: [
      { url: "http://localhost:8080", description: "Local development" },
      { url: process.env.RENDER_EXTERNAL_URL || "https://your-render-service.onrender.com", description: "Render deployment (replace with your service URL)" }
    ],
    tags: [
      { name: "Health", description: "API health checks" },
      { name: "Projects", description: "Project CRUD endpoints" },
      { name: "Tasks", description: "Task CRUD endpoints" }
    ],
    components: {
      schemas: {
        ProjectInput: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: { type: "string", maxLength: 100, example: "Website redesign" },
            description: { type: "string", maxLength: 2000, example: "Redesign the company website." },
            status: { type: "string", enum: ["planning", "active", "completed", "archived"], default: "planning" },
            startDate: { type: "string", format: "date-time" },
            dueDate: { type: "string", format: "date-time" },
            visibility: { type: "string", enum: ["private", "public"], default: "private" }
          }
        },
        TaskInput: {
          type: "object",
          required: ["projectId", "title", "description"],
          properties: {
            projectId: { type: "string", pattern: "^[a-fA-F0-9]{24}$", example: "66b123456789012345678901" },
            title: { type: "string", maxLength: 150, example: "Create API documentation" },
            description: { type: "string", maxLength: 3000, example: "Document all project endpoints." },
            assignedTo: { type: "string", nullable: true },
            status: { type: "string", enum: ["todo", "in_progress", "completed", "blocked"], default: "todo" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"], default: "medium" },
            dueDate: { type: "string", format: "date-time", nullable: true }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Bad Request" },
            message: { type: "string", example: "Invalid project ID." }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js", "./app.js"]
};

const spec = swaggerJsdoc(options);

// Explicit paths keep Swagger comprehensive and usable as a REST client.
spec.paths = {
  ...spec.paths,
  "/api/health": {
    get: {
      tags: ["Health"], summary: "Check API health",
      responses: { "200": { description: "API is running" } }
    }
  },
  "/api/projects": {
    get: {
      tags: ["Projects"], summary: "List projects",
      parameters: [
        { in: "query", name: "status", schema: { type: "string", enum: ["planning", "active", "completed", "archived"] } },
        { in: "query", name: "visibility", schema: { type: "string", enum: ["private", "public"] } }
      ],
      responses: { "200": { description: "Project list" }, "500": { description: "Server error" } }
    },
    post: {
      tags: ["Projects"], summary: "Create project",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectInput" } } } },
      responses: { "201": { description: "Project created" }, "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } }
    }
  },
  "/api/projects/{id}": {
    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
    get: { tags: ["Projects"], summary: "Get project by ID", responses: { "200": { description: "Project found" }, "400": { description: "Invalid ID" }, "404": { description: "Project not found" } } },
    put: {
      tags: ["Projects"], summary: "Update project",
      requestBody: { required: true, content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/ProjectInput" }] } } } },
      responses: { "200": { description: "Project updated" }, "400": { description: "Validation error" }, "404": { description: "Project not found" } }
    },
    delete: { tags: ["Projects"], summary: "Delete project and its tasks", responses: { "204": { description: "Project deleted" }, "400": { description: "Invalid ID" }, "404": { description: "Project not found" } } }
  },
  "/api/tasks": {
    get: {
      tags: ["Tasks"], summary: "List tasks",
      parameters: [
        { in: "query", name: "projectId", schema: { type: "string" } },
        { in: "query", name: "status", schema: { type: "string", enum: ["todo", "in_progress", "completed", "blocked"] } },
        { in: "query", name: "priority", schema: { type: "string", enum: ["low", "medium", "high", "urgent"] } },
        { in: "query", name: "assignedTo", schema: { type: "string" } }
      ],
      responses: { "200": { description: "Task list" }, "400": { description: "Invalid query parameter" } }
    },
    post: {
      tags: ["Tasks"], summary: "Create task",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } } },
      responses: { "201": { description: "Task created" }, "400": { description: "Validation error or project not found" } }
    }
  },
  "/api/tasks/{id}": {
    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
    get: { tags: ["Tasks"], summary: "Get task by ID", responses: { "200": { description: "Task found" }, "400": { description: "Invalid ID" }, "404": { description: "Task not found" } } },
    put: {
      tags: ["Tasks"], summary: "Update task",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } } },
      responses: { "200": { description: "Task updated" }, "400": { description: "Validation error" }, "404": { description: "Task not found" } }
    },
    delete: { tags: ["Tasks"], summary: "Delete task", responses: { "204": { description: "Task deleted" }, "400": { description: "Invalid ID" }, "404": { description: "Task not found" } } }
  }
};
export default spec;