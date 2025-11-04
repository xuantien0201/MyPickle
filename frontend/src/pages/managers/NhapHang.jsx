import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/NhapHang.css';
import { Sidebar } from '../../components/Sidebar'; 

const API_BASE = 'http://localhost:3000/api/admin';

const NhapHang = () => {
  const navigate = useNavigate();
  const [nhaCungCap, setNhaCungCap] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    nhacungcap_id: '',
    ghichu: ''
  });
  const [danhSachHang, setDanhSachHang] = useState([]);
  const [dangLuu, setDangLuu] = useState(false);
  const [showModalThemHang, setShowModalThemHang] = useState(false);
  const [hangMoi, setHangMoi] = useState({
    product_id: '',
    soluong: 1,
    dongia: 0
  });
  const [canhBaoGia, setCanhBaoGia] = useState('');

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

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      console.log('🔄 Đang tải danh sách sản phẩm...');
      
      // THỬ API ADMIN PRODUCTS TRƯỚC
      const response = await fetch(`${API_BASE}/products?limit=100`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Admin Products thành công:', data);
        
        if (data.products && Array.isArray(data.products)) {
          const normalized = data.products.map(sp => ({
            id: sp.id,
            name: sp.name || `Sản phẩm ${sp.id}`,
            price: sp.price || 0,
            stock: sp.stock || 0,
            image_url: sp.image_url || null,
            category: sp.category || 'Khác'
          }));
          console.log(`✅ Đã tải ${normalized.length} sản phẩm từ API Admin`);
          setProducts(normalized);
          return;
        }
      }
      
      // FALLBACK: THỬ API PRODUCTS THÔNG THƯỜNG
      console.log('🔄 Thử API products thông thường...');
      const normalResponse = await fetch(`${API_BASE}/products`);
      if (normalResponse.ok) {
        const normalData = await normalResponse.json();
        console.log('✅ API Products thông thường:', normalData);
        
        let rawProducts = [];
        if (Array.isArray(normalData)) {
          rawProducts = normalData;
        } else if (normalData.products && Array.isArray(normalData.products)) {
          rawProducts = normalData.products;
        } else if (normalData.data && Array.isArray(normalData.data)) {
          rawProducts = normalData.data;
        }
        
        const normalized = rawProducts.map(sp => ({
          id: sp.id,
          name: sp.name || sp.ten || `Sản phẩm ${sp.id}`,
          price: sp.price || sp.gia || 0,
          stock: sp.stock || sp.soluong || 0,
          image_url: sp.image_url || sp.hinhanh || null,
          category: sp.category || sp.loai || 'Khác'
        }));
        
        console.log(`✅ Đã tải ${normalized.length} sản phẩm từ API thường`);
        setProducts(normalized);
        return;
      }
      
      console.error('❌ Cả 2 API đều không hoạt động');
      setProducts([]);
      
    } catch (err) {
      console.error('❌ Lỗi tải sản phẩm:', err);
      setProducts([]);
    }
  };

  // Tạo phiếu nhập
  const taoPhieuNhap = async (phieuNhapData) => {
    try {
      const response = await fetch(`${API_BASE}/phieunhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phieuNhapData)
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errObj = JSON.parse(text);
          throw new Error(errObj.error || text);
        } catch (e) {
          throw new Error(text);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Lỗi tạo phiếu nhập:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchNhaCungCap();
    fetchProducts();
  }, []);

  const productsFiltered = selectedCategory
    ? products.filter(p => (p.category || '').toString() === selectedCategory)
    : products;

  // KIỂM TRA GIÁ NHẬP CÓ CAO HƠN GIÁ BÁN KHÔNG
  const kiemTraGiaNhap = (productId, giaNhap) => {
    const product = products.find(p => p.id == productId);
    if (!product) return '';
    
    const giaBan = product.price || 0;
    if (giaNhap > giaBan) {
      return `⚠️ Cảnh báo: Giá nhập (${giaNhap.toLocaleString('vi-VN')}đ) cao hơn giá bán (${giaBan.toLocaleString('vi-VN')}đ)`;
    }
    return '';
  };

  const handleThemHang = () => {
    if (!hangMoi.product_id || !hangMoi.soluong || !hangMoi.dongia) {
      alert('Vui lòng chọn sản phẩm và điền đầy đủ thông tin');
      return;
    }

    // KIỂM TRA GIÁ NHẬP CÓ CAO HƠN GIÁ BÁN KHÔNG
    const product = products.find(p => p.id == hangMoi.product_id);
    if (!product) {
      alert('Không tìm thấy sản phẩm');
      return;
    }

    const giaBan = product.price || 0;
    if (hangMoi.dongia > giaBan) {
      const xacNhan = window.confirm(
        `⚠️ CẢNH BÁO: Giá nhập (${hangMoi.dongia.toLocaleString('vi-VN')}đ) cao hơn giá bán (${giaBan.toLocaleString('vi-VN')}đ).\n\nBạn có chắc muốn thêm sản phẩm này?`
      );
      if (!xacNhan) {
        return; // KHÔNG thêm nếu người dùng không xác nhận
      }
    }

    const sanPhamDaCo = danhSachHang.find(hang => hang.product_id == hangMoi.product_id);
    if (sanPhamDaCo) {
      const xacNhan = window.confirm(
        `Sản phẩm "${product.name}" đã có trong danh sách. Bạn có muốn cập nhật số lượng?`
      );
      if (xacNhan) {
        setDanhSachHang(prev => prev.map(hang => 
          hang.product_id == hangMoi.product_id 
            ? { ...hang, soluong: parseInt(hangMoi.soluong) }
            : hang
        ));
        setShowModalThemHang(false);
        setCanhBaoGia('');
      }
      return;
    }

    const hangNhapDayDu = {
      ...hangMoi,
      id: Date.now(),
      product_id: parseInt(hangMoi.product_id),
      ten: product.name,
      image_url: product.image_url,
      category: product.category,
      gia_ban: product.price // Lưu giá bán để hiển thị
    };

    setDanhSachHang(prev => [...prev, hangNhapDayDu]);
    setHangMoi({ product_id: '', soluong: 1, dongia: 0 });
    setShowModalThemHang(false);
    setCanhBaoGia('');
  };

  const handleThayDoiSanPham = (productId) => {
    const product = products.find(p => p.id == productId);
    if (product) {
      setHangMoi(prev => ({
        ...prev,
        product_id: productId,
        dongia: 0 // Đặt về 0 để người dùng nhập thủ công
      }));
      setCanhBaoGia(''); // Reset cảnh báo khi chọn sản phẩm mới
    }
  };

  const handleThayDoiGiaNhap = (giaNhap) => {
    setHangMoi(prev => ({ 
      ...prev, 
      dongia: parseInt(giaNhap) || 0 
    }));

    // KIỂM TRA VÀ HIỂN THỊ CẢNH BÁO
    if (hangMoi.product_id) {
      const canhBao = kiemTraGiaNhap(hangMoi.product_id, parseInt(giaNhap) || 0);
      setCanhBaoGia(canhBao);
    }
  };

  const handleXoaHang = (id) => {
    setDanhSachHang(prev => prev.filter(hang => hang.id !== id));
  };

  const tongTien = danhSachHang.reduce((tong, hang) => {
    return tong + (hang.soluong * hang.dongia);
  }, 0);

  const handleLuuPhieuNhap = async (e) => {
    e.preventDefault();
    
    if (!formData.nhacungcap_id) {
      alert('Vui lòng chọn nhà cung cấp');
      return;
    }

    if (danhSachHang.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng');
      return;
    }

    // KIỂM TRA LẠI TẤT CẢ SẢN PHẨM TRONG DANH SÁCH
    const sanPhamGiaCao = danhSachHang.filter(hang => {
      const product = products.find(p => p.id == hang.product_id);
      return product && hang.dongia > product.price;
    });

    if (sanPhamGiaCao.length > 0) {
      const danhSachCanhBao = sanPhamGiaCao.map(hang => 
        `- ${hang.ten}: Giá nhập ${hang.dongia.toLocaleString('vi-VN')}đ > Giá bán ${products.find(p => p.id == hang.product_id).price.toLocaleString('vi-VN')}đ`
      ).join('\n');

      const xacNhan = window.confirm(
        `⚠️ CÓ ${sanPhamGiaCao.length} SẢN PHẨM CÓ GIÁ NHẬP CAO HƠN GIÁ BÁN:\n\n${danhSachCanhBao}\n\nBạn có chắc muốn lưu phiếu nhập này?`
      );
      
      if (!xacNhan) {
        return;
      }
    }

    setDangLuu(true);

    const phieuNhapData = {
      maphieu: `PN${Date.now()}`,
      ngaynhap: new Date().toISOString().split('T')[0],
      nhacungcap_id: parseInt(formData.nhacungcap_id),
      tongtien: tongTien,
      ghichu: formData.ghichu,
      chitiet: danhSachHang.map(hang => ({
        product_id: hang.product_id,
        soluong: parseInt(hang.soluong),
        dongia: parseInt(hang.dongia)
      }))
    };

    console.log('📤 Gửi dữ liệu phiếu nhập:', phieuNhapData);

    const result = await taoPhieuNhap(phieuNhapData);
    setDangLuu(false);

    if (result.success) {
      alert('✅ Tạo phiếu nhập thành công!');
      navigate('/lichsunhap');
    } else {
      alert('❌ Lỗi: ' + result.error);
    }
  };

  return (
    <div className="nh-container">
       <Sidebar />
      <div className="nh-content">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/nhaphang')}>
          ← Quay lại Dashboard
        </button>
        <h1>📥 Nhập Hàng</h1>
      </div>

      <form onSubmit={handleLuuPhieuNhap}>
        <div className="card">
          <h3>Thông tin phiếu nhập</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>🏢 Nhà cung cấp *</label>
              <select
                value={formData.nhacungcap_id}
                onChange={(e) => setFormData(prev => ({ ...prev, nhacungcap_id: e.target.value }))}
                required
              >
                <option value="">Chọn nhà cung cấp...</option>
                {nhaCungCap.map(ncc => (
                  <option key={ncc.id} value={ncc.id}>{ncc.ten}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>📝 Ghi chú</label>
              <textarea
                value={formData.ghichu}
                onChange={(e) => setFormData(prev => ({ ...prev, ghichu: e.target.value }))}
                placeholder="Ghi chú cho phiếu nhập..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📦 Danh sách hàng nhập</h3>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <span style={{fontSize: '14px', color: '#666'}}>
                {products.length} sản phẩm có sẵn
              </span>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setShowModalThemHang(true)}
              >
                ➕ Thêm hàng
              </button>
            </div>
          </div>

          {danhSachHang.length === 0 ? (
            <div className="empty-state">
              <p>📝 Chưa có hàng nhập nào. Nhấn "Thêm hàng" để bắt đầu.</p>
            </div>
          ) : (
            <div className="hang-nhap-list">
              {danhSachHang.map((hang, index) => {
                const product = products.find(p => p.id == hang.product_id);
                const giaBan = product?.price || 0;
                const canhBao = hang.dongia > giaBan;
                
                return (
                  <div key={hang.id} className={`hang-nhap-item ${canhBao ? 'canh-bao-gia' : ''}`}>
                    <div className="hang-nhap-header">
                      <span>Mặt hàng #{index + 1}</span>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleXoaHang(hang.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="hang-nhap-info">
                      <div className="product-info">
                        {hang.image_url && (
                          <img src={hang.image_url} alt={hang.ten} className="product-image" />
                        )}
                        <div>
                          <h4>{hang.ten}</h4>
                          <span className="product-category">{hang.category}</span>
                          {canhBao && (
                            <div className="canh-bao-item">
                              ⚠️ Giá nhập cao hơn giá bán
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="hang-nhap-details">
                        <div className="detail-item">
                          <label>Số lượng:</label>
                          <span>{hang.soluong}</span>
                        </div>
                        <div className="detail-item">
                          <label>Đơn giá nhập:</label>
                          <span className={canhBao ? 'gia-cao' : ''}>
                            {hang.dongia.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className="detail-item">
                          <label>Giá bán hiện tại:</label>
                          <span>{giaBan.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="detail-item">
                          <label>Thành tiền:</label>
                          <span className="thanh-tien">{(hang.soluong * hang.dongia).toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {danhSachHang.length > 0 && (
            <div className="tong-tien">
              <strong>💰 Tổng tiền: {tongTien.toLocaleString('vi-VN')}đ</strong>
            </div>
          )}
        </div>

        {danhSachHang.length > 0 && (
          <div className="action-buttons">
            <button
              type="submit"
              className="btn btn-success btn-large"
              disabled={dangLuu || !formData.nhacungcap_id}
            >
              {dangLuu ? '⏳ Đang lưu...' : '💾 Lưu phiếu nhập'}
            </button>
          </div>
        )}
      </form>

      {showModalThemHang && (
        <div className="modal-overlay" onClick={() => setShowModalThemHang(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Thêm sản phẩm</h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowModalThemHang(false);
                  setCanhBaoGia('');
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>📦 Chọn sản phẩm *</label>
                <div style={{ marginBottom: 8 }}>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">-- Tất cả danh mục --</option>
                    {[...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {products.length === 0 ? (
                  <div className="empty-state">
                    <p>❌ Không có sản phẩm nào</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      Kiểm tra kết nối API hoặc thêm sản phẩm trước
                    </p>
                  </div>
                ) : (
                  <select
                    value={hangMoi.product_id}
                    onChange={(e) => handleThayDoiSanPham(e.target.value)}
                  >
                    <option value="">Chọn sản phẩm...</option>
                    {productsFiltered.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Giá bán: {product.price?.toLocaleString('vi-VN')}đ - Tồn: {product.stock || 0}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {hangMoi.product_id && (
                <>
                  <div className="form-group">
                    <label>🔢 Số lượng nhập *</label>
                    <input
                      type="number"
                      min="1"
                      value={hangMoi.soluong}
                      onChange={(e) => setHangMoi(prev => ({ 
                        ...prev, 
                        soluong: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>💵 Giá nhập (VNĐ) *</label>
                    <input
                      type="number"
                      min="0"
                      value={hangMoi.dongia}
                      onChange={(e) => handleThayDoiGiaNhap(e.target.value)}
                      placeholder="Nhập giá nhập..."
                    />
                  </div>

                  {/* HIỂN THỊ GIÁ BÁN ĐỂ THAM KHẢO */}
                  {hangMoi.product_id && (
                    <div className="thong-tin-tham-khao">
                      <small>
                        💡 Giá bán hiện tại: {products.find(p => p.id == hangMoi.product_id)?.price?.toLocaleString('vi-VN')}đ
                      </small>
                    </div>
                  )}

                  {/* HIỂN THỊ CẢNH BÁO GIÁ */}
                  {canhBaoGia && (
                    <div className="canh-bao-gia-nhap">
                      {canhBaoGia}
                    </div>
                  )}

                  <div className="thong-tin-tam-tinh">
                    <strong>🧮 Thành tiền tạm tính: </strong>
                    <span className="so-tien">{(hangMoi.soluong * hangMoi.dongia).toLocaleString('vi-VN')}đ</span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowModalThemHang(false);
                  setCanhBaoGia('');
                }}
              >
                ❌ Hủy
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleThemHang}
                disabled={!hangMoi.product_id || !hangMoi.soluong || !hangMoi.dongia}
              >
                ✅ Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default NhapHang;