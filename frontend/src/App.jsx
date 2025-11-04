import './App.css'
import { Routes, Route } from 'react-router'
import { useLocation } from 'react-router-dom';

import { DatSanNgay } from './pages/managers/DatSanNgay'
import { DatSanThang } from './pages/managers/DatSanThang'
import { XacNhanDatSan } from './pages/managers/XacNhanDatSan'
import { QlyXeVe } from './pages/managers/QlyXeVe'
import { ThemXeVe } from './pages/managers/ThemXeVe'
import { TTXeVe } from './pages/managers/TTXeVe';
import { DatXeVe } from './pages/customers/DatXeVe';
import { ChiTietXeVe } from './pages/customers/ChiTietXeVe';
import { DichVu } from './pages/customers/DichVu';
import { CheckSanNgay } from './pages/managers/CheckSanNgay';
import { POS } from './pages/customers/POS'; // Thêm import này
import Header from './components/Header';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import Home from './pages/customers/Home';
import Shop from './pages/customers/Shop';
import ProductDetail from './pages/customers/ProductDetail';
import Cart from './pages/customers/Cart';
import Checkout from './pages/customers/Checkout';
import OrderComplete from './pages/customers/OrderComplete';
import PurchaseHistory from './pages/customers/PurchaseHistory'; // Import component mới
import AdminProducts from './pages/managers/AdminProducts';
import AdminCategories from './pages/managers/AdminCategories';
import AdminOrders from './pages/managers/AdminOrders';
import CaLam from './pages/employees/CaLam'
import QuanLyCaLam from './pages/managers/QuanLyCaLam'
import QuanLyTaiKhoan from './pages/managers/QuanLyTaiKhoan'
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ForgotPassword from "./pages/login/ForgotPassword";
import { NhanVien } from './pages/managers/NhanVien'
import NhapHangDashboard from './pages/managers/NhapHangDashboard'
import QuanLyNhaCungCap from './pages/managers/QuanLyNhaCungCap'
import NhapHang from './pages/managers/NhapHang'
import LichSuNhapHang from './pages/managers/LichSuNhapHang'


function App() {
  // 🧩 Lấy thông tin đăng nhập từ localStorage
// const currentUser =
//   JSON.parse(localStorage.getItem("user")) ||
//   JSON.parse(localStorage.getItem("khach"));

// let role = "";
// let maNguoiDung = "";
// let isKhachHang = false;

// if (currentUser?.role === "Nhân viên" || currentUser?.role === "Quản lý") {
//   role = "nhanvien";
//   maNguoiDung = currentUser.maNV;
//   console.log("🔹 Đang đăng nhập với vai trò:", currentUser.role);
//   console.log("Mã nhân viên:", maNguoiDung);
// } else if (currentUser?.id && !currentUser?.maNV) {
//   role = "khachhang";
//   maNguoiDung = currentUser.id;
//   isKhachHang = true;
//   console.log("🔹 Khách hàng đăng nhập:");
//   console.log("Mã KH:", currentUser.id);
//   console.log("Tên KH:", currentUser.TenKh);
//   console.log("SĐT:", currentUser.SDT);
// }


// 🧩 Lấy thông tin đăng nhập
const currentUser =
  JSON.parse(localStorage.getItem("user")) ||
  JSON.parse(localStorage.getItem("khach")) || {};

let role = ""; // nhanvien / khachhang

if (currentUser?.role === "Nhân viên" || currentUser?.role === "Quản lý") {
  role = "nhanvien";
} else if (currentUser?.MaKH) {
  role = "khachhang";
}

  const location = useLocation();


  const noHeaderFooterRoutes = ['/xacnhansan', '/xeve', '/categories', '/products', '/orders',
    '/nhaphang', '/nhacungcap', '/taophieunhap', '/lichsunhap','/calam', '/quanlycalam', '/quanlytaikhoan', '/nhanvien',
     '/register', '/forgot-password'
  ];
  const hideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);
  return (
    <div className="app">
      {!hideHeaderFooter && <Header />}
      <main className={`main-content ${hideHeaderFooter ? 'main-content--admin' : ''}`}>
        <Routes>
          {/* <Route index element={<DatSan />} /> */}
          <Route path="/" element={<Home />} />
          <Route path="dat-san" element={<DatSanNgay />} />
          <Route path="santhang" element={<DatSanThang />} />
          <Route path="nhaphang" element={<NhapHang />} />
          <Route path="xacnhansan" element={<XacNhanDatSan />} />
          <Route path="xeve" element={<QlyXeVe />} />
          <Route path="themxeve" element={<ThemXeVe />} />
          <Route path="datve" element={<DatXeVe />} />
          <Route path="checksanngay" element={<CheckSanNgay />} />
          <Route path="chitietve" element={<ChiTietXeVe />} />
          <Route path="/dichvu" element={<DichVu />} />
          <Route path="ttxeve" element={<TTXeVe />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-complete/:orderCode" element={<OrderComplete />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} /> {/* Thêm route này */}
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/pos" element={<POS />} />
          <Route path="nhanvien" element={<NhanVien />} />
          <Route path="calam" element={<CaLam />} />
          <Route path="quanlycalam" element={<QuanLyCaLam />} />
          <Route path="quanlytaikhoan" element={<QuanLyTaiKhoan />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="nhaphang" element={<NhapHangDashboard />} />
          <Route path="nhacungcap" element={<QuanLyNhaCungCap />} />
          <Route path="taophieunhap" element={<NhapHang />} />
          <Route path="lichsunhap" element={<LichSuNhapHang />} />
          <Route path="/profile" element={<ProfilePage />} />

        </Routes>
      </main>

      {!hideHeaderFooter && location.pathname !== '/pos' && location.pathname !== '/login' && <Footer />}
    </div >
  )
}

export default App
