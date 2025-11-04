import './Sidebar.css'
import { Link, useNavigate } from 'react-router-dom'; // sửa import
import React from 'react';

export function Sidebar() {
  const navigate = useNavigate();

  // Hàm xử lý logout
  const handleLogout = () => {
    // Xóa thông tin user khỏi localStorage
    localStorage.removeItem('user');
    // Nếu có token khác hoặc session, xóa thêm ở đây

    // Điều hướng về trang chủ (hoặc trang login)
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">🏸</div>
        <div className="title">
          Pickleball Bồ Đề
          <br />
          <small>Trang quản trị</small>
        </div>
      </div>

      <nav className="snav" aria-label="Chính">
        <Link className="slink" to="/">
          <span className="ic">🗓️</span>
          <span>Trang chủ</span>
        </Link>
        <Link className="slink" to="/dat-san">
          <span className="ic">🗓️</span>
          <span>Đặt sân ngày</span>
        </Link>
        <Link className="slink" to="/santhang">
          <span className="ic">🗓️</span>
          <span>Đặt sân tháng</span>
        </Link>
        <Link className="slink" to="/xeve">
          <span className="ic">🗓️</span>
          <span>Xé vé</span>
        </Link>
        <Link className="slink" to="/products">
          <span className="ic">🏷️</span>
          <span>Sản phẩm</span>
        </Link>
        <Link className="slink" to="/categories">
          <span className="ic">📁</span>
          <span>Danh mục</span>
        </Link>
        <Link className="slink" to="/orders">
          <span className="ic">🧾</span>
          <span>Đơn hàng</span>
        </Link>
        <Link className="slink" to="/pos">
          <span className="ic">💵</span>
          <span>Bán hàng tại quầy</span>
        </Link>
        <Link className="slink" to="#">
          <span className="ic">🎟️</span>
          <span>Khuyến mãi</span>
        </Link>
        <Link className="slink" to="/nhanvien">
          <span className="ic">👥</span>
          <span>Nhân viên</span>
        </Link>
        <Link className="slink" to="/quanlycalam">
          <span className="ic">📝</span>
          <span>Quản lí ca làm</span>
        </Link>
        <Link className="slink" to="/quanlytaikhoan">
          <span className="ic">🔑</span>
          <span>Quản lí tài khoản</span>
        </Link>
        <Link className="slink" to="/nhacungcap">
          <span className="ic">📇</span>
          <span>Nhà cung cấp</span>
        </Link>
        <Link className="slink" to="/nhaphang">
          <span className="ic">🎟️</span>
          <span>Nhập hàng</span>
        </Link>
        <Link className="slink" to="/lichsunhap">
          <span className="ic">🎟️</span>
          <span>Lịch sử nhập hàng</span>
        </Link>
      </nav>

      <div className="divider"></div>

      <nav className="bottom" aria-label="Hỗ trợ">
        <Link className="slink" to="#">
          <span className="ic">⚙️</span>
          <span>Cài đặt</span>
        </Link>

        {/* Logout */}
        <span className="slink" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span className="ic">🗓️</span>
          <span>Đăng xuất</span>
        </span>

        <Link className="slink" to="#">
          <span className="ic">❓</span>
          <span>Trung tâm trợ giúp</span>
        </Link>
      </nav>
    </aside>
  );
}
