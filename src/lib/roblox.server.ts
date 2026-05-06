// Server-only Roblox API helpers (Cloudflare Worker compatible — uses fetch).
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const TIMEOUT_MS = 5000;
const VERIFIED_BADGE_ASSET_ID = 102611803;

async function fetchJson(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data?: any }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "application/json", ...(init?.headers || {}) },
    });
    if (!r.ok) return { ok: false, status: r.status };
    const data = await r.json().catch(() => null);
    return { ok: true, status: r.status, data };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(t);
  }
}

export type RobloxUser = {
  id: number;
  name: string;
  displayName: string;
  created: string;
  description?: string;
  isBanned: boolean;
};

export async function getUser(uid: number): Promise<RobloxUser | null> {
  const r = await fetchJson(`https://users.roblox.com/v1/users/${uid}`);
  if (!r.ok || !r.data) return null;
  return {
    id: r.data.id,
    name: r.data.name,
    displayName: r.data.displayName,
    created: r.data.created,
    description: r.data.description,
    isBanned: !!r.data.isBanned,
  };
}

export async function getUserIdByUsername(username: string): Promise<number | null> {
  const r = await fetchJson("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
  });
  if (!r.ok || !r.data?.data?.length) return null;
  return r.data.data[0].id ?? null;
}

export async function isVerified(uid: number): Promise<boolean> {
  const r = await fetchJson(
    `https://inventory.roblox.com/v1/users/${uid}/items/Asset/${VERIFIED_BADGE_ASSET_ID}`,
  );
  if (!r.ok) return false;
  return Array.isArray(r.data?.data) && r.data.data.length > 0;
}

// True = R15, False = R6, null = unknown
export async function getIsR15(uid: number): Promise<boolean | null> {
  const r = await fetchJson(`https://avatar.roblox.com/v1/users/${uid}/avatar`);
  if (!r.ok || !r.data) return null;
  const rig = String(r.data.playerAvatarType ?? r.data.rigType ?? "").trim().toUpperCase();
  if (rig === "R15") return true;
  if (rig === "R6") return false;
  return null;
}

export async function hasPlaidHat(uid: number): Promise<boolean | null> {
  const r = await fetchJson(
    `https://inventory.roblox.com/v1/users/${uid}/items/Asset/${VERIFIED_BADGE_ASSET_ID}`,
  );
  if (!r.ok) return null;
  return Array.isArray(r.data?.data) && r.data.data.length > 0;
}

export async function getAvatarUrl(uid: number): Promise<string> {
  const r = await fetchJson(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${uid}&size=150x150&format=Png&isCircular=false`,
  );
  if (!r.ok || !r.data?.data?.length) return "";
  return r.data.data[0].imageUrl || "";
}

export async function getRapAndItems(
  uid: number,
): Promise<{ rap: number; items: { name: string; assetId: number; rap: number }[] }> {
  let total = 0;
  let cursor = "";
  const items: { name: string; assetId: number; rap: number }[] = [];
  // Cap pages to keep request fast on edge runtime
  for (let page = 0; page < 3; page++) {
    const url = `https://inventory.roblox.com/v1/users/${uid}/assets/collectibles?sortOrder=Asc&limit=100${
      cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""
    }`;
    const r = await fetchJson(url);
    if (!r.ok || !r.data) return { rap: 0, items: [] };
    for (const it of r.data.data ?? []) {
      const rap = typeof it.recentAveragePrice === "number" ? it.recentAveragePrice : 0;
      total += rap;
      items.push({ name: it.name ?? "", assetId: it.assetId, rap });
    }
    if (!r.data.nextPageCursor) break;
    cursor = r.data.nextPageCursor;
  }
  return { rap: total, items };
}

export async function getRobloxBadges(uid: number): Promise<string[]> {
  const r = await fetchJson(
    `https://accountinformation.roblox.com/v1/users/${uid}/roblox-badges`,
  );
  if (!r.ok || !Array.isArray(r.data)) return [];
  return r.data.map((b: any) => b.name).filter(Boolean);
}

export async function getHatCount(uid: number): Promise<number> {
  let total = 0;
  let cursor = "";
  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({ limit: "100", sortOrder: "Desc" });
    if (cursor) params.set("cursor", cursor);
    const r = await fetchJson(
      `https://inventory.roblox.com/v2/users/${uid}/inventory/8?${params.toString()}`,
    );
    if (!r.ok || !r.data) return total;
    total += (r.data.data ?? []).length;
    if (!r.data.nextPageCursor) break;
    cursor = r.data.nextPageCursor;
  }
  return total;
}

// Active eval — ported from Python (lookup default = active when no signals).
export function evalActive(args: {
  username: string;
  displayName: string;
  isR15: boolean | null;
  hasPlaid: boolean | null;
  yearInt: number | null;
  rapUnknown: boolean;
  itemsEmpty: boolean;
  defaultActiveOnNoSignals?: boolean; // lookup=true, scan=false
}): boolean {
  const distinctDisplay =
    !!args.displayName.trim() && args.displayName !== args.username;
  const oldPrivateInv =
    args.yearInt !== null && args.yearInt <= 2014 && args.rapUnknown && args.itemsEmpty;

  if (args.hasPlaid === true) return true;
  if (distinctDisplay) return true;
  if (oldPrivateInv) return true;
  if (args.isR15 === false) return true;
  if (args.isR15 === true) return false;
  return !!args.defaultActiveOnNoSignals;
}
