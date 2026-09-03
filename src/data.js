/* =========================================================================
   NỘI DUNG TRANG.

   Ba dự án bên dưới là DỰ ÁN THẬT, đọc từ chính kho mã trên GitHub của bạn:
   README, cây thư mục, tệp khai báo phụ thuộc. Không có con số nào bịa ra, và
   file cố tình không chứa lượt tải hay đánh giá sao.

   ẢNH DEMO. Mỗi dự án hiện trong một khung dựng bằng CSS, chọn bằng trường
   frame:
     'phone'   khung điện thoại dọc, tỉ lệ 9:19.5  -> dùng cho ứng dụng di động
     'browser' khung trình duyệt ngang, tỉ lệ 16:10 -> dùng cho web và plugin

   Ảnh thật khai trong mảng screens. Chụp thẳng từ máy hoặc máy ảo rồi bỏ vào
   public/screens/ :

     screens: [
       { src: '/screens/floodaid-1.png', label: 'Gửi tín hiệu bằng giọng nói' },
       { src: '/screens/floodaid-2.png', label: 'Bản đồ tình nguyện viên gần nhất' },
     ],

     - Khung điện thoại: ảnh dọc, tốt nhất 1170x2532 (cỡ ảnh chụp iPhone).
     - Khung trình duyệt: ảnh ngang, tốt nhất 1600x1000.
   Ảnh được cắt theo kiểu bám mép trên, nên lệch tỉ lệ một chút vẫn không sao.

   height là chiều cao khung riêng của dự án, tính bằng pixel. Bỏ trống thì dùng
   mức chung CAO trong Work.jsx. Đặt thấp hơn thì ảnh cũng hẹp lại theo đúng tỉ
   lệ — chiều cao và bề ngang không tách rời nhau được, trừ khi chịu cắt mất đáy
   ảnh, mà đáy là chỗ đặt nút chính.

   ratio là tỉ lệ khung máy của riêng dự án đó, ghi theo dạng 'rộng / cao' lấy
   đúng kích thước ảnh CAO nhất trong bộ. Máy mỗi hãng một khác, ép chung một
   khung là dự án nào đó bị cắt mất đáy màn hình — mà đáy màn hình thường là chỗ
   đặt nút chính. Bỏ trống thì dùng tỉ lệ mặc định trong Work.jsx.

   Ảnh đã ghép sẵn khung điện thoại thì khai thêm  fit: 'contain'  và  bg  bằng
   đúng màu nền của ảnh. Mặc định trang cắt ảnh cho phủ kín khung, gặp ảnh có
   khung vẽ sẵn là xén mất vành máy.

   label KHÔNG hiện ra trang. Nó dùng làm chữ thay thế cho ảnh: trình đọc màn
   hình đọc nó cho người khiếm thị, và bộ máy tìm kiếm đọc nó để hiểu ảnh. Bỏ
   trống thì rơi về một câu chung chung.

   TỪ HAI ẢNH TRỞ LÊN thì khung điện thoại tự xếp chồng thành cỗ bài và hiện nút
   mũi tên để chuyển. Một ảnh thì hiện thẳng, không có nút.

   Mảng rỗng thì khung điện thoại hiện màn hình khởi động vẽ bằng CSS, còn khung
   trình duyệt mượn thẻ OpenGraph của kho mã. Ảnh trong README GitHub KHÔNG nhúng
   được: chúng là URL có chữ ký, gọi từ tên miền khác sẽ bị trả 403.
   ========================================================================= */

export const profile = {
  name: 'fld-tn',
  role: 'Lập trình viên mobile',
  headline: ["Hello, I'm", 'Trần Anh Duy .'],
  blurb:
    'I am a software developer with a special bias towards creativity and innovation. Currently in my third year at Ho Chi Minh City University of Foreign Languages - Information Technology (HUFLIT), I am deeply passionate about building impactful solutions.',
  email: 'duyhsne@gmail.com',
  /* Tệp CV nằm trong public/ nên chạy trên chính tên miền này, không phụ thuộc
     quyền chia sẻ của Google Drive.

     Tên tệp không dấu, không khoảng trắng: nó chính là URL, mà tên có dấu sẽ
     thành /CV%20-%20Tr%E1%BA%A7n%20... vừa xấu vừa dễ hỏng khi qua proxy hay
     lúc ai đó chép link gửi cho nhau. Vẫn giữ đủ tên người vì đây cũng là tên
     tệp lúc tải về. */
  cv: '/CV-Tran-Anh-Duy-Mobile-Developer.pdf',
  github: 'https://github.com/FLD-TN',
  linkedin: 'https://www.linkedin.com/in/tran-anh-duy-bb8254333',
};

