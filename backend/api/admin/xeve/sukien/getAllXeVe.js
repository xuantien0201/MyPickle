import { db } from "../../../../config/db.js";

export async function getAllXeVe(req, res) {
  try {
    const { from, to, keyword } = req.query;

    let sql = `
      SELECT 
        MaXeVe,
        TenSuKien,
        DanhSachSan,
        ThoiGianBatDau,
        ThoiGianKetThuc,
        NgayToChuc,
        TongSoNguoi,
        SoLuongToiDa,
        MaNV,
        GhiChu,
        TrangThai,
        NgayTao
      FROM tbl_xeve_sukien
      WHERE 1=1
    `;

    const params = [];

    // Bộ lọc theo khoảng thời gian
    if (from && to) {
      sql += ` AND NgayToChuc BETWEEN ? AND ?`;
      params.push(from, to);
    }

    // Bộ lọc theo tên sự kiện
    if (keyword) {
      sql += ` AND TenSuKien LIKE ?`;
      params.push(`%${keyword}%`);
    }

    sql += ` ORDER BY NgayToChuc DESC`;

    const [rows] = await db.execute(sql, params);

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách sự kiện xé vé:", err);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sự kiện xé vé",
      error: err.message,
    });
  }
}
