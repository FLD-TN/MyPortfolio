import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useReducedMotion } from 'motion/react';
import { ListIcon, XIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { profile } from '../data.js';

const LINKS = [
  { href: '#du-an', label: 'Home' },
  { href: '#san-choi', label: 'Projects' },
  { href: '#cach-lam', label: 'Game' },
  { href: '#lien-he', label: 'Contact' },
];

const EASE = [0.16, 1, 0.3, 1];

export default function Nav() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => scrollY.on('change', (v) => setSolid(v > 24)), [scrollY]);

  // Khoá cuộn nền và cho phép đóng bằng phím Esc khi tấm menu đang mở
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[68px] transition-colors duration-300 ${
          solid || open ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-2.5 font-mono text-[13px] tracking-[0.04em] whitespace-nowrap">
            <span className="inline-block size-2 rounded-full bg-accent" aria-hidden="true" />
            {profile.name}
          </a>

          {/* Từ md trở lên: một hàng ngang. Dưới đó không đủ chỗ nên chuyển sang tấm menu. */}
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm whitespace-nowrap text-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            className="flex size-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent md:hidden"
          >
            {open ? <XIcon size={18} weight="bold" /> : <ListIcon size={18} weight="bold" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-0 top-[68px] bottom-0 z-40 bg-bg md:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <nav aria-label="Điều hướng trên di động" className="flex flex-col px-5 pt-4">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: EASE }}
                  className="font-display flex items-center justify-between border-b border-line py-5 text-2xl font-semibold tracking-[-0.02em]"
                >
                  {l.label}
                  <ArrowRightIcon size={20} weight="bold" className="text-accent" />
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
