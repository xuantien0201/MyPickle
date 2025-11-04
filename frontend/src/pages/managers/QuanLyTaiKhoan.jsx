import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/QuanLyTaiKhoanPage.css";
import { Sidebar } from "../../components/Sidebar";

export default function TaiKhoan() {
  const API = "http://localhost:3000/api/admin/taikhoan";
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    maTK: "",
    userName: "",
    passWord: "",
    role: "Nhân viên",
  });
  const [isEdit, setIsEdit] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(API);
      setAccounts(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải tài khoản:", err);
      alert("Không thể tải danh sách tài khoản");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = () => {
    setFormData({ maTK: "", userName: "", passWord: "", role: "Nhân viên" });
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (acc) => {
    setFormData(acc);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = async (maTK) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    try {
      await axios.delete(`${API}/${maTK}`);
      alert("✅ Xóa thành công");
      fetchAccounts();
    } catch (err) {
      alert("Lỗi khi xóa tài khoản");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(API, formData);
        alert("✅ Cập nhật thành công");
      } else {
        await axios.post(API, {
          userName: formData.userName,
          passWord: formData.passWord,
          role: formData.role,
        });
        alert("✅ Thêm thành công");
      }
      setShowForm(false);
      fetchAccounts();
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      alert("Lỗi khi lưu tài khoản");
    }
  };

  return (
    <div className="tk-app">
      <Sidebar />
      <div className="tk-container container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>🧑‍💻 Danh sách tài khoản</h2>
          <button className="tk-btn-add" onClick={handleAdd}>
            ➕ Thêm tài khoản
          </button>
        </div>

        <table className="tk-table table table-striped table-bordered">
          <thead>
            <tr>
              <th>Mã TK</th>
              <th>Tên đăng nhập</th>
              <th>Mật khẩu</th>
              <th>Phân quyền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length > 0 ? (
              accounts.map((acc) => (
                <tr key={acc.maTK}>
                  <td>{acc.maTK}</td>
                  <td>{acc.userName}</td>
                  <td>{acc.passWord}</td>
                  <td>{acc.role}</td>
                  <td>
                    <button
                      className="tk-btn-warning me-2"
                      onClick={() => handleEdit(acc)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="tk-btn-danger"
                      onClick={() => handleDelete(acc.maTK)}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {showForm && (
          <div className="tk-modal-backdrop">
            <div className="tk-modal-content p-4 rounded shadow">
              <h4>{isEdit ? "✏️ Sửa tài khoản" : "➕ Thêm tài khoản"}</h4>
              <form onSubmit={handleSubmit}>
                {isEdit && (
                  <div className="mb-3">
                    <label className="form-label">Mã tài khoản</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.maTK}
                      readOnly
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Tên đăng nhập</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tên đăng nhập..."
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    required
                    readOnly={isEdit}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu..."
                    value={formData.passWord}
                    onChange={(e) =>
                      setFormData({ ...formData, passWord: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phân quyền</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="Nhân viên">Nhân viên</option>
                    <option value="Quản lý">Quản lý</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="tk-btn-save me-2">
                    💾 {isEdit ? "Cập nhật" : "Lưu mới"}
                  </button>
                  <button
                    type="button"
                    className="tk-btn-cancel"
                    onClick={() => setShowForm(false)}
                  >
                    ❌ Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
