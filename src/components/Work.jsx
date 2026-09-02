import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowSquareOutIcon,
  BooksIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChatCircleDotsIcon,
  ForkKnifeIcon,
  GiftIcon,
  GithubLogoIcon,
  LifebuoyIcon,
  ProhibitIcon,
} from '@phosphor-icons/react';
import { projectGroups } from '../data.js';
import { SectionHeading, Reveal } from './ui.jsx';

/* Danh sách dự án: mỗi dự án một hàng, chữ một bên, ảnh demo một bên.

   Nguyên tắc: người xem đọc được dự án làm gì mà KHÔNG phải bấm gì cả. Bản
   trước giấu mô tả sau một cú bấm và giấu tiếp một nửa dự án sau tab, nên quét
   mắt qua chỉ thấy sáu cái tên trơ trọi. Chữ giờ luôn nằm sẵn trên trang.

   Riêng ảnh chụp thì cho bấm chuyển: bấm mũi tên thì ảnh trượt ngang sang ảnh
   kế. Cách này khác hẳn việc giấu chữ — mỗi ảnh vẫn được xem nguyên cỡ thay vì
   bị thu nhỏ xuống còn một phần tư, và ảnh đầu tiên đã hiện sẵn nên không bấm
   cũng thấy.

   KHUNG MÁY DỰNG BẰNG CSS, KHÔNG PHẢI ẢNH GHÉP SẴN. Ảnh chụp được đặt vào khung
   lúc chạy nên giữ nguyên độ nét trên màn hình Retina, đổi ảnh chỉ cần thay
   tệp, và mọi dự án dùng chung một khung nên không cái nào lệch cái nào.

   Hai hàng cạnh nhau đảo bên ảnh cho đỡ đều đều. Muốn ảnh nằm cùng một bên hết
   thì bỏ chỗ truyền `dao` ở dưới cùng. */

/* true  = ảnh nằm trong vành máy điện thoại
   false = ảnh trần, chỉ bo góc và đổ bóng */
const KHUNG_MAY = false;

const ICONS = {
  lifebuoy: LifebuoyIcon,
  books: BooksIcon,
  food: ForkKnifeIcon,
  chat: ChatCircleDotsIcon,
  prohibit: ProhibitIcon,
  gift: GiftIcon,
};

/* Ảnh trượt ngang theo đúng chiều nút vừa bấm. chieu = 1 là bấm tiến: ảnh mới
   vào từ mép phải, ảnh cũ ra bằng mép trái, y như lật sang trang sau. chieu =
   -1 thì ngược lại. Không xoay, không thu nhỏ, không xếp chéo. */
const TRUOT = {
  vao: (chieu) => ({ x: chieu > 0 ? '100%' : '-100%' }),
  giua: { x: '0%' },
  ra: (chieu) => ({ x: chieu > 0 ? '-100%' : '100%' }),
};

/* Hai lớp ảnh nằm sau lưng, thò ra ở CẠNH PHẢI. Không xoay: chỉ dịch ngang, nhỏ
   dần và mờ dần, nên vẫn đứng thẳng chứ không xoè như nan quạt.

   Neo phép thu nhỏ vào MÉP PHẢI. Neo vào tâm thì thu nhỏ tự kéo cả hai cạnh vào
   trong, phải cộng thêm nửa phần hụt vào x mới thấy ló ra — hai con số dính vào
   nhau, chỉnh cái này là hỏng cái kia. Neo mép phải thì x chính là bề rộng dải
   thò ra, đúng một con số một việc.

   Dải thò tính bằng pixel để mọi khổ màn hình đều mỏng như nhau. */
const LOP_SAU = [
  { scale: 0.945, x: 16, opacity: 0.5 },
  { scale: 0.89, x: 30, opacity: 0.24 },
];

// Khoá bấm sau mỗi lần chuyển, để một cú trượt chạy xong hẳn rồi mới nhận cú sau
const CHO = 500;

/* Tỉ lệ khung mặc định, dùng khi dự án không khai ratio riêng. Máy mỗi hãng một
   khác nên ảnh chụp của hai dự án có thể không cùng tỉ lệ; ép chung một khung là
   dự án nào đó bị cắt mất đáy màn hình. */
const TI_LE = '380 / 822';

