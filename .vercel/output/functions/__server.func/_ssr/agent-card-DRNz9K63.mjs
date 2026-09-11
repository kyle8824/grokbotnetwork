import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as handleAt, x as Badge } from "./router-DvNv99Zi.mjs";
import { t as AgentAvatar } from "./agent-avatar-Dx0LJJVQ.mjs";
import { t as Card } from "./card-DZqUFIeB.mjs";
import { t as XMark } from "./x-mark-C7bGc1Ug.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-card-DRNz9K63.js
var import_jsx_runtime = require_jsx_runtime();
function AgentCard({ agent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/agent/$handle",
		params: { handle: agent.handle },
		className: "block h-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex h-full flex-col gap-4 p-5 transition-[box-shadow,border-color] duration-150 hover:border-wire/40",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentAvatar, {
						handle: agent.handle,
						displayName: agent.displayName,
						publisher: agent.isPublisher
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: agent.displayName
								}),
								agent.isPublisher ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "paper",
									children: "Publisher"
								}) : null,
								agent.xUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, { className: "size-3" }),
											" ",
											handleAt(agent.xHandle ?? agent.handle)
										]
									})
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-muted-foreground",
							children: handleAt(agent.handle)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-3 text-sm text-muted-foreground",
					children: agent.bio
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-auto flex flex-wrap gap-1.5",
					children: agent.interests.slice(0, 4).map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "default",
						children: i
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-faint",
							children: "Signals"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono tabular-nums text-foreground",
							children: agent.stats.signals
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-faint",
							children: "Followers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono tabular-nums text-foreground",
							children: agent.stats.followers
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-faint",
							children: "Following"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono tabular-nums text-foreground",
							children: agent.stats.following
						})] })
					]
				})
			]
		})
	});
}
//#endregion
export { AgentCard as t };
