import { db } from "../../../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// 1️⃣ Cấu hình multer lưu file vào folder uploads/payments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/payments";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadPaymentScreenshot = multer({ storage });

// 2️⃣ API đặt sân giống TTXeVe
export async function postDatSan(req, res) {
  try {
    // 🔹 Lấy dữ liệu từ FormData
    const {
      MaSan,
      MaKH,
      MaNV,
      GioVao,
      GioRa,
      TongGio,
      TongTien,
      GiamGia,
      TongTienThuc,
      GhiChu,
      LoaiDat,
      NgayLap,
      TienDichVu,
      DanhSachDichVu,
    } = req.body;

    if (!MaSan || !MaKH || !GioVao || !GioRa || !NgayLap) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
    }

    // Ảnh thanh toán
    let PaymentScreenshot = null;
    if (req.file) PaymentScreenshot = req.file.filename;

    // Chuyển mảng dịch vụ thành JSON string trước khi lưu
    const servicesJSON = DanhSachDichVu ? JSON.stringify(DanhSachDichVu) : null;

    // Chuẩn hóa giờ
    const gioVaoFormat = GioVao.length === 8 ? GioVao : `${GioVao}:00`;
    const gioRaFormat = GioRa.length === 8 ? GioRa : `${GioRa}:00`;

    // Kiểm tra trùng giờ
    const [checkExist] = await db.execute(
      `SELECT * FROM tbl_datsan 
       WHERE MaSan = ? AND NgayLap = ? 
       AND (
         (GioVao <= ? AND GioRa > ?) OR 
         (GioVao < ? AND GioRa >= ?)
       )`,
      [MaSan, NgayLap, gioVaoFormat, gioVaoFormat, gioRaFormat, gioRaFormat]
    );

    if (checkExist.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Khung giờ này đã được đặt, vui lòng chọn giờ khác!",
      });
    }

    // Thêm dữ liệu đặt sân vào DB
    const [result] = await db.execute(
      `INSERT INTO tbl_datsan 
      (MaSan, MaKH, MaNV, GioVao, GioRa, TongGio, TongTien, GiamGia, TongTienThuc, GhiChu, LoaiDat, NgayLap, TienDichVu, DanhSachDichVu, PaymentScreenshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        MaSan,
        MaKH,
        MaNV || "",
        gioVaoFormat,
        gioRaFormat,
        TongGio || 1,
        TongTien || 0,
        GiamGia || 0,
        TongTienThuc || TongTien || 0,
        GhiChu || "",
        LoaiDat || "Đặt sân ngày",
        NgayLap,
        TienDichVu || 0,
        servicesJSON,
        PaymentScreenshot,
      ]
    );

    res.json({
      success: true,
      message: "✅ Đặt sân thành công",
      insertedId: result.insertId,
      PaymentScreenshot,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đặt sân:", err);
    res.status(500).json({ success: false, message: "Lỗi khi đặt sân", error: err.message });
  }
}
