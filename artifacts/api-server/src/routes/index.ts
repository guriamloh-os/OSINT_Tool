import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usernameRouter from "./osint/username";
import emailRouter from "./osint/email";
import domainRouter from "./osint/domain";
import ipRouter from "./osint/ip";
import phoneRouter from "./osint/phone";
import metadataRouter from "./osint/metadata";
import reportsRouter from "./osint/reports";
import dashboardRouter from "./osint/dashboard";
import historyRouter from "./osint/history";
import aiRouter from "./osint/ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(historyRouter);
router.use(usernameRouter);
router.use(emailRouter);
router.use(domainRouter);
router.use(ipRouter);
router.use(phoneRouter);
router.use(metadataRouter);
router.use(reportsRouter);
router.use(aiRouter);

export default router;
