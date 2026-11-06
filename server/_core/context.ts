import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateFirebaseRequest } from "./firebase-auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateFirebaseRequest(opts.req);
  } catch {
    // Public routes remain available if a token is absent or invalid.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
