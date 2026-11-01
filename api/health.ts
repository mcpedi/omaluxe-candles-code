import postgres from "postgres";

export default async function handler(_request: unknown, response: any) {
  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return response.status(503).json({ database: "unconfigured" });
  }

  const sql = postgres(connectionString, { max: 1, prepare: false, connect_timeout: 8 });
  try {
    const [state] = await sql`
      SELECT
        EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'omaluxe') AS schema_exists,
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'omaluxe' AND table_name = 'products') AS products_table_exists,
        CASE
          WHEN to_regclass('omaluxe.products') IS NULL THEN false
          ELSE has_table_privilege(current_user, 'omaluxe.products', 'SELECT')
        END AS can_select_products
    `;
    return response.status(200).json({ database: "reachable", ...state });
  } catch (error: any) {
    return response.status(503).json({
      database: "unavailable",
      code: typeof error?.code === "string" ? error.code : "unknown",
    });
  } finally {
    await sql.end({ timeout: 3 });
  }
}
