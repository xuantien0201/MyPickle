import { db } from "../../../config/db.js";

export async function getAllSan(req, res) {
  try {
    // ✅ Lấy ngày từ query hoặc mặc định hôm nay
    const date =
      req.query.date ||
      new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split("T")[0]; // +7h VN

    // 1️⃣ Lấy tất cả thông tin sân
    const [sanRows] = await db.execute(`
      SELECT MaSan, TenSan, LoaiSan, GiaThueTruoc16, GiaThueSau16, TrangThai
      FROM tbl_san
      ORDER BY CAST(SUBSTRING(MaSan, 2) AS UNSIGNED)
    `);

    // 2️⃣ Lấy toàn bộ lịch đặt sân theo ngày được chọn
    const [datSanRows] = await db.execute(
      `SELECT ds.*, k.TenKh AS KhachHang
   FROM tbl_datsan ds
   LEFT JOIN tbl_khachhang k ON ds.MaKH = k.id
   WHERE DATE(ds.NgayLap) = ?
   ORDER BY ds.GioVao ASC`,
      [date]
    );

    // 3️⃣ Gộp dữ liệu đặt sân theo từng sân
    const result = sanRows.map((san) => {
      const bookedSlots = datSanRows
        .filter((ds) => ds.MaSan === san.MaSan)
        .map((ds) => ({
          MaDatSan: ds.MaDatSan,
          MaSan: ds.MaSan,          // 🔹 thêm dòng này
          MaKH: ds.MaKH,
          MaNV: ds.MaNV,
          NgayLap: ds.NgayLap,
          GioVao: ds.GioVao,
          GioRa: ds.GioRa,
          TongGio: ds.TongGio,
          TongTien: ds.TongTien,
          GiamGia: ds.GiamGia,
          TongTienThuc: ds.TongTienThuc,
          GhiChu: ds.GhiChu,
          TrangThai: ds.TrangThai,
          LoaiDat: ds.LoaiDat,
          PaymentScreenshot: ds.PaymentScreenshot,
          // 🔹 cần thêm dòng sau
          KhachHang: ds.KhachHang,
        }));

      return {
        MaSan: san.MaSan,
        TenSan: san.TenSan,
        LoaiSan: san.LoaiSan,
        GiaThueTruoc16: san.GiaThueTruoc16,
        GiaThueSau16: san.GiaThueSau16,
        TrangThai: san.TrangThai,
        bookedSlots,
      };
    });

    // 4️⃣ Trả về JSON cho frontend
    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách sân:", err);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sân",
      error: err.message,
    });
  }
}