/* CHỖ DUY NHẤT chỉnh cỡ ảnh. Khống chế theo CHIỀU CAO chứ không theo bề ngang:
   ảnh chụp điện thoại nào cũng dài hơn hai lần bề ngang, nên cứ đặt bề ngang thì
   chiều cao muốn ra sao thì ra, mà tỉ lệ mỗi dự án một khác nên hàng nào cao
   thấp hàng nấy. Chốt chiều cao thì mọi hàng cao bằng nhau, bề ngang tự suy ra.

   Cắt bớt đáy ảnh cho ngắn lại thì KHÔNG được: ảnh nào cũng có nút chính nằm sát
   đáy — "GỬI YÊU CẦU CỨU TRỢ", "TRƯỢT ĐỂ ĐÓNG CA", thanh điều hướng. */
const CAO = 550;

/* Màn hình chờ vẽ bằng CSS, dùng khi dự án chưa có ảnh chụp. Cố tình trông như
   màn hình khởi động của ứng dụng chứ không phải một ô trống báo thiếu ảnh. */
function Splash({ project, Icon }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-surface-2 to-bg px-4 text-center">
      <Icon size={40} weight="duotone" className="text-accent" />
      <p className="font-display text-[15px] font-semibold">{project.name}</p>
      <p className="font-mono text-[10px] text-muted">{project.platform}</p>
    </div>
  );
}

/* Khung điện thoại: vành máy chuyển sắc, phím cạnh hai bên.

   Tỉ lệ 9:19.5 (0.462) lấy đúng theo ảnh chụp CAO nhất trong bộ ảnh thật. Ảnh
   nào hẹp hơn khung thì object-cover cắt chiều cao chứ không cắt chiều ngang,
   mà phần bị cắt luôn là đáy màn hình — đúng chỗ đặt nút hành động chính. Lấy
   khung theo ảnh cao nhất thì mọi ảnh chỉ mất vài phần trăm bề ngang ở hai rìa,
   nơi thường chỉ có lề.

   ĐẢO ĐỘNG chỉ vẽ khi chưa có ảnh thật. Ảnh chụp từ máy đã có sẵn thanh trạng
   thái và lỗ khoét camera của chính nó; vẽ thêm đảo động lên trên là chồng hai
   cái lỗ camera vào nhau. */
