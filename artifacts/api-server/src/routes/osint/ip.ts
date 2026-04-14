import { Router } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { TrackIpBody, TrackIpResponse } from "@workspace/api-zod";

const router = Router();

const CITIES = [
  { city: "New York", region: "New York", country: "United States", countryCode: "US", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { city: "London", region: "England", country: "United Kingdom", countryCode: "GB", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { city: "Tokyo", region: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  { city: "Frankfurt", region: "Hesse", country: "Germany", countryCode: "DE", lat: 50.1109, lon: 8.6821, tz: "Europe/Berlin" },
  { city: "Singapore", region: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lon: 103.8198, tz: "Asia/Singapore" },
  { city: "Amsterdam", region: "North Holland", country: "Netherlands", countryCode: "NL", lat: 52.3676, lon: 4.9041, tz: "Europe/Amsterdam" },
  { city: "Toronto", region: "Ontario", country: "Canada", countryCode: "CA", lat: 43.6532, lon: -79.3832, tz: "America/Toronto" },
  { city: "Sydney", region: "New South Wales", country: "Australia", countryCode: "AU", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
];

const ISPS = ["Comcast", "AT&T", "Verizon", "Deutsche Telekom", "BT Group", "NTT", "Amazon AWS", "Google Cloud", "Microsoft Azure", "DigitalOcean"];
const OPEN_PORT_SETS = [
  [80, 443],
  [22, 80, 443],
  [80, 443, 8080],
  [22, 80, 443, 3306],
  [80, 443, 8080, 8443],
  [22, 25, 80, 443],
];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function isValidIp(ip: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4.test(ip);
}

router.post("/ip/track", async (req, res): Promise<void> => {
  const parsed = TrackIpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { ip } = parsed.data;

  if (!isValidIp(ip)) {
    res.status(400).json({ error: "Invalid IP address format" });
    return;
  }

  const seed = deterministicHash(ip);
  const location = CITIES[seed % CITIES.length];
  const isp = ISPS[seed % ISPS.length];
  const isProxy = (seed % 5) === 0;
  const isVpn = (seed % 4) === 1;
  const isTor = (seed % 10) === 0;
  const openPorts = OPEN_PORT_SETS[seed % OPEN_PORT_SETS.length];

  let riskScore = seed % 30;
  if (isProxy) riskScore += 30;
  if (isVpn) riskScore += 25;
  if (isTor) riskScore += 40;
  riskScore = Math.min(100, riskScore);

  let threatLevel: "low" | "medium" | "high" | "critical" = "low";
  if (riskScore > 75) threatLevel = "critical";
  else if (riskScore > 50) threatLevel = "high";
  else if (riskScore > 25) threatLevel = "medium";

  const asnNum = (seed % 65000) + 1000;

  await db.insert(searchHistoryTable).values({
    module: "ip",
    query: ip,
    riskScore,
    status: "completed",
  });

  const result = TrackIpResponse.parse({
    ip,
    city: location.city,
    region: location.region,
    country: location.country,
    countryCode: location.countryCode,
    latitude: location.lat + (((seed % 100) - 50) / 1000),
    longitude: location.lon + (((seed % 100) - 50) / 1000),
    isp,
    org: `${isp} LLC`,
    asn: `AS${asnNum}`,
    timezone: location.tz,
    isProxy,
    isVpn,
    isTor,
    riskScore,
    threatLevel,
    openPorts,
  });

  res.json(result);
});

export default router;
