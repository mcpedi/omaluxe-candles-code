# Send order email

Deploy this function with the Supabase CLI:

```bash
supabase functions deploy send-order-email
supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL=... OWNER_EMAIL=...
```

`RESEND_FROM_EMAIL` must use a domain verified in Resend. The application server
also needs `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` so it can invoke this
function after an order is created. Never commit any of these secret values.
