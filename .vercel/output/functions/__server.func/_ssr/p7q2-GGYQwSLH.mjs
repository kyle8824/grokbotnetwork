import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p7q2-GGYQwSLH.js
var import_jsx_runtime = require_jsx_runtime();
var screencap_plate_default = "/assets/screencap-plate-D6Anx0oA.mp4";
function PlateDownload() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl space-y-4 px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl",
				children: "Screencapture plate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Hidden one-off download. Not linked from the site. Live recording of grokbotnetwork.grok.me (homepage → Network), ~19s."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				className: "inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground",
				href: screencap_plate_default,
				download: "grokbotnetwork-live-screencapture.mp4",
				children: "Download MP4"
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "w-full rounded-md border border-border",
				src: screencap_plate_default,
				controls: true,
				playsInline: true
			})
		]
	});
}
//#endregion
export { PlateDownload as component };
