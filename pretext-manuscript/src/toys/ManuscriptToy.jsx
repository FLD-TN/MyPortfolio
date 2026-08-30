import { useEffect, useRef } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';
import { useReducedMotion } from 'motion/react';

/* Món đồ chơi này là phần còn lại của bản dựng đầu tiên của trang. Chữ dạt ra
   khỏi con trỏ, và một ống kính đi theo con trỏ lộ ra dòng chữ nằm dưới. */
const TEXT = '"Có một cảnh tượng vĩ đại hơn biển cả, đó là bầu trời; có một cảnh tượng vĩ đại hơn bầu trời, đó là bề trong tâm hồn con người. Viết nên bài thơ về lương tâm con người, dù chỉ là của một con người duy nhất, dù chỉ là của một kẻ ti tiện nhất, cũng là dung hợp mọi anh hùng ca vào một bản anh hùng ca tối cao và tuyệt đích."';
const HIDDEN = 'Chưa tày đâu!';

export default function ManuscriptToy() {
  const reduce = useReducedMotion();
  const hostRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext('2d');
    const state = {
      w: 0,
      h: 0,
      chars: [],
      hidden: [],
      px: -9999,
      py: -9999,
      lensX: -9999,
      lensY: -9999,
      raf: 0,
      running: false,
      font: '',
      lens: 78,
    };

    const css = getComputedStyle(document.documentElement);
    const colors = {
      bg: css.getPropertyValue('--color-surface').trim() || '#101214',
      ink: css.getPropertyValue('--color-ink').trim() || '#f2f3f5',
      accent: css.getPropertyValue('--color-accent').trim() || '#4ade80',
      lens: css.getPropertyValue('--color-surface-2').trim() || '#17191c',
    };

    function layoutLines(prepared, maxW, lineHeight, startX, startY) {
      const out = [];
      const { lines } = layoutWithLines(prepared, maxW, lineHeight);
      lines.forEach((ln, i) => {
        let x = startX;
        const y = startY + i * lineHeight;
        for (const ch of ln.text) {
          const w = ctx.measureText(ch).width;
          out.push({ char: ch, bx: x, by: y, cx: x, cy: y });
          x += w;
        }
      });
      return { chars: out, height: lines.length * lineHeight };
    }

    function build() {
      const rect = host.getBoundingClientRect();
      state.w = rect.width;
      state.h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Chỉ đặt kích thước bộ đệm vẽ. TUYỆT ĐỐI không gán chiều cao CSS cho
      // canvas ở đây: canvas nằm absolute và lấy kích thước từ khung cha, nên
      // gán ngược lại sẽ tạo vòng lặp cha nở ra rồi con nở theo, không dừng.
      canvas.width = Math.round(state.w * dpr);
      canvas.height = Math.round(state.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Chữ to hẳn lên: hiệu ứng né tay chỉ đã mắt khi ký tự đủ lớn để nhìn rõ
      const size = state.w < 420 ? 17 : state.w < 620 ? 21 : 26;
      const lineHeight = Math.round(size * 1.78);
      state.lens = size * 4.4;
      state.font = `${size}px "Geist Variable", ui-sans-serif, system-ui, sans-serif`;
      ctx.font = state.font;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      const pad = 26;
      const maxW = Math.max(180, state.w - pad * 2);
      const main = prepareWithSegments(TEXT, state.font, { whiteSpace: 'normal' });
      const probe = layoutWithLines(main, maxW, lineHeight);
      const startY = Math.max(pad, (state.h - probe.height) / 2);

      state.chars = layoutLines(main, maxW, lineHeight, pad, startY).chars;
      const hid = prepareWithSegments(HIDDEN, state.font, { whiteSpace: 'normal' });
      state.hidden = layoutLines(hid, maxW, lineHeight, pad, startY).chars;
    }

    function paint(interactive) {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, state.w, state.h);
      ctx.font = state.font;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      if (interactive && state.lensX > -1000) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(state.lensX, state.lensY, state.lens, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = colors.lens;
        ctx.fillRect(state.lensX - state.lens, state.lensY - state.lens, state.lens * 2, state.lens * 2);
        ctx.fillStyle = colors.accent;
        for (const c of state.hidden) ctx.fillText(c.char, c.bx, c.by);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(state.lensX, state.lensY, state.lens, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.fillStyle = colors.ink;
      for (const c of state.chars) {
        ctx.fillText(c.char, interactive ? c.cx : c.bx, interactive ? c.cy : c.by);
      }
    }

    function frame() {
      state.lensX += (state.px - state.lensX) * 0.14;
      state.lensY += (state.py - state.lensY) * 0.14;

      for (const c of state.chars) {
        const dx = c.bx - state.lensX;
        const dy = c.by - state.lensY;
        const d = Math.hypot(dx, dy);
        let tx = c.bx;
        let ty = c.by;
        if (d < state.lens && d > 0.01) {
          const f = (1 - d / state.lens) * 56;
          tx += (dx / d) * f;
          ty += (dy / d) * f;
        }
        c.cx += (tx - c.cx) * 0.16;
        c.cy += (ty - c.cy) * 0.16;
      }

      paint(true);
      state.raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduce || state.running) return;
      state.running = true;
      state.raf = requestAnimationFrame(frame);
    }
    function stop() {
      state.running = false;
      cancelAnimationFrame(state.raf);
    }

    function onMove(e) {
      if (reduce) return;
      const r = host.getBoundingClientRect();
      state.px = e.clientX - r.left;
      state.py = e.clientY - r.top;
    }
    function onLeave() {
      state.px = -9999;
      state.py = -9999;
    }

    build();
    paint(false);

    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(host);

    let t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => {
        build();
        if (reduce) paint(false);
      }, 120);
    });
    ro.observe(host);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      clearTimeout(t);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
