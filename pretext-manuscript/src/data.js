/* =========================================================================
   NỘI DUNG TRANG.

   Ba dự án bên dưới là DỰ ÁN THẬT, đọc từ chính kho mã trên GitHub của bạn:
   README, cây thư mục, tệp khai báo phụ thuộc. Không có con số nào bịa ra, và
   file cố tình không chứa lượt tải hay đánh giá sao.

   ẢNH: screenshot để trống thì khung máy hiện thẻ OpenGraph của repo. Muốn đẹp
   hơn thì chụp màn hình ứng dụng, bỏ vào  public/screens/  rồi điền đường dẫn
   dạng '/screens/ten-tep.png'. Ảnh trong README GitHub KHÔNG nhúng được: chúng
   là URL có chữ ký, gọi từ tên miền khác sẽ bị trả 403.
   ========================================================================= */

export const profile = {
  name: 'fld-tn',
  role: 'Lập trình viên mobile',
  headline: ["Hello, I'm", 'Trần Anh Duy .'],
  blurb:
    'I am a software developer with a special bias towards creativity and innovation. Currently in my third year at Ho Chi Minh City University of Foreign Languages - Information Technology (HUFLIT), I am deeply passionate about building impactful solutions.',
  email: 'duyhsne@gmail.com',
  github: 'https://github.com/FLD-TN',
  // TODO: link thật, để '#' thì nút vẫn hiện nhưng bấm không đi đâu
  linkedin: '#',
};

/* Chỉ liệt kê thứ thật sự xuất hiện trong ba kho mã ở dưới. */
export const stack = [
  'Flutter',
  'Dart',
  'Java',
  'Android SDK',
  'Node.js',
  'Express',
  'PostgreSQL',
  'PostGIS',
  'React',
  'Firebase',
  'SQLite',
  'WebSocket',
  'Retrofit',
  'Gemini API',
];

export const projects = [
  {
    id: 'flood-aid',
    name: 'FloodAid',
    platform: 'Flutter · Node.js · React',
    year: '2026',
    tagline: 'Điều phối cứu trợ lũ lụt theo thời gian thực',
    body: 'Khoá luận tốt nghiệp HUFLIT. Người gặp nạn gửi tín hiệu bằng giọng nói, hệ thống chấm mức khẩn cấp rồi tìm tình nguyện viên gần nhất. Chuẩn hoá phương ngữ Miền Trung chạy ngay trên máy nên mất mạng vẫn hiểu được lời kêu cứu.',
    tags: ['Flutter', 'PostGIS', 'WebSocket', 'Gemini', 'eKYC'],
    repo: 'https://github.com/FLD-TN/Flood-aid',
    screenshot: '',
    accentTilt: -6,
  },
  {
    id: 'quan-li-truyen',
    name: 'Quản Lí Truyện',
    platform: 'Android · Java',
    year: '2025',
    tagline: 'Đọc truyện offline, thư viện nằm trong máy',
    body: 'Nhập truyện từ tệp .cbz, đọc theo kiểu lật ngang như sách hoặc cuộn dọc như webtoon. Chọn được mức chất lượng ảnh để tiết kiệm dung lượng, tự nhớ trang đang đọc dở, và thống kê thói quen đọc theo ngày, tuần, tháng.',
    tags: ['Java', 'SQLite', 'Glide', 'ViewPager2'],
    repo: 'https://github.com/FLD-TN/QuanLiTruyen',
    screenshot: '',
    accentTilt: 5,
  },
  {
    id: 'online-food-shop',
    name: 'OnlineFoodShop',
    platform: 'Android · Java · Firebase',
    year: '2025',
    tagline: 'Đặt đồ ăn, kèm trang quản trị đầy đủ',
    body: 'Hai vai trong cùng một ứng dụng. Khách duyệt món, bỏ giỏ, thanh toán và theo dõi đơn. Quản trị viên quản lý món, danh mục, đơn hàng, người dùng, mã giảm giá và thông báo đẩy.',
    tags: ['Java', 'Firebase', 'Retrofit', 'Google Sign-In'],
    repo: 'https://github.com/FLD-TN/OnlineFoodShop',
    screenshot: '',
    accentTilt: -4,
  },
];

/* TODO: đây là cách làm tôi phỏng đoán lúc dựng giao diện, chưa đối chiếu với
   cách bạn thật sự làm việc. Sửa lại cho đúng, hoặc bỏ bớt mục nào không phải. */
export const craft = [
  {
    icon: 'hand',
    title: 'Thiết kế cho ngón cái',
    body: 'Thao tác chính nằm ở nửa dưới màn hình. Không bắt người dùng đổi tay để bấm nút quan trọng.',
  },
  {
    icon: 'gauge',
    title: 'Giữ nhịp mượt',
    body: 'Đo bằng công cụ của hệ điều hành chứ không đoán. Mọi hoạt ảnh chạy trên transform và opacity.',
  },
  {
    icon: 'wifi',
    title: 'Mất mạng vẫn dùng được',
    body: 'Đọc từ dữ liệu dưới máy trước, đồng bộ sau. Người dùng không nhìn thấy vòng xoay chờ.',
  },
  {
    icon: 'battery',
    title: 'Không ăn pin',
    body: 'Gom tác vụ nền, hạn chế đánh thức máy, tắt cảm biến ngay khi màn hình rời khỏi tầm nhìn.',
  },
];
