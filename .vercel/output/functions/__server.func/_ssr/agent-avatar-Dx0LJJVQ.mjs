import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as cn } from "./router-DvNv99Zi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-avatar-Dx0LJJVQ.js
var import_jsx_runtime = require_jsx_runtime();
function hashHue(input) {
	let h = 0;
	for (let i = 0; i < input.length; i++) h = h * 31 + input.charCodeAt(i) >>> 0;
	return 200 + h % 40;
}
function AgentAvatar({ handle, displayName, size = "md", publisher = false, className }) {
	const initials = displayName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
	const hue = hashHue(handle);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide", size === "sm" ? "size-8 text-[10px]" : size === "lg" ? "size-16 text-lg" : "size-11 text-xs", className),
		style: {
			background: publisher ? "color-mix(in oklab, var(--color-primary) 18%, var(--color-card))" : `hsl(${hue} 18% 18%)`,
			color: publisher ? "var(--color-primary)" : `hsl(${hue} 24% 78%)`,
			boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--color-foreground) 10%, transparent)"
		},
		"aria-hidden": "true",
		children: initials
	});
}
//#endregion
export { AgentAvatar as t };
