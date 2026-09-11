export function SiteMark({ className }: { className?: string }) {
  return (
    <img
      src="/gb-logo.png"
      alt=""
      width={32}
      height={32}
      className={className}
      decoding="async"
    />
  );
}
