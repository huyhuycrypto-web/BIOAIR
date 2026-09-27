/* ============ SỬA FILE NÀY: giá, cọc, giao hàng, ngân hàng, ảnh ============ */
window.BIOAIR = {
  price: 24900000,            // GIÁ BÁN
  deposit: 2000000,           // TIỀN ĐẶT CỌC
  delivery: { vi: "Quý 4/2027", en: "Q4 2027" },   // NGÀY GIAO HÀNG
  style: "white",              // phong cách mặc định: "white" hoặc "wood"

  bank: {                     // THÔNG TIN NGÂN HÀNG (chỉ sửa ở đây)
    name: "[TÊN NGÂN HÀNG]", number: "[SỐ TÀI KHOẢN]", holder: "[TÊN CHỦ TÀI KHOẢN]",
    qr: "assets/qr.png"       // ĐẶT ẢNH QR VÀO assets/qr.png (tự ẩn nếu không tìm thấy)
  },
  contact: { email: "[EMAIL]", phone: "[SỐ ĐIỆN THOẠI]" },

  /* ẢNH. "white" ứng với ảnh kim loại sáng màu (tên file gốc là champagne-*, giữ nguyên
     tên file để không phải đổi tên ảnh, chỉ đổi NHÃN hiển thị thành "White Minimal").
     room  = ảnh toàn cảnh sản phẩm trong phòng (hero + điểm bắt đầu/kết thúc của Look closer)
     macro = ảnh cận vật liệu (điểm giữa của Look closer)
     look  = cấu hình camera ảo cho Look closer:
             o    = vị trí (transform-origin) trên ảnh room mà camera tiến vào, "x% y%"
             peak = tỉ lệ phóng to tối đa của ảnh room trước khi chuyển sang ảnh macro */
  images: {
    room:  { wood: "assets/wood-room.jpg",  white: "assets/champagne-room.jpg" },
    macro: { wood: "assets/wood-macro.jpg", white: "assets/champagne-macro.jpg" },
    look:  { wood: { o: "61% 39%", peak: 1.24 }, white: { o: "71% 38%", peak: 1.24 } },
    inside: "assets/inside.jpg"
  },

  /* PLANT POD: thêm/bớt tại đây. "img" dùng cho cả thẻ chọn và ảnh xem lớn. */
  pods: [
    { id: "green",  vi: "Cây xanh",  en: "Green Pod",  img: "assets/pod-green.jpg" },
    { id: "bonsai", vi: "Bonsai",    en: "Bonsai Pod", img: "assets/pod-bonsai.jpg" },
    { id: "flower", vi: "Hoa",       en: "Flower Pod", img: "assets/pod-flower.jpg" },
    { id: "decor",  vi: "Trang trí", en: "Decor Pod",  img: "assets/pod-decor.jpg" }
  ],

  /* THÔNG SỐ KỸ THUẬT ĐÃ XÁC NHẬN. Để [] cho tới khi có số liệu đo/xác nhận thật.
     Khi trang chưa có specs, phần Công nghệ chỉ hiển thị ở mức minh họa khái niệm,
     KHÔNG được tự bịa số liệu để lấp vào đây.
     Ví dụ khi có số liệu: [{vi:"Độ ồn", en:"Noise", v:"xx dB"}] */
  specs: []
};
