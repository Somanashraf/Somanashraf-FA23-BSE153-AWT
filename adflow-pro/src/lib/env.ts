/** True when Supabase URL and service key look real (not template placeholders). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!url || !key) return false;
  if (url.includes("your-project")) return false;
  if (key.includes("your-service-role")) return false;
  if (!url.startsWith("https://")) return false;
  if (key.length < 20) return false;
  return true;
}
