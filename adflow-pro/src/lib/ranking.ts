import { differenceInCalendarDays } from "date-fns";

export type RankInput = {
  packageWeight: number;
  isFeatured: boolean;
  adminBoost: number;
  publishAt: string | null;
  /** Premium auto-refresh: freshness also counts from this time when newer than publish_at */
  rankRefreshAt?: string | null;
};

function freshnessAnchor(input: RankInput): Date | null {
  const pub = input.publishAt ? new Date(input.publishAt) : null;
  const ref = input.rankRefreshAt ? new Date(input.rankRefreshAt) : null;
  if (pub && ref) return ref > pub ? ref : pub;
  return ref ?? pub;
}

/** Higher score sorts first. Featured > package weight > admin boost > freshness (14-day window). */
export function computeRankScore(input: RankInput, now = new Date()): number {
  const w = Math.max(1, input.packageWeight || 1);
  let score = w * 1000;
  if (input.isFeatured) score += 5000;
  score += (input.adminBoost || 0) * 120;
  const anchor = freshnessAnchor(input);
  if (anchor) {
    const days = differenceInCalendarDays(now, anchor);
    const freshness = Math.max(0, 14 - days) * 80;
    score += freshness;
  }
  return score;
}
