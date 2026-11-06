# Firebase Authentication Setup

OmaLuxe uses Firebase Authentication for account creation, email/password sign-in, verification, password reset and persistent browser sessions. Firebase verifies identity; the existing PostgreSQL database continues to own customer records, carts, orders, reviews, wishlists and notifications.

## Firebase project

1. In Firebase Console, create or select the project for OmaLuxe and register a Web app.
2. Under **Authentication → Sign-in method**, enable **Email/Password**.
3. Configure the email-verification and password-reset templates. Add the app's Preview and production hostnames to **Authentication → Settings → Authorized domains**.
4. Copy the Web app's `apiKey`, `authDomain`, `projectId` and `appId` values into the matching `VITE_FIREBASE_*` project environment values.
5. Create/download a Firebase Admin service-account JSON for the same project. Add the complete JSON document as the protected `FIREBASE_SERVICE_ACCOUNT_JSON` server environment value. Never commit that JSON or paste it into source code.
6. Set `DATABASE_URL` to the PostgreSQL connection string used by the existing OmaLuxe data. The server also accepts `NEON_DATABASE_URL` for compatibility with prior deployments.

The `VITE_FIREBASE_*` values are web-app configuration and are included in the browser bundle by design; they are not service-account credentials. The Admin service-account value and database URL must remain server-side secrets.

## Account behavior

Firebase stores the browser session using local persistence. The server accepts only Firebase ID tokens in the `Authorization: Bearer …` header, verifies them with Firebase Admin (including revocation checks), and requires a verified email before exposing customer data. When a verified Firebase email uniquely matches an existing OmaLuxe customer record, the Firebase identity is attached to that record so its order history and role are retained. Otherwise, a Firebase-backed customer record is created when no legacy email match exists. If multiple legacy customer records share the same normalized email, account linking fails closed and no new record is created; a trusted admin workflow must resolve those duplicates before that customer can access account data.

If Firebase settings are absent, the storefront remains viewable and the sign-in screen explains that setup is required. Protected customer APIs also need the server service-account credential and the existing PostgreSQL database connection.

An existing administrator role is retained only when a verified Firebase email uniquely matches that administrator's existing customer record. New registrations remain regular customers and are never promoted automatically. For a fresh database, provision the initial administrator through a trusted database/admin workflow.
