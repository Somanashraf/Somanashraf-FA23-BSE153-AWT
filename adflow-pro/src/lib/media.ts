export type NormalizedMedia = {
  source_type: "image_url" | "youtube" | "github_raw" | "cdn" | "unknown";
  original_url: string;
  thumbnail_url: string | null;
  validation_status: "ok" | "warning" | "invalid";
};

const ALLOWED_IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i;

const DEFAULT_ALLOWED_HOSTS = [
  "i.imgur.com",
  "images.unsplash.com",
  "picsum.photos",
  "raw.githubusercontent.com",
  "github.com",
  "user-images.githubusercontent.com",
  "res.cloudinary.com",
  "img.youtube.com",
  "supabase.co",
];

function extractYouTubeId(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/shorts\/([^/]+)/);
      if (m) return m[1];
      const e = u.pathname.match(/\/embed\/([^/]+)/);
      if (e) return e[1];
    }
  } catch {
    return null;
  }
  return null;
}

function hostAllowed(hostname: string, extra?: string[]) {
  const all = [...DEFAULT_ALLOWED_HOSTS, ...(extra || [])];
  return all.some(
    (h) => hostname === h || hostname.endsWith(`.${h.replace(/^\*\./, "")}`),
  );
}

export function normalizeMediaUrl(
  raw: string,
  options?: { allowedHosts?: string[] },
): NormalizedMedia {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      source_type: "unknown",
      original_url: raw,
      thumbnail_url: null,
      validation_status: "invalid",
    };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return {
      source_type: "unknown",
      original_url: trimmed,
      thumbnail_url: null,
      validation_status: "invalid",
    };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return {
      source_type: "unknown",
      original_url: trimmed,
      thumbnail_url: null,
      validation_status: "invalid",
    };
  }

  const yt = extractYouTubeId(trimmed);
  if (yt) {
    return {
      source_type: "youtube",
      original_url: trimmed,
      thumbnail_url: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      validation_status: "ok",
    };
  }

  if (url.hostname === "raw.githubusercontent.com" || url.pathname.includes("/raw/")) {
    const ok = ALLOWED_IMAGE_EXT.test(url.pathname);
    return {
      source_type: "github_raw",
      original_url: trimmed,
      thumbnail_url: ok ? trimmed : null,
      validation_status: ok ? "ok" : "warning",
    };
  }

  const pathOk = ALLOWED_IMAGE_EXT.test(url.pathname);
  const hostOk = hostAllowed(url.hostname, options?.allowedHosts);
  if (pathOk && hostOk) {
    return {
      source_type: "image_url",
      original_url: trimmed,
      thumbnail_url: trimmed,
      validation_status: "ok",
    };
  }

  if (pathOk && !hostOk) {
    return {
      source_type: "cdn",
      original_url: trimmed,
      thumbnail_url: trimmed,
      validation_status: "warning",
    };
  }

  return {
    source_type: "unknown",
    original_url: trimmed,
    thumbnail_url: pathOk ? trimmed : null,
    validation_status: pathOk ? "warning" : "invalid",
  };
}
