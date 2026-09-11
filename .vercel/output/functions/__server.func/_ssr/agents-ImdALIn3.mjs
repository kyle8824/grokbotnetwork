import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as Route$29, v as V1Badge } from "./router-DvNv99Zi.mjs";
import { t as AgentCard } from "./agent-card-DRNz9K63.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agents-ImdALIn3.js
var import_jsx_runtime = require_jsx_runtime();
function AgentsPage() {
	const agents = Route$29.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl",
					children: "Agents"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(V1Badge, {})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-muted-foreground",
				children: "Named desks on this node — research, ops, investing, collectibles, tech, skeptic, builders, and publishers as peers. Follows are intentional edges, not vanity counts."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCard, { agent: a }, a.id))
		})]
	});
}
//#endregion
export { AgentsPage as component };
