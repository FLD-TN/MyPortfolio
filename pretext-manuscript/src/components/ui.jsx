import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

/* Hiện dần khi cuộn tới.
 *
 * Trạng thái do một IntersectionObserver tự viết quyết định, không dùng
 * whileInView, vì hai lý do:
 *
 * 1. `threshold: 0` nghĩa là chỉ cần hé vào khung nhìn là hiện. Ngưỡng theo
 *    phần trăm (amount) là một cái bẫy: khối nào cao hơn màn hình thì trên máy
 *    nhỏ không bao giờ đạt đủ phần trăm, và nó nằm ẩn vĩnh viễn.
 * 2. Có `data-shown` để kiểm thử được trạng thái thật, tách khỏi việc hoạt ảnh
 *    đã chạy xong hay chưa.
 *
 * Kèm lưới an toàn: nếu sau 4 giây phần tử đã nằm trong hoặc trên khung nhìn mà
 * vẫn chưa được bật, bật thẳng. Nội dung không bao giờ được phép ẩn vĩnh viễn
 * chỉ vì một hiệu ứng trang trí không chạy.
 *
 * Phần chuyển động do CSS lo, không do thư viện hoạt ảnh (xem index.css). Trạng
 * thái ẩn ban đầu chỉ áp dụng khi JS đã chạy, nhờ cờ data-js trên thẻ html: nếu
 * kịch bản hỏng hoặc không tải được, trang vẫn hiện đầy đủ nội dung.
 */
export function Reveal({ children, delay = 0, y = 22, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShown(true);
    };

    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && reveal(),
      { threshold: 0, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);

    const safety = setTimeout(() => {
      if (el.getBoundingClientRect().top < window.innerHeight) reveal();
    }, 4000);

    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-shown={shown ? 'true' : 'false'}
      className={className}
      style={{ '--reveal-y': `${y}px`, '--reveal-delay': `${Math.round(delay * 1000)}ms` }}
    >
      {children}
    </Tag>
  );
}

/* Nút chính. Hình dạng theo khoá đã đặt: nút luôn bo tròn hết. */
export function Button({ href, children, variant = 'solid', className = '', ...rest }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium leading-none whitespace-nowrap transition-colors duration-200 active:scale-[0.98]';
  const styles = {
    solid: 'bg-accent text-bg hover:bg-accent-dim',
    ghost: 'border border-line-strong text-ink hover:border-accent hover:text-accent',
  };
  return (
    <a href={href} className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}

/* Nút bị con trỏ hút nhẹ. Toàn bộ chạy trên motion value, không đụng vào state
   của React, nên không render lại cây component theo từng khung hình. */
export function MagneticButton({ href, children, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.35 });

  function onMove(e) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.36);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`inline-flex items-center gap-3 rounded-full bg-accent px-9 py-5 text-lg font-medium leading-none whitespace-nowrap text-bg ${className}`}
    >
      {children}
    </motion.a>
  );
}

export function SectionHeading({ children, className = '' }) {
  return (
    <Reveal as="h2" className={`font-display text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] ${className}`}>
      {children}
    </Reveal>
  );
}

export function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 md:py-32 lg:px-12 lg:py-40 ${className}`}>
      {children}
    </section>
  );
}
