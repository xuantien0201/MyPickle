import { db } from "../../../../config/db.js";
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

// 2️⃣ API nhận file và lưu DB
export async function postDatVe(req, res) {
  try {
    // 🔹 Thêm 2 trường mới: TongTien và DanhSachDichVu
    const {
      MaXeVe,
      MaKH,
      NguoiLap,
      SoLuongSlot,
      GhiChu,
      ThoiGianDangKy,
      TongTien,          // tổng tiền vé + dịch vụ
      DanhSachDichVu     // mảng dịch vụ
    } = req.body;

    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    if (!MaXeVe || !MaKH || !SoLuongSlot) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
    }

    // Ảnh thanh toán
    let PaymentScreenshot = null;
    if (req.file) {
      PaymentScreenshot = req.file.filename; // lưu tên file vào DB
    }

    // Chuyển mảng dịch vụ thành JSON string trước khi lưu
    const servicesJSON = DanhSachDichVu ? JSON.stringify(DanhSachDichVu) : null;

    const [result] = await db.execute(
      `INSERT INTO tbl_xeve_datve 
        (MaXeVe, MaKH, NguoiLap, SoLuongSlot, GhiChu, ThoiGianDangKy, PaymentScreenshot, TongTien, DanhSachDichVu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [MaXeVe, MaKH, NguoiLap, SoLuongSlot, GhiChu, ThoiGianDangKy, PaymentScreenshot, TongTien, servicesJSON]
    );

    res.json({
      success: true,
      message: "✅ Đặt vé thành công",
      insertedId: result.insertId,
      PaymentScreenshot,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm đặt vé:", err);
    res.status(500).json({ success: false, message: "Lỗi khi thêm đặt vé", error: err.message });
  }
}
