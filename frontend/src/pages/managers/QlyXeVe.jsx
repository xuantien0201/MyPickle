import "../../css/QlyXeVe.css";
import { Sidebar } from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { ThemXeVe } from "./ThemXeVe";
import { SuaXeVe } from "./SuaXeVe";
import { useNavigate } from "react-router-dom";

export function QlyXeVe() {
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [addingId, setAddingId] = useState(null);
  const [customer, setCustomer] = useState({
    ten: "",
    sdt: "",
    soVe: "",
  });

  const fetchXeVe = async () => {
    try {
      // 1️⃣ Lấy danh sách sự kiện
      let url = `http://localhost:3000/api/admin/xeve/sukien`;
      const params = new URLSearchParams();

      if (keyword) params.append("keyword", keyword);
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      if (params.toString()) url += `?${params.toString()}`;

      const [resSuKien, resCount] = await Promise.all([
        fetch(url),
        fetch("http://localhost:3000/api/admin/xeve/datve/count"),
      ]);

      const dataSuKien = await resSuKien.json();
      const dataCount = await resCount.json();

      // 2️⃣ Gộp dữ liệu: thêm cột DaDat = tổng slot đã đặt
      const merged = dataSuKien.map((sk) => {
        const found = dataCount.find((d) => d.MaXeVe === sk.MaXeVe);
        return {
          ...sk,
          DaDat: found ? found.TongSlot : 0,
        };
      });

      setData(merged);
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu xé vé:", err);
    }
  };

  useEffect(() => {
    fetchXeVe();
  }, [keyword, from]);

  const handleToggleStatus = async (item) => {
    const current = item.TrangThai?.trim();
    if (current === "Mở") {
      const ok = window.confirm("Bạn có chắc chắn muốn KHÓA sự kiện này?");
      if (!ok) return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/xeve/sukien/${item.MaXeVe}/status`,
        { method: "PUT" }
      );
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchXeVe();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (e) {
      console.error("❌ Lỗi:", e);
    }
  };

  const handleDelete = async (MaXeVe) => {
    const ok = window.confirm(
      "⚠️ Bạn có chắc chắn muốn xóa sự kiện này không?"
    );
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/xeve/${MaXeVe}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        alert("✅ Xóa sự kiện thành công!");
        fetchXeVe();
      } else {
        alert(`❌ Lỗi: ${result.message || "Không thể xóa sự kiện"}`);
      }
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("❌ Lỗi kết nối tới server.");
    }
  };

  const handleAddCustomerClick = (MaXeVe) => {
    if (addingId === MaXeVe) {
      setAddingId(null);
    } else {
      setAddingId(MaXeVe);
      setCustomer({ ten: "", sdt: "", soVe: "" });
    }
  };

  // ✅ Thanh toán
  const handleThanhToan = (item) => {
    if (!customer.ten || !customer.sdt || !customer.soVe) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const bookingData = {
      ten: customer.ten,
      sdt: customer.sdt,
      soVe: customer.soVe,
      tenSuKien: item.TenSuKien,
      ngayToChuc: item.NgayToChuc,
      thoiGianBatDau: item.ThoiGianBatDau,
      thoiGianKetThuc: item.ThoiGianKetThuc,
      danhSachSan: item.DanhSachSan,
      maXeVe: item.MaXeVe,
    };

    console.log("📦 Dữ liệu truyền sang TTXeVe:", bookingData);

    // ✅ Dẫn tới trang thanh toán + truyền dữ liệu qua state
    navigate("/ttxeve", { state: { bookingData, role: "quanly" } });

    setAddingId(null);
  };

  return (
    <div className="qlyxeve-container">
      <Sidebar />

      <div className="qlyxeve-content">
        <h3>Danh sách sự kiện xé vé</h3>
        <div className="top-bar">
          <div className="filter-left">
            <input
              type="text"
              placeholder="Tìm kiếm tên sự kiện..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="xeve-input search-input"
            />
            <input
              type="date"
              value={from}
              onChange={(e) => {
                const selectedDate = e.target.value; // ngày người dùng chọn
                const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd hiện tại
                // Nếu ngày chọn nhỏ hơn hôm nay, mặc định lấy hôm nay
                setFrom(selectedDate >= today ? selectedDate : today);
              }}
              className="xeve-input date-input"
              title="Từ ngày"
            />
          </div>

          <div className="add-right">
            <button className="btn btn-add" onClick={() => setShowModal(true)}>
              Thêm sự kiện
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tên sự kiện</th>
              <th>Ngày tổ chức</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Sân tham gia</th>
              <th>Số người tối đa</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Không có sự kiện nào
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <>
                  <tr key={item.MaXeVe}>
                    <td>{item.TenSuKien}</td>
                    <td>{item.NgayToChuc?.split("T")[0]}</td>
                    <td>{item.ThoiGianBatDau?.slice(0, 5)}</td>
                    <td>{item.ThoiGianKetThuc?.slice(0, 5)}</td>
                    <td>{item.DanhSachSan}</td>
                    <td>
                      {item.DaDat}/{item.SoLuongToiDa}
                    </td>

                    <td>
                      <button
                        className={`status-btn ${
                          item.TrangThai === "Mở" ? "btn-danger" : "btn-success"
                        }`}
                        onClick={() => handleToggleStatus(item)}
                      >
                        {item.TrangThai === "Mở"
                          ? "Đóng sự kiện"
                          : "Mở sự kiện"}
                      </button>
                    </td>

                    <td className="action-buttons">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAddCustomerClick(item.MaXeVe)}
                      >
                        {addingId === item.MaXeVe ? "Ẩn form" : "Thêm người"}
                      </button>

                      <button
                        className="btn btn-warning"
                        onClick={() => setEditingId(item.MaXeVe)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item.MaXeVe)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>

                  {addingId === item.MaXeVe && (
                    <tr className="add-row">
                      <td colSpan="8">
                        <div className="add-customer-form">
                          <p className="intro">Thêm khách hàng</p>
                          <input
                            type="text"
                            className="xeve-input"
                            placeholder="Tên khách hàng"
                            value={customer.ten}
                            onChange={(e) =>
                              setCustomer((prev) => ({
                                ...prev,
                                ten: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            placeholder="Số điện thoại"
                            className="sdt-input xeve-input"
                            value={customer.sdt}
                            onChange={(e) =>
                              setCustomer((prev) => ({
                                ...prev,
                                sdt: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="number"
                            className="xeve-input"
                            placeholder="Số vé muốn đặt"
                            value={customer.soVe}
                            onChange={(e) =>
                              setCustomer((prev) => ({
                                ...prev,
                                soVe: e.target.value,
                              }))
                            }
                            min="1"
                          />
                          <button
                            className="btn btn-pay"
                            disabled={
                              !customer.ten || !customer.sdt || !customer.soVe
                            }
                            onClick={() => handleThanhToan(item)}
                          >
                            💳 Thanh toán
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa giữ nguyên */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <ThemXeVe onClose={() => setShowModal(false)} onAdded={fetchXeVe} />
          </div>
        </div>
      )}

      {editingId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setEditingId(null)}>
              ✖
            </button>
            <SuaXeVe
              MaXeVe={editingId}
              onClose={() => setEditingId(null)}
              onUpdated={() => {
                setEditingId(null);
                fetchXeVe();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
