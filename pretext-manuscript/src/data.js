/* =========================================================================
   NỘI DUNG TẠM. Mọi thứ trong file này là dữ liệu giả để dựng giao diện.
   Thay bằng thông tin thật trước khi deploy. Không có số liệu nào ở đây là
   thật, nên file cố tình KHÔNG chứa lượt tải, doanh thu hay đánh giá sao.
   ========================================================================= */

export const profile = {
  // TODO: tên hiển thị thật
  name: 'fld-tn',
  role: 'Lập trình viên mobile',
  headline: ['Hello, I\'m', 'Trần Anh Duy .'],
  blurb:
    'I am a software developer with a special bias towards creativity and innovation. Currently in my third year at Ho Chi Minh City University of Foreign Languages - Information Technology (HUFLIT), I am deeply passionate about building impactful solutions.',
  // TODO: email thật. Để trống nên nút sẽ không mở trình gửi thư.
  email: 'duyhsne@gmail.com',
  // TODO: link thật
  github: 'https://github.com/FLD-TN',
  linkedin: '#',
};

export const stack = [
  'Swift',
  'SwiftUI',
  'Kotlin',
  'Jetpack Compose',
  'Flutter',
  'Dart',
  'React Native',
  'Core Animation',
  'Room',
  'SQLite',
  'Firebase',
  'Fastlane',
];

/* Tên ứng dụng là từ tiếng Việt có nghĩa, không phải tên startup chung chung.
   TODO: thay bằng dự án thật của bạn. */
export const projects = [
  {
    id: 'sai',
    name: 'Sải',
    platform: 'iOS · SwiftUI',
    year: '2025',
    tagline: 'Đo quãng chạy khi không có sóng',
    body: 'Ứng dụng chạy bộ ghi lại lộ trình hoàn toàn dưới máy. Dữ liệu nằm ở thiết bị, đồng bộ lên mây chỉ khi người dùng chủ động bật.',
    tags: ['SwiftUI', 'Core Location', 'Offline-first'],
    accentTilt: -6,
    seed: 'sai-running-trail',
  },
  {
    id: 'chon',
    name: 'Chốn',
    platform: 'Android · Compose',
    year: '2024',
    tagline: 'Nhật ký nơi chốn, không cần tài khoản',
    body: 'Người dùng ghim ảnh và ghi chú lên bản đồ riêng. Không đăng nhập, không theo dõi, mọi thứ nằm trong một tệp có thể tự sao lưu.',
    tags: ['Jetpack Compose', 'Room', 'MapLibre'],
    accentTilt: 5,
    seed: 'chon-map-journal',
  },
  {
    id: 'nhip',
    name: 'Nhịp',
    platform: 'Flutter · đa nền tảng',
    year: '2024',
    tagline: 'Theo dõi thói quen bằng một cử chỉ',
    body: 'Toàn bộ thao tác chính nằm trong vùng ngón cái. Đánh dấu xong một việc chỉ mất một lần vuốt, kèm phản hồi rung theo nhịp.',
    tags: ['Flutter', 'Riverpod', 'Haptics'],
    accentTilt: -4,
    seed: 'nhip-habit-rhythm',
  },
];

export const craft = [
  {
    icon: 'hand',
    title: 'Thiết kế cho ngón cái',
    body: 'Thao tác chính nằm ở nửa dưới màn hình. Không bắt người dùng đổi tay để bấm nút quan trọng.',
  },
  {
    icon: 'gauge',
    title: 'Giữ nhịp 120fps',
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
