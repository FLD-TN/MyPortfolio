import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CameraIcon,
  ChatCircleIcon,
  GearIcon,
  MapPinIcon,
  MusicNotesIcon,
  TimerIcon,
  XIcon,
} from '@phosphor-icons/react';

/* Màn hình chính bấm được. Biểu tượng và ô ứng dụng dùng chung layoutId nên
   Motion tự nội suy giữa hai hình dạng: đúng kiểu chuyển cảnh mở ứng dụng của
   hệ điều hành di động, chứ không phải một hộp mờ dần hiện ra. */
const APPS = [
  { id: 'ban-do', label: 'Bản đồ', Icon: MapPinIcon, body: 'Ghim một nơi chốn, kèm ảnh và ghi chú. Bản đồ tải sẵn nên vào hang cũng mở được.' },
  { id: 'gio', label: 'Giờ', Icon: TimerIcon, body: 'Đếm ngược chạy dưới nền, vẫn đúng giờ khi bạn khoá máy hoặc chuyển ứng dụng.' },
  { id: 'anh', label: 'Ảnh', Icon: CameraIcon, body: 'Xử lý ảnh ngay trên máy. Không có tấm nào rời khỏi thiết bị nếu bạn không bấm gửi.' },
  { id: 'nhac', label: 'Nhạc', Icon: MusicNotesIcon, body: 'Phát nhạc liền mạch qua tai nghe, tự hạ âm lượng khi có thông báo.' },
  { id: 'tin', label: 'Tin nhắn', Icon: ChatCircleIcon, body: 'Tin soạn khi mất mạng được xếp hàng, tự gửi lại ngay lúc có sóng.' },
  { id: 'cai-dat', label: 'Cài đặt', Icon: GearIcon, body: 'Mọi quyền truy cập đều hỏi đúng lúc cần, kèm câu giải thích vì sao cần.' },
];

const SPRING = { type: 'spring', stiffness: 320, damping: 32, mass: 0.8 };

export default function HomeScreenToy() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(null);
  const app = APPS.find((a) => a.id === open);

  function launch(id) {
    setOpen(id);
    // Phản hồi rung trên máy có hỗ trợ. Không có thì bỏ qua, không báo lỗi.
    if (!reduce && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center py-7">
      <div className="relative aspect-[9/18.5] w-[210px] overflow-hidden rounded-[38px] border border-line-strong bg-surface-2 p-3 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(74,222,128,0.14),transparent_60%)]" />

        {/* Thanh trạng thái */}
        <div className="relative flex items-center justify-between px-2 pt-1 pb-3 font-mono text-[10px] text-muted">
          <span>12:04</span>
          <span className="h-[3px] w-9 rounded-full bg-ink/25" />
          <span>100%</span>
        </div>

        {/* Lưới ứng dụng */}
        <div className="relative grid grid-cols-3 gap-x-3 gap-y-4 px-1">
          {APPS.map(({ id, label, Icon }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => launch(id)}
              whileTap={reduce ? undefined : { scale: 0.88 }}
              transition={SPRING}
              className="flex flex-col items-center gap-1.5 rounded-input py-1"
              aria-label={`Mở ${label}`}
            >
              <motion.span
                layoutId={reduce ? undefined : `app-${id}`}
                transition={SPRING}
                className="flex size-12 items-center justify-center rounded-[15px] border border-line-strong bg-bg"
              >
                <Icon size={22} weight="duotone" color="#4ade80" />
              </motion.span>
              <span className="text-[10px] text-muted">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Ứng dụng đang mở */}
        <AnimatePresence>
          {app && (
            <motion.div
              key={app.id}
              layoutId={reduce ? undefined : `app-${app.id}`}
              transition={SPRING}
              initial={reduce ? { opacity: 0 } : false}
              animate={reduce ? { opacity: 1 } : undefined}
              exit={reduce ? { opacity: 0 } : undefined}
              className="absolute inset-2 z-20 flex flex-col rounded-[30px] border border-line-strong bg-bg p-5"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.3 }}
                className="flex h-full flex-col"
              >
                <div className="flex items-start justify-between">
                  <app.Icon size={30} weight="duotone" color="#4ade80" />
                  <button
                    type="button"
                    onClick={() => setOpen(null)}
                    aria-label="Đóng"
                    className="rounded-full border border-line-strong p-1.5 text-muted transition-colors hover:text-ink"
                  >
                    <XIcon size={13} weight="bold" />
                  </button>
                </div>
                <h4 className="font-display mt-5 text-xl font-semibold tracking-[-0.02em]">{app.label}</h4>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">{app.body}</p>
                <span className="mt-auto h-[4px] w-20 self-center rounded-full bg-ink/25" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
