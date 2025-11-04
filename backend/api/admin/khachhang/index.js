import express from "express";
import { getAllKhachHang } from "./getAllKhachHang.js";
import { searchKhachHang } from "./getSearch.js";
import { postKhachHang } from "./postKhachHang.js";
import { getKhachHangByMaKH } from "./getKhachHangByMaKH.js";

const router = express.Router();

router.get("/", getAllKhachHang);
router.get("/search", searchKhachHang);
router.post("/", postKhachHang);
router.get("/idsearch", getKhachHangByMaKH);

export default router;
