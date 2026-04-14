import { Router } from "express";
import { AiChatBody, AiChatResponse } from "@workspace/api-zod";

const router = Router();

const OSINT_RESPONSES: Record<string, { response: string; suggestions: string[] }> = {
  default: {
    response: "I'm ShadowTrace AI, your OSINT intelligence assistant. I can help you with investigation strategies, interpreting results, and understanding cybersecurity concepts. What would you like to know?",
    suggestions: ["How do I investigate a domain?", "What does a high risk score mean?", "How to find email breaches?"],
  },
  username: {
    response: "Username OSINT involves searching for an identifier across multiple platforms. Key platforms to check include social media sites, forums, gaming platforms, and professional networks. A consistent username across many platforms increases the OSINT footprint and can reveal patterns about the subject's online behavior and interests.",
    suggestions: ["What platforms are most valuable?", "How to correlate multiple accounts?", "What is username pivoting?"],
  },
  email: {
    response: "Email intelligence is one of the most powerful OSINT vectors. Breached email data can reveal password patterns, service usage, and timeline of digital activity. Always verify breach data through multiple sources. The domain of an email can also reveal information about the organization or service provider.",
    suggestions: ["How to check email breaches?", "What are disposable email risks?", "How to find associated accounts?"],
  },
  domain: {
    response: "Domain intelligence reveals critical infrastructure information. WHOIS data (when not privacy-protected) can expose registrant details. DNS records show hosting infrastructure, email servers, and subdomains. Certificate transparency logs are excellent for subdomain discovery. Historical DNS data can reveal past hosting providers.",
    suggestions: ["What are DNS records?", "How to find subdomains?", "What is certificate transparency?"],
  },
  ip: {
    response: "IP geolocation accuracy varies significantly — consumer IPs may be accurate to city level, while VPN/proxy IPs show the exit node location. ASN data reveals the hosting provider. Checking against known proxy/Tor databases helps assess anonymization. Open port scanning can reveal services running on an IP.",
    suggestions: ["What is ASN?", "How to detect VPN usage?", "What do open ports reveal?"],
  },
  osint: {
    response: "OSINT (Open Source Intelligence) is the collection and analysis of publicly available information. It's a legal and ethical practice when conducted for legitimate purposes — security research, due diligence, or investigative journalism. Always ensure you have legal authorization before investigating any individual or organization.",
    suggestions: ["What are OSINT best practices?", "What is passive vs active OSINT?", "What are legal considerations?"],
  },
  risk: {
    response: "Risk scores in ShadowTrace are calculated based on multiple factors: the quantity and quality of data found, presence in breach databases, use of anonymization services, and cross-platform correlation. A score above 70 indicates a significant digital footprint that may pose privacy or security risks. Scores are for informational purposes only.",
    suggestions: ["How is risk score calculated?", "What should I do with high scores?", "Can risk scores be reduced?"],
  },
};

function getRelevantResponse(message: string): { response: string; suggestions: string[] } {
  const lower = message.toLowerCase();
  if (lower.includes("username") || lower.includes("social") || lower.includes("platform")) {
    return OSINT_RESPONSES.username;
  }
  if (lower.includes("email") || lower.includes("breach") || lower.includes("password")) {
    return OSINT_RESPONSES.email;
  }
  if (lower.includes("domain") || lower.includes("dns") || lower.includes("whois") || lower.includes("subdomain")) {
    return OSINT_RESPONSES.domain;
  }
  if (lower.includes("ip") || lower.includes("geolocation") || lower.includes("vpn") || lower.includes("proxy")) {
    return OSINT_RESPONSES.ip;
  }
  if (lower.includes("osint") || lower.includes("intelligence") || lower.includes("investigation")) {
    return OSINT_RESPONSES.osint;
  }
  if (lower.includes("risk") || lower.includes("score") || lower.includes("threat")) {
    return OSINT_RESPONSES.risk;
  }
  return OSINT_RESPONSES.default;
}

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message } = parsed.data;
  const responseData = getRelevantResponse(message);

  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  const result = AiChatResponse.parse(responseData);
  res.json(result);
});

export default router;
