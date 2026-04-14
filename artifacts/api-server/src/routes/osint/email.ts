import { Router } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { EmailIntelligenceBody, EmailIntelligenceResponse } from "@workspace/api-zod";

const router = Router();

const BREACH_DATABASE = [
  {
    name: "Adobe",
    date: "2013-10-04",
    dataClasses: ["Email addresses", "Passwords", "Usernames", "Password hints"],
    severity: "high" as const,
  },
  {
    name: "LinkedIn",
    date: "2012-05-05",
    dataClasses: ["Email addresses", "Passwords"],
    severity: "high" as const,
  },
  {
    name: "Dropbox",
    date: "2012-07-01",
    dataClasses: ["Email addresses", "Passwords"],
    severity: "medium" as const,
  },
  {
    name: "MySpace",
    date: "2008-07-01",
    dataClasses: ["Email addresses", "Passwords", "Usernames"],
    severity: "critical" as const,
  },
  {
    name: "Canva",
    date: "2019-05-24",
    dataClasses: ["Email addresses", "Names", "Usernames", "Passwords"],
    severity: "medium" as const,
  },
  {
    name: "Twitter",
    date: "2022-07-01",
    dataClasses: ["Email addresses", "Phone numbers"],
    severity: "low" as const,
  },
];

const DISPOSABLE_DOMAINS = ["mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com", "throwam.com", "yopmail.com"];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

router.post("/email/intelligence", async (req, res): Promise<void> => {
  const parsed = EmailIntelligenceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email } = parsed.data;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  if (!isValid) {
    const result = EmailIntelligenceResponse.parse({
      email,
      isValid: false,
      domain: email.split("@")[1] || "unknown",
      mxRecords: [],
      breaches: [],
      disposable: false,
      riskScore: 10,
      reputation: "unknown",
    });
    res.json(result);
    return;
  }

  const domain = email.split("@")[1];
  const seed = deterministicHash(email);
  const disposable = DISPOSABLE_DOMAINS.includes(domain.toLowerCase());

  const breachCount = seed % 4;
  const breaches = BREACH_DATABASE.slice(0, breachCount);

  const mxRecords = [
    `mail.${domain}`,
    `alt1.mail.${domain}`,
    `alt2.mail.${domain}`,
  ];

  let riskScore = 0;
  if (disposable) riskScore += 40;
  riskScore += breachCount * 15;
  riskScore += seed % 20;
  riskScore = Math.min(100, riskScore);

  let reputation: "clean" | "suspicious" | "malicious" | "unknown" = "clean";
  if (riskScore > 70) reputation = "malicious";
  else if (riskScore > 40) reputation = "suspicious";
  else if (riskScore > 0) reputation = "clean";

  await db.insert(searchHistoryTable).values({
    module: "email",
    query: email,
    riskScore,
    status: "completed",
  });

  const result = EmailIntelligenceResponse.parse({
    email,
    isValid: true,
    domain,
    mxRecords,
    breaches,
    disposable,
    riskScore,
    reputation,
  });

  res.json(result);
});

export default router;
