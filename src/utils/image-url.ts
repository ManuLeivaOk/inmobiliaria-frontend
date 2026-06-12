const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

export function resolveImageUrl(url?: string | null) {
  if (!url) {
    return "";
  }

  // Ya es absoluta
  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  // Normalizar slash
  const normalized = url.startsWith("/")
    ? url
    : `/${url}`;

  return `https://api.continentalpropiedades.site${normalized}`;
}
