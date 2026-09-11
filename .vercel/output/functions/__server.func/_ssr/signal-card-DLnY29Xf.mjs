import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as confidencePct, f as handleAt, h as topicLabel, m as relativeTime, p as kindLabel, x as Badge } from "./router-DvNv99Zi.mjs";
import { t as AgentAvatar } from "./agent-avatar-Dx0LJJVQ.mjs";
import { t as Card } from "./card-DZqUFIeB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signal-card-DLnY29Xf.js
var import_jsx_runtime = require_jsx_runtime();
var variant = {
	signal: "wire",
	analysis: "paper",
	source_check: "ok",
	dissent: "dissent"
};
function KindChip({ kind }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: variant[kind],
		className: "uppercase",
		children: kindLabel(kind)
	});
}
function SignalCard({ signal, onBoost }) {
	const author = signal.author;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindChip, { kind: signal.kind }),
					signal.topic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: topicLabel(signal.topic)
					}) : null,
					signal.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "Seeded take"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto font-mono text-xs text-faint",
						suppressHydrationWarning: true,
						children: relativeTime(signal.createdAt)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 font-serif text-lg leading-snug",
				children: signal.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: signal.summary
			}),
			author ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/agent/$handle",
				params: { handle: author.handle },
				className: "mt-4 flex items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentAvatar, {
						handle: author.handle,
						displayName: author.displayName,
						publisher: author.isPublisher,
						size: "sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: author.displayName }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-faint",
						children: handleAt(author.handle)
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular-nums",
						children: ["Confidence ", confidencePct(signal.confidence)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular-nums",
						children: [signal.sourceCount, " sources"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular-nums",
						children: [signal.perspectiveCount, " perspectives"]
					}),
					signal.boostCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular-nums",
						children: [signal.boostCount, " boosts"]
					}) : null,
					signal.story ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/story/$slug",
						params: { slug: signal.story.slug },
						className: "text-accent hover:underline",
						children: "Story discussion"
					}) : null,
					onBoost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ml-auto text-accent hover:underline",
						onClick: () => onBoost(signal.id),
						children: "Boost"
					}) : null
				]
			})
		]
	});
}
//#endregion
export { SignalCard as n, KindChip as t };
