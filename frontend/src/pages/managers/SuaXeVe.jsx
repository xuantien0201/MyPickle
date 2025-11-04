import "../../css/ThemXeVe.css";
import { useState, useEffect } from "react";

export function SuaXeVe({ MaXeVe, onClose, onUpdated }) {
  const [tenSuKien, setTenSuKien] = useState("");
  const [ngayToChuc, setNgayToChuc] = useState("");
  const [gioBatDau, setGioBatDau] = useState("");
  const [gioKetThuc, setGioKetThuc] = useState("");
  const [sanChon, setSanChon] = useState([]);
  const [soNguoiToiDa, setSoNguoiToiDa] = useState(32);
  const [moTa, setMoTa] = useState("");
  const [trangThai, setTrangThai] = useState("Mở");
  const [isLoading, setIsLoading] = useState(false);

  // 🧠 Load dữ liệu khi có MaXeVe
  useEffect(() => {
    if (!MaXeVe) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/admin/xeve/sukien/getXeVeById/${MaXeVe}`
        );
        if (!res.ok) throw new Error("Không thể tải dữ liệu sự kiện");

        const data = await res.json();
        console.log("📥 Dữ liệu sự kiện:", data);

        setTenSuKien(data.TenSuKien || "");
        setNgayToChuc(data.NgayToChuc?.split("T")[0] || "");
        setGioBatDau(data.ThoiGianBatDau?.slice(0, 5) || "");
        setGioKetThuc(data.ThoiGianKetThuc?.slice(0, 5) || "");
        setSanChon(
          data.DanhSachSan
            ? data.DanhSachSan.split(",").map((s) => s.trim()) // loại bỏ khoảng trắng
            : []
        );

        setSoNguoiToiDa(data.SoLuongToiDa || 32);
        setMoTa(data.GhiChu || "");
        setTrangThai(data.TrangThai || "Mở");
      } catch (err) {
        console.error("❌ Lỗi khi load dữ liệu:", err);
        alert("Không thể tải thông tin sự kiện!");
      }
    };

    fetchData();
  }, [MaXeVe]);

  // ✅ Chọn/bỏ chọn sân
  const handleCheckSan = (value) => {
    setSanChon((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // 💾 Cập nhật sự kiện
  const capNhatSuKien = async () => {
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
      GhiChu: moTa.trim(),
      TrangThai: trangThai,
    };

    console.log("📤 Dữ liệu gửi cập nhật:", payload);

    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:3000/api/admin/xeve/sukien/${MaXeVe}`, // ✅ Đúng URL
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert("✅ Cập nhật sự kiện thành công!");
        if (onUpdated) onUpdated();
        if (onClose) onClose();
      } else {
        alert(`❌ Lỗi: ${result.message || "Không thể cập nhật sự kiện"}`);
      }
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật sự kiện:", err);
      alert("Không thể kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="themxeve-header">Sửa sự kiện Xé Vé #{MaXeVe}</header>

      <div className="container">
        {/* Nhập thông tin */}
        <div className="input-section">
          <div className="form-group ten">
            <label>Tên sự kiện:</label>
            <input
              type="text"
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
          <label>Chọn sân tham gia:</label>
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
          <label>Trạng thái:</label>
          <select
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
          >
            <option value="Mở">Mở</option>
            <option value="Khóa">Khóa</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mô tả sự kiện:</label>
          <textarea
            rows="3"
            placeholder="Nhập mô tả chi tiết..."
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
          ></textarea>
        </div>

        {/* Nút hành động */}
        <div className="action-area">
          <button
            className="btn btn-primary"
            onClick={capNhatSuKien}
            disabled={isLoading}
          >
            {isLoading ? "Đang cập nhật..." : "Cập nhật sự kiện"}
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
