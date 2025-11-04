import express from "express";
import { postDatSanThang } from "./postDatSanThang.js";
import { getDatSanThang } from "./getDatSanThang.js";

const router = express.Router();

// 🧾 Đặt sân tháng
router.post("/book", postDatSanThang);

// 📋 Lấy danh sách đặt sân tháng
router.get("/list", getDatSanThang);

export default router;
