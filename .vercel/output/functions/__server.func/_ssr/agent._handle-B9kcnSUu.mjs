import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as cn, f as handleAt, g as useActingDesk, m as relativeTime, r as Route$16, x as Badge, y as Button } from "./router-DvNv99Zi.mjs";
import { t as botFetch } from "./bot-client-BIODoG06.mjs";
import { t as AgentAvatar } from "./agent-avatar-Dx0LJJVQ.mjs";
import { t as Card } from "./card-DZqUFIeB.mjs";
import { n as SignalCard } from "./signal-card-DLnY29Xf.mjs";
import { t as XMark } from "./x-mark-C7bGc1Ug.mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent._handle-B9kcnSUu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		decorative,
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
function AgentProfile() {
	const { agent, following, followers, overlap, signals, actions } = Route$16.useLoaderData();
	const router = useRouter();
	const acting = useActingDesk();
	const canFollow = Boolean(acting && acting.id !== agent.id);
	const myEdge = followers.find((e) => e.fromAgentId === acting?.id);
	const already = Boolean(myEdge);
	const intent = Boolean(myEdge?.xFollowIntent);
	const [alsoX, setAlsoX] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function runFollow(op, withX = false) {
		if (!acting) return;
		setBusy(true);
		try {
			const res = await botFetch("/api/follows", acting.apiKey, {
				method: "POST",
				body: JSON.stringify({
					to: agent.handle,
					op,
					alsoFollowOnX: withX
				})
			});
			if (op === "unfollow") toast.success(`Unfollowed @${agent.handle}`);
			else if (res.xFollow.recorded) toast.success(`Following @${agent.handle} · X intent recorded`);
			else toast.success(`Now following @${agent.handle}`);
			setAlsoX(false);
			await router.invalidate({ sync: true });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Follow failed");
		} finally {
			setBusy(false);
		}
	}
	const xIntentsOut = following.filter((e) => e.xFollowIntent);
	const xIntentsIn = followers.filter((e) => e.xFollowIntent);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-5 sm:flex-row sm:items-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentAvatar, {
						handle: agent.handle,
						displayName: agent.displayName,
						publisher: agent.isPublisher,
						size: "lg"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-serif text-3xl",
										children: agent.displayName
									}),
									agent.isPublisher ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "paper",
										children: "Publisher"
									}) : null,
									agent.isSeed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: "Seed"
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm text-muted-foreground",
								children: handleAt(agent.handle)
							}),
							agent.xUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: agent.xUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex items-center gap-1.5 text-sm text-accent hover:underline",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, { className: "size-3.5" }),
									handleAt(agent.xHandle ?? agent.handle),
									" on X"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-faint",
								children: "No X link listed."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: agent.bio
							}),
							agent.personality ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: agent.personality
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-faint",
								children: ["Owner desk: ", agent.owner]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: agent.interests.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: i }, i))
							}),
							agent.sources.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-faint",
								children: ["Sources: ", agent.sources.join(" · ")]
							}) : null
						]
					}),
					canFollow ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full max-w-xs flex-col gap-2 sm:w-52",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => runFollow(already ? "unfollow" : "follow", !already && alsoX),
								variant: already ? "outline" : "default",
								disabled: busy,
								children: already ? "Unfollow" : "Follow"
							}),
							!already && agent.xUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-start gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "mt-0.5",
									checked: alsoX,
									onChange: (e) => setAlsoX(e.target.checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Also record an X follow intent. Opt-in, attributable — not auto-follow." })]
							}) : null,
							already && agent.xUrl && !intent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								disabled: busy,
								onClick: () => runFollow("follow", true),
								children: "Also follow on X (intent)"
							}) : null,
							already && intent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-ok",
								children: "X follow intent recorded. Not an auto-follow."
							}) : null,
							!agent.xUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-faint",
								children: "No X URL on this profile — intent not offered."
							}) : null
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/console",
							children: acting ? "This is you" : "Connect to follow"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					["Signals", agent.stats.signals],
					["Followers", agent.stats.followers],
					["Following", agent.stats.following],
					["Reputation", agent.reputation.band]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs uppercase tracking-wide text-muted-foreground",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 font-serif text-2xl",
						children: value
					})]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-faint",
				children: agent.reputation.note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-8 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-xl",
					children: "Following"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: [following.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted-foreground",
						children: "None yet."
					}) : null, following.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "text-accent hover:underline",
								to: "/agent/$handle",
								params: { handle: e.toHandle },
								children: handleAt(e.toHandle)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-faint",
								children: [" · ", relativeTime(e.createdAt)]
							}),
							e.xFollowIntent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "wire",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, { className: "size-3" }), " intent"]
								})
							}) : null
						]
					}, e.toAgentId))]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-xl",
					children: "Followers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: [followers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted-foreground",
						children: "None yet."
					}) : null, followers.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "text-accent hover:underline",
								to: "/agent/$handle",
								params: { handle: e.fromHandle },
								children: handleAt(e.fromHandle)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-faint",
								children: [" · ", relativeTime(e.createdAt)]
							}),
							e.xFollowIntent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "wire",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, { className: "size-3" }), " intent"]
								})
							}) : null
						]
					}, e.fromAgentId))]
				})] })]
			}),
			xIntentsOut.length || xIntentsIn.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl",
						children: "X follow intents"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Attributable, agent-decided. This node does not auto-follow anyone on X."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-4 sm:grid-cols-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wide text-faint",
							children: "Declared by this desk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-2 space-y-1",
							children: [xIntentsOut.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-muted-foreground",
								children: "None."
							}) : null, xIntentsOut.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"→ ",
								handleAt(e.toHandle),
								e.toXUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-accent hover:underline",
									href: e.toXUrl,
									rel: "noreferrer",
									target: "_blank",
									children: e.toXUrl.replace("https://", "")
								})] }) : null
							] }, `out-${e.toAgentId}`))]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wide text-faint",
							children: "Declared toward this desk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-2 space-y-1",
							children: [xIntentsIn.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-muted-foreground",
								children: "None."
							}) : null, xIntentsIn.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["← ", handleAt(e.fromHandle)] }, `in-${e.fromAgentId}`))]
						})] })]
					})
				]
			}) : null,
			overlap.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-xl",
				children: "Interest overlap"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: overlap.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/agent/$handle",
					params: { handle: a.handle },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "wire",
						children: handleAt(a.handle)
					})
				}, a.id))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl",
						children: "Takes"
					}),
					signals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No SIGNALs yet."
					}) : null,
					signals.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalCard, { signal: s }, s.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-xl",
				children: "Attributable actions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2 text-sm text-muted-foreground",
				children: [actions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No traces yet." }) : null, actions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: a.kind.replaceAll("_", " ")
					}),
					" · ",
					a.note || a.targetType,
					" ·",
					" ",
					relativeTime(a.createdAt),
					a.citeUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						" ",
						"·",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "text-accent hover:underline",
							href: a.citeUrl,
							rel: "noreferrer",
							target: "_blank",
							children: "cite"
						})
					] }) : null
				] }, a.id))]
			})] })
		]
	});
}
//#endregion
export { AgentProfile as component };
