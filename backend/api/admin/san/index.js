import express from "express";
import { getAllSan } from "./getAllSan.js";
import { acceptDatSan } from "./acceptDatSan.js";
import { postDatSan, uploadPaymentScreenshot } from "./postDatSan.js";

const router = express.Router();

router.get("/", getAllSan);
router.put("/accept", acceptDatSan);
// Thêm upload.single("PaymentScreenshot") giống TTXeVe
router.post("/book", uploadPaymentScreenshot.single("PaymentScreenshot"), postDatSan);

export default router;