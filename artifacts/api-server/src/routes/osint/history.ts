import { Router } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { GetSearchHistoryQueryParams, GetSearchHistoryResponse, ClearSearchHistoryResponse } from "@workspace/api-zod";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.get("/history", async (req, res): Promise<void> => {
  const parsed = GetSearchHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 20, module } = parsed.data;

  let query = db
    .select()
    .from(searchHistoryTable)
    .orderBy(desc(searchHistoryTable.createdAt))
    .$dynamic();

  if (module) {
    query = query.where(eq(searchHistoryTable.module, module));
  }

  const history = await query.limit(limit);

  const mapped = history.map((h) => ({
    id: String(h.id),
    module: h.module,
    query: h.query,
    timestamp: h.createdAt.toISOString(),
    riskScore: h.riskScore,
    status: h.status as "completed" | "failed" | "pending",
  }));

  res.json(GetSearchHistoryResponse.parse(mapped));
});

router.delete("/history", async (req, res): Promise<void> => {
  await db.delete(searchHistoryTable);
  res.json(ClearSearchHistoryResponse.parse({ success: true, message: "Search history cleared" }));
});

export default router;
