import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowUpRightIcon, ArrowSquareOutIcon, GithubLogoIcon } from '@phosphor-icons/react';
import { projectGroups } from '../data.js';
import { SectionHeading, Reveal } from './ui.jsx';

/* Hai kiểu hình tuỳ theo có ảnh chụp thật hay không.

   Có ảnh chụp màn hình (dọc) thì dựng khung điện thoại, đúng chất một sản phẩm
   di động. Chưa có thì dùng thẻ OpenGraph của chính repo, nhưng thẻ đó là ảnh
   NGANG tỉ lệ 2:1, nhét vào khung máy dọc sẽ teo lại giữa một mảng đen. Nên
   trường hợp này bỏ khung máy, trình bày như một tấm thẻ ngang cho đúng khổ.

   Ảnh nhúng trong README GitHub không dùng được ở đây: chúng là URL có chữ ký
   và trả 403 khi gọi từ tên miền khác. Phải tự chép ảnh vào public/screens/. */
function ProjectMedia({ project, tilt }) {
  const [imgFailed, setImgFailed] = useState(false);

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
      {imgFailed ? (
        /* Ảnh thẻ nằm ở máy chủ GitHub. Không tải được thì phải có thứ tử tế
           thế chỗ, chứ để mặc thì trình duyệt hiện khung vỡ kèm chữ alt. */
        <div className="flex aspect-[2/1] w-full flex-col items-center justify-center gap-2 bg-surface px-6 text-center">
          <GithubLogoIcon size={30} weight="fill" className="text-muted" />
          <p className="font-display text-base font-semibold">{project.name}</p>
        </div>
      ) : (
        <img
          src={`https://opengraph.githubassets.com/1/FLD-TN/${repo}`}
          alt={`Thẻ kho mã ${project.name} trên GitHub`}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="aspect-[2/1] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      )}
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
          <div className="flex flex-wrap items-center gap-3 font-mono text-[12px] text-muted">
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

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border-b border-accent/40 pb-0.5 text-[15px] text-accent transition-colors hover:border-accent"
            >
              Xem mã nguồn
              <ArrowUpRightIcon size={16} weight="bold" />
            </a>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border-b border-line-strong pb-0.5 text-[15px] text-ink transition-colors hover:border-ink"
              >
                Mở trang thật
                <ArrowSquareOutIcon size={16} weight="bold" />
              </a>
            )}
          </div>
        </div>

        <ProjectMedia project={project} tilt={project.accentTilt} />
      </motion.article>
    </div>
  );
}

export default function Work() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const group = projectGroups[active];

  return (
    <section id="du-an" className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading className="max-w-[16ch]">Ứng dụng đã làm</SectionHeading>
        <Reveal delay={0.1}>
          <p className="max-w-[34ch] text-[15px] text-muted">{group.blurb}</p>
        </Reveal>
      </div>

      {/* Nút thật, không phải div bắt sự kiện: bàn phím chuyển tab được ngay.
          Viên thuốc nền của tab đang chọn dùng layoutId nên nó trượt sang tab
          mới, thay vì tắt chỗ này rồi bật chỗ kia. */}
      <Reveal delay={0.15}>
        <div role="tablist" aria-label="Nhóm dự án" className="mb-10 flex flex-wrap gap-1 md:mb-14">
          {projectGroups.map((g, i) => {
            const selected = i === active;
            return (
              <button
                key={g.id}
                role="tab"
                type="button"
                id={`tab-${g.id}`}
                aria-selected={selected}
                aria-controls={`panel-${g.id}`}
                onClick={() => setActive(i)}
                className={`relative rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors ${
                  selected ? 'text-bg' : 'text-muted hover:text-ink'
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId={reduce ? undefined : 'tab-pill'}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-accent"
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">{g.label}</span>
                <span className="relative z-10 ml-2 font-mono text-[11px] opacity-70">
                  {g.projects.length}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* key theo nhóm để React dựng lại cây thẻ khi đổi tab. Mỗi thẻ có một
          useScroll riêng bám vào phần tử của nó; tái dùng cây cũ sẽ để lại giá
          trị cuộn của thẻ trước, làm thẻ mới hiện ra đã mờ sẵn. */}
      <motion.div
        key={group.id}
        id={`panel-${group.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${group.id}`}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {group.projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </motion.div>
    </section>
  );
}
