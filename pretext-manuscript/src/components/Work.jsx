import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { projects } from '../data.js';
import { SectionHeading, Reveal } from './ui.jsx';

/* Hai kiểu hình tuỳ theo có ảnh chụp thật hay không.

   Có ảnh chụp màn hình (dọc) thì dựng khung điện thoại, đúng chất một sản phẩm
   di động. Chưa có thì dùng thẻ OpenGraph của chính repo, nhưng thẻ đó là ảnh
   NGANG tỉ lệ 2:1, nhét vào khung máy dọc sẽ teo lại giữa một mảng đen. Nên
   trường hợp này bỏ khung máy, trình bày như một tấm thẻ ngang cho đúng khổ.

   Ảnh nhúng trong README GitHub không dùng được ở đây: chúng là URL có chữ ký
   và trả 403 khi gọi từ tên miền khác. Phải tự chép ảnh vào public/screens/. */
function ProjectMedia({ project, tilt }) {
  if (project.screenshot) {
    return (
      <div
        className="relative mx-auto aspect-[9/19] w-[190px] shrink-0 rounded-[34px] border border-line-strong bg-surface-2 p-[7px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] sm:w-[215px] lg:w-[240px]"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <div className="absolute top-[7px] left-1/2 z-10 h-[18px] w-[74px] -translate-x-1/2 rounded-b-[11px] bg-surface-2" />
        <div className="relative h-full w-full overflow-hidden rounded-[27px] bg-bg">
          <img
            src={project.screenshot}
            alt={`Ảnh chụp màn hình ${project.name}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    );
  }

  const repo = project.repo.split('/').pop();
  return (
    <a
      href={project.repo}
      target="_blank"
      rel="noreferrer"
      className="group relative block w-full shrink-0 overflow-hidden rounded-card border border-line bg-surface-2 md:w-[320px] lg:w-[380px]"
    >
      <img
        src={`https://opengraph.githubassets.com/1/FLD-TN/${repo}`}
        alt={`Thẻ kho mã ${project.name} trên GitHub`}
        loading="lazy"
        className="aspect-[2/1] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
      <p className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-muted">
        github.com/FLD-TN/{repo}
      </p>
    </a>
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

          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 border-b border-accent/40 pb-0.5 text-[15px] text-accent transition-colors hover:border-accent"
          >
            Xem mã nguồn
            <ArrowUpRightIcon size={16} weight="bold" />
          </a>
        </div>

        <ProjectMedia project={project} tilt={project.accentTilt} />
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
