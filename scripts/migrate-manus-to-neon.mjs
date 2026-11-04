import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import postgres from "postgres";

const sourceUrl = process.env.DATABASE_URL;
const targetUrl = process.env.NEON_DATABASE_URL;
if (!sourceUrl) throw new Error("DATABASE_URL is required for the Manus source database");
if (!targetUrl) throw new Error("NEON_DATABASE_URL is required for the Neon target database");

const migrationSql = await fs.readFile(new URL("../drizzle-neon/0000_stiff_hedge_knight.sql", import.meta.url), "utf8");
const schemaName = "omaluxe";
const tables = [
  "users",
  "categories",
  "products",
  "cart_items",
  "orders",
  "order_items",
  "notifications",
  "notification_preferences",
  "wishlist_items",
  "coupons",
  "reviews",
];

const dateColumns = new Set(["createdAt", "updatedAt", "lastSignedIn", "expiresAt"]);
const booleanColumns = new Set([
  "isFeatured",
  "isBestseller",
  "isRead",
  "orderUpdates",
  "promotions",
  "newArrivals",
  "isActive",
]);

function normalizeRow(row) {
  const normalized = { ...row };
  for (const [key, value] of Object.entries(normalized)) {
    if (value === null || value === undefined) continue;
    if (booleanColumns.has(key)) {
      normalized[key] = value === true || value === 1 || value === "1";
    } else if (key === "sizes" && typeof value === "string") {
      normalized[key] = JSON.parse(value);
    } else if (dateColumns.has(key) && !(value instanceof Date)) {
      normalized[key] = new Date(value);
    }
  }
  return normalized;
}

const source = await mysql.createConnection(sourceUrl);
const target = postgres(targetUrl, {
  max: 4,
  connect_timeout: 20,
  prepare: false,
});

try {
  const existing = await target`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = ${schemaName}
      AND table_name IN ${target(tables)}
  `;
  if (existing.length > 0) {
    throw new Error(`Neon schema ${schemaName} already contains OmaLuxe tables: ${existing.map((row) => row.table_name).join(", ")}. Aborting to prevent duplicate data.`);
  }

  await target.begin(async (tx) => {
    await tx.unsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    for (const statement of migrationSql.split("--> statement-breakpoint")) {
      const trimmed = statement.trim();
      if (trimmed) await tx.unsafe(trimmed);
    }

    for (const table of tables) {
      const [rows] = await source.query(`SELECT * FROM \`${table}\``);
      const normalizedRows = rows.map(normalizeRow);
      if (normalizedRows.length > 0) {
        await tx`INSERT INTO ${tx(schemaName + "." + table)} ${tx(normalizedRows)}`;
      }
      await tx.unsafe(
        `SELECT setval(pg_get_serial_sequence('"${schemaName}"."${table}"', 'id'), COALESCE(MAX("id"), 1), MAX("id") IS NOT NULL) FROM "${schemaName}"."${table}"`
      );
      console.log(`${table}: ${normalizedRows.length} rows copied`);
    }
  });

  const verification = await target`
    SELECT table_name, row_count
    FROM (
      SELECT 'users' AS table_name, COUNT(*)::int AS row_count FROM ${target(schemaName + ".users")}
      UNION ALL SELECT 'categories', COUNT(*)::int FROM ${target(schemaName + ".categories")}
      UNION ALL SELECT 'products', COUNT(*)::int FROM ${target(schemaName + ".products")}
      UNION ALL SELECT 'cart_items', COUNT(*)::int FROM ${target(schemaName + ".cart_items")}
      UNION ALL SELECT 'orders', COUNT(*)::int FROM ${target(schemaName + ".orders")}
      UNION ALL SELECT 'order_items', COUNT(*)::int FROM ${target(schemaName + ".order_items")}
      UNION ALL SELECT 'notifications', COUNT(*)::int FROM ${target(schemaName + ".notifications")}
      UNION ALL SELECT 'notification_preferences', COUNT(*)::int FROM ${target(schemaName + ".notification_preferences")}
      UNION ALL SELECT 'wishlist_items', COUNT(*)::int FROM ${target(schemaName + ".wishlist_items")}
      UNION ALL SELECT 'coupons', COUNT(*)::int FROM ${target(schemaName + ".coupons")}
      UNION ALL SELECT 'reviews', COUNT(*)::int FROM ${target(schemaName + ".reviews")}
    ) counts
    ORDER BY table_name
  `;
  console.log("Neon verification:", JSON.stringify(verification));
} finally {
  await source.end();
  await target.end({ timeout: 5 });
}
