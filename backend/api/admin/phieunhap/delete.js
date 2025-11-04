import { db } from "../../../config/db.js";

export async function deletePhieuNhap(req, res) {
  console.log("🗑️ Bắt đầu xóa phiếu nhập...");

  try {
    const { id } = req.params;
    let { hoanTraTonKho = 'true' } = req.body || {};
    hoanTraTonKho = (hoanTraTonKho === true) || (String(hoanTraTonKho).toLowerCase() === 'true');

    console.log("📋 Xóa phiếu nhập ID:", id, "Hoàn trả tồn kho:", hoanTraTonKho);

    await db.beginTransaction();

    try {
      // 1. Lấy chi tiết phiếu nhập
      console.log("📦 Đang lấy chi tiết phiếu nhập...");
      const [chiTiet] = await db.execute(
        "SELECT product_id, soluong FROM chitietphieunhap WHERE phieunhap_id = ?",
        [id]
      );

      console.log("📋 Chi tiết phiếu nhập:", chiTiet);

      // 2. Hoàn trả tồn kho nếu được chọn
      if (chiTiet.length > 0 && hoanTraTonKho) {
        console.log("🔄 Đang hoàn trả tồn kho...");
        for (let item of chiTiet) {
          const qty = parseInt(item.soluong) || 0;
          const productId = item.product_id;

          await db.execute(
            "UPDATE products SET stock = IF(stock - ? >= 0, stock - ?, 0) WHERE id = ?",
            [qty, qty, productId]
          );

          console.log(`✅ Đã hoàn trả ${qty} sản phẩm ID: ${productId}`);
        }
      } else {
        console.log("⏭️ Bỏ qua hoàn trả tồn kho theo yêu cầu");
      }

      // 3. Xóa chi tiết phiếu nhập
      console.log("🗑️ Đang xóa chi tiết phiếu nhập...");
      await db.execute(
        "DELETE FROM chitietphieunhap WHERE phieunhap_id = ?",
        [id]
      );

      // 4. Xóa phiếu nhập
      console.log("🗑️ Đang xóa phiếu nhập...");
      const [result] = await db.execute(
        "DELETE FROM phieunhap WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        await db.rollback();
        return res.status(404).json({ error: "Không tìm thấy phiếu nhập" });
      }

      // Commit transaction
      await db.commit();
      console.log("🎉 Xóa phiếu nhập thành công!");

      res.json({
        message: "✅ Xóa phiếu nhập thành công!",
        data: {
          id: parseInt(id),
          hoanTraTonKho: hoanTraTonKho,
          soSanPhamDaXuLy: chiTiet.length
        }
      });

    } catch (error) {
      await db.rollback();
      console.error("❌ Lỗi trong quá trình xóa phiếu nhập:", error);
      throw error;
    }

  } catch (error) {
    console.error("❌ Lỗi xóa phiếu nhập:", error);
    res.status(500).json({ error: error.message });
  }
}