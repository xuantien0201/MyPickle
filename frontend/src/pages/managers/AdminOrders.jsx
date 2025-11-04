import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/AdminOrders.css';
import { Sidebar } from '../../components/Sidebar';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkActionStatus, setBulkActionStatus] = useState('');

  // State cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [totalOrders, setTotalOrders] = useState(0);

  const [dashboardStats, setDashboardStats] = useState({
    totalOrdersFiltered: 0,
    totalRevenueFiltered: 0,
    failedOrders: 0,
    successfulOrders: 0,
    totalItemsSold: 0,
    topSellingProducts: [],
  });

  // State cho bộ lọc
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSalesType, setFilterSalesType] = useState('all'); // 'all', 'online', 'pos'
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchOrders(); }, [currentPage, searchTerm, filterStartDate, filterEndDate, filterSalesType, activeTab]);

  const fetchOrders = async () => {
    try {
      const params = {
        page: currentPage,
        limit: ordersPerPage,
        search: searchTerm,
        startDate: filterStartDate,
        endDate: filterEndDate,
        salesType: filterSalesType,
        statusFilter: activeTab === 'all' ? '' : activeTab, // Gửi trạng thái lọc
      };
      const response = await axios.get('/api/admin/orders', { params });
      setOrders(response.data.orders);
      setTotalOrders(response.data.totalCount);
      setDashboardStats(response.data.dashboardStats); // Cập nhật dashboard stats từ dữ liệu đã lọc
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id)
        ? prev.filter((orderId) => orderId !== id)
        : [...prev, id]
    );
  };

  const viewOrderDetails = async (orderCode) => {
    try {
      const response = await axios.get(`/api/client/orders/${orderCode}`);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      const data = response.data;

      alert(data.message || 'Cập nhật trạng thái đơn hàng thành công!');

      if (data.stockMessages && data.stockMessages.length > 0) {
        const fullMessage = data.stockMessages.join('\n');
        alert('Thông tin kho:\n' + fullMessage);
      }

      fetchOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert(error.response?.data?.error || 'Cập nhật trạng thái thất bại.');
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      cho_xac_nhan: { color: 'warning', text: 'Chờ xác nhận' },
      da_xac_nhan: { color: 'info', text: 'Đã xác nhận' },
      dang_giao: { color: 'primary', text: 'Đang giao hàng' },
      da_nhan: { color: 'success', text: 'Đã nhận hàng' },
      doi_hang: { color: 'info', text: 'Đổi hàng' },
      tra_hang: { color: 'danger', text: 'Trả hàng' },
      hoan_tien: { color: 'danger', text: 'Hoàn tiền' },
      da_huy: { color: 'danger', text: 'Đã hủy (trước xác nhận)' },
      huy_sau_xac_nhan: { color: 'danger', text: 'Hủy sau xác nhận' },
      giao_that_bai: { color: 'danger', text: 'Giao thất bại' },
    };
    return statuses[status] || { color: 'secondary', text: status };
  };

  const formatDate = (d) => new Date(d).toLocaleString('vi-VN');


  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const renderPaymentMethod = (method) => {
    switch (method) {
      case 'cod':
        return '💰 COD ';
      case 'Tiền mặt':
        return '💰 Tiền mặt';
      case 'Chuyển khoản':
        return '📱 Chuyển khoản';
      default:
        return method;
    }
  };
  const getNextStatusOptions = (current) => {
    const allowedTransitionsFrontend = {
      cho_xac_nhan: ['da_xac_nhan', 'da_huy'],
      da_xac_nhan: ['dang_giao', 'huy_sau_xac_nhan'],
      dang_giao: ['da_nhan', 'giao_that_bai'],
      da_nhan: ['doi_hang', 'tra_hang'],
      doi_hang: ['da_nhan', 'tra_hang'],
      tra_hang: ['hoan_tien'],
      hoan_tien: [], // Cập nhật
      da_huy: [],
      huy_sau_xac_nhan: [],
      giao_that_bai: [],
    };
    return allowedTransitionsFrontend[current] || [];
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0 || !bulkActionStatus) {
      alert('Vui lòng chọn đơn hàng và trạng thái muốn cập nhật.');
      return;
    }

    const statusText = getStatusInfo(bulkActionStatus).text;

    if (!window.confirm(`Bạn có chắc muốn chuyển ${selectedOrders.length} đơn hàng đã chọn sang trạng thái "${statusText}" không?`)) {
      return;
    }

    try {
      const response = await axios.put(`/api/admin/orders/hangloat/status`, {
        orderIds: selectedOrders,
        status: bulkActionStatus,
      });

      const data = response.data;
      const { message, skippedCount, invalidOrders, stockMessages } = data;
      let alertMessage = message;

      // 🟢 Hiển thị thông tin kho nếu có
      if (stockMessages && stockMessages.length > 0) {
        alertMessage += `\n\n📦 Thông tin kho:\n${stockMessages.join('\n')}`;
      }

      if (skippedCount > 0) {
        const skippedDetails = invalidOrders.map(order => `${order.order_code}: ${order.reason}`).join('\n');
        alertMessage += `\n\n⚠️ Đã bỏ qua ${skippedCount} đơn hàng không hợp lệ:\n${skippedDetails}`;
      }

      alert(alertMessage);


      fetchOrders();
      setSelectedOrders([]);
      setBulkActionStatus('');
    } catch (error) {
      console.error('Lỗi khi cập nhật hàng loạt:', error);
      const errorData = error.response?.data;
      let errorMessage = errorData?.error || 'Cập nhật hàng loạt thất bại.';

      if (errorData?.invalidOrders?.length > 0) {
        const skippedDetails = errorData.invalidOrders.map(order => `${order.order_code}: ${order.reason}`).join('\n');
        errorMessage += `\n\nChi tiết:\n${skippedDetails}`;
      }

      alert(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '0₫';
    return num.toLocaleString('vi-VN');
  };

  // Hàm để xóa tất cả các bộ lọc
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSalesType('all');
    setActiveTab('all');
    setCurrentPage(1);
  };

  return (
    <div className="admin-orders-page">
      <Sidebar />
      <div className="admin-content">
        <div className="dashboard-mini">
          <div className="stat-card">
            <h4>Tổng đơn (hiện tại)</h4>
            <p>{dashboardStats.totalOrdersFiltered}</p>
          </div>
          <div className="stat-card">
            <h4>Tổng doanh thu (hiện tại)</h4>
            <p>{formatCurrency(dashboardStats.totalRevenueFiltered)}</p>
          </div>
          <div className="stat-card stat-card-top-products">
            <h4>Top sản phẩm bán chạy</h4>
            {dashboardStats.topSellingProducts && dashboardStats.topSellingProducts.length > 0 ? (
              <ol className="top-products-list">
                {dashboardStats.topSellingProducts.map((product, index) => (
                  <li key={index}>
                    <span className="product-name" title={product.product_name}>{product.product_name}</span>
                    <span className="product-sold-count">{product.total_sold}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="no-data">Chưa có dữ liệu</p>
            )}
          </div>
          <div className="stat-card">
            <h4>Đơn thất bại</h4>
            <p>{dashboardStats.failedOrders}</p>
          </div>
          <div className="stat-card">
            <h4>Đơn thành công</h4>
            <p>{dashboardStats.successfulOrders}</p>
          </div>
        </div>

        {/* NEW: Filters */}
        <div className="admin-filters-row">
          {/* Hàng chứa status + ô tìm kiếm bên phải */}
          <div className="status-search-row">
            <div className="status-tabs">
              {[
                'all',
                'cho_xac_nhan',
                'da_xac_nhan',
                'dang_giao',
                'da_nhan',
                'doi_hang',
                'tra_hang',
                'hoan_tien',
                'da_huy',
                'huy_sau_xac_nhan',
                'giao_that_bai'
              ].map(status => (
                <button
                  key={status}
                  className={`status-tab-btn ${activeTab === status ? 'active' : ''}`}
                  onClick={() => { setActiveTab(status); setCurrentPage(1); }}
                >
                  {status === 'all' ? 'Tất cả' : getStatusInfo(status).text}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Tìm kiếm theo mã ĐH, tên, SĐT..."
              className="simple-search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Từ ngày:</label>
            <input
              type="date"
              id="startDate"
              value={filterStartDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="endDate">Đến ngày:</label>
            <input
              type="date"
              id="endDate"
              value={filterEndDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="salesType">Kiểu bán:</label>
            <select
              id="salesType"
              value={filterSalesType}
              onChange={(e) => { setFilterSalesType(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả</option>
              <option value="online">Online</option>
              <option value="pos">Tại quầy</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={handleClearFilters}>
            Xóa bộ lọc
          </button>
        </div>


        {selectedOrders.length > 0 && (
          <div className="hangloat-actions">
            <span>Đã chọn {selectedOrders.length} đơn hàng</span>
            <div className="hangloat-buttons">
              <select
                value={bulkActionStatus}
                onChange={(e) => setBulkActionStatus(e.target.value)}
                className="bulk-status-select"
              >
                <option value="">Chọn trạng thái...</option>
                <option value="da_xac_nhan">✅ Xác nhận đơn (trừ kho) </option>
                <option value="dang_giao">🚚 Đang giao hàng</option>
                <option value="da_nhan">🎉 Đã nhận hàng</option>
                <option value="doi_hang">🔄 Đổi hàng</option>
                <option value="tra_hang">↩️ Trả hàng (hoàn kho chờ hoàn tiền)</option>
                <option value="hoan_tien">💲 Hoàn tiền</option>
                <option value="da_huy">❌ Hủy (trước xác nhận)</option>
                <option value="huy_sau_xac_nhan">♻️ Hủy sau xác nhận (hoàn kho)</option>
                <option value="giao_that_bai">⚠️ Giao thất bại (hoàn kho)</option>
              </select>

              <button
                className="btn btn-primary"
                onClick={handleBulkStatusUpdate}
                disabled={!bulkActionStatus}
              >
                Cập nhật hàng loạt
              </button>
            </div>
          </div>
        )}

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Kiểu bán</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                    />
                  </td>
                  <td><strong>{order.order_code}</strong></td>
                  <td>
                    <div className="customer-info">
                      <div>{order.customer_name}</div>
                      <div className="phone">{order.customer_phone}</div>
                    </div>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td><strong>{order.total_amount.toLocaleString('vi-VN')}₫</strong></td>
                  <td><span className="payment-method">{renderPaymentMethod(order.payment_method)}</span></td>
                  <td>
                    {/* Thêm console.log để kiểm tra giá trị order.order_type */}
                    {console.log('Order in AdminOrders:', order)}
                    <span className={`order-type-badge order-type-${order.order_type || 'unknown'}`}>
                      {/* Điều chỉnh logic hiển thị cho Kiểu bán */}
                      {order.order_type === 'pos' ? 'Tại quầy' :
                        order.order_type === 'online' ? 'Online' : // Kiểm tra trực tiếp 'online'
                          'Không xác định'}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`status-select status-${getStatusInfo(order.status).color}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value={order.status}>{getStatusInfo(order.status).text}</option>
                      {getNextStatusOptions(order.status).map((next) => (
                        <option key={next} value={next}>
                          {getStatusInfo(next).text}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons-orders">
                      <button className="btn-view" onClick={() => viewOrderDetails(order.order_code)}>
                        Xem chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
          {orders.length === 0 && <div className="no-orders"><p>Không có đơn hàng nào.</p></div>}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {showModal && selectedOrder && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-order">
                <h3>Chi tiết Đơn hàng - {selectedOrder.order_code}</h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <h4>Thông tin khách hàng</h4>
                  <p><strong>Tên:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Giới tính:</strong> {selectedOrder.customer_gender || 'Chưa cập nhật'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email || 'Không có'}</p>
                  <p><strong>SĐT:</strong> {selectedOrder.customer_phone}</p>
                </div>
                <div className="detail-section">
                  <h4>Địa chỉ giao hàng</h4>
                  <p>{selectedOrder.shipping_address}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="detail-section">
                    <h4>Ghi chú của khách hàng</h4>
                    <p className="order-notes">{selectedOrder.notes}</p>
                  </div>
                )}
                <div className="detail-section">
                  <h4>Sản phẩm</h4>
                  <table className="items-table">
                    <thead>
                      <tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th><th>Tổng</th></tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price.toLocaleString('vi-VN')}₫</td>
                          <td>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="detail-section summary-section">
                  <h4>Tổng cộng: <span>{selectedOrder.total_amount.toLocaleString('vi-VN')}₫</span></h4>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
