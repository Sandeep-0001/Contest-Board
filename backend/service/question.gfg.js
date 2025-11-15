const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createContestDocument } = require("../appwrite/config");

async function getLatestGeeksforGeeksQuestions() {
	try {
		const url =
			"https://practiceapi.geeksforgeeks.org/api/vr/events/?sub_type=all&type=contest";
		const response = await axios.get(url);
		let contests = response.data.results.upcoming || [];

		// apply optional local override (same behavior as index.js)
		try {
			const overridePath = path.join(__dirname, "..", "gfg_override.json");
			if (fs.existsSync(overridePath)) {
				const raw = fs.readFileSync(overridePath, "utf8");
				const parsed = JSON.parse(raw || "{}");
				const ov = parsed?.upcoming || [];
				if (Array.isArray(ov) && ov.length > 0) {
					const seen = new Set(contests.map((c) => c.slug));
					contests = [...ov.filter((c) => !seen.has(c.slug)), ...contests];
				}
			}
		} catch (e) {
			console.warn("Failed to read gfg_override.json in service:", e.message);
		}

		// filter out invalid/unrealistic contests
		const now = new Date();
		const MAX_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days
		const MAX_FUTURE_YEARS = 5;
		const isValid = (c) => {
			try {
				const s = new Date(c.start_time + ".000+05:30");
				const e = new Date(c.end_time + ".000+05:30");
				const dur = (e - s) / 1000;
				if (Number.isNaN(dur) || dur <= 0) return false;
				if (dur > MAX_DURATION_SECONDS) return false;
				if (e.getFullYear() > now.getFullYear() + MAX_FUTURE_YEARS) return false;
				return true;
			} catch (err) {
				return false;
			}
		};

		contests = contests.filter(isValid);

		const data = contests.map((contest) => {
			const type = contest.name.includes("Hiring") ? "Hiring" : "Weekly";
			const startIso = new Date(contest.start_time + ".000+05:30").toISOString();
			const endIso = new Date(contest.end_time + ".000+05:30").toISOString();
			const durationSec = (new Date(contest.end_time + ".000+05:30") - new Date(contest.start_time + ".000+05:30")) / 1000;
			return {
				name: contest.name,
				startTime: startIso,
				endTime: endIso,
				duration: durationSec, // duration in seconds
				link: `https://practice.geeksforgeeks.org/contest/${contest.slug}`,
				type: type,
				contestId: `geeksforGeeks_${contest.slug}`,
				platform: "GeeksforGeeks",
			};
		});
		const promise = data.map(createContestDocument);
		await Promise.all(promise);
		console.log("GeeksforGeeks questions fetched and stored successfully.");
	} catch (error) {
		console.log("Error fetching GeeksforGeeks questions:", error.message);
	}
}

module.exports = {
	getLatestGeeksforGeeksQuestions,
};
