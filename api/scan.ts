import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  YEAR_ID_RANGES,
  type ScanResponse,
  type ScanResult,
} from "../src/lib/rfinder-data.js";
import { usernameMatchesMethod } from "../src/lib/rfinder-logic.js";
import {
  evalActive,
  getAvatarUrl,
  getHatCount,
  getIsR15,
  getRapAndItems,
  getRobloxBadges,
  getUser,
  hasPlaidHat,
  isVerified,
} from "../src/lib/roblox.server.js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type ScanReq = {
  year?: string;
  method?: string;
  batch_size?: number;
  rap_min?: number | null;
  hat_min?: number | null;
  ban_filter?: string;
  verified_filter?: string;
  active_filter?: string;
  required_badges?: string[];
  sort?: string;
};

function pickRandomId(year: string): number {
  const range = YEAR_ID_RANGES[year] ?? YEAR_ID_RANGES["Any year"];
  const [lo, hi] = range;
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function yearIntFromCreated(created: string): number | null {
  if (!created) return null;
  const y = parseInt(created.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

async function scanOne(uid: number, req: ScanReq): Promise<ScanResult | null> {
  const user = await getUser(uid);
  if (!user) return null;

  const username = user.name;
  const match = usernameMatchesMethod(username, req.method || "random");
  if (!match.ok) return null;

  const banned = !!user.isBanned;
  if (req.ban_filter === "Only not banned" && banned) return null;
  if (req.ban_filter === "Only banned" && !banned) return null;

  const [verified, isR15, plaid, rapData, badges, hats, avatar] = await Promise.all([
    isVerified(uid),
    getIsR15(uid),
    hasPlaidHat(uid),
    getRapAndItems(uid),
    getRobloxBadges(uid),
    getHatCount(uid),
    getAvatarUrl(uid),
  ]);

  if (req.verified_filter === "Only verified" && !verified) return null;
  if (req.verified_filter === "Only unverified" && verified) return null;
  if (typeof req.rap_min === "number" && rapData.rap < req.rap_min) return null;
  if (typeof req.hat_min === "number" && hats < req.hat_min) return null;

  if (req.required_badges && req.required_badges.length) {
    for (const b of req.required_badges) if (!badges.includes(b)) return null;
  }

  const created = (user.created || "").slice(0, 10);
  const active = evalActive({
    username,
    displayName: user.displayName || "",
    isR15,
    hasPlaid: plaid,
    yearInt: yearIntFromCreated(user.created || ""),
    rapUnknown: rapData.rap === 0 && rapData.items.length === 0,
    itemsEmpty: rapData.items.length === 0,
    defaultActiveOnNoSignals: false,
  });

  if (req.active_filter === "Only active" && !active) return null;
  if (req.active_filter === "Only inactive" && active) return null;

  return {
    user_id: uid,
    username,
    display_name: user.displayName || username,
    created,
    rap: rapData.rap,
    hat_count: hats,
    verified,
    banned,
    active,
    avatar_url: avatar,
    roblox_badges: badges,
    rap_items: rapData.items,
  };
}

function sortResults(arr: ScanResult[], sort?: string): ScanResult[] {
  if (!sort || sort === "None") return arr;
  const sorted = [...arr];
  switch (sort) {
    case "Username A→Z": sorted.sort((a, b) => a.username.localeCompare(b.username)); break;
    case "Username Z→A": sorted.sort((a, b) => b.username.localeCompare(a.username)); break;
    case "ID low→high": sorted.sort((a, b) => a.user_id - b.user_id); break;
    case "ID high→low": sorted.sort((a, b) => b.user_id - a.user_id); break;
    case "Created oldest→newest": sorted.sort((a, b) => a.created.localeCompare(b.created)); break;
    case "Created newest→oldest": sorted.sort((a, b) => b.created.localeCompare(a.created)); break;
    case "RAP high→low": sorted.sort((a, b) => b.rap - a.rap); break;
    case "RAP low→high": sorted.sort((a, b) => a.rap - b.rap); break;
    case "Verified Yes first": sorted.sort((a, b) => Number(b.verified) - Number(a.verified)); break;
    case "Verified No first": sorted.sort((a, b) => Number(a.verified) - Number(b.verified)); break;
    case "Banned Yes first": sorted.sort((a, b) => Number(b.banned) - Number(a.banned)); break;
    case "Banned No first": sorted.sort((a, b) => Number(a.banned) - Number(b.banned)); break;
    case "Active Yes first": sorted.sort((a, b) => Number(b.active) - Number(a.active)); break;
    case "Active No first": sorted.sort((a, b) => Number(a.active) - Number(b.active)); break;
  }
  return sorted;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const start = Date.now();
  let body: ScanReq;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const year = body.year || "Any year";
  const batch = Math.max(5, Math.min(body.batch_size ?? 30, 60));
  const ids = Array.from({ length: batch }, () => pickRandomId(year));
  const settled = await Promise.allSettled(ids.map((uid) => scanOne(uid, body)));
  const results: ScanResult[] = [];
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value) results.push(s.value);
  }

  const response: ScanResponse = {
    results: sortResults(results, body.sort),
    scanned: ids.length,
    matched: results.length,
    elapsed_seconds: (Date.now() - start) / 1000,
  };

  return res.status(200).json(response);
}