function PhoneShell({ children, phim = true, dao = false, tiLe = TI_LE, nen }) {
  /* Ảnh trần, không vành máy. Ảnh chụp của bạn đã tự mang thanh trạng thái và
     lỗ khoét camera, nên bỏ vành đi thì màn hình ứng dụng to hẳn ra và không có
     hai lớp viền chồng nhau. Đổi KHUNG_MAY để so hai kiểu. */
  if (!KHUNG_MAY) {
    return (
      <div
        className="relative w-full overflow-hidden rounded-[1.6rem] shadow-[0_34px_70px_-28px_rgba(0,0,0,0.95)]"
        style={{ aspectRatio: tiLe, background: nen || '#0a0b0c' }}
      >
        {children}
        {dao && (
          <span className="absolute left-1/2 top-[9px] h-[17px] w-[31%] -translate-x-1/2 rounded-full bg-black" />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {phim && (
        <>
          <span className="absolute -left-[3px] top-[17%] h-[6%] w-[3px] rounded-l-sm bg-[#26292d]" />
          <span className="absolute -left-[3px] top-[26%] h-[9%] w-[3px] rounded-l-sm bg-[#26292d]" />
          <span className="absolute -left-[3px] top-[38%] h-[9%] w-[3px] rounded-l-sm bg-[#26292d]" />
          <span className="absolute -right-[3px] top-[30%] h-[13%] w-[3px] rounded-r-sm bg-[#26292d]" />
        </>
      )}
      <div
        className="relative rounded-[2.1rem] bg-gradient-to-b from-[#3d4147] to-[#191b1e] p-[3px] shadow-[0_34px_70px_-28px_rgba(0,0,0,0.95)]"
        style={{ aspectRatio: tiLe }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.95rem] bg-[#0a0b0c]">
          {children}
          {dao && (
            <span className="absolute left-1/2 top-[9px] h-[17px] w-[31%] -translate-x-1/2 rounded-full bg-black" />
          )}
        </div>
      </div>
    </div>
  );
}

/* cover = phủ kín khung, thừa đâu cắt đó. Dùng cho ảnh chụp màn hình trần.
   contain = thu vừa khít, không cắt một pixel nào, thừa chỗ thì để trống. Dùng
   cho ảnh đã ghép sẵn khung điện thoại — cắt kiểu cover là xén mất vành máy vẽ
   trong ảnh. Chỗ trống lấp bằng đúng màu nền của ảnh nên không thấy mối nối. */
function Anh({ src, alt, vua }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`h-full w-full ${vua ? 'object-contain' : 'object-cover object-top'}`}
    />
  );
}

/* Nút chuyển ảnh. Nút đặc chứ không phải vòng tròn rỗng: trên nền đen, một
   đường viền mảnh với mũi tên mờ trông như thứ trang trí, không ra cái bấm
   được. 44px là cỡ tối thiểu để ngón tay bấm trúng trên điện thoại. */
function Nut({ huong, onClick, khoa }) {
  const Icon = huong < 0 ? CaretLeftIcon : CaretRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={khoa}
      aria-label={huong < 0 ? 'Ảnh trước' : 'Ảnh kế tiếp'}
      className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface-2 text-ink transition-all hover:bg-accent hover:text-bg disabled:cursor-default disabled:opacity-35 disabled:hover:bg-surface-2 disabled:hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon size={17} weight="bold" />
    </button>
  );
}

/* Bộ ảnh chụp. Không ảnh thì hiện màn hình chờ, một ảnh thì hiện thẳng không
   mũi tên, từ hai ảnh trở lên mới có nút chuyển. */
function PhoneDeck({ project, Icon }) {
  const reduce = useReducedMotion();
  const screens = project.screens ?? [];
  const n = screens.length;
  const [i, setI] = useState(0);
  // Nhớ chiều vừa bấm, để ảnh mới vào từ đúng phía đối diện ảnh cũ đi ra
  const [chieu, setChieu] = useState(1);
  const [khoa, setKhoa] = useState(false);
  const hen = useRef(null);
  // Ảnh chụp của dự án nào thì khung theo tỉ lệ máy của dự án đó
  const tiLe = project.ratio || TI_LE;
  /* Bề ngang suy ngược từ chiều cao mong muốn, cộng 30px chỗ cho lớp sau thò ra.
     Đặt bằng style chứ không bằng lớp Tailwind vì con số phụ thuộc tỉ lệ. */
  // Ảnh đã có sẵn khung máy thì để nguyên, không cắt; nền khung lấy đúng màu nền ảnh
  const vua = project.fit === 'contain';
  const nen = project.bg;
  const [rNgang, rDoc] = tiLe.split('/').map((v) => Number(v.trim()));
  const rongKhung = Math.round((project.height || CAO) * (rNgang / rDoc)) + 30;

  // Mọi hook phải nằm trên các nhánh return ở dưới, không được gọi có điều kiện
  useEffect(() => () => clearTimeout(hen.current), []);

  if (n === 0) {
    return (
      <div className="mx-auto w-full" style={{ maxWidth: rongKhung - 30 }}>
        <PhoneShell dao tiLe={tiLe} nen={nen}>
          <Splash project={project} Icon={Icon} />
        </PhoneShell>
      </div>
    );
  }

  if (n === 1) {
    return (
      <div className="mx-auto w-full" style={{ maxWidth: rongKhung - 30 }}>
        <PhoneShell tiLe={tiLe} nen={nen}>
          <Anh src={screens[0].src} alt={screens[0].label || `Màn hình ứng dụng ${project.name}`} vua={vua} />
        </PhoneShell>
      </div>
    );
  }

  /* Khoá CHO mili giây sau mỗi cú bấm. Không khoá thì bấm liên tiếp làm nhiều
     ảnh cùng trượt chồng lên nhau, nhìn ra là lỗi. Nút chuyển sang trạng thái
     mờ trong lúc khoá, để người bấm biết là đang chờ chứ không phải nút hỏng. */
  const chuyen = (idxMoi, chieuMoi) => {
    if (khoa || idxMoi === i) return;
    setChieu(chieuMoi);
    setI(idxMoi);
    setKhoa(true);
    hen.current = setTimeout(() => setKhoa(false), CHO);
  };
  const di = (buoc) => chuyen((i + buoc + n) % n, buoc);
  const toi = (idx) => chuyen(idx, idx > i ? 1 : -1);

  const buoc = reduce
    ? { duration: 0 }
    : { type: 'spring', stiffness: 260, damping: 34, mass: 0.9 };
  const hienTai = screens[i];
  // Hai ảnh kế tiếp nằm sau lưng. Chỉ có hai ảnh thì sau lưng còn đúng một tấm.
  const soLopSau = Math.min(LOP_SAU.length, n - 1);

  /* Mũi tên nằm HAI BÊN ảnh, không phải nằm dưới. Nút chuyển ảnh đặt dưới đáy
     thì trông như nút của cả khối chứ không gắn với ảnh, người xem chẳng biết
     bấm vào thì cái gì đổi. Kẹp hai bên là quy ước ai cũng đọc được ngay, mà
     lại lấp đúng khoảng trống hai bên cột ảnh. */
  return (
    <div className="flex w-full items-center justify-center gap-3 sm:gap-4">
      <Nut huong={-1} onClick={() => di(-1)} khoa={khoa} />

      {/* Ảnh chính tự trừ đi 30px để chừa chỗ cho lớp sau thò ra bên phải. 30px
          là x lớn nhất trong LOP_SAU; đổi con số đó thì đổi cả calc ở dưới. */}
      <div className="min-w-0 flex-1" style={{ maxWidth: rongKhung }}>
        <div className="relative w-[calc(100%-30px)]">
          {/* Mấy ảnh kế tiếp nằm sau lưng, thò ra ở cạnh phải. Đây là thứ duy
              nhất cho người xem biết còn ảnh nữa để bấm — không có nó thì tấm
              ảnh đứng một mình, chẳng gợi ý gì. */}
          {Array.from({ length: soLopSau }).map((_, k) => {
            const sau = screens[(i + k + 1) % n];
            const lop = LOP_SAU[k];
            return (
              <div
                key={k}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 origin-right"
                style={{
                  transform: `translateX(${lop.x}px) scale(${lop.scale})`,
                  opacity: lop.opacity,
                }}
              >
                <PhoneShell tiLe={tiLe} nen={nen}>
                  <Anh src={sau.src} alt="" vua={vua} />
                </PhoneShell>
              </div>
            );
          })}

          {/* Máy đứng yên, chỉ ảnh bên trong trượt. overflow-hidden của khung máy
              che phần ảnh còn nằm ngoài, nên ảnh vào ra gọn trong màn hình chứ
              không tràn ra đè lên nút mũi tên. Bóng đổ của khung không bị cắt:
              overflow chỉ cắt con bên trong, không cắt bóng của chính nó. */}
          <div className="relative z-10">
            <PhoneShell tiLe={tiLe} nen={nen}>
              <AnimatePresence initial={false} custom={chieu}>
                <motion.div
                  key={hienTai.src}
                  custom={chieu}
                  className="absolute inset-0"
                  variants={TRUOT}
                  initial="vao"
                  animate="giua"
                  exit="ra"
                  transition={buoc}
                >
                  <Anh src={hienTai.src} alt={hienTai.label || `Màn hình ứng dụng ${project.name}`} vua={vua} />
                </motion.div>
              </AnimatePresence>
            </PhoneShell>
          </div>
        </div>

        {/* Vạch đếm thay cho dòng chữ "1/4". Nó nói luôn hai điều mà con số
            không nói được: có tất cả mấy ảnh, và đang đứng ở ảnh thứ mấy. Bấm
            thẳng vào một vạch là nhảy tới đúng ảnh đó, và ảnh vẫn trượt đúng
            chiều: bấm vạch bên phải thì trượt như bấm nút tiến. */}
        <div className="mt-6 flex w-[calc(100%-30px)] justify-center gap-2">
          {screens.map((s, idx) => (
            <button
              key={s.src}
              type="button"
              onClick={() => toi(idx)}
              disabled={khoa}
              aria-label={`Xem ảnh ${idx + 1} trong ${n}`}
              aria-current={idx === i}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                idx === i ? 'w-8 bg-accent' : 'w-1.5 bg-line-strong hover:bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <Nut huong={1} onClick={() => di(1)} khoa={khoa} />
    </div>
  );
}

/* Khung trình duyệt cho dự án web và plugin. Chưa có ảnh chụp thì mượn thẻ
   OpenGraph của kho mã trên GitHub, hỏng nữa thì rơi về một tấm nền có tên. */
function BrowserFrame({ project, Icon }) {
  const [failed, setFailed] = useState(false);
  const screens = project.screens ?? [];
  const repo = project.repo.split('/').pop();
  const host = project.live
    ? project.live.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : `github.com/FLD-TN/${repo}`;
  const src = screens[0]?.src || `https://opengraph.githubassets.com/1/FLD-TN/${repo}`;
  /* Thẻ OpenGraph của GitHub luôn là 2:1. Ép nó vào khung 16:10 thì bị cắt cụt
     hai bên mất cả tên kho mã, nên khung đổi tỉ lệ theo đúng nguồn ảnh. */
  const tyLe = screens[0] ? 'aspect-[16/10]' : 'aspect-[2/1]';

  return (
    <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-card border border-line-strong bg-surface-2 shadow-[0_34px_70px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-surface px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-[#34383d]" />
        <span className="size-2.5 rounded-full bg-[#34383d]" />
        <span className="size-2.5 rounded-full bg-[#34383d]" />
        <span className="ml-3 truncate font-mono text-[10.5px] text-muted">{host}</span>
      </div>
      {failed ? (
        <div className={`flex ${tyLe} w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-surface-2 to-bg`}>
          <Icon size={34} weight="duotone" className="text-accent" />
          <p className="font-display text-base font-semibold">{project.name}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={`Ảnh xem trước dự án ${project.name}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`${tyLe} w-full object-cover object-top`}
        />
      )}
    </div>
  );
}

function ProjectRow({ project, dao }) {
  const Icon = ICONS[project.icon] ?? GithubLogoIcon;
  const Frame = project.frame === 'phone' ? PhoneDeck : BrowserFrame;

  return (
    <article className="grid items-center gap-10 border-t border-line py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
      {/* order chỉ đảo khi đã đủ rộng để có hai cột. Ở một cột thì chữ luôn
          đứng trước ảnh, vì đọc mới là việc chính. */}
      <div className={dao ? 'lg:order-2' : undefined}>
        <p className="flex flex-wrap items-center gap-x-2.5 font-mono text-[12px] uppercase tracking-[0.06em] text-accent">
          {project.platform}
          <span className="normal-case text-muted">· {project.year}</span>
        </p>

        <h3 className="font-display mt-3 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.03em]">
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {project.name}
          </a>
        </h3>

        {/* Câu trả lời cho "cái này là cái gì". Với người quét trang trong hai
            mươi giây thì đây là dòng duy nhất họ đọc, nên để cỡ lớn hơn thân. */}
        <p className="mt-4 text-[18px] leading-snug text-ink">{project.tagline}</p>

        <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted">{project.body}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <li key={t} className="rounded-full bg-surface-2 px-3 py-1 font-mono text-[11.5px] text-muted">
              {t}
            </li>
          ))}
        </ul>

        {/* Viền bo tròn cho hai liên kết này trông ra cái bấm được. Chữ trơn
            nằm lẫn giữa các dòng chữ khác thì người xem đọc nó như một cái nhãn
            rồi bỏ qua — mà đây lại là hai chỗ duy nhất dẫn ra khỏi trang. */}
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[14px] text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <GithubLogoIcon size={16} weight="fill" />
            Mã nguồn
          </a>
          {project.live && (
            /* Trang chạy thật là thứ đáng bấm nhất, nên nút này tô đặc màu nhấn
               để nổi hơn nút mã nguồn ngay cạnh. */
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[14px] font-medium text-bg transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ArrowSquareOutIcon size={16} weight="bold" />
              Truy cập
            </a>
          )}
        </div>
      </div>

      <div className={dao ? 'lg:order-1' : undefined}>
        <Frame project={project} Icon={Icon} />
      </div>
    </article>
  );
}

export default function Work() {
  return (
    <section id="du-an" className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading className="max-w-[16ch]">Dự án cá nhân</SectionHeading>
      </div>

      <div className="flex flex-col gap-20">
        {projectGroups.map((group) => (
          <div key={group.id}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink">{group.label}</h3>
              <span className="font-mono text-[12px] text-muted">{group.projects.length} dự án</span>
              {group.blurb && (
                <p className="w-full text-[14px] text-muted sm:ml-auto sm:w-auto sm:max-w-[46ch]">
                  {group.blurb}
                </p>
              )}
            </div>

            {group.projects.map((p, i) => (
              <ProjectRow key={p.id} project={p} dao={i % 2 === 1} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
