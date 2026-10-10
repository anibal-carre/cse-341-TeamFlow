import "dotenv/config";
import app from "./app.js";
import { connectDatabase, closeDatabase } from "./config/database.js";

const port = process.env.PORT || 3000;
let server;

try {
  await connectDatabase();
  server = app.listen(port, () => console.log(`TeamFlow API listening on port ${port}`));
} catch (error) {
  console.error("Failed to start TeamFlow API:", error.message);
  process.exit(1);
}

async function shutdown() {
  console.log("Shutting down...");
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDatabase();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);