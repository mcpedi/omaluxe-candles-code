import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { getBearerToken, getFirebaseOpenId } from "./_core/firebase-auth";
import { resolveUniqueEmailMatch } from "./db";

describe("Firebase identity mapping", () => {
  it("creates a stable database key scoped to the Firebase project", () => {
    const uid = "firebase-user-123";
    const projectId = "omaluxe-test";
    const expected = createHash("sha256")
      .update(`${projectId}:${uid}`)
      .digest("hex");

    expect(getFirebaseOpenId(uid, projectId)).toBe(expected);
    expect(getFirebaseOpenId(uid, projectId)).toHaveLength(64);
    expect(getFirebaseOpenId(uid, "another-project")).not.toBe(expected);
  });

  it("extracts one bearer token and rejects malformed authorization headers", () => {
    expect(getBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(getBearerToken(["Bearer array-token"])).toBe("array-token");
    expect(getBearerToken("Basic abc.def.ghi")).toBeNull();
    expect(getBearerToken("Bearer two tokens")).toBeNull();
    expect(getBearerToken(undefined)).toBeNull();
  });

  it("links only a unique legacy email match and rejects ambiguous records", () => {
    const customer = { id: 7 };
    expect(resolveUniqueEmailMatch([customer])).toBe(customer);
    expect(resolveUniqueEmailMatch([])).toBeUndefined();
    expect(() => resolveUniqueEmailMatch([customer, { id: 8 }])).toThrow(
      "Multiple customer records share this verified email"
    );
  });
});
