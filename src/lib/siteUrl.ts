export function getAppUrl(path = "") {
  const baseUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL || window.location.origin;
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
