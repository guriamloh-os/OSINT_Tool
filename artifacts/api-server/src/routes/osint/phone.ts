import { Router } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { PhoneLookupBody, PhoneLookupResponse } from "@workspace/api-zod";

const router = Router();

const COUNTRY_DATA = [
  { countryCode: "+1", country: "United States", carriers: ["AT&T", "Verizon", "T-Mobile", "Sprint"] },
  { countryCode: "+44", country: "United Kingdom", carriers: ["EE", "O2", "Vodafone", "Three"] },
  { countryCode: "+49", country: "Germany", carriers: ["Deutsche Telekom", "Vodafone DE", "O2 Germany"] },
  { countryCode: "+33", country: "France", carriers: ["Orange", "SFR", "Bouygues Telecom"] },
  { countryCode: "+91", country: "India", carriers: ["Jio", "Airtel", "Vodafone India", "BSNL"] },
  { countryCode: "+86", country: "China", carriers: ["China Mobile", "China Unicom", "China Telecom"] },
  { countryCode: "+7", country: "Russia", carriers: ["MTS", "Beeline", "MegaFon"] },
  { countryCode: "+81", country: "Japan", carriers: ["NTT DoCoMo", "au", "SoftBank"] },
  { countryCode: "+55", country: "Brazil", carriers: ["Claro", "Vivo", "TIM", "Oi"] },
  { countryCode: "+61", country: "Australia", carriers: ["Telstra", "Optus", "Vodafone AU"] },
];

const LINE_TYPES = ["mobile", "landline", "voip", "unknown"] as const;
const US_REGIONS = ["New York", "California", "Texas", "Florida", "Illinois", "Pennsylvania"];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

router.post("/phone/lookup", async (req, res): Promise<void> => {
  const parsed = PhoneLookupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { phone } = parsed.data;
  const seed = deterministicHash(phone);

  const countryEntry = COUNTRY_DATA[seed % COUNTRY_DATA.length];
  const carrier = countryEntry.carriers[seed % countryEntry.carriers.length];
  const lineType = LINE_TYPES[seed % LINE_TYPES.length];
  const region = US_REGIONS[seed % US_REGIONS.length];
  const spamScore = (seed % 100) / 100;
  const riskScore = Math.round(spamScore * 60 + (seed % 40));

  await db.insert(searchHistoryTable).values({
    module: "phone",
    query: phone,
    riskScore,
    status: "completed",
  });

  const result = PhoneLookupResponse.parse({
    phone,
    valid: phone.length >= 7,
    countryCode: countryEntry.countryCode,
    country: countryEntry.country,
    carrier,
    lineType,
    region,
    spamScore,
    riskScore,
  });

  res.json(result);
});

export default router;
