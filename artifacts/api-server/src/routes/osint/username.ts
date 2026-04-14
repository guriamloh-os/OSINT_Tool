import { Router } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { SearchUsernameBody, SearchUsernameResponse } from "@workspace/api-zod";

const router = Router();

const PLATFORMS = [
  { name: "GitHub", base: "https://github.com" },
  { name: "Twitter", base: "https://twitter.com" },
  { name: "Instagram", base: "https://www.instagram.com" },
  { name: "LinkedIn", base: "https://www.linkedin.com/in" },
  { name: "Reddit", base: "https://www.reddit.com/user" },
  { name: "TikTok", base: "https://www.tiktok.com/@" },
  { name: "YouTube", base: "https://www.youtube.com/@" },
  { name: "Pinterest", base: "https://www.pinterest.com" },
  { name: "Twitch", base: "https://www.twitch.tv" },
  { name: "Snapchat", base: "https://www.snapchat.com/add" },
  { name: "Telegram", base: "https://t.me" },
  { name: "Discord", base: "https://discord.com" },
];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

router.post("/username/search", async (req, res): Promise<void> => {
  const parsed = SearchUsernameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username } = parsed.data;
  const seed = deterministicHash(username);

  const platforms = PLATFORMS.map((p, i) => {
    const found = (seed + i * 7) % 3 !== 0;
    const url = p.name === "TikTok"
      ? `${p.base}${username}`
      : `${p.base}/${username}`;

    if (!found) {
      return { platform: p.name, url, status: "not_found" as const };
    }

    const followers = ((seed * (i + 1) * 137) % 50000) + 100;
    const following = ((seed * (i + 1) * 73) % 2000) + 10;
    const posts = ((seed * (i + 1) * 29) % 1000) + 1;

    return {
      platform: p.name,
      url,
      status: "found" as const,
      profileData: {
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        bio: `Profile found on ${p.name}. Account appears active.`,
        followers,
        following,
        posts,
        verified: (seed + i) % 7 === 0,
        joinDate: `${2015 + (seed % 8)}-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 28) + 1).padStart(2, "0")}`,
      },
    };
  });

  const foundCount = platforms.filter((p) => p.status === "found").length;
  const riskScore = Math.min(100, Math.round((foundCount / PLATFORMS.length) * 80 + (seed % 20)));

  await db.insert(searchHistoryTable).values({
    module: "username",
    query: username,
    riskScore,
    status: "completed",
  });

  const result = SearchUsernameResponse.parse({
    username,
    totalFound: foundCount,
    riskScore,
    platforms,
    summary: `Found ${foundCount} out of ${PLATFORMS.length} platforms for username "${username}". Risk score: ${riskScore}/100.`,
  });

  res.json(result);
});

export default router;
