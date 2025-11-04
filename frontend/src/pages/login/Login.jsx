import React, { useState } from "react";
import axios from "axios";
import "../../css/LoginPage.css"; // đổi tên file CSS
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    localStorage.removeItem("khach");
    try {
      let res;
      if (role === "employee") {
        res = await axios.post("http://localhost:3000/api/admin/taikhoan/login", {
          userName: username,
          passWord: password,
          role: "Nhân viên",
        });
        if (res.data.success) {
          alert("✅ Đăng nhập nhân viên thành công!");
          localStorage.setItem("user", JSON.stringify(res.data.user));
          window.location.href = "/";
        } else alert("❌ Sai tài khoản hoặc mật khẩu!");
      } else if (role === "Quản lý") {
        res = await axios.post("http://localhost:3000/api/admin/taikhoan/login", {
          userName: username,
          passWord: password,
          role: "Quản lý",
        });
        if (res.data.success) {
          alert("✅ Đăng nhập quản lý thành công!");
          localStorage.setItem("user", JSON.stringify(res.data.user));
          window.location.href = "/";
        } else alert("❌ Sai tài khoản hoặc mật khẩu!");
      } else {
        res = await axios.post(
          "http://localhost:3000/api/admin/taikhoan/loginKhachHang",
          {
            userName: username,
            passWord: password,
          }
        );
        if (res.data.success) {
          alert("✅ Đăng nhập khách hàng thành công!"); // Sau khi backend cập nhật, res.data.user sẽ có TenKH
          localStorage.setItem("khach", JSON.stringify(res.data.user));
          console.log("🔹 Parsed object:", JSON.parse(localStorage.getItem("khach")));
          window.location.href = "/";
        } else alert("❌ " + res.data.message);
      }
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);
      alert("❌ Lỗi kết nối server!");
    }
  };

  return (
    <div
      className={`login-bg ${
        role === "employee"
          ? "login-employee-mode"
          : role === "Quản lý"
          ? "login-admin-mode"
          : "login-customer-mode"
      }`}
    >
      <div className="login-pickleball-ball"></div>
      <div className="login-card animate-pop">
        <div className="login-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7067/7067361.png"
            alt="Pickleball Logo"
            className="login-logo"
          />
          <h2>Pickleball Bồ Đề</h2>
          <p>
            {role === "customer"
              ? "Đăng nhập để cùng ra sân!"
              : role === "employee"
              ? "Chào mừng nhân viên trở lại!"
              : "Xin chào Quản lý!"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-role-selector">
            <span
              className={
                role === "customer" ? "login-role active" : "login-role"
              }
              onClick={() => setRole("customer")}
            >
              Khách hàng
            </span>
            <span
              className={
                role === "employee" ? "login-role active" : "login-role"
              }
              onClick={() => setRole("employee")}
            >
              Nhân viên
            </span>
            <span
              className={
                role === "Quản lý" ? "login-role active" : "login-role"
              }
              onClick={() => setRole("Quản lý")}
            >
              Quản lý
            </span>
          </div>

          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">
            {role === "employee"
              ? "Đăng nhập nhân viên"
              : role === "Quản lý"
              ? "Đăng nhập quản lý"
              : "Đăng nhập khách hàng"}
          </button>
        </form>

        <div className="login-footer">
          {role === "customer" && <a href="/register">Đăng ký</a>}
          {role === "customer" && <span>|</span>}
          <a href="/forgot-password">Quên mật khẩu?</a>
        </div>
      </div>
    </div>
  );
}
