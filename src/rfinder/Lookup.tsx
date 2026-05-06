import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import type { LookupResponse } from "@/lib/rfinder-data";
import { ResultCard } from "./ResultCard";

export function Lookup() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Extract<LookupResponse, { ok: true }> | null>(null);

  async function doLookup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const body = (await res.json()) as LookupResponse;
      if (!body.ok) setError(body.error);
      else setData(body);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <form onSubmit={doLookup} className="matte-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Roblox username (e.g. Builderman)"
          maxLength={50}
          className="flex-1 rounded-md bg-secondary/50 border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring/50"
        />
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Look up
        </button>
      </form>

      {error && (
        <div className="matte-card p-4 text-sm text-destructive border-destructive/30">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="matte-card p-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin opacity-60" />
          Fetching profile…
        </div>
      )}

      {data && (
        <ResultCard
          large
          r={{
            user_id: data.user_id,
            username: data.username,
            display_name: data.display_name,
            created: data.created,
            rap: data.rap,
            hat_count: data.hat_count,
            verified: data.verified,
            banned: data.banned,
            active: data.active,
            avatar_url: data.avatar_url,
            roblox_badges: data.roblox_badges.map((b) => b.name),
            rap_items: data.rap_items,
          }}
        />
      )}
    </div>
  );
}
