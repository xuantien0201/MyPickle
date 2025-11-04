import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/NhanVienPage.css";
import { Sidebar } from "../../components/Sidebar";

export function NhanVien() {
  const [nhanVienList, setNhanVienList] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    maNV: "",
    tenNV: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    sdt: "",
    email: "",
    queQuan: "",
    maTK: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchNhanVien();
  }, []);

  const fetchNhanVien = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/nhanvien");
      const formattedData = res.data.map((nv) => ({
        ...nv,
        ngaySinh: nv.ngaySinh ? nv.ngaySinh.split("T")[0] : "",
      }));
      setNhanVienList(formattedData);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách nhân viên:", err);
      alert("Không thể tải danh sách nhân viên! Vui lòng kiểm tra server.");
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.trim() === "") return fetchNhanVien();
    try {
      const res = await axios.get(`http://localhost:3000/api/admin/nhanvien/search?q=${q}`);
      setNhanVienList(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tìm kiếm:", err);
      alert("Đã xảy ra lỗi khi tìm kiếm!");
    }
  };

  const handleSave = async () => {
    const required = ["maNV", "tenNV", "sdt", "email"];
    for (let field of required) {
      if (!form[field]) {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
      }
    }

    try {
      if (editing) {
        await axios.put("http://localhost:3000/api/admin/nhanvien", form);
        alert("✅ Cập nhật nhân viên thành công!");
      } else {
        await axios.post("http://localhost:3000/api/admin/nhanvien", form);
        alert("✅ Thêm nhân viên thành công!");
      }
      fetchNhanVien();
      setShowForm(false);
      setForm({
        maNV: "",
        tenNV: "",
        ngaySinh: "",
        gioiTinh: "Nam",
        sdt: "",
        email: "",
        queQuan: "",
        maTK: "",
      });
      setEditing(false);
    } catch (err) {
      console.error("❌ Lỗi khi lưu nhân viên:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Đã xảy ra lỗi khi lưu nhân viên!";
      alert("❌ " + errorMsg);
    }
  };

  const handleEdit = (nv) => {
    setForm(nv);
    setEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (maNV) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/nhanvien/${maNV}`);
      alert("✅ Xóa nhân viên thành công!");
      fetchNhanVien();
    } catch (err) {
      console.error("❌ Lỗi khi xóa nhân viên:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Đã xảy ra lỗi khi xóa nhân viên!";
      alert("❌ " + errorMsg);
    }
  };

  return (
    <div className="nv-app">
      <Sidebar />
      <main className="nv-main">
        <div className="nv-topbar">
          <div className="nv-hello">Xin chào, Quản lý 👋🏼</div>
          <div className="nv-search">
            <span>🔍</span>
            <input
              placeholder="Tìm kiếm nhân viên..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        <section className="nv-section">
          <div className="nv-actions">
            <button
              className="nv-btn-add"
              onClick={() => {
                setForm({
                  maNV: "",
                  tenNV: "",
                  ngaySinh: "",
                  gioiTinh: "Nam",
                  sdt: "",
                  email: "",
                  queQuan: "",
                  maTK: "",
                });
                setEditing(false);
                setShowForm(true);
              }}
            >
              ➕ Thêm nhân viên
            </button>
          </div>

          <div className="nv-bd">
            <table>
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Tên NV</th>
                  <th>Ngày sinh</th>
                  <th>Giới tính</th>
                  <th>SĐT</th>
                  <th>Email</th>
                  <th>Quê quán</th>
                  <th>Mã TK</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {nhanVienList.map((nv) => (
                  <tr key={nv.maNV}>
                    <td>{nv.maNV}</td>
                    <td>{nv.tenNV}</td>
                    <td>{nv.ngaySinh}</td>
                    <td>{nv.gioiTinh}</td>
                    <td>{nv.sdt}</td>
                    <td>{nv.email}</td>
                    <td>{nv.queQuan}</td>
                    <td>{nv.maTK}</td>
                    <td>
                      <button
                        className="nv-btn-edit"
                        onClick={() => handleEdit(nv)}
                      >
                        ✏️
                      </button>
                      <button
                        className="nv-btn-delete"
                        onClick={() => handleDelete(nv.maNV)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div className="nv-popup">
            <div className="nv-popup-content">
              <h3>{editing ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}</h3>

              <input
                name="maNV"
                placeholder="Mã nhân viên"
                value={form.maNV}
                onChange={(e) => setForm({ ...form, maNV: e.target.value })}
                readOnly={editing}
              />
              <input
                name="tenNV"
                placeholder="Tên nhân viên"
                value={form.tenNV}
                onChange={(e) => setForm({ ...form, tenNV: e.target.value })}
              />
              <input
                type="date"
                name="ngaySinh"
                value={form.ngaySinh}
                onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })}
              />
              <select
                name="gioiTinh"
                value={form.gioiTinh}
                onChange={(e) => setForm({ ...form, gioiTinh: e.target.value })}
              >
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
              <input
                name="sdt"
                placeholder="Số điện thoại"
                value={form.sdt}
                onChange={(e) => setForm({ ...form, sdt: e.target.value })}
              />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                name="queQuan"
                placeholder="Quê quán"
                value={form.queQuan}
                onChange={(e) => setForm({ ...form, queQuan: e.target.value })}
              />
              <input
                name="maTK"
                placeholder="Mã tài khoản"
                value={form.maTK}
                onChange={(e) => setForm({ ...form, maTK: e.target.value })}
                readOnly={editing}
              />

              <div className="nv-popup-buttons">
                <button className="nv-btn-save" onClick={handleSave}>
                  {editing ? "Cập nhật" : "Lưu"}
                </button>
                <button
                  className="nv-btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
