require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Helpers to fetch and normalize data from each platform (no Appwrite writes)
async function fetchCodeforcesAll() {
  const url = "https://codeforces.com/api/contest.list";
  const { data } = await axios.get(url);
  const contests = data.result || [];
  return contests.map((contest) => {
    const startMs = contest.startTimeSeconds * 1000;
    const endMs = (contest.startTimeSeconds + contest.durationSeconds) * 1000;
    return {
      name: contest.name,
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
      duration: contest.durationSeconds,
      link: `https://codeforces.com/contests/${contest.id}`,
      type: contest.type,
      contestId: `codeforces_${contest.id}`,
      platform: "Codeforces",
    };
  });
}

async function fetchLeetCodeUpcoming() {
  const url = "https://leetcode.com/graphql";
  const { data } = await axios.post(url, {
    query: `
      query upcomingContests { upcomingContests { title titleSlug startTime duration __typename } }
    `,
  });
  const upcoming = data?.data?.upcomingContests || [];
  return upcoming.map((c) => {
    const startMs = c.startTime * 1000;
    const endMs = startMs + c.duration * 1000;
    const type = c.title.includes("Weekly") ? "Weekly" : "Biweekly";
    return {
      name: c.title,
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
      duration: c.duration,
      link: `https://leetcode.com/contest/${c.titleSlug}`,
      type,
      contestId: `leetcode_${c.titleSlug}`,
      platform: "LeetCode",
    };
  });
}

async function fetchCodeChefAll() {
  const url = "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";
  const { data } = await axios.get(url);
  const format = (contest) => ({
    name: contest.contest_name,
    startTime: contest.contest_start_date_iso,
    endTime: contest.contest_end_date_iso,
    duration: (contest.contest_duration || 0) * 60,
    link: `https://www.codechef.com/${contest.contest_code}`,
    type: contest.contest_name?.includes("Starters") ? "Starters" : "Others",
    contestId: `codechef_${contest.contest_code}`,
    platform: "CodeChef",
  });
  const future = (data.future_contests || []).map(format);
  const present = (data.present_contests || []).map(format);
  const past = (data.past_contests || []).map(format);
  return { future, present, past };
}

async function fetchGFGUpcoming() {
  const url = "https://practiceapi.geeksforgeeks.org/api/vr/events/?sub_type=all&type=contest";
  const { data } = await axios.get(url);
  let upcoming = data?.results?.upcoming || [];
  // filter out invalid / unrealistic contests (some entries use sentinel end dates)
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
  upcoming = upcoming.filter(isValid);
  // merge any local overrides (useful when GFG API has no upcoming contests)
  try {
    const overridePath = path.join(__dirname, "gfg_override.json");
    if (fs.existsSync(overridePath)) {
      const raw = fs.readFileSync(overridePath, "utf8");
      const parsed = JSON.parse(raw || "{}");
      const ov = parsed?.upcoming || [];
      if (Array.isArray(ov) && ov.length > 0) {
        // prepend overrides but avoid duplicates by slug
        const seen = new Set(upcoming.map((c) => c.slug));
        const merged = [...ov.filter((c) => !seen.has(c.slug)), ...upcoming];
        upcoming = merged;
      }
    }
  } catch (e) {
    // don't block on override read errors
    // eslint-disable-next-line no-console
    console.warn("Failed to read gfg_override.json:", e.message);
  }
  // log counts for visibility
  // eslint-disable-next-line no-console
  console.log("GFG upcoming count:", (upcoming || []).length, "(api returned:", (data?.results?.upcoming || []).length, ")");
  return upcoming.map((contest) => {
    const startIso = new Date(contest.start_time + ".000+05:30").toISOString();
    const endIso = new Date(contest.end_time + ".000+05:30").toISOString();
    const duration = (new Date(contest.end_time) - new Date(contest.start_time)) / 1000;
    const type = contest.name?.includes("Hiring") ? "Hiring" : "Weekly";
    return {
      name: contest.name,
      startTime: startIso,
      endTime: endIso,
      duration,
      link: `https://practice.geeksforgeeks.org/contest/${contest.slug}`,
      type,
      contestId: `geeksforGeeks_${contest.slug}`,
      platform: "GeeksforGeeks",
    };
  });
}

// Fetch both upcoming and past contests from GFG
// async function fetchGFGAll() {
//   const url = "https://practiceapi.geeksforgeeks.org/api/vr/events/?sub_type=all&type=contest";
//   const { data } = await axios.get(url);
//   const upcoming = data?.results?.upcoming || [];
//   const past = data?.results?.past || [];

//   const mapContest = (contest) => {
//     // GFG times come without timezone; append IST offset and convert
//     const startIso = new Date(contest.start_time + ".000+05:30").toISOString();
//     const endIso = new Date(contest.end_time + ".000+05:30").toISOString();
//     const duration = (new Date(contest.end_time) - new Date(contest.start_time)) / 1000;
//     const type = contest.name?.includes("Hiring") ? "Hiring" : "Weekly";
//     return {
//       name: contest.name,
//       startTime: startIso,
//       endTime: endIso,
//       duration,
//       link: `https://practice.geeksforgeeks.org/contest/${contest.slug}`,
//       type,
//       contestId: `geeksforGeeks_${contest.slug}`,
//       platform: "GeeksforGeeks",
//     };
//   };

