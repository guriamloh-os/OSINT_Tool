import { Router } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { DomainLookupBody, DomainLookupResponse } from "@workspace/api-zod";

const router = Router();

const REGISTRARS = ["GoDaddy", "Namecheap", "Google Domains", "Cloudflare", "Network Solutions", "enom", "Name.com"];
const COUNTRIES = ["US", "GB", "DE", "FR", "CA", "AU", "JP", "NL", "SG", "CH"];
const TECH_STACKS = [
  ["nginx", "React", "Cloudflare"],
  ["Apache", "WordPress", "MySQL"],
  ["Varnish", "Angular", "AWS"],
  ["Caddy", "Vue.js", "Docker"],
  ["nginx", "Next.js", "Vercel"],
];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

router.post("/domain/lookup", async (req, res): Promise<void> => {
  const parsed = DomainLookupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { domain } = parsed.data;
  const seed = deterministicHash(domain);
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  const registrar = REGISTRARS[seed % REGISTRARS.length];
  const country = COUNTRIES[seed % COUNTRIES.length];
  const createdYear = 2000 + (seed % 20);
  const expiryYear = createdYear + 5 + (seed % 10);

  const technologies = TECH_STACKS[seed % TECH_STACKS.length];

  const subdomains = [
    `www.${cleanDomain}`,
    `mail.${cleanDomain}`,
    `api.${cleanDomain}`,
    `cdn.${cleanDomain}`,
    ...(seed % 2 === 0 ? [`dev.${cleanDomain}`, `staging.${cleanDomain}`] : []),
    ...(seed % 3 === 0 ? [`admin.${cleanDomain}`] : []),
  ];

  const ipBase = `${(seed % 200) + 10}.${(seed % 100) + 10}.${(seed % 50) + 1}.${(seed % 254) + 1}`;

  const riskScore = Math.min(100, (seed % 30) + 10);

  await db.insert(searchHistoryTable).values({
    module: "domain",
    query: cleanDomain,
    riskScore,
    status: "completed",
  });

  const result = DomainLookupResponse.parse({
    domain: cleanDomain,
    whois: {
      registrar,
      createdDate: `${createdYear}-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 28) + 1).padStart(2, "0")}`,
      expiryDate: `${expiryYear}-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 28) + 1).padStart(2, "0")}`,
      updatedDate: `${createdYear + 2}-06-15`,
      registrant: `REDACTED FOR PRIVACY`,
      country,
      nameservers: [`ns1.${cleanDomain}`, `ns2.${cleanDomain}`],
    },
    dnsRecords: {
      A: [ipBase],
      MX: [`10 mail.${cleanDomain}`, `20 alt.mail.${cleanDomain}`],
      NS: [`ns1.${cleanDomain}`, `ns2.${cleanDomain}`],
      TXT: [`v=spf1 include:${cleanDomain} ~all`, `google-site-verification=${seed.toString(16)}`],
      CNAME: [`www.${cleanDomain}`],
    },
    subdomains,
    technologies,
    riskScore,
    sslInfo: {
      issuer: seed % 2 === 0 ? "Let's Encrypt Authority X3" : "DigiCert Inc",
      validFrom: `${createdYear + 3}-01-01`,
      validTo: `${createdYear + 4}-01-01`,
      valid: true,
    },
  });

  res.json(result);
});

export default router;
