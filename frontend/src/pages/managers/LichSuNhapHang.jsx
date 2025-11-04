import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/LichSuNhapHang.css';
import { Sidebar } from '../../components/Sidebar'; 

const API_BASE = 'http://localhost:3000/api/admin';

const LichSuNhapHang = () => {
  const navigate = useNavigate();
  const [phieuNhap, setPhieuNhap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [chiTietPhieu, setChiTietPhieu] = useState(null);
  const [showModalChiTiet, setShowModalChiTiet] = useState(false);

  // Lấy danh sách phiếu nhập
  const fetchPhieuNhap = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/phieunhap`);
      const data = await response.json();
      setPhieuNhap(data.data || []);
    } catch (err) {
      console.error('Lỗi tải phiếu nhập:', err);
      setError('Không thể tải danh sách phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  // Xóa phiếu nhập
  const xoaPhieuNhap = async (id, hoanTraTonKho = true) => {
    try {
      const response = await fetch(`${API_BASE}/phieunhap/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoanTraTonKho })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      await fetchPhieuNhap();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchPhieuNhap();
  }, []);

  const phieuNhapLoc = phieuNhap.filter(phieu => 
    phieu.maphieu.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
    (phieu.ten_nhacungcap && phieu.ten_nhacungcap.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()))
  );

  const handleXoaPhieuNhap = async (phieu) => {
    const hoanTraTonKho = window.confirm(
      `Bạn có chắc muốn xóa phiếu nhập #${phieu.maphieu}?\n\n` +
      `Chọn:\nOK - Hoàn trả tồn kho\nCancel - Giữ nguyên tồn kho`
    );

    if (window.confirm(`XÁC NHẬN XÓA phiếu nhập #${phieu.maphieu}?`)) {
      await xoaPhieuNhap(phieu.id, hoanTraTonKho);
    }
  };

  const handleXemChiTiet = async (phieu) => {
    try {
      const response = await fetch(`${API_BASE}/phieunhap/${phieu.id}`);
      const data = await response.json();
      setChiTietPhieu(data.data);
      setShowModalChiTiet(true);
    } catch (err) {
      console.error('Lỗi tải chi tiết:', err);
      alert('Không thể tải chi tiết phiếu nhập');
    }
  };

  const formatNgay = (ngayString) => {
    return new Date(ngayString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="ls-container">
       <Sidebar />
       <div className="ls-content">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/nhaphang')}>
          ← Quay lại
        </button>
        <h1>📊 Lịch Sử Nhập Hàng</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="thong-ke-grid">
        <div className="thong-ke-card">
          <div className="thong-ke-icon">📦</div>
          <div className="thong-ke-content">
            <div className="thong-ke-so">{phieuNhap.length}</div>
            <div className="thong-ke-label">Tổng phiếu</div>
          </div>
        </div>
        <div className="thong-ke-card">
          <div className="thong-ke-icon">💰</div>
          <div className="thong-ke-content">
            <div className="thong-ke-so">
              {phieuNhap.reduce((tong, phieu) => tong + (phieu.tongtien || 0), 0).toLocaleString('vi-VN')}đ
            </div>
            <div className="thong-ke-label">Tổng giá trị</div>
          </div>
        </div>
      </div>

      <div className="tim-kiem-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã phiếu hoặc nhà cung cấp..."
            value={tuKhoaTimKiem}
            onChange={(e) => setTuKhoaTimKiem(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <h3>Danh sách phiếu nhập ({phieuNhapLoc.length})</h3>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : phieuNhapLoc.length === 0 ? (
          <div className="empty-state">
            {tuKhoaTimKiem ? (
              <p>🔍 Không tìm thấy phiếu nhập phù hợp</p>
            ) : (
              <p>📝 Chưa có phiếu nhập nào</p>
            )}
          </div>
        ) : (
          <div className="phieu-nhap-table">
            <div className="table-header">
              <div>Mã phiếu</div>
              <div>Ngày nhập</div>
              <div>Nhà cung cấp</div>
              <div>Số mặt hàng</div>
              <div>Tổng tiền</div>
              <div>Thao tác</div>
            </div>
            {phieuNhapLoc.map(phieu => (
              <div key={phieu.id} className="table-row">
                <div className="ma-phieu">#{phieu.maphieu}</div>
                <div>{formatNgay(phieu.ngaynhap)}</div>
                <div className="nha-cung-cap">{phieu.ten_nhacungcap || 'N/A'}</div>
                <div className="so-mat-hang">{phieu.tong_sanpham || 0} mặt hàng</div>
                <div className="tong-tien">{phieu.tongtien?.toLocaleString('vi-VN')}đ</div>
                <div className="actions">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleXemChiTiet(phieu)}
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleXoaPhieuNhap(phieu)}
                    title="Xóa phiếu nhập"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModalChiTiet && chiTietPhieu && (
        <div className="modal-overlay" onClick={() => setShowModalChiTiet(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Chi tiết phiếu nhập #{chiTietPhieu.maphieu}</h2>
              <button className="btn-close" onClick={() => setShowModalChiTiet(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="thong-tin-chung">
                <h3>📝 Thông tin chung</h3>
                <div className="thong-tin-dong">
                  <strong>📅 Ngày nhập:</strong>
                  <span>{formatNgay(chiTietPhieu.ngaynhap)}</span>
                </div>
                <div className="thong-tin-dong">
                  <strong>🏢 Nhà cung cấp:</strong>
                  <span>{chiTietPhieu.ten_nhacungcap || 'N/A'}</span>
                </div>
                <div className="thong-tin-dong">
                  <strong>📦 Tổng mặt hàng:</strong>
                  <span>{chiTietPhieu.chitiet?.length || 0} sản phẩm</span>
                </div>
                {chiTietPhieu.ghichu && (
                  <div className="thong-tin-dong">
                    <strong>📝 Ghi chú:</strong>
                    <span>{chiTietPhieu.ghichu}</span>
                  </div>
                )}
              </div>

              <div className="chi-tiet-phieu">
                <h3>📦 Chi tiết mặt hàng</h3>
                {chiTietPhieu.chitiet && chiTietPhieu.chitiet.length > 0 ? (
                  <>
                    <div className="bang-chi-tiet">
                      <div className="hang-tieu-de">
                        <span>#</span>
                        <span>Tên sản phẩm</span>
                        <span>Số lượng</span>
                        <span>Đơn giá</span>
                        <span>Thành tiền</span>
                      </div>
                      
                      {chiTietPhieu.chitiet.map((hang, index) => (
                        <div key={index} className="hang-du-lieu">
                          <span className="stt">{index + 1}</span>
                          <span className="ten-san-pham">{hang.ten_sanpham || 'N/A'}</span>
                          <span className="so-luong">{hang.soluong || 0}</span>
                          <span className="don-gia">{hang.dongia?.toLocaleString('vi-VN')}đ</span>
                          <span className="thanh-tien">
                            {((hang.soluong || 0) * (hang.dongia || 0)).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="tong-ket-phieu">
                      <div className="tong-ket-dong">
                        <strong>📊 Tổng số mặt hàng:</strong>
                        <span>{chiTietPhieu.chitiet.length}</span>
                      </div>
                      <div className="tong-ket-dong">
                        <strong>💰 Tổng tiền:</strong>
                        <span className="tong-tien">
                          {chiTietPhieu.tongtien?.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="empty-state">⏳ Đang tải chi tiết...</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModalChiTiet(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default LichSuNhapHang;