//   return {
//     // include overrides for upcoming if present
//     upcoming: (() => {
//       try {
//         const overridePath = path.join(__dirname, "gfg_override.json");
//         if (fs.existsSync(overridePath)) {
//           const raw = fs.readFileSync(overridePath, "utf8");
//           const parsed = JSON.parse(raw || "{}");
//           const ov = parsed?.upcoming || [];
//           if (Array.isArray(ov) && ov.length > 0) {
//             const seen = new Set(upcoming.map((c) => c.slug));
//             const merged = [...ov.filter((c) => !seen.has(c.slug)), ...upcoming];
//             // eslint-disable-next-line no-console
//             console.log("GFG upcoming merged with override:", merged.length);
//             return merged.map(mapContest);
//           }
//         }
//       } catch (e) {
//         // eslint-disable-next-line no-console
//         console.warn("Failed to apply GFG override:", e.message);
//       }
//       // default
//       // eslint-disable-next-line no-console
//       console.log("GFG upcoming count:", (upcoming || []).length, "past count:", (past || []).length);
//       return upcoming.map(mapContest);
//     })(),
//     past: past.map(mapContest),
//   };
// }

async function fetchGFGAll() {
  const url = "https://practiceapi.geeksforgeeks.org/api/vr/events/?sub_type=all&type=contest";
  const { data } = await axios.get(url);

  const all =
    [
      ...(data?.results?.upcoming || []),
      ...(data?.results?.past || [])
    ];

  const now = new Date();
  const upcoming = [];
  const past = [];

  for (const contest of all) {
    const startIso = new Date(contest.start_time + ".000+05:30").toISOString();
    const endIso = new Date(contest.end_time + ".000+05:30").toISOString();

    const mapped = {
      name: contest.name,
      startTime: startIso,
      endTime: endIso,
      duration: (new Date(endIso) - new Date(startIso)) / 1000,
      link: `https://practice.geeksforgeeks.org/contest/${contest.slug}`,
      type: contest.name?.includes("Hiring") ? "Hiring" : "Contest",
      contestId: `geeksforgeeks_${contest.slug}`,
      platform: "GeeksforGeeks",
    };

    if (new Date(endIso) >= now) {
      upcoming.push(mapped);
    } else {
      past.push(mapped);
    }
  }

  return { upcoming, past };
}


function filterByPlatforms(items, platforms) {
  if (!platforms || platforms.length === 0) return items;
  const set = new Set(platforms.map((p) => p.toLowerCase()));
  return items.filter((it) => set.has(it.platform.toLowerCase()));
}

function paginate(items, skip = 0, limit = 10) {
  const total = items.length;
  const sliced = items.slice(skip, skip + limit);
  return { documents: sliced, total };
}

// Routes
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/contests/upcoming", async (req, res) => {
  try {
    const platformsParam = (req.query.platforms || "").toString();
    const platforms = platformsParam
      ? platformsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const skip = parseInt(req.query.skip || "0", 10) || 0;
    const limit = parseInt(req.query.limit || "10", 10) || 10;

    // fetch GFG both upcoming and past so we can include past items in /past
    const [cfAll, lcUpcoming, ccAll, gfgAll] = await Promise.all([
      fetchCodeforcesAll(),
      fetchLeetCodeUpcoming(),
      fetchCodeChefAll(),
      fetchGFGAll(),
    ]);

    const now = new Date();
    const fromCf = cfAll.filter((c) => new Date(c.endTime) >= now);
    const fromCc = [...ccAll.present, ...ccAll.future];
    const all = [...fromCf, ...lcUpcoming, ...fromCc, ...gfgAll.upcoming]
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const filtered = filterByPlatforms(all, platforms);
    const { documents, total } = paginate(filtered, skip, limit);
    res.json({ documents, total });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch upcoming contests" });
  }
});

app.get("/api/contests/past", async (req, res) => {
  try {
    const platformsParam = (req.query.platforms || "").toString();
    const platforms = platformsParam
      ? platformsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const skip = parseInt(req.query.skip || "0", 10) || 0;
    const limit = parseInt(req.query.limit || "10", 10) || 10;

    // include GFG past data
    const [cfAll, ccAll, gfgAll] = await Promise.all([
      fetchCodeforcesAll(),
      fetchCodeChefAll(),
      fetchGFGAll(),
    ]);

    const now = new Date();
    const fromCf = cfAll.filter((c) => new Date(c.endTime) < now);
    const fromCc = ccAll.past;
    const fromGfg = gfgAll.past || [];
    const all = [...fromCf, ...fromCc, ...fromGfg]
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    const filtered = filterByPlatforms(all, platforms);
    const { documents, total } = paginate(filtered, skip, limit);
    res.json({ documents, total });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch past contests" });
  }
});

// Debug endpoint: show raw GFG API response, override and merged upcoming list
app.get("/api/debug/gfg", async (_req, res) => {
  try {
    const url = "https://practiceapi.geeksforgeeks.org/api/vr/events/?sub_type=all&type=contest";
    const { data } = await axios.get(url);
    const rawUpcoming = data?.results?.upcoming || [];
    const rawPast = data?.results?.past || [];
    let override = [];
    try {
      const overridePath = path.join(__dirname, "gfg_override.json");
      if (fs.existsSync(overridePath)) {
        const raw = fs.readFileSync(overridePath, "utf8");
        const parsed = JSON.parse(raw || "{}");
        override = parsed?.upcoming || [];
      }
    } catch (e) {
      // ignore
    }

    // apply same validation as fetchGFGUpcoming
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

    const filtered = rawUpcoming.filter(isValid);
    const seen = new Set(filtered.map((c) => c.slug));
    const merged = [...(override.filter((c) => !seen.has(c.slug)) || []), ...filtered];

    res.json({ rawUpcomingCount: rawUpcoming.length, rawPastCount: rawPast.length, rawUpcoming: rawUpcoming.slice(0, 50), override, filteredCount: filtered.length, mergedCount: merged.length, mergedSample: merged.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${PORT}`);
});
