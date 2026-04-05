import { clearAuthCookie, jsonOk } from "../../_utils";

export async function POST() {
  const res = jsonOk({ ok: true });
  return clearAuthCookie(res);
}
