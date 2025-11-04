import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/QuanLyCaLamPage.css";
import { Sidebar } from "../../components/Sidebar";

export default function QuanLyCaLam() {
  const API = "http://localhost:3000/api/admin/calam";
  const shiftOptions = ["Sáng", "Chiều", "Tối", "Nghỉ"];

  const [calamList, setCalamList] = useState([]);
  const [form, setForm] = useState({
    maNV: "",
    tenNV: "",
    week_start: "",
    t2: undefined,
    t3: undefined,
    t4: undefined,
    t5: undefined,
    t6: undefined,
    t7: undefined,
    cn: undefined,
    status: "Chưa duyệt",
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [weekStart, setWeekStart] = useState(getMonday());
  const [weekDates, setWeekDates] = useState([]);

  // --- HÀM CHUYỂN ĐỔI ---
  const normalizeShift = (shift) => {
    if (shift === "morning") return "Sáng";
    if (shift === "afternoon") return "Chiều";
    if (shift === "night") return "Tối";
    return "Nghỉ";
  };

  const denormalizeShift = (shift) => {
    if (shift === "Sáng") return "morning";
    if (shift === "Chiều") return "afternoon";
    if (shift === "Tối") return "night";
    return "off";
  };

  function getMonday(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${dayNum}`;
  }

  const displayShift = (shift) => {
    if (shift === "morning") return "Sáng";
    if (shift === "afternoon") return "Chiều";
    if (shift === "night") return "Tối";
    return "Nghỉ";
  };

  // --- FETCH DATA ---
  useEffect(() => {
    updateWeekDates(weekStart);
    fetchCaLam();
  }, [weekStart]);

  const updateWeekDates = (start) => {
    const base = new Date(start);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    });
    setWeekDates(days);
  };

  const fetchCaLam = async () => {
    try {
      const res = await axios.get(API, { params: { week_start: weekStart } });
      setCalamList(res.data || []);
    } catch {
      alert("❌ Không thể tải ca làm!");
    }
  };

  // --- XỬ LÝ ---
  const handleEdit = (item) => {
    if (item.status === "Đã duyệt") {
      alert("❌ Ca làm này đã được duyệt, không thể chỉnh sửa!");
      return;
    }
    const monday = item.week_start ? getMonday(item.week_start) : getMonday();
    setForm({
      ...item,
      week_start: monday,
      t2: normalizeShift(item.t2),
      t3: normalizeShift(item.t3),
      t4: normalizeShift(item.t4),
      t5: normalizeShift(item.t5),
      t6: normalizeShift(item.t6),
      t7: normalizeShift(item.t7),
      cn: normalizeShift(item.cn),
      status: item.status || "Chưa duyệt",
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.maNV || !form.tenNV || !form.week_start) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const payload = {
      ...form,
      t2: denormalizeShift(form.t2 || "Nghỉ"),
      t3: denormalizeShift(form.t3 || "Nghỉ"),
      t4: denormalizeShift(form.t4 || "Nghỉ"),
      t5: denormalizeShift(form.t5 || "Nghỉ"),
      t6: denormalizeShift(form.t6 || "Nghỉ"),
      t7: denormalizeShift(form.t7 || "Nghỉ"),
      cn: denormalizeShift(form.cn || "Nghỉ"),
      status: form.status || "Chưa duyệt",
    };

    try {
      await axios.post(API, payload);
      alert("✅ Lưu ca làm thành công!");
      fetchCaLam();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lưu ca làm!");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(false);
    setForm({
      maNV: "",
      tenNV: "",
      week_start: getMonday(),
      t2: undefined,
      t3: undefined,
      t4: undefined,
      t5: undefined,
      t6: undefined,
      t7: undefined,
      cn: undefined,
      status: "Chưa duyệt",
    });
  };

  const normalizeWeekStartForServer = (ws) => {
    if (!ws) return ws;
    const d = new Date(ws);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleApprove = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn duyệt ca làm của ${item.tenNV} tuần ${item.week_start}?`)) return;

    try {
      const week_for_server = normalizeWeekStartForServer(item.week_start);
      await axios.patch(`${API}/approve`, {
        maNV: item.maNV,
        week_start: week_for_server,
        status: "Đã duyệt",
      });

      alert("✅ Duyệt ca làm thành công!");
      fetchCaLam();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi duyệt ca làm!");
    }
  };

  return (
    <div className="cl-app">
      <Sidebar />
      <main className="cl-main">
    <div className="cl-topbar">
  <div className="cl-page-title">Quản lý ca làm của nhân viên</div>
  <div className="cl-right">
    <span className="cl-hello">Xin chào, Quản lý 👋🏼</span>
    <div className="cl-week-picker">
      <label>Chọn tuần:</label>
      <input
        type="date"
        value={weekStart}
        onChange={(e) => {
          const parts = e.target.value.split("-");
          const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
          setWeekStart(getMonday(localDate));
        }}
      />
    </div>
  </div>
</div>


        <section className="cl-section">
          <table className="cl-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Tên NV</th>
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                  <th key={d}>
                    {d}
                    <br />({weekDates[i] || "--/--"})
                  </th>
                ))}
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {calamList.length > 0 ? (
                calamList.map((c) => (
                  <tr key={c.maNV + c.week_start}>
                    <td>{c.maNV}</td>
                    <td>{c.tenNV}</td>
                    <td>{displayShift(c.t2)}</td>
                    <td>{displayShift(c.t3)}</td>
                    <td>{displayShift(c.t4)}</td>
                    <td>{displayShift(c.t5)}</td>
                    <td>{displayShift(c.t6)}</td>
                    <td>{displayShift(c.t7)}</td>
                    <td>{displayShift(c.cn)}</td>
                    <td>{c.status}</td>
                    <td>
                      <button
                        className="cl-btn-edit"
                        onClick={() => handleEdit(c)}
                        disabled={c.status === "Đã duyệt"}
                      >
                        ✏️
                      </button>
                      <button
                        className="cl-btn-approve"
                        onClick={() => handleApprove(c)}
                        disabled={c.status === "Đã duyệt"}
                      >
                        ✔️ Duyệt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center" }}>
                    Không có dữ liệu ca làm trong tuần này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {showForm && (
          <div className="cl-popup">
            <div className="cl-popup-content">
              <h3>{editing ? "Chỉnh sửa ca làm" : "Thêm ca làm"}</h3>

              <div className="cl-row">
                <input value={form.maNV} readOnly placeholder="Mã NV" />
                <input value={form.tenNV} readOnly placeholder="Tên NV" />
              </div>

              <div className="cl-row">
                <label>Tuần bắt đầu:</label>
                <input type="date" value={form.week_start} readOnly />
              </div>

              <div className="cl-shift-grid">
                {["t2", "t3", "t4", "t5", "t6", "t7", "cn"].map((d, i) => (
                  <div key={d} className="cl-shift-day">
                    <label>{["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}</label>
                    <select
                      value={form[d] ?? "Nghỉ"}
                      onChange={(e) => handleChange(d, e.target.value)}
                    >
                      {shiftOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="cl-row">
                <label>Trạng thái:</label>
                <input value={form.status} readOnly />
              </div>

              <div className="cl-popup-buttons">
                <button className="cl-btn-save" onClick={handleSave}>
                  Lưu
                </button>
                <button className="cl-btn-cancel" onClick={resetForm}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="cl-shift-legend cl-card">
          <h3>🕒 Chú giải ca làm</h3>
          <table>
            <thead>
              <tr>
                <th>Ca</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ca sáng</td>
                <td>05:00 – 11:00</td>
              </tr>
              <tr>
                <td>Ca chiều</td>
                <td>11:00 – 17:00</td>
              </tr>
              <tr>
                <td>Ca tối</td>
                <td>17:00 – 23:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
