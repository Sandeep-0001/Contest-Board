// This file previously used Appwrite SDK. For setups without Appwrite we call the
// local Express API provided by the `fetchContestData` service. The API endpoint
// is configured via Vite env var VITE_API_ENDPOINT (default: http://localhost:4000).

const API_BASE = import.meta.env.VITE_API_ENDPOINT || "http://localhost:4000";

async function jsonFetch(path, params = {}) {
	const url = new URL(API_BASE + path);
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null) url.searchParams.set(k, v);
	});
	const res = await fetch(url.toString());
	if (!res.ok) {
		const txt = await res.text().catch(() => "");
		throw new Error(`${res.status} ${res.statusText} ${txt}`);
	}
	return res.json();
}

// skip and limit are numeric; selected is array of selected platform indices
export const getLatestContest = async (skip = 0, limit = 10, selected = []) => {
	// Map selected indices to platform names same as the original appwrite logic
	const platforms = ["CodeChef", "Codeforces", "LeetCode", "GeeksforGeeks"];
	let platformParam = "";
	if (selected && selected.length > 0) {
		if (selected.includes(0)) platformParam = platforms.join(",");
		else platformParam = selected.map((i) => platforms[i - 1]).filter(Boolean).join(",");
	}
	return await jsonFetch(`/api/contests/upcoming`, { skip, limit, platforms: platformParam });
};

export const getPastContest = async (skip = 0, limit = 10, selected = []) => {
	const platforms = ["CodeChef", "Codeforces", "LeetCode", "GeeksforGeeks"];
	let platformParam = "";
	if (selected && selected.length > 0) {
		if (selected.includes(0)) platformParam = platforms.join(",");
		else platformParam = selected.map((i) => platforms[i - 1]).filter(Boolean).join(",");
	}
	return await jsonFetch(`/api/contests/past`, { skip, limit, platforms: platformParam });
};

// There is no 'lastUpdated' from the local API; return a client-side generated date.
export const getLastUpdatedDate = async () => new Date().toISOString();
