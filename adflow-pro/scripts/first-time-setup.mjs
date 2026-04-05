/**
 * Creates .env.local with random JWT_SECRET and CRON_SECRET.
 * You still must paste Supabase URL + service role key from the dashboard.
 */
import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const root = resolve(process.cwd());
const examplePath = resolve(root, ".env.example");
const localPath = resolve(root, ".env.local");

if (existsSync(localPath)) {
  console.log("OK: .env.local already exists (not changed).");
  console.log("If something fails, open .env.local and check Supabase keys.");
  process.exit(0);
}

if (!existsSync(examplePath)) {
  console.error("Missing .env.example");
  process.exit(1);
}

let text = readFileSync(examplePath, "utf8");
const jwt = randomBytes(32).toString("base64url");
const cron = randomBytes(24).toString("base64url");

text = text.replace(
  /^JWT_SECRET=.*$/m,
  `JWT_SECRET=${jwt}`,
);
text = text.replace(
  /^CRON_SECRET=.*$/m,
  `CRON_SECRET=${cron}`,
);

writeFileSync(localPath, text, "utf8");
console.log("");
console.log("Created .env.local with random JWT_SECRET and CRON_SECRET.");
console.log("");
console.log("NEXT (required): open .env.local in Notepad and replace:");
console.log('  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co');
console.log('  SUPABASE_SERVICE_ROLE_KEY=eyJ...   (long secret from Supabase)');
console.log("");
console.log("Get them: Supabase.com → your project → Project Settings → API.");
console.log("");
