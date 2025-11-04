import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../css/Register.css";

export default function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [passWord, setPassWord] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sdt, setSDT] = useState("");
const [tenKh, setTenKh] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!userName || !email || !passWord || !confirmPassword || !sdt || !tenKh) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (passWord !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    const phoneRegex = /^[0-9]{9,12}$/;
    if (!phoneRegex.test(sdt)) {
      alert("Số điện thoại không hợp lệ!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/admin/taikhoan/registerKhachHang", {
  userName,
  passWord,
  email,
  sdt,
  tenKh
});

      alert(res.data.message);
      if (res.data.success) window.location.href = "/login";
    } catch (err) {
      console.error("❌ Lỗi khi đăng ký:", err);
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box animate-pop">
        <h2>Đăng ký tài khoản</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
  type="text"
  placeholder="Họ và tên"
  value={tenKh}
  onChange={(e) => setTenKh(e.target.value)}
/>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={passWord}
            onChange={(e) => setPassWord(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Số điện thoại"
            value={sdt}
            onChange={(e) => setSDT(e.target.value)}
          />

          <button type="submit">Đăng ký</button>
        </form>

        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
