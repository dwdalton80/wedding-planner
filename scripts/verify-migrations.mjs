import { execFileSync } from "node:child_process";
import mysql from "mysql2/promise";

const sourceUrl = process.env.DATABASE_URL;
const migrationUrl = process.env.MIGRATION_DATABASE_URL ?? sourceUrl;

if (!sourceUrl || !migrationUrl) {
  throw new Error("DATABASE_URL is required to verify migrations.");
}

const databaseUrl = new URL(sourceUrl);
const migrationDatabaseUrl = new URL(migrationUrl);
const baseDatabase = databaseUrl.pathname.replace(/^\//, "");

if (!/^[A-Za-z0-9_]+$/.test(baseDatabase)) {
  throw new Error("DATABASE_URL must include an alphanumeric or underscore database name for temporary migration verification.");
}

const temporaryDatabase = `${baseDatabase}_migration_check_${Date.now()}`;
const adminUrl = new URL(migrationDatabaseUrl);
adminUrl.pathname = "/";
const temporaryUrl = new URL(migrationDatabaseUrl);
temporaryUrl.pathname = `/${temporaryDatabase}`;

let admin;
let verificationConnection;
let temporaryDatabaseCreated = false;

try {
  admin = await mysql.createConnection(adminUrl.toString());
  await admin.query(`CREATE DATABASE \`${temporaryDatabase}\``);
  temporaryDatabaseCreated = true;

  execFileSync("pnpm", ["drizzle-kit", "migrate"], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: temporaryUrl.toString() },
    stdio: "inherit",
  });

  verificationConnection = await mysql.createConnection(temporaryUrl.toString());
  const [rows] = await verificationConnection.query("SHOW TABLES");
  const tableNames = rows.map(row => Object.values(row)[0]);
  const expectedTables = ["planner_items", "planner_settings", "planner_timeline_events"];
  const missingTables = expectedTables.filter(table => !tableNames.includes(table));

  if (missingTables.length > 0) {
    throw new Error(`Migration verification failed. Missing tables: ${missingTables.join(", ")}`);
  }

  console.log(`Migration verification passed in temporary database: ${temporaryDatabase}`);
} finally {
  if (verificationConnection) await verificationConnection.end();
  if (admin) {
    if (temporaryDatabaseCreated) await admin.query(`DROP DATABASE IF EXISTS \`${temporaryDatabase}\``);
    await admin.end();
  }
}
