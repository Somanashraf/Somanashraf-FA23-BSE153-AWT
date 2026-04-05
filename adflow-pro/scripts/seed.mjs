/**
 * Full demo seed: users (bcrypt), seller profiles, 20+ ads, media, payments, notifications.
 * Run `supabase/schema.sql` + `supabase/seed.sql` first.
 * Run: npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    let v = m[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const PASS = "Password123!";
const hash = await bcrypt.hash(PASS, 10);

async function main() {
  const { count } = await db.from("ads").select("*", { count: "exact", head: true });
  if ((count ?? 0) >= 15) {
    console.log("Database already has sample ads (>=15). Skipping seed.");
    return;
  }

  const users = [
    { name: "Demo Client", email: "client@demo.local", role: "client" },
    { name: "Second Client", email: "client2@demo.local", role: "client" },
    { name: "Mod User", email: "mod@demo.local", role: "moderator" },
    { name: "Admin User", email: "admin@demo.local", role: "admin" },
    { name: "Super Admin", email: "super@demo.local", role: "super_admin" },
  ];

  const userIds = {};
  for (const u of users) {
    const { error: upErr } = await db.from("users").upsert(
      {
        name: u.name,
        email: u.email,
        password_hash: hash,
        role: u.role,
        status: "active",
      },
      { onConflict: "email" },
    );
    if (upErr) throw upErr;
    const { data: row, error: selErr } = await db
      .from("users")
      .select("id, email")
      .eq("email", u.email)
      .single();
    if (selErr) throw selErr;
    userIds[u.email] = row.id;
    const { error: spErr } = await db.from("seller_profiles").upsert(
      {
        user_id: row.id,
        display_name: u.name,
        business_name: u.role === "client" ? "Demo Traders Co." : null,
        phone: "+92-300-0000000",
        city: "Karachi",
        is_verified: u.role !== "client",
      },
      { onConflict: "user_id" },
    );
    if (spErr) throw spErr;
  }

  const [{ data: pkgs }, { data: cats }, { data: cits }] = await Promise.all([
    db.from("packages").select("id, slug, duration_days, weight"),
    db.from("categories").select("id, slug"),
    db.from("cities").select("id, slug"),
  ]);

  const pkg = Object.fromEntries((pkgs ?? []).map((p) => [p.slug, p]));
  if (!pkg.basic || !pkg.standard || !pkg.premium) {
    throw new Error("Packages missing — run supabase/seed.sql first.");
  }

  const clientId = userIds["client@demo.local"];
  const client2 = userIds["client2@demo.local"];

  const titles = [
    "MacBook Pro 14 — M3, mint condition",
    "Toyota Corolla 2021 — single owner",
    "2-bed apartment DHA Phase 5",
    "Professional plumbing & electrical",
    "Senior React developer — remote",
    "Designer sneakers collection drop",
    "Outdoor patio furniture set",
    "Cricket kit + pads bundle",
    "iPhone 15 Pro 256GB sealed",
    "Honda Civic RS turbo",
    "Studio flat Bahria Town",
    "Home cleaning subscription",
    "UI/UX internship opportunity",
    "Luxury watches consignment",
    "Smart garden irrigation system",
    "Mountain bike carbon frame",
    "Gaming PC RTX 4070 build",
    "Commercial plot Ring Road",
    "Wedding photography package",
    "Vintage leather sofa",
    "LED TV 55 inch 4K",
    "Yamaha YBR 125G",
    "Co-working hot desk monthly",
    "Full-stack bootcamp mentor",
    "Premium gym membership transfer",
    "Drone DJI Mini 4 Pro fly-more",
  ];

  const statuses = [
    "published",
    "published",
    "published",
    "published",
    "published",
    "published",
    "published",
    "published",
    "payment_verified",
    "scheduled",
    "payment_submitted",
    "payment_pending",
    "under_review",
    "submitted",
    "draft",
    "published",
    "published",
    "expired",
    "archived",
    "rejected",
    "published",
    "published",
    "published",
    "published",
    "published",
    "published",
  ];

  const now = new Date();
  const iso = (d) => d.toISOString();

  for (let i = 0; i < titles.length; i++) {
    const slug = `demo-listing-${i + 1}`;
    const st = statuses[i] ?? "draft";
    const owner = i % 3 === 0 ? client2 : clientId;
    const pkgPick = i % 3 === 0 ? pkg.premium : i % 2 === 0 ? pkg.standard : pkg.basic;
    const catPick = (cats ?? [])[i % Math.max(cats?.length || 1, 1)];
    const cityPick = (cits ?? [])[i % Math.max(cits?.length || 1, 1)];

    let publish_at = null;
    let expire_at = null;
    let scheduled_publish_at = null;
    if (st === "published") {
      const pub = new Date(now.getTime() - (i + 1) * 36 * 60 * 60 * 1000);
      publish_at = iso(pub);
      expire_at = iso(
        new Date(pub.getTime() + (pkgPick?.duration_days ?? 7) * 86400000),
      );
    }
    if (st === "scheduled") {
      scheduled_publish_at = iso(new Date(now.getTime() + 2 * 86400000));
    }
    if (st === "expired") {
      const pub = new Date(now.getTime() - 40 * 86400000);
      publish_at = iso(pub);
      expire_at = iso(new Date(now.getTime() - 2 * 86400000));
    }

    const row = {
      user_id: owner,
      package_id: pkgPick?.id ?? null,
      category_id: catPick?.id ?? null,
      city_id: cityPick?.id ?? null,
      title: titles[i],
      slug,
      description: `Trusted listing #${i + 1} for AdFlow Pro coursework demo. External media URLs only; workflow-aware marketplace sample.`,
      status: st,
      is_featured: i % 5 === 0,
      admin_boost: i % 7 === 0 ? 2 : 0,
      publish_at,
      expire_at,
      scheduled_publish_at,
      rejection_reason: st === "rejected" ? "Policy: duplicate inventory" : null,
    };

    const { data: ad, error } = await db.from("ads").insert(row).select("id").single();
    if (error) {
      console.warn("Skip ad", slug, error.message);
      continue;
    }

    const mediaUrl =
      i % 4 === 0
        ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        : `https://picsum.photos/seed/${slug}/800/600`;

    await db.from("ad_media").insert({
      ad_id: ad.id,
      source_type: i % 4 === 0 ? "youtube" : "image_url",
      original_url: mediaUrl,
      thumbnail_url:
        i % 4 === 0
          ? "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
          : mediaUrl,
      validation_status: "ok",
      sort_order: 0,
    });

    if (st === "payment_submitted" || st === "payment_verified" || st === "scheduled") {
      await db.from("payments").insert({
        ad_id: ad.id,
        amount: (pkgPick?.weight ?? 1) * 25 + 10,
        method: "Bank transfer",
        transaction_ref: `TX-${slug.toUpperCase().replace(/-/g, "")}`,
        sender_name: "Demo Client",
        screenshot_url: "https://picsum.photos/seed/receipt/600/400",
        status: st === "payment_submitted" ? "pending" : "verified",
      });
    }

    await db.from("ad_status_history").insert({
      ad_id: ad.id,
      previous_status: null,
      new_status: st,
      changed_by: userIds["admin@demo.local"],
      note: "Seed",
    });
  }

  await db.from("notifications").insert({
    user_id: clientId,
    title: "Welcome to AdFlow Pro",
    message: "Use mod@ / admin@ / super@ accounts to walk the full workflow.",
    type: "info",
    link: "/dashboard/client",
  });

  console.log("Seed complete.");
  console.log("Password for all demo users:", PASS);
  console.log("Emails:", users.map((u) => u.email).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
