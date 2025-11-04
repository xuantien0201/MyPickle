import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/CaLamPage.css"; // đổi tên file CSS
import { Link } from "react-router-dom";
export default function CaLam() {
  const API = "http://localhost:3000/api/admin/calam";

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const EMP_CODE = user.maNV || "";
  const EMP_NAME = user.tenNV || "";

  const daysVN = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dayNames = ["t2", "t3", "t4", "t5", "t6", "t7", "cn"];

  const mapToLocal = {
    morning: "am",
    afternoon: "chieu",
    night: "toi",
    off: "none",
    none: "none",
  };

  const SLOT_MAP = {
    am: ["Sáng", "05:00–11:00", "am"],
    chieu: ["Chiều", "11:00–17:00", "chieu"],
    toi: ["Tối", "17:00–23:00", "toi"],
    none: ["Nghỉ", "—", "none"],
  };

  const pad = (n) => String(n).padStart(2, "0");
  const toYMD = (d) => d.toISOString().slice(0, 10);
  const mondayOf = (date) => {
    const d = new Date(date);
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
    d.setDate(d.getDate() + diff);
    return d;
  };

  const [picker, setPicker] = useState(toYMD(new Date()));
  const [selected, setSelected] = useState({
    t2: "none",
    t3: "none",
    t4: "none",
    t5: "none",
    t6: "none",
    t7: "none",
    cn: "none",
  });
  const [savedWeek, setSavedWeek] = useState(null);
  const [headerDates, setHeaderDates] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const monday = mondayOf(new Date(picker));
    updateHeaderDates(monday);

    const weekStart = toYMD(monday);
    const localKey = `calam_${EMP_CODE}_${weekStart}`;
    const localData = localStorage.getItem(localKey);

    if (localData) {
      const parsed = JSON.parse(localData);
      setSelected(parsed.selected || {});
      setSavedWeek(parsed.savedWeek || null);

      axios.get(API, { params: { week_start: weekStart } }).then((res) => {
        const data = Array.isArray(res.data)
          ? res.data.find((c) => c.maNV === EMP_CODE)
          : null;
        if (data && data.status !== parsed.savedWeek?.status) {
          localStorage.setItem(
            localKey,
            JSON.stringify({ selected: parsed.selected, savedWeek: data })
          );
          setSavedWeek(data);
        }
      });
    } else {
      loadSavedFromAPI(weekStart);
    }
  }, [picker]);

  const updateHeaderDates = (monday) => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      arr.push(`${pad(d.getDate())}/${pad(d.getMonth() + 1)}`);
    }
    setHeaderDates(arr);
  };

  const loadSavedFromAPI = async (weekStart) => {
    try {
      const res = await axios.get(API, { params: { week_start: weekStart } });
      const data = Array.isArray(res.data)
        ? res.data.find((c) => c.maNV === EMP_CODE)
        : null;

      if (data) {
        const obj = {};
        dayNames.forEach((n) => {
          obj[n] = mapToLocal[data[n]] || "none";
        });
        setSelected(obj);
        setSavedWeek(data);

        const localKey = `calam_${EMP_CODE}_${weekStart}`;
        localStorage.setItem(localKey, JSON.stringify({ selected: obj, savedWeek: data }));
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải ca làm:", err);
    }
  };

  const handleSelect = (day, value) => {
    setSelected((prev) => ({ ...prev, [day]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const unselectedDays = Object.entries(selected)
      .filter(([_, shifts]) => {
        if (!Array.isArray(shifts)) return true;
        return shifts.length === 0;
      })
      .map(([day]) => day.toUpperCase());

    if (unselectedDays.length > 0) {
      alert(
        `❌ Bạn phải chọn ít nhất 1 ca cho tất cả các ngày!\nNgày chưa chọn: ${unselectedDays.join(
          ", "
        )}`
      );
      return;
    }
    if (savedWeek?.status === "Đã duyệt") {
      alert("✅ Ca làm tuần này đã được duyệt, bạn không thể gửi lại!");
      return;
    }

    const invalidDays = Object.entries(selected)
      .filter(([_, shifts]) => {
        if (!Array.isArray(shifts)) return false;
        return shifts.length > 1 || (shifts.includes("none") && shifts.some((s) => s !== "none"));
      })
      .map(([day]) => day.toUpperCase());

    if (invalidDays.length > 0) {
      alert(`❌ Mỗi ngày chỉ được chọn 1 ca!\nLỗi ở: ${invalidDays.join(", ")}`);
      return;
    }

    const mondayStr = getMonday(picker);
    const mapToServer = { am: "morning", chieu: "afternoon", toi: "night", none: "off" };

    const payload = {
      maNV: EMP_CODE,
      tenNV: EMP_NAME,
      week_start: mondayStr,
      t2: mapToServer[selected.t2],
      t3: mapToServer[selected.t3],
      t4: mapToServer[selected.t4],
      t5: mapToServer[selected.t5],
      t6: mapToServer[selected.t6],
      t7: mapToServer[selected.t7],
      cn: mapToServer[selected.cn],
      status: "Chưa duyệt",
    };

    try {
      await axios.post(API, payload);
      setSavedWeek(payload);
      setAlertVisible(true);

      const localKey = `calam_${EMP_CODE}_${mondayStr}`;
      localStorage.setItem(localKey, JSON.stringify({ selected, savedWeek: payload }));

      setTimeout(() => setAlertVisible(false), 2000);
    } catch (err) {
      console.error("❌ Gửi thất bại:", err);
      alert("❌ Server lỗi!");
    }
  };

  const handleView = () => {
    if (savedWeek) setModalOpen(true);
  };

  const getMonday = (date = new Date()) => {
    const d = new Date(date);
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  };

  const mondayDate = mondayOf(new Date(picker));

  return (
    <div className="calam-app">
      <main className="calam-main">
        {/* Form đăng ký ca làm */}
        <form className="calam-card" onSubmit={handleSubmit}>
          <div className="calam-head">
            
            <div>
              <h1>Đăng ký ca làm theo tuần</h1>
            </div>
            <div className="calam-emp">
              <div className="calam-code">{EMP_CODE}</div>
              <div>{EMP_NAME}</div>
            </div>
            <div>
              <label className="calam-small">Chọn ngày</label>
              <input type="date" value={picker} onChange={(e) => setPicker(e.target.value)} />
            </div>
            <div className="calam-actions">
              <button type="button" className="calam-btn" onClick={handleView} disabled={!savedWeek}>
                Xem ca làm
              </button>
              <button
                type="submit"
                className={`calam-btn calam-primary ${savedWeek?.status === "Đã duyệt" ? "disabled" : ""}`}
                disabled={savedWeek?.status === "Đã duyệt"}
                title={savedWeek?.status === "Đã duyệt" ? "Ca làm tuần này đã được duyệt, không thể gửi lại" : ""}
              >
                Gửi đăng ký
              </button>
              <Link to="/" className="calam-btn calam-back-btn">
    Trang Chủ
  </Link>
            </div>
          </div>

          <div className="calam-body">
            <div className="calam-grid">
              <div className="calam-th">Tuần của tôi</div>
              {daysVN.map((day, i) => (
                <div key={day} className="calam-th">
                  <div className="calam-daytitle">
                    {day}
                    <span className="calam-daydate">{headerDates[i] || "--/--"}</span>
                  </div>
                </div>
              ))}

              <div className="calam-cell calam-name">
                <strong>Tôi</strong>
                <span className="calam-sub">Đăng ký ca theo tuần đã chọn</span>
              </div>

              {dayNames.map((n) => (
                <div className="calam-cell" key={n}>
                  <div className="calam-set">
                    {["am", "chieu", "toi", "none"].map((v) => (
                      <div className={`calam-opt ${v}`} key={v}>
                        <input
                          type="checkbox"
                          name={`shift_${n}_${v}`}
                          checked={Array.isArray(selected[n]) && selected[n].includes(v)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelected((prev) => {
                              const old = Array.isArray(prev[n]) ? prev[n] : [];
                              let newList;
                              if (checked) newList = [...old, v];
                              else newList = old.filter((x) => x !== v);
                              return { ...prev, [n]: newList };
                            });
                          }}
                        />
                        <label>{SLOT_MAP[v][0]}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="calam-shift-legend calam-card">
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
        </form>

        {alertVisible && <div id="calam-alertBox">✅ Đăng ký thành công!</div>}

        {modalOpen && (
          <div className="calam-modal" onClick={(e) => e.target.classList.contains("calam-modal") && setModalOpen(false)}>
            <div className="calam-box">
              <header>
                <strong>Ca làm đã đăng ký</strong>
                <button className="calam-btn" type="button" onClick={() => setModalOpen(false)}>
                  Đóng
                </button>
              </header>

              <table>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Thứ</th>
                    <th>Ca</th>
                    <th>Giờ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {dayNames.map((n, i) => {
                    const d = new Date(mondayDate);
                    d.setDate(mondayDate.getDate() + i);
                    const val = mapToLocal[savedWeek?.[n]] || "none";
                    const show = SLOT_MAP[val];
                    return (
                      <tr key={n}>
                        <td>{pad(d.getDate())}/{pad(d.getMonth() + 1)}</td>
                        <td>{daysVN[i]}</td>
                        <td>{show[0]}</td>
                        <td>{show[1]}</td>
                        <td style={{ color: savedWeek?.status === "Đã duyệt" ? "green" : "orange" }}>
                          {savedWeek?.status || "Chưa duyệt"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
