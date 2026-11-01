import postgres from "postgres";

export default async function handler(_request: unknown, response: any) {
  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return response.status(503).json({ database: "unconfigured" });
  }

  const sql = postgres(connectionString, { max: 1, prepare: false, connect_timeout: 8 });
  let stage = "connect";
  try {
    await sql`SELECT current_database()`;
    stage = "schema_lookup";
    const [schema] = await sql`SELECT to_regnamespace('omaluxe') IS NOT NULL AS exists`;
    stage = "schema_usage";
    const [usage] = await sql`SELECT has_schema_privilege(current_user, 'omaluxe', 'USAGE') AS allowed`;
    stage = "product_table_lookup";
    const [table] = await sql`SELECT to_regclass('omaluxe.products') IS NOT NULL AS exists`;
    stage = "product_select_permission";
    const [select] = await sql`
      SELECT CASE WHEN to_regclass('omaluxe.products') IS NULL THEN false
        ELSE has_table_privilege(current_user, 'omaluxe.products', 'SELECT') END AS allowed
    `;
    return response.status(200).json({
      database: "reachable",
      schemaExists: schema.exists,
      schemaUsage: usage.allowed,
      productsTableExists: table.exists,
      canSelectProducts: select.allowed,
    });
  } catch (error: any) {
    return response.status(503).json({
      database: "unavailable",
      stage,
      code: typeof error?.code === "string" ? error.code : "unknown",
      message: typeof error?.message === "string" ? error.message : "query failed",
    });
  } finally {
    await sql.end({ timeout: 3 });
  }
}
