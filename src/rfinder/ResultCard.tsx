import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, BadgeCheck, Ban, Circle, CircleSlash } from "lucide-react";
import { BADGE_ICON_URLS, type ScanResult } from "@/lib/rfinder-data";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function ResultCard({ r, large = false }: { r: ScanResult; large?: boolean }) {
  const [open, setOpen] = useState(false);
  const profileUrl = `https://www.roblox.com/users/${r.user_id}/profile`;

  return (
    <div className="matte-card p-4 sm:p-5">
      <div className="flex gap-4 items-start">
        {r.avatar_url ? (
          <img
            src={r.avatar_url}
            alt={`${r.username} avatar`}
            className={`${large ? "h-24 w-24 sm:h-28 sm:w-28" : "h-14 w-14 sm:h-16 sm:w-16"} rounded-full bg-secondary object-cover shrink-0 border border-border`}
            loading="lazy"
          />
        ) : (
          <div className={`${large ? "h-24 w-24" : "h-14 w-14"} rounded-full bg-secondary shrink-0`} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className={`font-display ${large ? "text-2xl" : "text-base sm:text-lg"} font-semibold text-foreground truncate`}>
              {r.username}
            </h3>
            {r.display_name && r.display_name !== r.username && (
              <span className="text-muted-foreground text-sm truncate">{r.display_name}</span>
            )}
          </div>
          <div className="font-mono text-xs text-muted-foreground mt-0.5">ID {r.user_id}</div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            <Stat label="Created" value={r.created || "—"} />
            <Stat label="RAP" value={fmt(r.rap)} />
            <Stat label="Hats" value={fmt(r.hat_count)} />
            <Stat
              label="Status"
              value={
                <span className="inline-flex flex-wrap gap-1.5">
                  {r.verified && (
                    <Pill tone="accent" icon={<BadgeCheck className="h-3 w-3" />}>Verified</Pill>
                  )}
                  {r.banned && <Pill tone="danger" icon={<Ban className="h-3 w-3" />}>Banned</Pill>}
                  {r.active ? (
                    <Pill tone="success" icon={<Circle className="h-3 w-3 fill-current" />}>Active</Pill>
                  ) : (
                    <Pill tone="muted" icon={<CircleSlash className="h-3 w-3" />}>Inactive</Pill>
                  )}
                </span>
              }
            />
          </div>

          {r.roblox_badges.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {r.roblox_badges.map((b) => (
                <img
                  key={b}
                  src={BADGE_ICON_URLS[b] || ""}
                  alt={b}
                  title={b}
                  className="h-6 w-6 rounded-md bg-secondary object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/70 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Profile
            </a>
            {r.rap_items.length > 0 && (
              <button
                onClick={() => setOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {r.rap_items.length} RAP item{r.rap_items.length === 1 ? "" : "s"}
              </button>
            )}
          </div>

          {open && r.rap_items.length > 0 && (
            <div className="mt-3 matte-card-2 overflow-hidden">
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead className="bg-background/40 text-muted-foreground sticky top-0">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Item</th>
                      <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Asset ID</th>
                      <th className="text-right font-medium px-3 py-2">RAP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.rap_items.map((it) => (
                      <tr key={it.assetId} className="border-t border-border">
                        <td className="px-3 py-2 truncate max-w-[180px]">{it.name}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground hidden sm:table-cell">
                          {it.assetId}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{fmt(it.rap)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function Pill({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone: "accent" | "success" | "danger" | "muted";
  icon?: React.ReactNode;
}) {
  const tones = {
    accent: "bg-accent/15 text-accent border-accent/20",
    success: "bg-success/15 text-success border-success/20",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
    muted: "bg-muted text-muted-foreground border-border",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
