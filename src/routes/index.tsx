import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Radar, UserSearch } from "lucide-react";
import { Scanner } from "@/components/rfinder/Scanner";
import { Lookup } from "@/components/rfinder/Lookup";
import { TOOL_VERSION, DISCORD_URL } from "@/lib/rfinder-data";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type Tab = "scanner" | "lookup";

function HomePage() {
  const [tab, setTab] = useState<Tab>("scanner");

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg matte-card-2 grid place-items-center">
              <Radar className="h-4 w-4 text-accent" />
            </div>
            <h1 className="font-display text-base sm:text-lg font-semibold truncate">
              {TOOL_VERSION}
            </h1>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <TabButton active={tab === "scanner"} onClick={() => setTab("scanner")} icon={<Radar className="h-4 w-4" />}>
              Scanner
            </TabButton>
            <TabButton active={tab === "lookup"} onClick={() => setTab("lookup")} icon={<UserSearch className="h-4 w-4" />}>
              Lookup
            </TabButton>
          </nav>

          <div className="flex-1" />

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            Discord
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div hidden={tab !== "scanner"}><Scanner /></div>
        <div hidden={tab !== "lookup"}><Lookup /></div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="grid grid-cols-2">
          <BottomTab active={tab === "scanner"} onClick={() => setTab("scanner")} icon={<Radar className="h-5 w-5" />} label="Scanner" />
          <BottomTab active={tab === "lookup"} onClick={() => setTab("lookup")} icon={<UserSearch className="h-5 w-5" />} label="Lookup" />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function BottomTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
        active ? "text-accent" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
