import { createHash } from "node:crypto";
import type { Request } from "express";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { ServiceAccount } from "firebase-admin/app";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

type FirebaseServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const FIREBASE_ADMIN_APP_NAME = "omaluxe-firebase-auth";

function getServiceAccount(): FirebaseServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON");
  }

  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as Record<string, unknown>).project_id !== "string" ||
    typeof (value as Record<string, unknown>).client_email !== "string" ||
    typeof (value as Record<string, unknown>).private_key !== "string"
  ) {
    throw new Error("Firebase service-account JSON is missing required fields");
  }

  return value as FirebaseServiceAccount;
}

export function hasFirebaseAdminConfiguration(): boolean {
  try {
    getServiceAccount();
    return true;
  } catch {
    return false;
  }
}

function getFirebaseAdminAuth() {
  const account = getServiceAccount();
  const existing = getApps().find((app) => app.name === FIREBASE_ADMIN_APP_NAME);
  const app =
    existing ??
    initializeApp(
      {
        credential: cert({
          projectId: account.project_id,
          clientEmail: account.client_email,
          privateKey: account.private_key,
        } satisfies ServiceAccount),
        projectId: account.project_id,
      },
      FIREBASE_ADMIN_APP_NAME
    );

  return getAuth(app);
}

export function getFirebaseOpenId(uid: string, projectId: string): string {
  return createHash("sha256").update(`${projectId}:${uid}`).digest("hex");
}

export function getBearerToken(
  authorization: string | string[] | undefined
): string | null {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!header) return null;

  const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export async function authenticateFirebaseRequest(
  req: Pick<Request, "headers">
): Promise<User | null> {
  const token = getBearerToken(req.headers.authorization);
  if (!token) return null;

  const account = getServiceAccount();
  const decoded = await getFirebaseAdminAuth().verifyIdToken(token, true);
  const email = decoded.email?.trim().toLowerCase();

  // Only verified Firebase email addresses may receive or link customer records.
  if (!decoded.uid || !email || decoded.email_verified !== true) return null;

  const openId = getFirebaseOpenId(decoded.uid, account.project_id);
  const profile = {
    openId,
    name:
      typeof decoded.name === "string" && decoded.name.trim()
        ? decoded.name.trim()
        : email.split("@")[0] || null,
    email,
    loginMethod: "firebase",
    lastSignedIn: new Date(),
  };

  let user = await db.getUserByOpenId(openId);

  if (!user) {
    const existingByVerifiedEmail = await db.getUserByEmail(email);
    if (existingByVerifiedEmail) {
      try {
        user = await db.linkExistingUserToFirebase(
          existingByVerifiedEmail.id,
          profile
        );
      } catch {
        // If another request linked this Firebase identity concurrently, resolve
        // the unique identity after the first request commits.
        user = await db.getUserByOpenId(openId);
        if (!user) throw new Error("Unable to link the verified Firebase account");
      }
    }
  }

  // Explicitly carry the stored role for existing accounts and default new
  // Firebase accounts to "user", preventing email-based admin auto-promotion.
  const role = user?.role ?? "user";
  await db.upsertUser({ ...profile, role });

  user = await db.getUserByOpenId(openId);
  if (!user) {
    throw new Error("Firebase identity could not be saved to the customer database");
  }

  return user;
}
