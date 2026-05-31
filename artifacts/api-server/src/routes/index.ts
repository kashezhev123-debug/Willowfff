import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bookingRouter from "./booking";
import pcsRouter from "./pcs";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bookingRouter);
router.use(pcsRouter);
router.use(adminRouter);

export default router;
