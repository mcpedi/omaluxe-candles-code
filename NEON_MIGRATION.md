# OmaLuxe Neon migration

The OmaLuxe database was migrated from the Manus MySQL database to PostgreSQL on Neon.

## Connection and isolation

- The server prefers the project secret `NEON_DATABASE_URL` and falls back to `DATABASE_URL` for compatibility.
- OmaLuxe tables and enum types live in the dedicated PostgreSQL schema `omaluxe`.
- The supplied Neon database already contained another application in `public`; no public tables were modified, dropped, or overwritten.
- The original Manus database remains intact as a rollback source.

## Imported row counts

| Table | Rows |
| --- | ---: |
| users | 8 |
| categories | 3 |
| products | 9 |
| cart_items | 1 |
| orders | 0 |
| order_items | 0 |
| notifications | 62 |
| notification_preferences | 1 |
| wishlist_items | 2 |
| coupons | 14 |
| reviews | 12 |

All serial sequences were reset to continue after the imported IDs.

## Verification

- Neon connection test: passed.
- TypeScript check: passed.
- Vitest: 48 passed, 3 skipped.
- Production build: passed.
- Live storefront preview loaded product data from the migrated database.

## Future schema changes

Use the PostgreSQL schema and migration directory already configured in `drizzle.config.ts`:

```bash
pnpm db:generate
pnpm db:migrate
```

The one-time source migration script is retained at `scripts/migrate-manus-to-neon.mjs`. It aborts if the `omaluxe` schema already contains tables, preventing accidental duplicate imports.
