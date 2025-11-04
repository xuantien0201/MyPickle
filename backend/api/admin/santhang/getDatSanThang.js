import { db } from "../../../config/db.js";

/**
 * API: Lấy danh sách tất cả đặt sân tháng
 * - Có thể lọc theo MaKH (mã khách hàng)
 * - Có thể lọc theo TrangThai hoặc trạng thái thanh toán
 * 
 * GET /api/santhang/list?MaKH=KH001
 */

export async function getDatSanThang(req, res) {
  try {
    const { MaKH, TrangThai, TrangThaiThanhToan } = req.query;

    // 🧩 Câu SQL cơ bản
    let sql = `SELECT 
      MaDatSanThang, MaKH, MaNV, DanhSachSan, NgayBatDau, NgayKetThuc,
      DanhSachNgay, GioBatDau, GioKetThuc, TongGio, TongTien, GiamGia,
      TongTienThuc, LoaiThanhToan, SoTienDaThanhToan, TrangThaiThanhToan,
      GhiChu, NgayLap, TrangThai
      FROM tbl_datsanthang
      WHERE 1=1`;

    const params = [];

    // 🧩 Bộ lọc động
    if (MaKH) {
      sql += " AND MaKH = ?";
      params.push(MaKH);
    }

    if (TrangThai) {
      sql += " AND TrangThai = ?";
      params.push(TrangThai);
    }

    if (TrangThaiThanhToan) {
      sql += " AND TrangThaiThanhToan = ?";
      params.push(TrangThaiThanhToan);
    }

    sql += " ORDER BY NgayLap DESC";

    const [rows] = await db.execute(sql, params);

    // 📅 Parse JSON cho cột DanhSachNgay
    const result = rows.map((item) => ({
      ...item,
      DanhSachSan: item.DanhSachSan ? item.DanhSachSan.split(",") : [],
      DanhSachNgay: (() => {
        try {
          const parsed = JSON.parse(item.DanhSachNgay);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })(),
    }));

    res.json({
      message: "✅ Lấy danh sách đặt sân tháng thành công!",
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách đặt sân tháng:", err);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đặt sân tháng",
      error: err.message,
    });
  }
}
