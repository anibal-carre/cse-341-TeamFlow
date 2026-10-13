import swaggerJsdoc from "swagger-jsdoc";

const idParam = [{ in: "path", name: "id", required: true, schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" } }];
const jsonBody = (schema) => ({ required: true, content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}` } } } });
const responses = (name) => ({
  "200": { description: `${name} returned or updated successfully.` },
  "201": { description: `${name} created successfully.` },
  "204": { description: `${name} deleted successfully.` },
  "400": { description: "Invalid input or identifier." },
  "401": { description: "Authentication required for this operation." },
  "403": { description: "Authenticated user does not have permission." },
  "404": { description: `${name} not found.` },
  "500": { description: "Unexpected server error." }
});
const crudPaths = (base, tag, schema, updateSchema, queryParameters = []) => ({
  [base]: {
    get: { tags: [tag], summary: `List ${tag.toLowerCase()}`, parameters: queryParameters, responses: { "200": { description: `${tag} list returned.` }, "400": { description: "Invalid filter." }, "500": { description: "Unexpected server error." } } },
    post: { tags: [tag], summary: `Create ${tag.slice(0, -1).toLowerCase()}`, security: [{ cookieAuth: [] }], requestBody: jsonBody(schema), responses: responses(tag) }
  },
  [`${base}/{id}`]: {
    parameters: idParam,
    get: { tags: [tag], summary: `Get ${tag.slice(0, -1).toLowerCase()} by ID`, responses: { "200": { description: `${tag.slice(0, -1)} returned.` }, "400": { description: "Invalid ID." }, "404": { description: "Record not found." } } },
    put: { tags: [tag], summary: `Update ${tag.slice(0, -1).toLowerCase()}`, security: [{ cookieAuth: [] }], requestBody: jsonBody(updateSchema), responses: responses(tag) },
    delete: { tags: [tag], summary: `Delete ${tag.slice(0, -1).toLowerCase()}`, security: [{ cookieAuth: [] }], responses: responses(tag) }
  }
});

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TeamFlow API",
      version: "1.1.0",
      description: "CSE 341 team project management REST API. Projects, tasks, comments, and memberships support CRUD. Mutations require a GitHub OAuth session."
    },
    servers: [
      { url: "http://localhost:8080", description: "Local development" },
      ...(process.env.RENDER_EXTERNAL_URL ? [{ url: process.env.RENDER_EXTERNAL_URL, description: "Render deployment" }] : [])
    ],
    tags: [
      { name: "Health" }, { name: "Authentication" }, { name: "Projects" },
      { name: "Tasks" }, { name: "Comments" }, { name: "Memberships" }
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "teamflow.sid", description: "Session cookie created after GitHub OAuth login." }
      },
      schemas: {
        ProjectInput: {
          type: "object", required: ["name", "description"], additionalProperties: false,
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
          type: "object", required: ["projectId", "title", "description"], additionalProperties: false,
          properties: {
            projectId: { type: "string", pattern: "^[a-fA-F0-9]{24}$", example: "66b123456789012345678901" },
            title: { type: "string", maxLength: 150, example: "Create API documentation" },
            description: { type: "string", maxLength: 3000 },
            assignedTo: { type: "string", nullable: true },
            status: { type: "string", enum: ["todo", "in_progress", "completed", "blocked"], default: "todo" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"], default: "medium" },
            dueDate: { type: "string", format: "date-time", nullable: true }
          }
        },
        CommentInput: {
          type: "object", required: ["taskId", "body"], additionalProperties: false,
          properties: {
            taskId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            body: { type: "string", maxLength: 3000, example: "The new endpoint looks good." },
            parentCommentId: { type: "string", nullable: true, pattern: "^[a-fA-F0-9]{24}$" }
          }
        },
        MembershipInput: {
          type: "object", required: ["projectId", "userId"], additionalProperties: false,
          properties: {
            projectId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            userId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            role: { type: "string", enum: ["owner", "admin", "member", "viewer"], default: "member" },
            status: { type: "string", enum: ["invited", "active", "inactive"], default: "active" }
          }
        },
        ProjectUpdate: {
          type: "object", minProperties: 1, additionalProperties: false,
          properties: {
            name: { type: "string", maxLength: 100 },
            description: { type: "string", maxLength: 2000 },
            status: { type: "string", enum: ["planning", "active", "completed", "archived"] },
            startDate: { type: "string", format: "date-time" },
            dueDate: { type: "string", format: "date-time" },
            visibility: { type: "string", enum: ["private", "public"] }
          }
        },
        TaskUpdate: {
          type: "object", minProperties: 1, additionalProperties: false,
          properties: {
            projectId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            title: { type: "string", maxLength: 150 },
            description: { type: "string", maxLength: 3000 },
            assignedTo: { type: "string", nullable: true },
            status: { type: "string", enum: ["todo", "in_progress", "completed", "blocked"] },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
            dueDate: { type: "string", format: "date-time", nullable: true }
          }
        },
        CommentUpdate: {
          type: "object", minProperties: 1, additionalProperties: false,
          properties: {
            taskId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            body: { type: "string", maxLength: 3000 },
            parentCommentId: { type: "string", nullable: true, pattern: "^[a-fA-F0-9]{24}$" }
          }
        },
        MembershipUpdate: {
          type: "object", minProperties: 1, additionalProperties: false,
          properties: {
            projectId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            userId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            role: { type: "string", enum: ["owner", "admin", "member", "viewer"] },
            status: { type: "string", enum: ["invited", "active", "inactive"] }
          }
        },
        Error: { type: "object", properties: { error: { type: "string" }, message: { type: "string" }, details: { type: "array", items: { type: "string" } } } }
      }
    }
  },
  apis: ["./routes/*.js", "./app.js"]
};
const spec = swaggerJsdoc(options);
spec.paths = {
  ...spec.paths,
  "/api/health": { get: { tags: ["Health"], summary: "Check API health", responses: { "200": { description: "API is running." } } } },
  "/auth/github": { get: { tags: ["Authentication"], summary: "Start GitHub OAuth login", responses: { "302": { description: "Redirects to GitHub." }, "503": { description: "OAuth is not configured." } } } },
  "/auth/github/callback": { get: { tags: ["Authentication"], summary: "GitHub OAuth callback", responses: { "302": { description: "Redirects after authentication." } } } },
  "/auth/me": { get: { tags: ["Authentication"], summary: "Get the current authenticated user", responses: { "200": { description: "Authenticated user." }, "401": { description: "Not signed in." } } } },
  "/auth/logout": { post: { tags: ["Authentication"], summary: "Sign out", responses: { "200": { description: "Session ended." } } } },
  ...crudPaths("/api/projects", "Projects", "ProjectInput", "ProjectUpdate", [
    { in: "query", name: "status", schema: { type: "string", enum: ["planning", "active", "completed", "archived"] } },
    { in: "query", name: "visibility", schema: { type: "string", enum: ["private", "public"] } }
  ]),
  ...crudPaths("/api/tasks", "Tasks", "TaskInput", "TaskUpdate", [
    { in: "query", name: "projectId", schema: { type: "string" } },
    { in: "query", name: "status", schema: { type: "string", enum: ["todo", "in_progress", "completed", "blocked"] } },
    { in: "query", name: "priority", schema: { type: "string", enum: ["low", "medium", "high", "urgent"] } },
    { in: "query", name: "assignedTo", schema: { type: "string" } }
  ]),
  ...crudPaths("/api/comments", "Comments", "CommentInput", "CommentUpdate", [
    { in: "query", name: "taskId", schema: { type: "string" } },
    { in: "query", name: "createdBy", schema: { type: "string" } }
  ]),
  ...crudPaths("/api/memberships", "Memberships", "MembershipInput", "MembershipUpdate", [
    { in: "query", name: "projectId", schema: { type: "string" } },
    { in: "query", name: "userId", schema: { type: "string" } },
    { in: "query", name: "role", schema: { type: "string" } },
    { in: "query", name: "status", schema: { type: "string" } }
  ])
};
export default spec;
