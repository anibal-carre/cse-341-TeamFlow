import { MongoClient } from "mongodb";

let client;
let database;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "teamflow";

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);

  await Promise.all([
    database.collection("projects").createIndex({ ownerId: 1, createdAt: -1 }),
    database.collection("tasks").createIndex({ projectId: 1, createdAt: -1 }),
    database.collection("tasks").createIndex({ status: 1, priority: 1 })
  ]);

  console.log(`Connected to MongoDB database: ${dbName}`);
  return database;
}

export function getDatabase() {
  if (!database) {
    throw new Error("Database is not connected.");
  }
  return database;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}

// Allows tests to inject an isolated database handle if needed.
export function setDatabaseForTests(db) {
  database = db;
}

export function clearDatabaseForTests() {
  database = undefined;
}
