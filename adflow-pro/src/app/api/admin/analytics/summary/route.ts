import { getSession } from "@/lib/auth/session";
import { requireRoles, isAdminLike } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../../_utils";

export async function GET() {
  try {
    const session = await getSession();
    requireRoles(session, ["admin", "super_admin"]);
    if (!isAdminLike(session!.role)) return jsonError("Forbidden", 403);
    const db = supabaseAdmin();

    const headCount = async (table: string, filters?: Record<string, string | string[]>) => {
      let q = db.from(table).select("*", { count: "exact", head: true });
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (Array.isArray(v)) q = q.in(k, v);
          else q = q.eq(k, v);
        }
      }
      const { count, error } = await q;
      if (error) throw new Error(error.message);
      return count ?? 0;
    };

    const [totalAds, activeAds, pendingReview, expiredAds, verifiedPayments] =
      await Promise.all([
        headCount("ads"),
        headCount("ads", { status: "published" }),
        headCount("ads", {
          status: [
            "submitted",
            "under_review",
            "payment_pending",
            "payment_submitted",
          ],
        }),
        headCount("ads", { status: "expired" }),
        headCount("payments", { status: "verified" }),
      ]);

    const { data: payRows, error: payErr } = await db
      .from("payments")
      .select(
        `amount,
         ads ( package_id, packages ( name ) )`,
      )
      .eq("status", "verified");
    if (payErr) throw new Error(payErr.message);

    const revenueByPackage: Record<string, number> = {};
    for (const row of payRows ?? []) {
      const ads = row.ads as
        | { packages?: { name?: string } | null }
        | { packages?: { name?: string } | null }[]
        | null;
      const pkg = Array.isArray(ads) ? ads[0]?.packages : ads?.packages;
      const name = pkg?.name ?? "Unknown";
      const amt =
        typeof row.amount === "string" ? parseFloat(row.amount) : Number(row.amount);
      revenueByPackage[name] = (revenueByPackage[name] || 0) + (Number.isFinite(amt) ? amt : 0);
    }

    const { data: byCategory } = await db
      .from("ads")
      .select("categories(name)")
      .eq("status", "published")
      .not("category_id", "is", null);

    const catMap: Record<string, number> = {};
    for (const row of byCategory ?? []) {
      const c = row.categories as { name?: string } | null;
      const name = c?.name ?? "Uncategorized";
      catMap[name] = (catMap[name] || 0) + 1;
    }

    const { data: byCity } = await db
      .from("ads")
      .select("cities(name)")
      .eq("status", "published")
      .not("city_id", "is", null);

    const cityMap: Record<string, number> = {};
    for (const row of byCity ?? []) {
      const c = row.cities as { name?: string } | null;
      const name = c?.name ?? "Unknown";
      cityMap[name] = (cityMap[name] || 0) + 1;
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: modHist } = await db
      .from("ad_status_history")
      .select("new_status")
      .in("new_status", ["payment_pending", "rejected"])
      .gte("changed_at", since);

    let approved = 0;
    let rejected = 0;
    for (const h of modHist ?? []) {
      if (h.new_status === "payment_pending") approved += 1;
      if (h.new_status === "rejected") rejected += 1;
    }

    const { data: health } = await db
      .from("system_health_logs")
      .select("source, status, response_ms, checked_at")
      .order("checked_at", { ascending: false })
      .limit(15);

    const { count: invalidMedia } = await db
      .from("ad_media")
      .select("*", { count: "exact", head: true })
      .eq("validation_status", "invalid");

    const { data: snapRows, error: snapErr } = await db
      .from("analytics_snapshots")
      .select("captured_at, payload")
      .order("captured_at", { ascending: false })
      .limit(14);
    const snapshots = snapErr ? [] : (snapRows ?? []);

    const cityRows = Object.entries(cityMap).map(([name, ads]) => ({ name, ads }));

    return jsonOk({
      listings: {
        total: totalAds,
        active: activeAds,
        pending_pipeline: pendingReview,
        expired: expiredAds,
      },
      revenue: {
        verified_payment_count: verifiedPayments,
        by_package: revenueByPackage,
      },
      moderation: {
        approx_approvals_30d: approved,
        approx_rejections_30d: rejected,
        approval_rate:
          approved + rejected === 0
            ? null
            : Math.round((approved / (approved + rejected)) * 1000) / 10,
      },
      moderation_pie: [
        { name: "Approved to payment", value: approved },
        { name: "Rejected", value: rejected },
      ],
      taxonomy: { by_category: catMap, by_city: cityMap, by_city_rows: cityRows },
      operations: {
        health_recent: health ?? [],
        invalid_media_count: invalidMedia ?? 0,
      },
      snapshots,
    });
  } catch (e) {
    const msg =
      e instanceof Error && e.message === "FORBIDDEN"
        ? "Forbidden"
        : e instanceof Error && e.message === "UNAUTHORIZED"
          ? "Unauthorized"
          : e instanceof Error
            ? e.message
            : "Server error";
    const status =
      e instanceof Error && e.message === "UNAUTHORIZED"
        ? 401
        : e instanceof Error && e.message === "FORBIDDEN"
          ? 403
          : 500;
    return jsonError(msg, status);
  }
}
