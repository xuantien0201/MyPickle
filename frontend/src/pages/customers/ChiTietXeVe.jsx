import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../css/ChiTietXeVe.css";

export function ChiTietXeVe() {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;
  const initialServices = location.state?.services || [];
  const [tenKH, setTenKH] = useState("");
  const [sdtKH, setSdtKH] = useState("");

  if (!event) {
    return (
      <div className="ctxeve-container">
        <h2>Không có dữ liệu sự kiện!</h2>
        <button className="btn-register" onClick={() => navigate("/datxeve")}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  

  const totalSlots = event.SoLuongToiDa || 0;
  const bookedSlots = event.TongSoNguoi || 0;
  const remainingSlots = totalSlots - bookedSlots;

  const [quantity, setQuantity] = useState(1);
  const [services, setServices] = useState(initialServices); // Services đã chọn
  const [note, setNote] = useState("");
  // Lấy role và MaKH từ location.state (truyền từ DatXeVe)
  const role = location.state?.role || "khach"; // fallback = "khach"
  const MaKH = location.state?.MaKH || "KH002"; // fallback = KH002

  // console.log("Role la: " + role);
  

  const price = Number(event.GiaVe || 100000);
  const total = price * quantity;

  const handleIncrease = () => {
    if (quantity < remainingSlots) setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddServices = () => {
    navigate("/dichvu", { state: { event, services } });
  };

  // Tính tổng tiền dịch vụ
  const totalServicePrice = services.reduce(
    (sum, s) => sum + s.price * s.qty,
    0
  );

  useEffect(() => {
    if (!MaKH) return;

    const fetchKhachHang = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/khachhang/idsearch?MaKH=${MaKH}`
        );
        const data = await res.json();

        if (res.ok) {
          setTenKH(data.TenKh);
          setSdtKH(data.SDT);
        } else {
          console.warn("Không tìm thấy khách hàng, dùng mặc định");
          setTenKH("Khách hàng");
          setSdtKH("0123456789");
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin khách:", err);
        setTenKH("Khách hàng");
        setSdtKH("0123456789");
      }
    };

    fetchKhachHang();
  }, [MaKH]);

  return (
    <div className="ctxeve-container">
      <h1>Chi tiết sự kiện xé vé</h1>

      <div className="event-info">
        <p>
          <span className="highlight">Mã sự kiện:</span> #{event.MaXeVe}
        </p>
        <p>
          <span className="highlight">Tên sự kiện:</span> {event.TenSuKien}
        </p>
        <p>
          <span className="highlight">Ngày tổ chức:</span>{" "}
          {new Date(event.NgayToChuc).toLocaleDateString("vi-VN")}
        </p>
        <p>
          <span className="highlight">Thời gian:</span>{" "}
          {event.ThoiGianBatDau?.slice(0, 5)} -{" "}
          {event.ThoiGianKetThuc?.slice(0, 5)}
        </p>
        <p>
          <span className="highlight">Sân tham gia:</span>{" "}
          {event.DanhSachSan || "Chưa có"}
        </p>
        <p>
          <span className="highlight">Giá vé:</span>{" "}
          {price.toLocaleString("vi-VN")}đ / người
        </p>
        <p>
          <span className="highlight">Số lượng còn lại:</span> {remainingSlots}{" "}
          / {totalSlots}
        </p>
      </div>

      <div className="quantity">
        <label>Số lượng vé muốn đặt</label>
        <div className="quantity-control">
          <button onClick={handleDecrease}>-</button>
          <input
            type="number"
            value={quantity}
            min="1"
            max={remainingSlots}
            readOnly
          />
          <button onClick={handleIncrease}>+</button>
        </div>
        <div className="total">
          Tổng tiền vé: {total.toLocaleString("vi-VN")}đ
        </div>
      </div>

      <div className="services">
        <button className="add" onClick={handleAddServices}>
          Thêm dịch vụ
        </button>
        {services.length > 0 && (
          <div className="selected-services">
            <h4>Dịch vụ đã chọn:</h4>
            <ul>
              {services.map((s, i) => (
                <li key={i}>
                  {s.name} x{s.qty} = {(s.price * s.qty).toLocaleString()}đ
                </li>
              ))}
            </ul>
            <div className="total-services">
              Tổng tiền dịch vụ: {totalServicePrice.toLocaleString()}đ
            </div>
          </div>
        )}
      </div>

      <div className="note">
        <label htmlFor="note">Ghi chú</label>
        <textarea
          id="note"
          rows="3"
          placeholder="Nhập ghi chú của bạn..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>

      <button
        className="btn-register"
        onClick={() =>
          navigate("/ttxeve", {
            state: {
              bookingData: {
                ten: tenKH,
                sdt: sdtKH,
                soVe: quantity,
                tenSuKien: event.TenSuKien,
                ngayToChuc: event.NgayToChuc,
                danhSachSan: event.DanhSachSan,
                thoiGianBatDau: event.ThoiGianBatDau,
                thoiGianKetThuc: event.ThoiGianKetThuc,
                maXeVe: event.MaXeVe,
                services,
                note,
                role,
                MaKH,
              },
            },
          })
        }
      >
        XÁC NHẬN ĐẶT VÉ
      </button>
    </div>
  );
}
