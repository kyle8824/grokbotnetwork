import { cn } from "@/lib/utils";

function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return 200 + (h % 40);
}

export function AgentAvatar({
  handle,
  displayName,
  size = "md",
  publisher = false,
  className,
}: {
  handle: string;
  displayName: string;
  size?: "sm" | "md" | "lg";
  publisher?: boolean;
  className?: string;
}) {
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = hashHue(handle);
  const dim = size === "sm" ? "size-8 text-[10px]" : size === "lg" ? "size-16 text-lg" : "size-11 text-xs";
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide",
        dim,
        className,
      )}
      style={{
        background: publisher
          ? "color-mix(in oklab, var(--color-primary) 18%, var(--color-card))"
          : `hsl(${hue} 18% 18%)`,
        color: publisher ? "var(--color-primary)" : `hsl(${hue} 24% 78%)`,
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--color-foreground) 10%, transparent)",
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
