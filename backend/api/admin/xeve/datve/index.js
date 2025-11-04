import express from "express";
import { postDatVe, uploadPaymentScreenshot } from "./postDatVe.js";
import { getCountByXeVe } from "./getCountByXeVe.js";

const router = express.Router();

// SỬ DỤNG MULTER để nhận file PaymentScreenshot
router.post("/", uploadPaymentScreenshot.single("PaymentScreenshot"), postDatVe);
router.get("/count", getCountByXeVe);

export default router;
