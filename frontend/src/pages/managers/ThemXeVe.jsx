import "../../css/ThemXeVe.css";
import { useState } from "react";

export function ThemXeVe({ onClose, onAdded }) {
  const [tenSuKien, setTenSuKien] = useState("");
  const [ngayToChuc, setNgayToChuc] = useState("");
  const [gioBatDau, setGioBatDau] = useState("");
  const [gioKetThuc, setGioKetThuc] = useState("");
  const [sanChon, setSanChon] = useState([]);
  const [soNguoiToiDa, setSoNguoiToiDa] = useState(32);
  const [moTa, setMoTa] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Chọn/bỏ chọn sân
  const handleCheckSan = (value) => {
    setSanChon((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // ✅ Hàm gửi API tạo sự kiện
  const taoSuKien = async () => {
    if (
      !tenSuKien.trim() ||
      !ngayToChuc ||
      !gioBatDau ||
      !gioKetThuc ||
      sanChon.length === 0 ||
      !soNguoiToiDa
    ) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin (trừ mô tả có thể để trống)!");
      return;
    }

    const payload = {
      TenSuKien: tenSuKien.trim(),
      NgayToChuc: ngayToChuc,
      ThoiGianBatDau: gioBatDau,
      ThoiGianKetThuc: gioKetThuc,
      DanhSachSan: sanChon.join(","),
      SoLuongToiDa: parseInt(soNguoiToiDa),
      MaNV: "NV001",
      GhiChu: moTa.trim(), // 👈 map đúng tên với DB
      TrangThai: "Mở",
    };

    console.log("🎯 Dữ liệu gửi đi:", payload);

    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:3000/api/admin/xeve/sukien/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Thêm sự kiện thành công!");
        if (onAdded) onAdded();
        if (onClose) onClose();
        else window.location.href = "/qlyxeve";
      } else {
        alert(`❌ Lỗi: ${result.message || "Không thể tạo sự kiện"}`);
        console.error("Chi tiết lỗi:", result);
      }
    } catch (err) {
      console.error("❌ Lỗi khi gọi API:", err);
      alert("❌ Không thể kết nối tới máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="themxeve-header">Thêm sự kiện Xé Vé</header>

      <div className="container">
        {/* Nhập thông tin */}
        <div className="input-section">
          <div className="form-group ten">
            <label>Tên sự kiện:</label>
            <input
              type="text"
              placeholder="VD: Giải Pickleball Mở Rộng"
              value={tenSuKien}
              onChange={(e) => setTenSuKien(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group small">
              <label>Ngày tổ chức:</label>
              <input
                type="date"
                value={ngayToChuc}
                onChange={(e) => setNgayToChuc(e.target.value)}
              />
            </div>

            <div className="form-group small">
              <label>Giờ bắt đầu:</label>
              <input
                type="time"
                value={gioBatDau}
                onChange={(e) => setGioBatDau(e.target.value)}
              />
            </div>

            <div className="form-group small">
              <label>Giờ kết thúc:</label>
              <input
                type="time"
                value={gioKetThuc}
                onChange={(e) => setGioKetThuc(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Chọn sân */}
        <div className="form-group">
          <label>Chọn sân tham gia (có thể chọn nhiều):</label>
          <div className="san-grid">
            {[...Array(16)].map((_, i) => {
              const value = `S${i + 1}`;
              return (
                <label key={value}>
                  <input
                    type="checkbox"
                    checked={sanChon.includes(value)}
                    onChange={() => handleCheckSan(value)}
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </div>

        {/* Số người và mô tả */}
        <div className="form-group">
          <label>Số người tối đa:</label>
          <input
            type="number"
            min="1"
            value={soNguoiToiDa}
            onChange={(e) => setSoNguoiToiDa(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Mô tả sự kiện:</label>
          <textarea
            rows="3"
            placeholder="Nhập mô tả chi tiết về sự kiện..."
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
          ></textarea>
        </div>

        {/* Nút hành động */}
        <div className="action-area">
          <button
            className="btn btn-primary"
            onClick={taoSuKien}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Tạo sự kiện"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() =>
              onClose ? onClose() : (window.location.href = "/qlyxeve")
            }
          >
            Quay lại
          </button>
        </div>
      </div>
    </>
  );
}
