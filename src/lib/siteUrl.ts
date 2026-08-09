export function getAppUrl(path = "") {
  // Use production URL for certificate verification links
  const productionUrl = "https://lernexai.site";
  const baseUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL || productionUrl;
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
