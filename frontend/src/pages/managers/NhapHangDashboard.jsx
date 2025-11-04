import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/NhapHangDashboard.css';
import { Sidebar } from '../../components/Sidebar';

const API_BASE = 'http://localhost:3000/api/admin';

const NhapHangDashboard = () => {
  const navigate = useNavigate();
  const [nhaCungCap, setNhaCungCap] = useState([]);
  const [phieuNhap, setPhieuNhap] = useState([]);

  // Lấy danh sách nhà cung cấp
  const fetchNhaCungCap = async () => {
    try {
      const response = await fetch(`${API_BASE}/nhacungcap`);
      const data = await response.json();
      setNhaCungCap(data.data || []);
    } catch (err) {
      console.error('Lỗi tải nhà cung cấp:', err);
    }
  };

  // Lấy danh sách phiếu nhập
  const fetchPhieuNhap = async () => {
    try {
      const response = await fetch(`${API_BASE}/phieunhap`);
      const data = await response.json();
      setPhieuNhap(data.data || []);
    } catch (err) {
      console.error('Lỗi tải phiếu nhập:', err);
    }
  };

  useEffect(() => {
    fetchNhaCungCap();
    fetchPhieuNhap();
  }, []);

  const chucNang = [
    {
      id: 'nhacungcap',
      title: '🏢 Quản lý Nhà Cung Cấp',
      description: 'Thêm, xóa, quản lý nhà cung cấp',
      soLuong: nhaCungCap.length,
      path: '/nhacungcap',
      color: '#3B82F6'
    },
    {
      id: 'nhaphang',
      title: '📥 Nhập Hàng',
      description: 'Tạo phiếu nhập hàng mới',
      soLuong: 'Tạo mới',
      path: '/taophieunhap',
      color: '#10B981'
    },
    {
      id: 'lichsu',
      title: '📊 Lịch Sử Nhập Hàng',
      description: 'Xem và quản lý các phiếu nhập',
      soLuong: phieuNhap.length,
      path: '/lichsunhap',
      color: '#8B5CF6'
    }
  ];

  return (
    <div className="nhd-container">
       <Sidebar />
      <div className="nhd-content">
      <div className="dashboard-header">
        <h1>📥 Quản Lý Nhập Hàng</h1>
        <p>Quản lý nhà cung cấp, nhập hàng và theo dõi lịch sử</p>
      </div>

      <div className="thong-ke-grid">
        <div className="thong-ke-card">
          <div className="thong-ke-icon" style={{ background: '#3B82F6' }}>🏢</div>
          <div className="thong-ke-content">
            <div className="thong-ke-so">{nhaCungCap.length}</div>
            <div className="thong-ke-label">Nhà Cung Cấp</div>
          </div>
        </div>
        <div className="thong-ke-card">
          <div className="thong-ke-icon" style={{ background: '#10B981' }}>📦</div>
          <div className="thong-ke-content">
            <div className="thong-ke-so">{phieuNhap.length}</div>
            <div className="thong-ke-label">Phiếu Nhập</div>
          </div>
        </div>
        <div className="thong-ke-card">
          <div className="thong-ke-icon" style={{ background: '#8B5CF6' }}>💰</div>
          <div className="thong-ke-content">
            <div className="thong-ke-so">
              {phieuNhap.reduce((tong, phieu) => tong + (phieu.tongtien || 0), 0).toLocaleString('vi-VN')}đ
            </div>
            <div className="thong-ke-label">Tổng Giá Trị</div>
          </div>
        </div>
      </div>

      <div className="chuc-nang-grid">
        {chucNang.map((chucNang) => (
          <div
            key={chucNang.id}
            className="chuc-nang-card"
            onClick={() => navigate(chucNang.path)}
            style={{ borderLeft: `4px solid ${chucNang.color}` }}
          >
            <div className="chuc-nang-icon" style={{ color: chucNang.color }}>
              {chucNang.title.split(' ')[0]}
            </div>
            <div className="chuc-nang-content">
              <h3>{chucNang.title}</h3>
              <p>{chucNang.description}</p>
              <div className="chuc-nang-so">{chucNang.soLuong}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default NhapHangDashboard;