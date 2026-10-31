import { afterEach, describe, expect, it } from "vitest";
import postgres from "postgres";

let sql: ReturnType<typeof postgres> | undefined;

afterEach(async () => {
  if (sql) {
    await sql.end({ timeout: 5 });
    sql = undefined;
  }
});

describe("Neon database connection", () => {
  it("can execute a lightweight SELECT 1 query", async () => {
    const connectionString = process.env.NEON_DATABASE_URL;
    expect(connectionString, "NEON_DATABASE_URL must be configured").toMatch(/^postgres(ql)?:\/\//);

    sql = postgres(connectionString!, {
      max: 1,
      connect_timeout: 20,
      idle_timeout: 5,
      prepare: false,
    });

    const result = await sql`SELECT 1 AS connected`;
    expect(result[0]?.connected).toBe(1);
  }, 30_000);
});
