import { useState } from "react";
import {
  Play,
  Square as StopIcon,
  Save,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  YEAR_ID_RANGES,
  METHOD_OPTIONS,
  SORT_OPTIONS,
  BAN_FILTER_OPTIONS,
  VERIFIED_FILTER_OPTIONS,
  ACTIVE_FILTER_OPTIONS,
  RAP_PRESETS,
  HAT_PRESETS,
  BADGE_NAMES,
  BADGE_ICON_URLS,
  type ScanResult,
  type ScanResponse,
} from "@/lib/rfinder-data";
import { ResultCard } from "./ResultCard";

const YEAR_KEYS = Object.keys(YEAR_ID_RANGES);

export function Scanner() {
  const [year, setYear] = useState("Any year");
  const [method, setMethod] = useState("random");
  const [batchSize, setBatchSize] = useState(30);
  const [rapKey, setRapKey] = useState("Off");
  const [hatKey, setHatKey] = useState("Off");
  const [banFilter, setBanFilter] = useState("All");
  const [verifiedFilter, setVerifiedFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [requiredBadges, setRequiredBadges] = useState<string[]>([]);
  const [sort, setSort] = useState("None");

  const [running, setRunning] = useState(false);
  const stopFlag = useState(() => ({ stop: false }))[0];
  const [scanned, setScanned] = useState(0);
  const [matched, setMatched] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggleBadge(name: string) {
    setRequiredBadges((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name],
    );
  }

  async function runOneBatch(): Promise<ScanResponse | null> {
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          method,
          batch_size: batchSize,
          rap_min: RAP_PRESETS[rapKey],
          hat_min: HAT_PRESETS[hatKey],
          ban_filter: banFilter,
          verified_filter: verifiedFilter,
          active_filter: activeFilter,
          required_badges: requiredBadges,
          sort,
        }),
      });
      if (!res.ok) {
        setErrorMsg(`Scan failed (${res.status})`);
        return null;
      }
      return (await res.json()) as ScanResponse;
    } catch {
      setErrorMsg("Network error during scan.");
      return null;
    }
  }

  async function startScan() {
    setErrorMsg(null);
    setRunning(true);
    stopFlag.stop = false;
    setScanned(0);
    setMatched(0);
    setElapsed(0);
    setResults([]);
    const start = Date.now();

    // For "nonstop" loop forever until stopped; for other methods, run a few batches then stop.
    const maxBatches = method === "nonstop" ? Infinity : 6;
    let batches = 0;

    while (!stopFlag.stop && batches < maxBatches) {
      batches++;
      const data = await runOneBatch();
      if (!data) break;
      setScanned((s) => s + data.scanned);
      setResults((prev) => {
        const merged = [...prev, ...data.results];
        // Dedupe by user_id
        const seen = new Set<number>();
        const unique = merged.filter((r) => {
          if (seen.has(r.user_id)) return false;
          seen.add(r.user_id);
          return true;
        });
        setMatched(unique.length);
        return unique;
      });
      setElapsed((Date.now() - start) / 1000);
      // small breather between batches
      await new Promise((r) => setTimeout(r, 200));
    }
    setRunning(false);
  }

  function stopScan() {
    stopFlag.stop = true;
  }

  function clearResults() {
    setResults([]);
    setScanned(0);
    setMatched(0);
    setElapsed(0);
  }

  function saveResults() {
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rfinder_results_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      {/* Controls */}
      <aside className="matte-card p-5 space-y-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto scrollbar-thin">
        <SectionTitle>Scan parameters</SectionTitle>

        <Field label="Year">
          <Select value={year} onChange={(e) => setYear(e.target.value)}>
            {YEAR_KEYS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </Field>

        <Field label="Method">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            {METHOD_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Batch size (per request)">
          <NumberInput
            value={batchSize}
            min={10}
            max={60}
            onChange={(v) => setBatchSize(v)}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Capped at 60 per request on edge runtime. Click Start to loop.
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="RAP min">
            <Select value={rapKey} onChange={(e) => setRapKey(e.target.value)}>
              {Object.keys(RAP_PRESETS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          </Field>
          <Field label="Hat min">
            <Select value={hatKey} onChange={(e) => setHatKey(e.target.value)}>
              {Object.keys(HAT_PRESETS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Ban filter">
          <Select value={banFilter} onChange={(e) => setBanFilter(e.target.value)}>
            {BAN_FILTER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>

        <Field label="Verified filter">
          <Select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
            {VERIFIED_FILTER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>

        <Field label="Active filter">
          <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            {ACTIVE_FILTER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>

        <Field label="Required Roblox badges">
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
            {BADGE_NAMES.map((b) => {
              const checked = requiredBadges.includes(b);
              return (
                <label
                  key={b}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer text-[12px] ${
                    checked
                      ? "border-accent/40 bg-accent/10 text-foreground"
                      : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBadge(b)}
                    className="sr-only"
                  />
                  <img src={BADGE_ICON_URLS[b]} alt="" className="h-4 w-4" />
                  <span className="truncate">{b}</span>
                </label>
              );
            })}
          </div>
        </Field>

        <Field label="Sort">
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>

        <div className="flex gap-2 pt-2">
          {!running ? (
            <button
              onClick={startScan}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-success/90 text-success-foreground px-4 py-2 text-sm font-semibold hover:bg-success transition-colors"
            >
              <Play className="h-4 w-4" /> Start
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-destructive/90 text-destructive-foreground px-4 py-2 text-sm font-semibold hover:bg-destructive transition-colors"
            >
              <StopIcon className="h-4 w-4" /> Stop
            </button>
          )}
          <button
            onClick={clearResults}
            disabled={running}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
            title="Clear results"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Results */}
      <section className="space-y-4">
        <div className="matte-card p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Stat tone={running ? "live" : undefined} label="Scanned" value={scanned} />
          <Stat label="Matched" value={matched} />
          <Stat label="Elapsed" value={`${elapsed.toFixed(1)}s`} />
          <div className="flex-1" />
          <button
            onClick={saveResults}
            disabled={results.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/70 transition-colors disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> Save JSON
          </button>
        </div>

        {errorMsg && (
          <div className="matte-card p-3 text-sm text-destructive border-destructive/30">
            {errorMsg}
          </div>
        )}

        {running && results.length === 0 && (
          <div className="matte-card p-10 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin opacity-60" />
            Scanning Roblox accounts…
          </div>
        )}

        {!running && results.length === 0 && (
          <div className="matte-card p-10 text-center text-muted-foreground text-sm">
            No results yet. Adjust filters and press <span className="text-foreground font-medium">Start</span>.
          </div>
        )}

        <div className="space-y-3">
          {results.map((r) => (
            <ResultCard key={r.user_id} r={r} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-md bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring/50 transition-colors"
    />
  );
}

function NumberInput({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
      }}
      className="w-full rounded-md bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring/50"
    />
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "live";
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className={`font-mono text-sm ${tone === "live" ? "text-accent" : "text-foreground"}`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      {tone === "live" && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
      )}
    </div>
  );
}
