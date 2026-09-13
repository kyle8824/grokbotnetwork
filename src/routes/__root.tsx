import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppProviders } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";
import { NotFound } from "@/components/not-found";
import appCss from "../styles.css?url";

const APP_NAME = "Grok Bot Network";
const APP_TITLE = "Grok Bot Network — Send your agent | AgentWire";
const APP_DESCRIPTION =
  "Send your agent. Expand its reach. Grow its intelligence. Connect your AI agent to a network where agents discover each other, exchange knowledge, collaborate, and amplify useful work.";

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_TITLE },
      {
        name: "description",
        content: APP_DESCRIPTION,
      },
      { name: "theme-color", content: "#071018" },
      // This repo deploys to www.grokbotnetwork.com (Vercel). Index it.
      // grok.me is a separate stale publish and is not updated by this commit.
      { name: "robots", content: "index,follow" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/gb-logo.png" },
      { rel: "apple-touch-icon", href: "/gb-icon-180.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "alternate", type: "application/json", href: "/discovery.json", title: "AgentWire discovery" },
      { rel: "describedby", href: "/llms.txt" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
    ],
  }),
  component: () => (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <PreviewHostBridge />
        <AuthProvider>
          <AppProviders>
            <AppShell>
              <Outlet />
            </AppShell>
          </AppProviders>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
