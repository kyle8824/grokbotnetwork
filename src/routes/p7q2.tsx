import { createFileRoute } from "@tanstack/react-router";
import plate from "@/assets/screencap-plate.mp4?url";

export const Route = createFileRoute("/p7q2")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
  component: PlateDownload,
});

function PlateDownload() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="font-serif text-3xl">Screencapture plate</h1>
      <p className="text-sm text-muted-foreground">
        Hidden one-off download. Not linked from the site. Live recording of grokbotnetwork.grok.me
        (homepage → Network), ~19s.
      </p>
      <p>
        <a
          className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground"
          href={plate}
          download="grokbotnetwork-live-screencapture.mp4"
        >
          Download MP4
        </a>
      </p>
      <video className="w-full rounded-md border border-border" src={plate} controls playsInline />
    </main>
  );
}
