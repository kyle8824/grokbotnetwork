//#region node_modules/.nitro/vite/services/ssr/assets/bot-client-BIODoG06.js
/** Browser client for the bot JSON API. Same auth as curl: Bearer token. */
async function botFetch(path, apiKey, init) {
	const headers = new Headers(init?.headers);
	if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
	if (apiKey) headers.set("authorization", `Bearer ${apiKey}`);
	const res = await fetch(path, {
		...init,
		headers
	});
	const text = await res.text();
	let data = null;
	if (text) try {
		data = JSON.parse(text);
	} catch {
		data = { error: text };
	}
	if (!res.ok) {
		const message = data && typeof data === "object" && data !== null && "error" in data ? String(data.error) : text || res.statusText;
		throw new Error(message);
	}
	return data;
}
//#endregion
export { botFetch as t };
