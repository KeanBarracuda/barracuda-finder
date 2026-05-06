import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BADGE_ICON_URLS, type LookupResponse } from "../src/lib/rfinder-data.js";
import {
  evalActive,
  getAvatarUrl,
  getHatCount,
  getIsR15,
  getRapAndItems,
  getRobloxBadges,
  getUser,
  getUserIdByUsername,
  hasPlaidHat,
  isVerified,
} from "../src/lib/roblox.server.js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body: { username?: string } = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    body = {};
  }

  const username = (body.username || "").trim();
  if (!username || username.length > 50) {
    const err: LookupResponse = { ok: false, error: "Invalid username" };
    return res.status(400).json(err);
  }

  const uid = await getUserIdByUsername(username);
  if (!uid) {
    const err: LookupResponse = { ok: false, error: "User not found" };
    return res.status(404).json(err);
  }

  const user = await getUser(uid);
  if (!user) {
    const err: LookupResponse = { ok: false, error: "Failed to fetch user info" };
    return res.status(502).json(err);
  }

  const [verified, isR15, plaid, rapData, badges, hats, avatar] = await Promise.all([
    isVerified(uid),
    getIsR15(uid),
    hasPlaidHat(uid),
    getRapAndItems(uid),
    getRobloxBadges(uid),
    getHatCount(uid),
    getAvatarUrl(uid),
  ]);

  const created = (user.created || "").slice(0, 10);
  const yearInt = created ? parseInt(created.slice(0, 4), 10) : null;
  const active = evalActive({
    username: user.name,
    displayName: user.displayName || "",
    isR15,
    hasPlaid: plaid,
    yearInt,
    rapUnknown: rapData.rap === 0 && rapData.items.length === 0,
    itemsEmpty: rapData.items.length === 0,
    defaultActiveOnNoSignals: true,
  });

  const response: LookupResponse = {
    ok: true,
    user_id: uid,
    username: user.name,
    display_name: user.displayName || user.name,
    created,
    rap: rapData.rap,
    hat_count: hats,
    verified,
    banned: !!user.isBanned,
    active,
    avatar_url: avatar,
    roblox_badges: badges.map((name) => ({
      name,
      icon_url: BADGE_ICON_URLS[name] || "",
    })),
    rap_items: rapData.items,
  };

  return res.status(200).json(response);
}
