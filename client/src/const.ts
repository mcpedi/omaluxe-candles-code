export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getSafeInternalRedirect = (
  value: string | null | undefined,
  fallback = "/account"
): string => {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  try {
    const destination = new URL(value, window.location.origin);
    if (
      destination.origin !== window.location.origin ||
      !destination.pathname.startsWith("/") ||
      destination.pathname.startsWith("//") ||
      destination.pathname === "/login" ||
      destination.pathname.startsWith("/login/")
    ) {
      return fallback;
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
};

export const getLoginUrl = (nextPath?: string) => {
  if (typeof window === "undefined") return "/login";
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const target =
    nextPath ?? (window.location.pathname === "/login" ? "/account" : currentPath);
  const safeTarget = getSafeInternalRedirect(target, "/account");
  const encodedTarget = encodeURIComponent(safeTarget);
  // Emit both query names for older links and callers that expect redirectTo.
  return `/login?next=${encodedTarget}&redirectTo=${encodedTarget}`;
};

export const getPostLoginPath = () => {
  if (typeof window === "undefined") return "/account";
  const params = new URLSearchParams(window.location.search);
  return getSafeInternalRedirect(
    params.get("redirectTo") ?? params.get("next"),
    "/account"
  );
};
