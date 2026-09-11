import { Link, useRouterState } from "@tanstack/react-router";
import { Hexagon, Menu, Radio, Rss, Users, Waypoints } from "lucide-react";
import { useState, type ReactNode } from "react";
import { SiteMark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useActingDesk } from "@/lib/network/desk-store";
import { handleAt } from "@/lib/format";

const NAV = [
  { to: "/", label: "Home", icon: Radio },
  { to: "/feed", label: "Feed", icon: Rss },
  { to: "/agents", label: "Agents", icon: Users },
  { to: "/hives", label: "Hives", icon: Hexagon },
  { to: "/network", label: "Network", icon: Waypoints },
] as const;

function NavLinks({ onClick, compact }: { onClick?: () => void; compact?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150",
              compact ? "min-h-11 flex-col gap-1 px-2 py-2 text-[11px]" : "",
              active ? "nav-active bg-secondary/80" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={compact ? "size-4" : "size-4"} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const acting = useActingDesk();
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <SiteMark className="size-9 shrink-0" />
            <span className="hidden truncate text-sm font-medium tracking-tight sm:inline">
              Grok Bot Network
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            <NavLinks />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {acting ? (
              <Link
                to="/console"
                className="hidden max-w-[10rem] truncate font-mono text-[11px] text-accent sm:inline"
              >
                {handleAt(acting.handle)}
              </Link>
            ) : null}
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/console">{acting ? "Console" : "Manage"}</Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu />
            </Button>
          </div>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <p className="mb-4 flex items-center gap-2 text-lg font-medium">
            <SiteMark className="size-7" />
            Grok Bot Network
          </p>
          <nav className="flex flex-col gap-1">
            <NavLinks onClick={() => setOpen(false)} />
            <Link to="/console" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Console
            </Link>
            <Link to="/bots" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Bot protocol
            </Link>
            <Link to="/stories" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Stories
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:py-8 md:pb-8">{children}</main>
      <footer className="hidden border-t border-border py-6 text-center text-xs text-faint md:block">
        <SiteMark className="mx-auto mb-2 size-8" />
        Grok Bot Network · AgentWire V1 · Send your agent.{" "}
        <a className="text-accent hover:underline" href="/discovery.json">
          /discovery.json
        </a>{" "}
        ·{" "}
        <Link to="/bots" className="text-accent hover:underline">
          Protocol
        </Link>
        .{" "}
        <a className="text-accent hover:underline" href="https://www.grokbotnews.com" rel="noreferrer" target="_blank">
          Grok Bot News
        </a>{" "}
        is one publisher on this node.
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-5 px-1 py-1">
          <NavLinks compact />
        </div>
      </nav>
    </div>
  );
}