/* Chỉ liệt kê thứ thật sự xuất hiện trong ba kho mã ở dưới. */
export const stack = [
  'Flutter',
  'Dart',
  'Java',
  'Android SDK',
  'Node.js',
  'PostgreSQL',
  'PostGIS',
  'Firebase',
  'SQLite',
  'WebSocket',
  'Retrofit',
  'Gemini API',
];

/* Dự án chia thành nhóm, mỗi nhóm là một tab ở mục "Ứng dụng đã làm".
   Thêm nhóm mới chỉ cần thêm một phần tử vào mảng này, giao diện tự sinh tab. */
export const projectGroups = [
  {
    id: 'mobile',
    label: 'Ứng dụng di động',
    projects: [
      {
        id: 'flood-aid',
        frame: 'phone',
        ratio: '380 / 822',
        icon: 'lifebuoy',
        name: 'FloodAid',
        platform: 'Flutter · Node.js · React',
        year: '2026',
        tagline: 'Nghiên cứu và xây dựng Nền tảng Hỗ trợ Điều phối Cứu trợ Lũ lụt tại Miền Trung dựa trên AI NLP',
        body: 'Khoá luận tốt nghiệp HUFLIT. Người gặp nạn gửi tín hiệu bằng giọng nói, hệ thống chấm mức khẩn cấp rồi tìm tình nguyện viên gần nhất. Chuẩn hoá phương ngữ Miền Trung chạy ngay trên máy nên mất mạng vẫn hiểu được lời kêu cứu.',
        tags: ['Flutter', 'PostGIS', 'WebSocket', 'Gemini', 'eKYC'],
        repo: 'https://github.com/FLD-TN/Flood-aid',
        live: '',
        screens: [
          {
            src: '/screens/floodaid-1.png',
            label: 'Gửi yêu cầu cứu trợ kèm toạ độ, ghi chú nhanh và mô tả bằng giọng nói',
          },
          {
            src: '/screens/floodaid-2.png',
            label: 'Theo dõi ca SOS trực tiếp trong lúc hệ thống quét đội cứu hộ gần nhất',
          },
          {
            src: '/screens/floodaid-3.png',
            label: 'Phía cứu hộ: đường tới nạn nhân, khoảng cách và thời gian dự kiến',
          },
          {
            src: '/screens/floodaid-4.png',
            label: 'Nhắn tin thời gian thực giữa người gặp nạn và tình nguyện viên',
          },
        ],
        accentTilt: -6,
      },
      {
        id: 'quan-li-truyen',
        frame: 'phone',
        /* Hai ảnh này đã ghép sẵn khung điện thoại nên dùng nguyên bản, không
           cắt. fit contain cho ảnh vừa khít khung, bg lấy đúng màu nền của ảnh
           để chỗ thừa không lộ ra thành viền. ratio lấy theo ảnh RỘNG nhất, khi
           đó ảnh còn lại chỉ hụt hai bên vài pixel mà nền đã cùng màu. */
        ratio: '428 / 830',
        fit: 'contain',
        bg: '#2b2d30',
        height: 500,
        icon: 'books',
        name: 'Quản Lí Truyện',
        platform: 'Android · Java',
        year: '2025',
        tagline: 'Đọc truyện offline, thư viện nằm trong máy',
        body: 'Nhập truyện từ tệp .cbz, đọc theo kiểu lật ngang như sách hoặc cuộn dọc như webtoon. Chọn được mức chất lượng ảnh để tiết kiệm dung lượng, tự nhớ trang đang đọc dở, và thống kê thói quen đọc theo ngày, tuần, tháng.',
        tags: ['Java', 'SQLite', 'Glide', 'ViewPager2'],
        repo: 'https://github.com/FLD-TN/QuanLiTruyen',
        live: '',
        screens: [
          { src: '/screens/5.png', label: 'Thư viện truyện trong máy, kèm lịch sử đọc và thống kê' },
          { src: '/screens/6.png', label: 'Đọc cuộn dọc kiểu webtoon, nhớ đúng trang đang dở' },
        ],
        accentTilt: 5,
      },
      {
        id: 'online-food-shop',
        frame: 'phone',
        ratio: '1344 / 2992',
        icon: 'food',
        name: 'OnlineFoodShop',
        platform: 'Android · Java · Firebase',
        year: '2025',
        tagline: 'Đặt đồ ăn, kèm trang quản trị đầy đủ',
        body: 'Hai vai trong cùng một ứng dụng. Khách duyệt món, bỏ giỏ, thanh toán và theo dõi đơn. Quản trị viên quản lý món, danh mục, đơn hàng, người dùng, mã giảm giá và thông báo đẩy.',
        tags: ['Java', 'Firebase', 'Retrofit', 'Google Sign-In'],
        repo: 'https://github.com/FLD-TN/OnlineFoodShop',
        live: '',
        screens: [
          { src: '/screens/7.png', label: 'Trang chủ: tìm món, duyệt theo danh mục, thêm thẳng vào giỏ' },
          { src: '/screens/8.png', label: 'Giỏ hàng: sửa số lượng từng món, cộng tổng rồi thanh toán' },
        ],
        accentTilt: -4,
      },
    ],
  },
  {
    id: 'khac',
    label: 'Các dự án khác',
    projects: [
      {
        id: 'gopy-discord',
        frame: 'browser',
        icon: 'chat',
        name: 'GopYDiscord',
        platform: 'Minecraft · Spigot/Paper 1.21+',
        year: '2026',
        tagline: 'Góp ý trong game, tin nhắn hiện thẳng ở Discord',
        body: 'Người chơi gõ một lệnh trong máy chủ Minecraft là góp ý bay thẳng sang kênh Discord qua bot. Nối hai nơi cộng đồng hay tụ lại, đỡ phải thoát game ra báo lỗi.',
        tags: ['Java', 'Spigot API', 'Discord Bot'],
        repo: 'https://github.com/FLD-TN/GopYDiscord',
        live: '',
        screens: [],
        accentTilt: 4,
      },
      {
        id: 'disable-command',
        frame: 'browser',
        icon: 'prohibit',
        name: 'DisableCommand',
        platform: 'Minecraft · Plugin',
        year: '2025',
        tagline: 'Khoá lệnh trong máy chủ, chỉnh ngay trong game',
        body: 'Chặn những lệnh không muốn người chơi dùng. Sửa danh sách bằng lệnh ingame chứ không phải mở tệp cấu hình, có phân quyền riêng và cho quản trị viên đi vòng qua.',
        tags: ['Java', 'Bukkit config', 'Permission', 'Tab completion'],
        repo: 'https://github.com/FLD-TN/DisableCommand',
        live: '',
        screens: [],
        accentTilt: -5,
      },
      {
        id: 'li-xi-game',
        frame: 'browser',
        icon: 'gift',
        name: 'Lì Xì Game',
        platform: 'React · TypeScript · Vite',
        year: '2026',
        tagline: 'Bóc lì xì ngẫu nhiên, làm cho Tết Bính Ngọ 2026',
        body: 'Trang web bóc bao lì xì với các mệnh giá 20k, 30k, 50k và 100k. Đã chạy thật trên mạng suốt dịp Tết.',
        tags: ['React', 'TypeScript', 'Framer Motion', 'canvas-confetti'],
        repo: 'https://github.com/FLD-TN/L-X-Game-main',
        live: 'https://lixigame.vercel.app/',
        screens: [{ src: '/screens/lixigame.jpg', label: 'Trang bóc lì xì Tết Bính Ngọ, đang chạy thật trên mạng' }],
        accentTilt: 6,
      },
    ],
  },
];

