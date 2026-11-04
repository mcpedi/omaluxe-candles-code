export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = () => {
  if (typeof window === "undefined") return "/login";

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const redirectTo = currentPath === "/login" || currentPath.startsWith("/login?")
    ? "/"
    : currentPath;

  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
};
