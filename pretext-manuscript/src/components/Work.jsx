import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { projects } from '../data.js';
import { SectionHeading, Reveal } from './ui.jsx';

/* Khung điện thoại dựng bằng CSS, ảnh thật nằm bên trong. Đây không phải giao
   diện giả ghép từ thẻ div: nó là khung máy, phần nội dung là ảnh. */
function PhoneFrame({ seed, tilt }) {
  return (
    <div
      className="relative mx-auto aspect-[9/19] w-[190px] shrink-0 rounded-[34px] border border-line-strong bg-surface-2 p-[7px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] sm:w-[215px] lg:w-[240px]"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="absolute top-[7px] left-1/2 z-10 h-[18px] w-[74px] -translate-x-1/2 rounded-b-[11px] bg-surface-2" />
      <div className="relative h-full w-full overflow-hidden rounded-[27px] bg-bg">
        {/* TODO: thay bằng ảnh chụp màn hình thật của ứng dụng.
            Ảnh tạm được khử màu và phủ sắc xanh để nó đọc như một mảng chất
            liệu trong bảng màu, không giả vờ là ảnh chụp giao diện thật. */}
        <img
          src={`https://picsum.photos/seed/${seed}/540/1140`}
          alt=""
          width={540}
          height={1140}
          loading="lazy"
          className="h-full w-full object-cover grayscale contrast-125 brightness-[0.55]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,222,128,0.28)_0%,rgba(74,222,128,0.06)_45%,rgba(8,9,10,0.8)_100%)]" />
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 84px', 'end 200px'],
  });

  // Thẻ phía dưới thu nhỏ và mờ đi khi thẻ kế tiếp trượt lên đè lên nó
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.28]);

  return (
    <div ref={ref} className="sticky top-[84px] pb-6" style={{ paddingTop: `${index * 14}px` }}>
      <motion.article
        style={reduce ? undefined : { scale, opacity }}
        className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-card border border-line bg-surface px-6 py-10 sm:px-10 md:grid-cols-[1fr_auto] md:gap-12 md:px-14 md:py-14"
      >
        <div>
          <div className="flex items-center gap-3 font-mono text-[12px] text-muted">
            <span className="rounded-full border border-line-strong px-3 py-1">{project.platform}</span>
            <span>{project.year}</span>
          </div>

          <h3 className="font-display mt-6 text-[clamp(2rem,5vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
            {project.name}
          </h3>
          <p className="mt-3 text-lg text-ink/90">{project.tagline}</p>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted">{project.body}</p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li
                key={t}
                className="rounded-full bg-surface-2 px-3.5 py-1.5 font-mono text-[11.5px] text-muted"
              >
                {t}
              </li>
            ))}
          </ul>

          {/* TODO: điền link thật tới trang ứng dụng */}
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-1.5 border-b border-accent/40 pb-0.5 text-[15px] text-accent transition-colors hover:border-accent"
          >
            Xem chi tiết
            <ArrowUpRightIcon size={16} weight="bold" />
          </a>
        </div>

        <PhoneFrame seed={project.seed} tilt={project.accentTilt} />
      </motion.article>
    </div>
  );
}

export default function Work() {
  return (
    <section id="du-an" className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
        <SectionHeading className="max-w-[16ch]">Ứng dụng đã làm</SectionHeading>
        <Reveal delay={0.1}>
          <p className="max-w-[34ch] text-[15px] text-muted">
            Ba sản phẩm, ba nền tảng. Mỗi cái giải một bài toán hẹp thay vì làm tất cả mọi thứ.
          </p>
        </Reveal>
      </div>

      <div className="relative">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}
