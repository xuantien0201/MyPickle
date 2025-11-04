import { db } from "../../../config/db.js";

/**
 * API đặt sân tháng (phiên bản gộp bảng mới)
 * Nhận dữ liệu:
 * {
 *   MaSan: ["S2","S3"],
 *   MaKH: "KH001",
 *   MaNV: "NV001",
 *   GioVao: "18:00",
 *   GioRa: "21:00",
 *   TongGio: 3,
 *   TongTien: 900000,
 *   GiamGia: 0,
 *   TongTienThuc: 900000,
 *   GhiChu: "Nguyễn Văn A",
 *   LoaiDat: "Đặt sân tháng",
 *   Thang: 11,
 *   Nam: 2025,
 *   ThuChon: [3,5],
 *   NgayChon: [4,18,25],
 *   NgayDat: ["2025-11-04","2025-11-06",...],
 *   LoaiThanhToan: "50%" hoặc "100%"
 * }
 */

export async function postDatSanThang(req, res) {
  try {
    const {
      MaSan = [],
      MaKH,
      MaNV,
      GioVao,
      GioRa,
      TongGio,
      TongTien,
      GiamGia = 0,
      TongTienThuc,
      GhiChu = "",
      LoaiDat = "Đặt sân tháng",
      Thang,
      Nam,
      ThuChon = [],
      NgayChon = [],
      NgayDat = [],
      LoaiThanhToan = "100%",
    } = req.body;

    // 🧩 Kiểm tra dữ liệu bắt buộc
    if (!MaSan.length || !MaKH || !GioVao || !GioRa || !Thang || !Nam) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    const gioVaoFormat = GioVao.length === 8 ? GioVao : `${GioVao}:00`;
    const gioRaFormat = GioRa.length === 8 ? GioRa : `${GioRa}:00`;

    // 🗓️ Tạo danh sách ngày đặt
    let danhSachNgay = [];

    if (LoaiDat === "Đặt sân tháng" && NgayDat.length > 0) {
      danhSachNgay = NgayDat;
    } else if (LoaiDat === "Đặt sân theo thứ" && ThuChon.length > 0) {
      const soNgayTrongThang = new Date(Nam, Thang, 0).getDate();
      for (let d = 1; d <= soNgayTrongThang; d++) {
        const dateObj = new Date(Nam, Thang - 1, d);
        const thu = dateObj.getDay() === 0 ? 8 : dateObj.getDay() + 1; // CN=8 để tương thích
        if (ThuChon.includes(thu)) {
          danhSachNgay.push(`${Nam}-${String(Thang).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
        }
      }
    } else if (LoaiDat === "Đặt sân theo ngày" && NgayChon.length > 0) {
      danhSachNgay = NgayChon.map(
        (d) => `${Nam}-${String(Thang).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      );
    } else {
      return res.status(400).json({ message: "Không có ngày nào để đặt sân!" });
    }

    if (danhSachNgay.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy ngày hợp lệ!" });
    }

    // 🧾 Tạo mã đặt sân tháng
    const MaDatSanThang = "DST" + Date.now();

    // 💰 Tính tiền đã thanh toán và trạng thái
    let SoTienDaThanhToan = 0;
    let TrangThaiThanhToan = "Chưa thanh toán";

    if (LoaiThanhToan === "50%") {
      SoTienDaThanhToan = (TongTienThuc || TongTien) * 0.5;
      TrangThaiThanhToan = "Đã cọc";
    } else if (LoaiThanhToan === "100%") {
      SoTienDaThanhToan = TongTienThuc || TongTien;
      TrangThaiThanhToan = "Đã thanh toán";
    }

    // 🗓️ Ngày bắt đầu và kết thúc tháng
    const ngayBatDau = danhSachNgay[0];
    const ngayKetThuc = danhSachNgay[danhSachNgay.length - 1];

    // 💾 Lưu vào bảng tbl_datsanthang
    const sql = `
      INSERT INTO tbl_datsanthang (
        MaDatSanThang, MaKH, MaNV, DanhSachSan, NgayBatDau, NgayKetThuc,
        DanhSachNgay, GioBatDau, GioKetThuc, TongGio, TongTien, GiamGia,
        TongTienThuc, LoaiThanhToan, SoTienDaThanhToan, TrangThaiThanhToan,
        GhiChu
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(sql, [
      MaDatSanThang,
      MaKH,
      MaNV,
      Array.isArray(MaSan) ? MaSan.join(",") : MaSan,
      ngayBatDau,
      ngayKetThuc,
      JSON.stringify(danhSachNgay),
      gioVaoFormat,
      gioRaFormat,
      TongGio || 1,
      TongTien || 0,
      GiamGia || 0,
      TongTienThuc || TongTien || 0,
      LoaiThanhToan,
      SoTienDaThanhToan,
      TrangThaiThanhToan,
      GhiChu,
    ]);

    // ✅ Phản hồi
    res.json({
      message: "✅ Đặt sân tháng thành công!",
      MaDatSanThang,
      TongTienThuc: TongTienThuc || TongTien,
      SoTienDaThanhToan,
      TrangThaiThanhToan,
      LoaiThanhToan,
      SoNgay: danhSachNgay.length,
      San: MaSan,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đặt sân tháng:", err);
    res.status(500).json({
      message: "Lỗi khi đặt sân tháng",
      error: err.message,
    });
  }
}
