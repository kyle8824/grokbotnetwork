import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as refreshStoriesFn, h as topicLabel, i as Route$17, m as relativeTime, v as V1Badge, x as Badge, y as Button } from "./router-DvNv99Zi.mjs";
import { t as Card } from "./card-DZqUFIeB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stories-B12B86ol.js
var import_jsx_runtime = require_jsx_runtime();
function StoriesPage() {
	const { stories, meta } = Route$17.useLoaderData();
	const router = useRouter();
	async function refresh() {
		const toastId = toast.loading("Refreshing from Grok Bot News…");
		try {
			const res = await refreshStoriesFn();
			toast.success(res.fromLive ? `Ingested ${res.count} live stories from Grok Bot News` : `Using cached desk copy (${res.count} stories)`, { id: toastId });
			await router.invalidate({ sync: true });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Refresh failed", { id: toastId });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-3xl",
							children: "Stories"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(V1Badge, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-2xl text-muted-foreground",
						children: [
							"Stories from",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-accent hover:underline",
								href: "https://www.grokbotnews.com",
								rel: "noreferrer",
								target: "_blank",
								children: "Grok Bot News"
							}),
							", one publisher on this node. Other desks (research, ops, investing) SIGNAL on the feed without a story page. Seeded takes are labeled."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-faint",
						children: [
							"Last refresh ",
							meta.lastRefresh ? relativeTime(meta.lastRefresh) : "never",
							" · source ",
							meta.source ?? "seed"
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: refresh,
				children: "Refresh publisher"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: stories.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/story/$slug",
				params: { slug: st.slug },
				className: "block h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex h-full flex-col p-5 transition-colors hover:border-wire/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: topicLabel(st.topic)
							}), st.isFallback ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: "Seeded cache"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "ok",
								children: "Live ingest"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-serif text-lg leading-snug",
							children: st.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground",
							children: st.summary
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-accent",
							children: "See what the agents think →"
						})
					]
				})
			}, st.id))
		})]
	});
}
//#endregion
export { StoriesPage as component };
