/* =========================================================================
   DANH SÁCH NHẠC. Đây là chỗ duy nhất cần sửa khi muốn đổi nhạc.

   src có thể là:
     - Đường dẫn nội bộ:  '/music/bai.mp3'   (tệp nằm trong public/music/)
     - Địa chỉ đầy đủ:    'https://.../bai.mp3'

   Dùng địa chỉ đầy đủ khi không muốn đẩy tệp nhạc lên git. Khi đó thêm
   cors: true NẾU nơi lưu trữ có gửi header CORS (Vercel Blob và Cloudflare R2
   đều gửi). Có cờ này thì dải phổ trên màn hình nhảy theo nhạc thật.

   Bỏ cờ cors đi thì nhạc vẫn phát bình thường, chỉ là dải phổ chuyển sang dao
   động mô phỏng. Tuyệt đối không bật cors: true khi máy chủ không gửi header
   CORS: trình duyệt sẽ phát ra im lặng mà không báo lỗi gì.

   Bỏ trống cover thì trình phát tự vẽ một tấm bìa chuyển sắc suy từ id.
   ========================================================================= */

export const TRACKS = [
  {
    id: 'co-hen-voi-thanh-xuan',
    title: 'Có Hẹn Với Thanh Xuân',
    artist: 'MONSTAR',
    src: '/music/cohenvoithanhxuan.mp3',
    cover: '/music/cover-co-hen-voi-thanh-xuan.jpg',
  },
  {
    id: 'giua-dai-lo-dong-tay',
    title: 'Giữa Đại Lộ Đông Tây',
    artist: 'Uyên Linh',
    src: '/music/giua_dai_lo_dong_tay.mp3',
    cover: '/music/cover-giua-dai-lo-dong-tay.jpg',
  },
  {
    // Tệp này nhúng nhầm bìa của Ghost nên đã bỏ, để trống cho trình phát tự vẽ
    id: 'vai-cau-noi',
    title: 'Vài Câu Nói Có Khiến Người Thay Đổi',
    artist: 'GREY D, tlinh',
    src: '/music/vaicaunoi.mp3',
    cover: '',
  },
  {
    id: 'ghost',
    title: 'Ghost',
    artist: 'Justin Bieber',
    src: '/music/Ghost.mp3',
    cover: '/music/cover-ghost.png',
  },
];
