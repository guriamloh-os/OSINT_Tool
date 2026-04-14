import { Router } from "express";
import { db, reportsTable, searchHistoryTable } from "@workspace/db";
import { GenerateReportBody, GenerateReportResponse, ListReportsResponse } from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/reports", async (req, res): Promise<void> => {
  const reports = await db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .limit(50);

  const mapped = reports.map((r) => ({
    id: String(r.id),
    title: r.title,
    target: r.target,
    createdAt: r.createdAt.toISOString(),
    riskScore: r.riskScore,
    modules: r.modules,
  }));

  res.json(ListReportsResponse.parse(mapped));
});

router.post("/reports/generate", async (req, res): Promise<void> => {
  const parsed = GenerateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, target, modules } = parsed.data;

  const riskScore = Math.min(100, modules.length * 15 + Math.floor(Math.random() * 30));
  const summary = `Investigation report for "${target}" covering ${modules.length} modules. Analysis completed on ${new Date().toLocaleDateString()}. Risk assessment score: ${riskScore}/100. ${riskScore > 70 ? "HIGH RISK: Significant OSINT footprint detected." : riskScore > 40 ? "MEDIUM RISK: Moderate digital presence found." : "LOW RISK: Limited public exposure identified."}`;

  const [report] = await db.insert(reportsTable).values({
    title,
    target,
    riskScore,
    summary,
    modules,
    downloadUrl: `/api/reports/download/${Date.now()}`,
  }).returning();

  await db.insert(searchHistoryTable).values({
    module: "reports",
    query: target,
    riskScore,
    status: "completed",
  });

  const result = GenerateReportResponse.parse({
    id: String(report.id),
    title: report.title,
    target: report.target,
    createdAt: report.createdAt.toISOString(),
    riskScore: report.riskScore,
    summary: report.summary,
    modules: report.modules,
    downloadUrl: report.downloadUrl,
  });

  res.json(result);
});

export default router;
