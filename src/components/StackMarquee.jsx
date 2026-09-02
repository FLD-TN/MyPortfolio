import { useReducedMotion } from 'motion/react';
import { stack } from '../data.js';

/* Dải chạy ngang duy nhất trên trang. Nó tồn tại để cho thấy bề rộng của bộ
   công cụ mà không phải liệt kê thành danh sách dài. */
export default function StackMarquee() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="border-y border-line py-5">
        <ul className="mx-auto flex max-w-[1240px] flex-wrap justify-center gap-x-7 gap-y-2 px-5 font-mono text-[13px] text-muted">
          {stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-y border-line py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />

      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-10 whitespace-nowrap will-change-transform">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex gap-10" aria-hidden={copy === 1 ? 'true' : undefined}>
            {stack.map((s) => (
              <li key={s} className="flex items-center gap-10 font-mono text-[13px] tracking-wide text-muted">
                {s}
                <span className="size-1 rounded-full bg-accent/50" aria-hidden="true" />
              </li>
            ))}
          </ul>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(-50%,0,0); }
        }
      `}</style>
    </div>
  );
}
