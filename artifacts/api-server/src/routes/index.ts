import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bookingRouter from "./booking";
import pcsRouter from "./pcs";
import adminRouter from "./admin";
import statsRouter from "./stats";
import blockedRouter from "./blocked";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bookingRouter);
router.use(pcsRouter);
router.use(adminRouter);
router.use(statsRouter);
router.use(blockedRouter);

export default router;
