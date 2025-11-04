import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import "../../css/XacNhanDatSan.css";
import mbBank from "../../images/mb-bank.jpg";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios"; // đảm bảo có import axios

export function XacNhanDatSan() {
  const navigate = useNavigate();
  const [danhSachSan, setDanhSachSan] = useState([]);
  const [tenKhach, setTenKhach] = useState("");
  const [sdt, setSdt] = useState("");
  const [selectedKhachHangId, setSelectedKhachHangId] = useState("");
  const [searchTen, setSearchTen] = useState([]);
  const [searchSdt, setSearchSdt] = useState([]);
  const [hienThiMaGiamGia, setHienThiMaGiamGia] = useState(false);
  const [dichVuList, setDichVuList] = useState([]);
  const [khachHangData, setKhachHangData] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  useEffect(() => {
    if (location.state?.services) {
      const updatedList = location.state.services.map((s) => ({
        ten: s.name, // tên dịch vụ
        gia: s.price, // giá dịch vụ
        qty: s.qty || 1,
      }));
      setDichVuList(updatedList);
    } else {
      // Nếu mở trực tiếp /xacnhansan từ đầu
      const tmp = JSON.parse(localStorage.getItem("bookingServiceTmp"));
      if (tmp?.dichVuList) setDichVuList(tmp.dichVuList);
    }
  }, [location.state]);

  // 🆕 cho đặt sân tháng
  const [isDatSanThang, setIsDatSanThang] = useState(false);
  const [thongTinThang, setThongTinThang] = useState({});
  const [loaiThanhToan, setLoaiThanhToan] = useState("100%");

  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (!data) return;
    const payload = JSON.parse(data);

    // Nếu payload có MaKH và role là "khachhang" → gọi API
    if (payload.MaKH && payload.Role === "khachhang") {
      axios
        .get(`/api/khachhang/idsearch?MaKH=${payload.MaKH}`)
        .then((res) => {
          const kh = res.data;
          // Cập nhật lại thông tin hiển thị
          setThongTinThang((prev) => ({
            ...prev,
            TenKH: kh.TenKh || kh.TenKH || kh.ten || kh.HoTen || "Không rõ",
            SDT: kh.SDT || kh.sdt || kh.SoDienThoai || "Không rõ",
            MaKH: payload.MaKH,
            ...payload,
          }));
        })
        .catch((err) => {
          console.error("❌ Lỗi lấy thông tin khách hàng:", err);
        });
    } else {
      // Nếu không có khách hàng (NV đặt hộ)
      setThongTinThang((prev) => ({
        ...prev,
        ...payload,
      }));
    }
  }, []);

  // const [tongTienSan, setTongTienSan] = useState(0);

  const [tongTienSan, setTongTienSan] = useState(0);
  const [giamGia, setGiamGia] = useState(0);
  const [tongTienThuc, setTongTienThuc] = useState(0);
  const [soTienThanhToan, setSoTienThanhToan] = useState(0);

  // 🆕 Lấy thông tin đăng nhập

  const storedUser =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(localStorage.getItem("khach")) ||
    {};

  const currentUser = {
    id: storedUser.id || storedUser.MaKH || null,
    maNV: storedUser.maNV || null,
    TenKh: storedUser.TenKh || storedUser.TenKH || storedUser.HoTen || "",
    SDT: storedUser.SDT || storedUser.sdt || storedUser.SoDienThoai || "",
    role: (
      storedUser.role ||
      storedUser.Role ||
      storedUser.RoleName ||
      "khachhang"
    ).toLowerCase(),
  };

  const userRole = currentUser.role; // luôn là 'khachhang' hoặc 'nhanvien'
  const userId = currentUser?.maNV || currentUser?.id || null;

  useEffect(() => {
    console.log("🔎 Người dùng hiện tại:", currentUser);
  }, []);

  console.log("userRole:", userRole, "maNguoiDung:", userId);

  const API_BASE = "http://localhost:3000/api/admin/khachhang";
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (userRole === "khachhang" && currentUser?.id) {
      // ✅ Lấy thông tin khách hàng trực tiếp từ localStorage (đã có sẵn)
      setTenKhach(currentUser.TenKh);
      setSdt(currentUser.SDT);
      setSelectedKhachHangId(currentUser.id);
      console.log("👤 Thông tin khách hàng đăng nhập:", currentUser);
    }
  }, []);

  useEffect(() => {
    if (!location.state?.services) {
      // Nếu không có dịch vụ từ location.state, reset
      setDichVuList([]);
    } else {
      // Nếu có dịch vụ truyền từ /dichvu, dùng luôn
      setDichVuList(location.state.services);
    }
  }, [location.state]);

  const openingHour = 5;
  const courts = [
    "Sân 1",
    "Sân 2",
    "Sân 3",
    "Sân 4",
    "Sân 5",
    "Sân 6",
    "Sân 7",
    "Sân 8",
    "Sân 9",
    "Sân 10",
    "Sân 11",
    "Sân 12",
    "Sân 13",
    "Sân 14",
    "Sân 15",
    "Sân TT",
  ];

  useEffect(() => {
    if (!thongTinThang?.MaSan || !thongTinThang?.NgayDat) return;

    let tongTien = 0;

    thongTinThang.MaSan.forEach((maSan) => {
      thongTinThang.NgayDat.forEach((ngay) => {
        const gioVao = thongTinThang.GioVao;
        const gioRa = thongTinThang.GioRa;
        const normalizedCourtName =
          maSan === "TT" || maSan === "STT" ? "Sân TT" : maSan;

        const tien =
          Number(tinhTienTheoGio(normalizedCourtName, gioVao, gioRa)) || 0;
        tongTien += tien;
      });
    });

    // --- Tính toán các giá trị ---
    let giam = 0;
    let tongSauGiam = tongTien;
    let soTienThanhToan = tongTien;

    if (loaiThanhToan === "100%") {
      giam = tongTien * 0.1;
      tongSauGiam = tongTien - giam; // ✅ Tổng sau giảm 10%
      soTienThanhToan = tongSauGiam; // ✅ Thanh toán toàn bộ
    } else if (loaiThanhToan === "50%") {
      tongSauGiam = tongTien; // ✅ Không giảm
      soTienThanhToan = tongTien * 0.5; // ✅ Cọc 50%
    }

    // --- Gán giá trị chính xác ---
    setTongTienSan(tongTien);
    setGiamGia(giam);
    setTongTienThuc(tongSauGiam); // ✅ Tổng tiền thực chính là tongSauGiam
    setSoTienThanhToan(soTienThanhToan);

    console.log("💰 Tổng tiền:", tongTien);
    console.log("💸 Giảm giá:", giam);
    console.log("✅ Tổng thực tế sau giảm:", tongSauGiam); // ✅ tongTienThuc thực tế
    console.log("💵 Cần thanh toán:", soTienThanhToan);
  }, [thongTinThang, loaiThanhToan]);

  // ===================== HÀM TÍNH GIÁ =====================

  const getSlotPriceByHour = (courtName, hour) => {
    // hour: số nguyên 0-23
    const isAfter16h = hour >= 16;
    if (courtName === "Sân TT") return isAfter16h ? 200000 : 150000;
    return isAfter16h ? 160000 : 100000;
  };

  const tinhTienTheoGio = (courtName, gioVao, gioRa) => {
    const [h1, m1] = gioVao.split(":").map(Number);
    const [h2, m2] = gioRa.split(":").map(Number);
    let total = 0;
    let currentH = h1;
    while (currentH < h2 || (currentH === h2 && m2 > 0)) {
      total += getSlotPriceByHour(courtName, currentH);
      currentH += 1;
    }
    return total;
  };

  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (data) {
      const parsed = JSON.parse(data);
      setDanhSachSan(parsed.MaSan || []);
      setTenKhach("");
      setSdt("");
      setSelectedKhachHangId(parsed.MaKH || null);

      // 🔹 Nếu có mã khách hàng => gọi API để lấy thông tin chi tiết
      if (parsed.MaKH) {
        fetchKhachHangInfo(parsed.MaKH);
      }
    }
  }, []);

  const fetchKhachHangInfo = async (maKH) => {
    try {
      const res = await axios.get(`/api/admin/khachhang/idsearch?MaKH=${maKH}`);
      const kh = res.data;
      setTenKhach(kh.TenKh || kh.ten || kh.HoTen || "");
      setSdt(kh.SDT || kh.sdt || kh.SoDienThoai || "");
    } catch (err) {
      console.error("❌ Lỗi lấy thông tin khách hàng:", err);
    }
  };

  // 🧩 Load dữ liệu đặt sân
  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (!data) {
      alert("Không có dữ liệu đặt sân. Vui lòng quay lại chọn sân!");
      window.location.href = "/datsan";
      return;
    }

    const parsed = JSON.parse(data);
    console.log("📦 Dữ liệu đọc từ localStorage:", parsed);

    // ✅ Ưu tiên nhận diện Đặt sân tháng
    const isThang =
      parsed?.LoaiDat === "Đặt sân tháng" ||
      parsed?.bookingType === "Đặt sân tháng" ||
      parsed?.type === "Đặt sân tháng" ||
      (Array.isArray(parsed?.NgayDat) && parsed?.Thang && parsed?.Nam);

    if (isThang) {
      console.log("✅ Phát hiện loại đặt sân tháng!");
      setIsDatSanThang(true);
      setThongTinThang(parsed);
      return;
    }

    // ⚠️ Nếu không phải sân tháng → xử lý sân ngày như cũ
    console.log("⚠️ Không phát hiện đặt sân tháng, xử lý như sân ngày");

    const grouped = {};
    parsed.selectedSlots?.forEach((s) => {
      const courtName = courts[s.courtIndex];
      const hour = openingHour + s.slotIndex;
      const date = parsed.date || new Date().toLocaleDateString("vi-VN");
      if (!grouped[courtName]) grouped[courtName] = {};
      if (!grouped[courtName][date]) grouped[courtName][date] = [];
      grouped[courtName][date].push(hour);
    });

    const merged = [];
    Object.keys(grouped).forEach((courtName) => {
      Object.keys(grouped[courtName]).forEach((date) => {
        const hours = grouped[courtName][date].sort((a, b) => a - b);
        let start = hours[0],
          end = hours[0];
        for (let i = 1; i <= hours.length; i++) {
          if (hours[i] === end + 1) {
            end = hours[i];
          } else {
            const gioVaoStr = `${String(start).padStart(2, "0")}:00`;
            const gioRaStr = `${String(end + 1).padStart(2, "0")}:00`;
            const normalizedCourtName =
              courtName === "TT" || courtName === "STT" ? "Sân TT" : courtName;
            // const gia = tinhTienTheoGio(
            //   normalizedCourtName,
            //   gioVaoStr,
            //   gioRaStr
            // );
            // merged.push({
            //   ten: normalizedCourtName,
            //   loai: "Sân tiêu chuẩn",
            //   ngay: date,
            //   batDau: gioVaoStr,
            //   ketThuc: gioRaStr,
            //   gia,
            //   soGio: tinhSoGio(gioVaoStr, gioRaStr),
            // });
            merged.push({
              ten: normalizedCourtName,
              loai:
                normalizedCourtName === "Sân TT"
                  ? "Sân đặc biệt"
                  : "Sân tiêu chuẩn",
              ngay: date,
              batDau: gioVaoStr,
              ketThuc: gioRaStr,
              gia: tinhTienTheoGio(normalizedCourtName, gioVaoStr, gioRaStr),
              soGio: tinhSoGio(gioVaoStr, gioRaStr),
            });
            start = hours[i];
            end = hours[i];
          }
        }
      });
    });

    console.log("📋 Danh sách sân lẻ được xử lý:", merged);
    setDanhSachSan(merged);
  }, []);

  // 🧭 Theo dõi trạng thái
  useEffect(() => {
    console.log("🔍 Trạng thái isDatSanThang:", isDatSanThang);
    console.log("🔍 Thông tin tháng:", thongTinThang);
  }, [isDatSanThang, thongTinThang]);

  const tinhSoGio = (bd, kt) => {
    const [h1, m1] = bd.split(":").map(Number);
    const [h2, m2] = kt.split(":").map(Number);
    return h2 + m2 / 60 - (h1 + m1 / 60);
  };

  const tongTien = danhSachSan.reduce(
    (sum, san) => sum + Number(san.gia || 0),
    0
  );

  // ===================== API KHÁCH HÀNG =====================
  const timKiemKhachHang = async (tuKhoa, type) => {
    if (!tuKhoa.trim())
      return type === "ten" ? setSearchTen([]) : setSearchSdt([]);
    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(tuKhoa)}`
      );
      if (!res.ok) throw new Error("Lỗi khi gọi API tìm kiếm");
      const data = await res.json();
      type === "ten" ? setSearchTen(data) : setSearchSdt(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(
      () => timKiemKhachHang(tenKhach, "ten"),
      400
    );
  }, [tenKhach]);
  useEffect(() => {
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => timKiemKhachHang(sdt, "sdt"), 400);
  }, [sdt]);

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const chonKhach = (ten, sdt, id) => {
    setTenKhach(ten);
    setSdt(sdt);
    setSelectedKhachHangId(id);
    setSearchTen([]);
    setSearchSdt([]);
    setHienThiMaGiamGia(true);
    console.log("👤 Chọn khách:", { ten, sdt, id });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setSdt(value);
    if (value && !/^\d{10}$/.test(value)) {
      setErrorMsg("⚠️ Số điện thoại không hợp lệ (phải đủ 10 số)");
    } else {
      setErrorMsg("");
    }
  };

  const themKhachHang = async () => {
    if (!tenKhach.trim() || !sdt.trim()) {
      alert("Vui lòng nhập đầy đủ họ tên và số điện thoại!");
      return;
    }

    if (!/^\d{10}$/.test(sdt)) {
      alert("Số điện thoại không hợp lệ (10 số)!");
      return;
    }

    try {
      // 🔹 Tạo mã KH ngẫu nhiên (giống bên server)
      const randomNum = Math.floor(Math.random() * 900000 + 100000);
      const maKh = `KH${randomNum}`;

      // 🔹 Gọi API thêm khách hàng
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaKH: maKh,
          TenKh: tenKhach,
          SDT: sdt,
          DiaChi: "",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Lỗi thêm khách hàng!");

      // ✅ Thành công → cập nhật state, truyền lại mã KH mới
      alert("✅ Thêm khách hàng thành công!");

      // Lưu mã KH mới vừa tạo để dùng cho các bước sau
      setSelectedKhachHangId(result.insertedId || maKh);

      // Nếu muốn cập nhật lại danh sách gợi ý (tuỳ bạn)
      setSearchTen((prev) => [
        ...prev,
        { TenKh: tenKhach, SDT: sdt, id: result.insertedId || maKh },
      ]);
      setSearchSdt((prev) => [
        ...prev,
        { TenKh: tenKhach, SDT: sdt, id: result.insertedId || maKh },
      ]);

      console.log("✅ Đã thêm KH mới:", result.insertedId || maKh);
    } catch (err) {
      console.error(err);
      alert(err.message || "❌ Lỗi khi thêm khách hàng!");
    }
  };

  // ===================== XÁC NHẬN ĐẶT SÂN =====================
  const xacNhanDatSan = async (loaiDat) => {
    const data = localStorage.getItem("bookingData");
    if (!data) {
      alert("Không có dữ liệu đặt sân!");
      return;
    }

    const parsed = JSON.parse(data);
    console.log("🚀 Dữ liệu xác nhận đặt sân:", parsed);

    // ===============================
    // 🌟 Xử lý đặt sân tháng (CÓ ĐỦ DỮ LIỆU TIỀN)
    // ===============================
    if (loaiDat === "thang") {
      // 🔍 Ưu tiên lấy thông tin khách hàng từ 3 nguồn: parsed → thongTinThang → state
      const tenKHThang =
        parsed.TenKH ||
        parsed.TenKh ||
        thongTinThang?.TenKH ||
        thongTinThang?.TenKh ||
        tenKhach ||
        "";
      const sdtThang = parsed.SDT || thongTinThang?.SDT || sdt || "";

      // ✅ Nếu vẫn thiếu thì báo lỗi
      if (!tenKHThang?.trim() || !sdtThang?.trim()) {
        alert("Vui lòng nhập đầy đủ họ tên và SĐT cho sân tháng!");
        return;
      }

      // ✅ Kiểm tra ảnh thanh toán nếu là khách
      if (userRole === "khachhang" && !paymentScreenshot) {
        alert("⚠️ Vui lòng nộp ảnh thanh toán trước khi xác nhận!");
        return;
      }

      try {
        // 🧾 Lấy tổng tiền gốc từ dữ liệu
        const tongTien = Number(tongTienSan) || 0;

        // 💰 Xử lý giảm giá và tổng tiền thực
        let giamGia = "0";
        let tongTienThuc = tongTien;

        if (loaiThanhToan === "100%") {
          giamGia = "10%"; // ✅ Ghi rõ là 10%
          tongTienThuc = tongTien * 0.9; // ✅ Trừ 10% ra
        } else if (loaiThanhToan === "50%") {
          giamGia = "0"; // ❌ Không giảm
          tongTienThuc = tongTien; // ✅ Giữ nguyên
        }

        // 💵 Số tiền khách thanh toán (tùy loại)
        const soTienThanhToan =
          loaiThanhToan === "50%" ? tongTienThuc / 2 : tongTienThuc;

        // 🧩 Tạo dữ liệu gửi API
        const reqBody = {
          MaSan: parsed.MaSan,
          MaNV: currentUser?.maNV || null,
          MaKH: currentUser?.id || parsed.MaKH || null,
          Thang: parsed.Thang,
          Nam: parsed.Nam,
          TongTien: tongTien, // Tổng gốc
          GiamGia: giamGia, // ✅ Chuỗi "10%" hoặc "0"
          TongTienThuc: tongTienThuc, // ✅ Tổng sau giảm giá
          SoTienThanhToan: soTienThanhToan,
          LoaiThanhToan: loaiThanhToan,
          LoaiDat: "Đặt sân tháng",
          TenKH: tenKHThang,
          SDT: sdtThang,
          NgayDat: parsed.NgayDat,
          GioVao: parsed.GioVao,
          GioRa: parsed.GioRa,
          GhiChu: parsed.GhiChu || tenKHThang,
          TongGio: parsed.TongGio,
        };

        console.log("✅ Dữ liệu gửi API đặt sân tháng:", reqBody);

        // 🚀 Gửi API
        const res = await fetch("http://localhost:3000/api/admin/santhang/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Lỗi đặt sân tháng!");

        alert("✅ Đặt sân tháng thành công!");
        localStorage.removeItem("bookingData");
        window.location.href = "/";
      } catch (err) {
        console.error("❌ Lỗi đặt sân tháng:", err);
        alert(err.message);
      }
    }

    // ===============================
    // 🌟 Xử lý đặt sân ngày
    // ===============================
    else {
      try {
        // ✅ Lấy lại thông tin đăng nhập
        const storedUser =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(localStorage.getItem("khach")) ||
          {};

        const currentUser = {
          id: storedUser.id || storedUser.MaKH || null,
          maNV: storedUser.maNV || null,
          TenKh: storedUser.TenKh || storedUser.TenKH || storedUser.HoTen || "",
          SDT: storedUser.SDT || storedUser.sdt || storedUser.SoDienThoai || "",
          role: (
            storedUser.role ||
            storedUser.Role ||
            storedUser.RoleName ||
            "khachhang"
          ).toLowerCase(),
        };

        const userRole = currentUser.role; // luôn là 'khachhang' hoặc 'nhanvien'
        let maNhanVienThucTe = currentUser?.maNV || null;
        let maKhachHangThucTe = currentUser?.id || null;
        const maNguoiDung = currentUser?.id || currentUser?.MaKH || null;

        // ⚡ Nếu là khách hàng đăng nhập
        if (userRole === "khachhang") {
          if (!maNguoiDung) {
            alert("Không xác định được mã khách hàng!");
            return;
          }
          maKhachHangThucTe = currentUser?.id; // Lấy từ tài khoản khách hàng
          console.log("👤 Khách hàng tự đặt, Mã KH:", maKhachHangThucTe);
        }
        // ⚡ Nếu là nhân viên / quản lý
        else {
          if (!tenKhach?.trim() || !sdt?.trim()) {
            alert("Vui lòng nhập đầy đủ họ tên và SĐT cho sân ngày!");
            return;
          }
          if (!selectedKhachHangId) {
            alert("Vui lòng chọn hoặc thêm khách hàng trước khi đặt sân!");
            return;
          }
          maNhanVienThucTe = currentUser?.maNV; // Lấy từ tài khoản nhân viên hoặc quản lý
          maKhachHangThucTe = selectedKhachHangId;
          console.log("🧑‍💼 Đặt giúp khách, Mã NV:", maNhanVienThucTe);
        }

        // ✅ Kiểm tra ảnh thanh toán nếu là khách
        if (userRole === "khachhang" && !paymentScreenshot) {
          alert("⚠️ Vui lòng nộp ảnh thanh toán trước khi xác nhận!");
          return;
        }

        const grouped = {};
        parsed.selectedSlots?.forEach((s) => {
          let courtName = courts[s.courtIndex];
          if (courtName === "TT") courtName = "Sân TT";
          const hour = openingHour + s.slotIndex;
          const date = parsed.date || new Date().toLocaleDateString("vi-VN");
          if (!grouped[courtName]) grouped[courtName] = {};
          if (!grouped[courtName][date]) grouped[courtName][date] = [];
          grouped[courtName][date].push(hour);
        });

        const requests = [];
        Object.keys(grouped).forEach((courtName) => {
          Object.keys(grouped[courtName]).forEach((date) => {
            const hours = grouped[courtName][date].sort((a, b) => a - b);
            let start = hours[0],
              end = hours[0];
            for (let i = 1; i <= hours.length; i++) {
              if (hours[i] === end + 1) {
                end = hours[i];
              } else {
                const soGio = end - start + 1;
                const gioVaoStr = `${String(start).padStart(2, "0")}:00`;
                const gioRaStr = `${String(end + 1).padStart(2, "0")}:00`;
                const tongTienSan = tinhTienTheoGio(
                  courtName,
                  gioVaoStr,
                  gioRaStr
                );
                // Tính tổng tiền dịch vụ
                const TienDichVu = dichVuList.reduce(
                  (sum, dv) =>
                    sum +
                    (dv.qty || dv.soLuong || 1) * (dv.price || dv.gia || 0),
                  0
                );

                // Chuyển danh sách dịch vụ thành JSON string để gửi API
                const DanhSachDichVu = dichVuList.map((dv) => ({
                  name: dv.name || dv.ten,
                  qty: dv.qty || dv.soLuong || 1,
                  price: dv.price || dv.gia || 0,
                }));

                let PaymentScreenshotData = null;
                if (paymentScreenshot) {
                  PaymentScreenshotData = readFileAsDataURL(paymentScreenshot);
                }

                requests.push({
                  MaSan: `S${courts.indexOf(courtName) + 1}`,
                  MaKH: maKhachHangThucTe,
                  MaNV: maNhanVienThucTe,
                  GioVao: gioVaoStr,
                  GioRa: gioRaStr,
                  TongGio: soGio,
                  TongTien: tongTienSan,
                  GiamGia: 0,
                  TongTienThuc: tongTienSan + TienDichVu,
                  GhiChu: "",
                  LoaiDat: "Đặt sân ngày",
                  NgayLap: date,
                  TienDichVu, // ✅ tổng tiền dịch vụ
                  DanhSachDichVu: JSON.stringify(DanhSachDichVu), // ✅ JSON string
                  PaymentScreenshot: paymentScreenshot || null, // ✅ ảnh thanh toán
                });

                start = hours[i];
                end = hours[i];
              }
            }
          });
        });

        console.log("🧾 Danh sách yêu cầu gửi đặt sân ngày:", requests);

        for (let reqBody of requests) {
          const formData = new FormData();
          formData.append("MaSan", reqBody.MaSan);
          formData.append("MaKH", reqBody.MaKH);
          formData.append("MaNV", reqBody.MaNV || "");
          formData.append("GioVao", reqBody.GioVao);
          formData.append("GioRa", reqBody.GioRa);
          formData.append("TongGio", reqBody.TongGio);
          formData.append("TongTien", reqBody.TongTien);
          formData.append("GiamGia", reqBody.GiamGia);
          formData.append("TongTienThuc", reqBody.TongTienThuc);
          formData.append("GhiChu", reqBody.GhiChu || "");
          formData.append("LoaiDat", reqBody.LoaiDat);
          formData.append("NgayLap", reqBody.NgayLap);
          formData.append("TienDichVu", reqBody.TienDichVu || 0);
          formData.append(
            "DanhSachDichVu",
            JSON.stringify(reqBody.DanhSachDichVu || [])
          );
          if (reqBody.PaymentScreenshot) {
            formData.append("PaymentScreenshot", reqBody.PaymentScreenshot);
          }

          const res = await fetch("http://localhost:3000/api/admin/san/book", {
            method: "POST",
            body: formData,
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message || "Lỗi khi đặt sân!");
        }

        alert("✅ Đặt sân thành công!");
        localStorage.removeItem("bookingData");
        window.location.href = "/";
      } catch (err) {
        console.error("❌ Lỗi đặt sân:", err);
        alert(err.message || "❌ Lỗi đặt sân!");
      }
    }
  };

  // ==== RENDER ====
  return (
    <div className="xacnhan-container">
      <Sidebar />
      <div className="xacnhan-content">
        <h1>{isDatSanThang ? "Xác nhận đặt sân tháng" : "Xác nhận đặt sân"}</h1>

        {/* Nếu là đặt sân tháng */}
        {isDatSanThang ? (
          <div className="info-group">
            <div className="tt-info-grid">
              {/* 🟢 Cột 1 + 2: Thông tin khách hàng */}
              <div className="info-col info-customer">
                {userRole === "khachhang" ? (
                  <>
                    <div className="grid-row">
                      <div className="grid-label">Họ và tên:</div>
                      <div className="grid-value">
                        {currentUser.TenKh || thongTinThang.TenKH || "Không rõ"}
                      </div>
                    </div>
                    <div className="grid-row">
                      <div className="grid-label">SĐT:</div>
                      <div className="grid-value">
                        {currentUser.SDT || thongTinThang.SDT || "Không rõ"}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid-row">
                      <div className="grid-label">Họ và tên:</div>
                      <div className="grid-value" title="Click để chỉnh sửa">
                        {thongTinThang.TenKH || tenKhach}
                      </div>
                    </div>
                    <div className="grid-row">
                      <div className="grid-label">SĐT:</div>
                      <div className="grid-value" title="Click để chỉnh sửa">
                        {thongTinThang.SDT || sdt}
                      </div>
                    </div>
                  </>
                )}

                {/* Các thông tin tháng/sân */}
                <div className="grid-row">
                  <div className="grid-label">Tháng:</div>
                  <div className="grid-value">
                    {thongTinThang.Thang} / {thongTinThang.Nam}
                  </div>
                </div>
                <div className="grid-row">
                  <div className="grid-label">Sân:</div>
                  <div className="grid-value">
                    {thongTinThang.MaSan?.join(", ")}
                  </div>
                </div>
              </div>
            </div>

            <div className="tt-payment-div">
              {/* 🟢 Cột 3: Mã QR */}
              <div className="info-col info-qr">
                <img src={mbBank} alt="QR Thanh toán" className="qr-image" />
                <p className="qr-note">Quét mã QR để thanh toán</p>
              </div>

              {/* 🟢 Cột 4: Thông tin tài khoản */}
              <div className="info-col info-bank">
                <h3>Thông tin chuyển khoản</h3>
                <p>
                  <b>Tên tài khoản:</b> Nguyen Trung Nguyen
                </p>
                <p>
                  <b>Số tài khoản:</b> 0345137842
                </p>
                <p>
                  <b>Ngân hàng:</b> MB Bank
                </p>
              </div>

              {userRole === "khachhang" && (
                <div className="customer-payment-upload">
                  <h4>💳 Nộp ảnh chụp màn hình chuyển khoản</h4>
                  {/* Khung hiển thị ảnh */}
                  <div
                    className="payment-preview"
                    onClick={() =>
                      document.getElementById("payment-input").click()
                    }
                  >
                    {paymentScreenshot ? (
                      <img
                        src={URL.createObjectURL(paymentScreenshot)}
                        alt="Ảnh đã chọn"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#999" }}>
                        Click vào đây để chọn ảnh
                      </span>
                    )}
                  </div>

                  {/* Input file ẩn */}
                  <input
                    id="payment-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                  />

                  {paymentScreenshot && (
                    <p style={{ marginTop: "5px", color: "#333" }}>
                      Ảnh đã chọn thành công!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bảng thông tin sân tháng */}
            <table className="table-san-thang">
              <thead>
                <tr>
                  <th>Tên sân</th>
                  <th>Ngày</th>
                  <th>Thứ</th>
                  <th>Giờ bắt đầu</th>
                  <th>Giờ kết thúc</th>
                  <th>Giá / giờ</th>
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {thongTinThang.MaSan?.flatMap((maSan, i) =>
                  thongTinThang.NgayDat?.map((ngay, j) => {
                    const date = new Date(ngay);
                    const thuVN = [
                      "CN",
                      "Hai",
                      "Ba",
                      "Tư",
                      "Năm",
                      "Sáu",
                      "Bảy",
                    ][date.getDay()];
                    const gioVao = thongTinThang.GioVao;
                    const gioRa = thongTinThang.GioRa;
                    const courtName =
                      maSan === "TT" || maSan === "STT" ? "Sân TT" : maSan;
                    const tong = tinhTienTheoGio(courtName, gioVao, gioRa);
                    const soGio =
                      parseInt(gioRa.split(":")[0]) -
                      parseInt(gioVao.split(":")[0]);
                    const giaGio = Math.round(tong / soGio);

                    return (
                      <tr key={`${i}-${j}`}>
                        <td>{courtName}</td>
                        <td>{ngay}</td>
                        <td>{thuVN}</td>
                        <td>{gioVao}</td>
                        <td>{gioRa}</td>
                        <td>{giaGio.toLocaleString()}đ</td>
                        <td className="tongTien">{tong.toLocaleString()}đ</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* ✅ Tổng tiền & loại thanh toán */}
            <div className="total-summary">
              <label>Loại thanh toán:</label>
              <select
                value={loaiThanhToan}
                onChange={(e) => setLoaiThanhToan(e.target.value)}
              >
                <option value="50%">Cọc 50%</option>
                <option value="100%">Thanh toán 100% (Giảm 10%)</option>
              </select>

              <div className="price-summary">
                <p>
                  <b>Tổng tiền:</b> {Number(tongTienSan || 0).toLocaleString()}đ
                </p>

                {loaiThanhToan === "100%" && (
                  <>
                    <p>
                      <b>Giảm 10%:</b> -{Number(giamGia || 0).toLocaleString()}đ
                    </p>
                    <p className="total">
                      <b>Khách cần thanh toán:</b>{" "}
                      {Number(tongTienThuc || 0).toLocaleString()}đ
                    </p>
                  </>
                )}

                {loaiThanhToan === "50%" && (
                  <>
                    <p>
                      <b>Khách cần thanh toán (50%):</b>{" "}
                      {Number(soTienThanhToan || 0).toLocaleString()}đ
                    </p>
                    <p>
                      <b>Còn lại:</b>{" "}
                      {Number(
                        tongTienSan - soTienThanhToan || 0
                      ).toLocaleString()}
                      đ
                    </p>
                  </>
                )}
              </div>

              <button
                className="btn-confirm"
                onClick={() => xacNhanDatSan(isDatSanThang ? "thang" : "ngay")}
              >
                {isDatSanThang
                  ? "✅ Xác nhận đặt sân tháng"
                  : "✅ Xác nhận đặt sân"}
              </button>
            </div>
          </div>
        ) : (
          // 🟢 Giao diện đặt sân NGÀY
          <>
            <div className="info-group">
              <h2>Danh sách sân khách đặt</h2>
              <table>
                <thead>
                  <tr>
                    <th>Tên sân</th>
                    <th>Loại sân</th>
                    <th>Ngày</th>
                    <th>Giờ bắt đầu</th>
                    <th>Giờ kết thúc</th>
                    <th>Giá / giờ</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSachSan.map((san, index) => {
                    const gio = tinhSoGio(san.batDau, san.ketThuc);
                    const tong = san.gia;
                    return (
                      <tr key={index}>
                        <td>{san.ten}</td>
                        <td>{san.loai}</td>
                        <td>{san.ngay}</td>
                        <td>{san.batDau}</td>
                        <td>{san.ketThuc}</td>
                        <td>
                          {san.soGio
                            ? (san.gia / san.soGio).toLocaleString()
                            : "-"}
                          đ
                        </td>
                        <td className="tongTien">
                          {san.gia?.toLocaleString() || "0"}đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="total">
                Tổng cộng: {tongTien.toLocaleString()}đ
              </div>
            </div>

            {/* 🟡 Ẩn phần nhập khách hàng nếu là khách hàng đăng nhập */}
            {userRole !== "khachhang" && (
              <div className="info-group">
                <h2 className="section-title">Thông tin khách hàng</h2>

                <div className="flex-row">
                  {/* Họ và tên */}
                  <div className="flex-col" style={{ position: "relative" }}>
                    <label>Họ và tên:</label>
                    <input
                      type="text"
                      value={tenKhach}
                      onChange={(e) => setTenKhach(e.target.value)}
                      placeholder="Nhập họ tên..."
                      autoComplete="off"
                    />
                    {searchTen.length > 0 && (
                      <div
                        className="search-results-table"
                        style={{ position: "relative" }}
                      >
                        <table className="suggest-table">
                          <thead>
                            <tr>
                              <th>Họ & tên</th>
                              <th>SĐT</th>
                              <th>Mã</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchTen
                              .filter((kh) =>
                                kh?.TenKh?.toLowerCase().includes(
                                  tenKhach.toLowerCase()
                                )
                              )
                              .slice(0, 5)
                              .map((kh, i) => (
                                <tr
                                  key={i}
                                  onClick={() =>
                                    chonKhach(kh.TenKh, kh.SDT, kh.id ?? kh.ID)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <td>{kh.TenKh}</td>
                                  <td>{kh.SDT}</td>
                                  <td>{kh.id ?? kh.ID ?? ""}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="flex-col" style={{ position: "relative" }}>
                    <label>Số điện thoại:</label>
                    <input
                      type="tel"
                      value={sdt}
                      onChange={handlePhoneChange}
                      placeholder="Nhập SĐT..."
                      maxLength={10}
                      autoComplete="off"
                    />
                    {errorMsg && <p className="error-text">{errorMsg}</p>}
                    {searchSdt.length > 0 && (
                      <div
                        className="search-results-table"
                        style={{ position: "relative" }}
                      >
                        <table className="suggest-table">
                          <thead>
                            <tr>
                              <th>SĐT</th>
                              <th>Họ & tên</th>
                              <th>Mã</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchSdt
                              .filter((kh) =>
                                String(kh?.SDT || "").includes(sdt)
                              )
                              .slice(0, 5)
                              .map((kh, i) => (
                                <tr
                                  key={i}
                                  onClick={() =>
                                    chonKhach(kh.TenKh, kh.SDT, kh.id ?? kh.ID)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <td>{kh.SDT}</td>
                                  <td>{kh.TenKh}</td>
                                  <td>{kh.id ?? kh.ID ?? ""}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hành động thêm khách và mã giảm giá */}
                <div className="actions-customer">
                  <button className="btn-add-customer" onClick={themKhachHang}>
                    + Thêm khách hàng mới
                  </button>
                  {hienThiMaGiamGia && (
                    <div>
                      <label htmlFor="maGiamGia">Mã giảm giá:</label>
                      <select id="maGiamGia">
                        <option value="">-- Chọn mã giảm giá --</option>
                        <option value="KM10">Giảm 10%</option>
                        <option value="KM50">Giảm 50.000đ</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dịch vụ thêm */}
            <div className="info-group">
              <h2>Dịch vụ thêm</h2>

              <button
                className="btn-add-service"
                onClick={() => {
                  // Lưu state hiện tại vào localStorage
                  const tmpData = {
                    danhSachSan,
                    tenKhach,
                    sdt,
                    selectedKhachHangId,
                    dichVuList,
                    tongTienSan,
                    giamGia,
                    tongTienThuc,
                    soTienThanhToan,
                  };
                  localStorage.setItem(
                    "bookingServiceTmp",
                    JSON.stringify(tmpData)
                  );

                  // Chuyển tới trang chọn dịch vụ
                  navigate("/dichvu", {
                    state: {
                      event: {
                        danhSachSan,
                        tenKhach,
                        sdt,
                        selectedKhachHangId,
                      },
                      services: dichVuList || [],
                      returnPath: "/xacnhansan", // trang cần quay về sau khi thêm dịch vụ
                    },
                  });
                }}
              >
                + Thêm dịch vụ
              </button>

              <div className="dichvu-list">
                <table className="dichvu-table">
                  <thead>
                    <tr>
                      <th>Tên dịch vụ</th>
                      <th>Số lượng</th>
                      <th>Giá (đ)</th>
                      <th>Tổng (đ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dichVuList.map((dv, index) => (
                      <tr key={index}>
                        <td>{dv.name || dv.ten}</td>
                        <td>{dv.qty || dv.soLuong || 1}</td>
                        <td>{(dv.price || dv.gia || 0).toLocaleString()}</td>
                        <td>
                          {(
                            (dv.qty || dv.soLuong || 1) *
                            (dv.price || dv.gia || 0)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {dichVuList.length > 0 && (
                    <tfoot>
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: "right", fontWeight: "bold" }}
                        >
                          Tổng dịch vụ:
                        </td>
                        <td style={{ fontWeight: "bold" }}>
                          {dichVuList
                            .reduce(
                              (sum, dv) =>
                                sum +
                                (dv.qty || dv.soLuong || 1) *
                                  (dv.price || dv.gia || 0),
                              0
                            )
                            .toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            <div className="tt-payment-div">
              {/* 🟢 Cột 3: Mã QR */}
              <div className="info-col info-qr">
                <img src={mbBank} alt="QR Thanh toán" className="qr-image" />
                <p className="qr-note">Quét mã QR để thanh toán</p>
              </div>

              {/* 🟢 Cột 4: Thông tin tài khoản */}
              <div className="info-col info-bank">
                <h3>Thông tin chuyển khoản</h3>
                <p>
                  <b>Tên tài khoản:</b> Nguyen Trung Nguyen
                </p>
                <p>
                  <b>Số tài khoản:</b> 0345137842
                </p>
                <p>
                  <b>Ngân hàng:</b> MB Bank
                </p>
              </div>

              {userRole === "khachhang" && (
                <div className="customer-payment-upload">
                  <h4>💳 Nộp ảnh chụp màn hình chuyển khoản</h4>
                  {/* Khung hiển thị ảnh */}
                  <div
                    className="payment-preview"
                    onClick={() =>
                      document.getElementById("payment-input").click()
                    }
                  >
                    {paymentScreenshot ? (
                      <img
                        src={URL.createObjectURL(paymentScreenshot)}
                        alt="Ảnh đã chọn"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#999" }}>
                        Click vào đây để chọn ảnh
                      </span>
                    )}
                  </div>

                  {/* Input file ẩn */}
                  <input
                    id="payment-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                  />

                  {paymentScreenshot && (
                    <p style={{ marginTop: "5px", color: "#333" }}>
                      Ảnh đã chọn thành công!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="confirm-buttons">
              <button className="btn-back" onClick={() => history.back()}>
                Quay lại
              </button>
              <button
                className="btn-confirm"
                onClick={() => xacNhanDatSan(isDatSanThang ? "thang" : "ngay")}
              >
                {isDatSanThang
                  ? "✅ Xác nhận đặt sân tháng"
                  : "✅ Xác nhận đặt sân"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
