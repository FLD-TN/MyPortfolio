import { useCallback, useEffect, useRef, useState, Suspense, lazy } from 'react';
import { motion, useScroll, useReducedMotion } from 'motion/react';
import {
  ArrowRightIcon,
  EnvelopeSimpleIcon,
  HandGrabbingIcon,
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeakerHighIcon,
  CircleNotchIcon,
} from '@phosphor-icons/react';
import { profile } from '../data.js';
import { AudioPlayer } from '../audio/audioPlayer.js';
import { hitTest, BARS } from '../three/musicScreen.js';
import { Button } from './ui.jsx';

const PhoneScene = lazy(() => import('../three/PhoneScene.jsx'));

const EASE = [0.16, 1, 0.3, 1];
const TAP_SLOP = 8; // px di chuyển tối đa để vẫn tính là một cú chạm chứ không phải kéo

export default function Hero() {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const scrollRef = useRef(0);
  const [sceneActive, setSceneActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Trình phát sống trong một ref: nó tự giữ trạng thái và đồng hồ riêng, đưa
     vào state React là render lại cả cây mỗi nhịp nhạc. React chỉ nhận những
     thay đổi rời rạc qua onChange để vẽ lại bộ điều khiển HTML. */
  const playerRef = useRef(null);
  if (playerRef.current === null && typeof window !== 'undefined') {
    playerRef.current = new AudioPlayer();
  }
  const [ui, setUi] = useState({
    playing: false,
    loading: false,
    index: 0,
    volume: 0.7,
    error: null,
    total: 0,
  });

  const spinRef = useRef({ dragging: false, offsetX: 0, offsetY: 0, velX: 0, velY: 0 });
  const dragRef = useRef({ id: null, x: 0, y: 0, moved: 0 });
  const pendingHit = useRef(null);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end start'],
  });

  useEffect(() => scrollYProgress.on('change', (v) => (scrollRef.current = v)), [scrollYProgress]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.onChange = () =>
      setUi({
        playing: player.playing,
        loading: player.loading,
        index: player.index,
        volume: player.volume,
        error: player.error,
        total: player.tracks.length,
      });
    /* Chỉ dừng phát, KHÔNG gọi dispose ở đây. Trong StrictMode, React gắn rồi
       tháo rồi gắn lại effect ngay khi khởi động; dispose sẽ xoá audio.src của
       chính thực thể đang dùng và bài đầu tiên vĩnh viễn không tải được, cho tới
       khi người dùng bấm chuyển bài. */
    return () => {
      player.onChange = null;
      player.pause();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSceneActive(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cuộn qua khỏi hero thì tạm dừng nhạc: không ai muốn nhạc đuổi theo suốt trang
  useEffect(() => {
    if (!sceneActive) playerRef.current?.pause();
  }, [sceneActive]);

  const buzz = () => {
    if (!reduce && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
  };

  /* Mặt phẳng màn hình trong không gian 3D trả về toạ độ điểm chạm ngay lúc
     nhấn, nhưng chưa hành động vội: phải đợi lúc nhả mới biết đó là cú chạm hay
     là một cú kéo để xoay máy. */
  const handleScreenHit = useCallback((pt) => {
    pendingHit.current = { ...pt, name: hitTest(pt.x, pt.y) };
  }, []);

  const applyHit = useCallback((hit) => {
    const p = playerRef.current;
    if (!p || !hit?.name) return;
    switch (hit.name) {
      case 'toggle':
      case 'art':
        p.toggle();
        buzz();
        break;
      case 'next':
        p.next();
        buzz();
        break;
      case 'prev':
        p.prev();
        buzz();
        break;
      case 'progress':
        p.seek((hit.x - BARS.progress.x) / BARS.progress.w);
        break;
      case 'volume':
        p.setVolume((hit.x - BARS.volume.x) / BARS.volume.w);
        break;
      default:
        break;
    }
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (reduce) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* không bắt được thì vẫn kéo bình thường trong khung */
      }
      dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
      const s = spinRef.current;
      s.dragging = true;
      s.velX = 0;
      s.velY = 0;
    },
    [reduce]
  );

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    const s = spinRef.current;
    if (!s.dragging || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    s.offsetY += dx * 0.008;
    s.offsetX += dy * 0.005;
    s.velY = dx * 0.008;
    s.velX = dy * 0.005;
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      const d = dragRef.current;
      if (d.id !== e.pointerId) return;
      spinRef.current.dragging = false;
      d.id = null;
      const hit = pendingHit.current;
      pendingHit.current = null;
      if (d.moved < TAP_SLOP) applyHit(hit);
    },
    [applyHit]
  );

  const line = {
    hidden: { opacity: 0, y: '55%' },
    show: (i) => ({
      opacity: 1,
      y: '0%',
      transition: { duration: 0.9, delay: 0.15 + i * 0.11, ease: EASE },
    }),
  };

  const player = playerRef.current;
  const track = player?.track;

  return (
    <section ref={wrapRef} id="top" className="relative min-h-[100dvh] w-full overflow-hidden pt-24 sm:pt-28">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-60" />
      <div className="accent-bloom top-[-8%] right-[-6%] h-[520px] w-[520px]" />
      <div className="accent-bloom bottom-[6%] left-[-12%] h-[380px] w-[380px] opacity-60" />

      <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-6 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-4 lg:px-12">
        <div className="relative z-10 order-2 pb-16 lg:order-1 lg:pb-0">
          <h1 className="font-display text-[clamp(2.6rem,7.4vw,5.4rem)] leading-[0.98] font-semibold tracking-[-0.035em]">
            {profile.headline.map((tx, i) => (
              <span key={tx} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  custom={i}
                  variants={line}
                  initial={reduce ? 'show' : 'hidden'}
                  animate="show"
                >
                  {i === profile.headline.length - 1 ? (
                    <>
                      {tx.replace(/\.$/, '')}
                      <span className="text-accent">.</span>
                    </>
                  ) : (
                    tx
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-7 max-w-[46ch] text-[15px] leading-relaxed text-muted sm:text-base"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
          >
            {profile.blurb}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68, ease: EASE }}
          >
            {/* Mở tab mới: đọc CV xong đóng tab là portfolio vẫn còn nguyên
                phía sau. Cùng tab thì phần lớn người ta không bấm quay lại. */}
            <Button href={profile.cv} target="_blank" rel="noreferrer">
              My Resume
              <ArrowRightIcon size={18} weight="bold" />
            </Button>
            <Button href="#lien-he" variant="ghost">
              <EnvelopeSimpleIcon size={18} weight="bold" />
              Liên hệ
            </Button>
          </motion.div>
        </div>

        {/* Sân khấu 3D. touch-action: pan-y để trên điện thoại vuốt dọc vẫn cuộn
            được trang, còn kéo ngang thì xoay máy. */}
        <div className="order-1 flex flex-col lg:order-2">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: 'pan-y' }}
            className={`relative h-[42vh] min-h-[300px] w-full select-none lg:h-[64vh] lg:min-h-[480px] ${
              reduce ? '' : 'cursor-grab active:cursor-grabbing'
            }`}
          >
            {mounted && (
              <Suspense fallback={null}>
                <PhoneScene
                  scrollRef={scrollRef}
                  spinRef={spinRef}
                  playerRef={playerRef}
                  onScreenHit={handleScreenHit}
                  reduceMotion={!!reduce}
                  active={sceneActive}
                />
              </Suspense>
            )}
          </div>

          {/* Bộ điều khiển HTML. Bấm thẳng lên màn hình 3D là phần thú vị, nhưng
              một mặt phẳng trong WebGL thì bàn phím và trình đọc màn hình không
              với tới được, nên các nút thật vẫn phải có ở đây. */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-1">
            <div className="min-w-0">
              <p className="font-display truncate text-sm font-semibold">
                {track ? track.title : 'Chưa có bài nào'}
              </p>
              <p className="truncate font-mono text-[11px] text-muted">
                {ui.error
                  ? `Không tải được ${ui.error}`
                  : ui.loading
                    ? 'Đang tải nhạc…'
                    : track
                      ? `${track.artist} · bài ${ui.index + 1}/${ui.total}`
                      : 'Thêm tệp vào public/music/'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => playerRef.current?.prev()}
                aria-label="Bài trước"
                className="text-muted transition-colors hover:text-ink"
              >
                <SkipBackIcon size={20} weight="fill" />
              </button>
              <button
                type="button"
                onClick={() => playerRef.current?.toggle()}
                aria-label={ui.loading ? 'Đang tải nhạc' : ui.playing ? 'Tạm dừng' : 'Phát nhạc'}
                aria-pressed={ui.playing}
                aria-busy={ui.loading || undefined}
                className="flex size-10 items-center justify-center rounded-full bg-accent text-bg transition-transform active:scale-95"
              >
                {ui.loading ? (
                  <CircleNotchIcon size={18} weight="bold" className="animate-spin" />
                ) : ui.playing ? (
                  <PauseIcon size={18} weight="fill" />
                ) : (
                  <PlayIcon size={18} weight="fill" />
                )}
              </button>
              <button
                type="button"
                onClick={() => playerRef.current?.next()}
                aria-label="Bài sau"
                className="text-muted transition-colors hover:text-ink"
              >
                <SkipForwardIcon size={20} weight="fill" />
              </button>

              <label className="ml-1 flex items-center gap-2">
                <SpeakerHighIcon size={16} weight="fill" className="text-muted" />
                <span className="sr-only">Âm lượng</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(ui.volume * 100)}
                  onChange={(e) => playerRef.current?.setVolume(Number(e.target.value) / 100)}
                  className="h-1 w-20 cursor-pointer accent-accent"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
