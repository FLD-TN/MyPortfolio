import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { ArrowUpRightIcon, ArrowSquareOutIcon, GithubLogoIcon, PlusIcon } from '@phosphor-icons/react';
import { projectGroups } from '../data.js';
import { SectionHeading, Reveal } from './ui.jsx';

/* Mục lục dự án.

   Tên dự án là những hàng chữ lớn xếp chồng, ngăn nhau bằng một nét mảnh. Rê
   chuột lên hàng nào thì ảnh xem trước của dự án đó bay theo con trỏ, và các
   hàng còn lại mờ đi. Bấm thì hàng tự mở ra ngay tại chỗ.

   Vì sao mở tại chỗ chứ không bật hộp thoại: toàn bộ chữ mô tả luôn nằm trong
   HTML, nên bộ máy tìm kiếm đọc được và người dùng bấm Ctrl+F vẫn tìm ra. Hộp
   thoại thì chữ chỉ xuất hiện sau khi bấm.

   Ảnh bay theo con trỏ chỉ bật khi thiết bị thật sự có con trỏ. Trên cảm ứng
   không có trạng thái rê chuột, hiện nó ra chỉ tổ vướng. */

function useHasPointer() {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setHas(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return has;
}

/* Tấm ảnh bám theo con trỏ. Toạ độ chạy trên motion value, không qua state của
   React, nên di chuột không làm render lại cây component. */
function CursorPreview({ project, active, isOpen }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const placed = useRef(false);
  // Nghiêng theo tốc độ đưa ngang, cho tấm ảnh có quán tính chứ không cứng đờ
  const tilt = useTransform(sx, (v) => {
    const d = v - x.get();
    return Math.max(-14, Math.min(14, d * 0.12));
  });

  useEffect(() => {
    const move = (e) => {
      const nx = e.clientX + 28;
      const ny = e.clientY - 110;
      x.set(nx);
      y.set(ny);
      /* Lần đầu thì đặt thẳng, không cho lò xo chạy. Thiếu bước này tấm ảnh sẽ
         bay từ góc trên bên trái màn hình vào, trông như lỗi. */
      if (!placed.current) {
        placed.current = true;
        sx.jump(nx);
        sy.jump(ny);
      }
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [x, y, sx, sy]);

  const repo = project?.repo.split('/').pop();

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy, rotate: tilt }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.9 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed top-0 left-0 z-40 hidden w-[320px] overflow-hidden rounded-card border border-line-strong bg-surface-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] lg:block"
    >
      {repo && (
        <img
          src={`https://opengraph.githubassets.com/1/FLD-TN/${repo}`}
          alt=""
          className="aspect-[2/1] w-full object-cover"
        />
      )}
      {/* Nói thẳng ra việc cần làm. Người dùng không phải đoán hàng chữ này có
          bấm được hay không. */}
      <p className="flex items-center gap-1.5 bg-accent px-4 py-2 font-mono text-[11px] font-medium text-bg">
        {isOpen ? 'Bấm để đóng lại' : 'Bấm để xem chi tiết'}
        <ArrowUpRightIcon size={12} weight="bold" />
      </p>
    </motion.div>
  );
}

function ProjectRow({ project, open, onToggle, onHover, dimmed, reduce }) {
  return (
    <div
      className="border-t border-line"
      onMouseEnter={() => onHover(project.id)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        onClick={() => onToggle(project.id)}
        aria-expanded={open}
        aria-controls={`row-${project.id}`}
        className={`group flex w-full cursor-pointer items-center justify-between gap-6 py-7 text-left transition-opacity duration-300 md:py-9 ${
          dimmed ? 'opacity-35' : 'opacity-100'
        }`}
      >
        <span className="flex min-w-0 items-baseline gap-4 md:gap-7">
          <motion.span
            animate={reduce ? undefined : { x: open ? 14 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`font-display truncate text-[clamp(1.75rem,5.2vw,3.6rem)] leading-[1.05] font-semibold tracking-[-0.035em] transition-colors duration-300 ${
              open ? 'text-accent' : 'group-hover:text-accent'
            }`}
          >
            {project.name}
            {/* Gạch chân chạy từ trái sang khi rê vào, thêm một dấu hiệu nữa cho
                người dùng chuột lẫn người dùng bàn phím khi hàng được focus. */}
            <span
              className={`mt-1 block h-[2px] origin-left bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100'
              }`}
            />
          </motion.span>
        </span>

        <span className="flex shrink-0 items-center gap-4 md:gap-8">
          <span className="hidden font-mono text-[12px] text-muted sm:block">{project.platform}</span>
          <span className="font-mono text-[12px] text-muted">{project.year}</span>
          <motion.span
            animate={reduce ? undefined : { rotate: open ? 135 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
              open ? 'border-accent text-accent' : 'border-line-strong text-muted group-hover:border-accent group-hover:text-accent'
            }`}
          >
            <PlusIcon size={16} weight="bold" />
          </motion.span>
        </span>
      </button>

      {/* Mở ra bằng lưới 0fr sang 1fr: trình duyệt tự nội suy chiều cao, không
          phải đo bằng JavaScript rồi gán pixel. Con bên trong bắt buộc phải có
          overflow hidden và min-height 0, thiếu là nó không chịu co lại. */}
      <div
        id={`row-${project.id}`}
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          // Giảm chuyển động thì mở ra tức thì, không bắt chờ nửa giây
          transitionDuration: reduce ? '0ms' : undefined,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid grid-cols-1 gap-8 pb-10 md:grid-cols-[1fr_340px] md:gap-12">
            <div>
              <p className="text-lg text-ink/90">{project.tagline}</p>
              <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-muted">{project.body}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
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

            <RepoCard project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RepoCard({ project }) {
  const [failed, setFailed] = useState(false);
  const repo = project.repo.split('/').pop();
  return (
    <a
      href={project.repo}
      target="_blank"
      rel="noreferrer"
      className="group block h-fit overflow-hidden rounded-card border border-line bg-surface-2"
    >
      {failed ? (
        <div className="flex aspect-[2/1] w-full flex-col items-center justify-center gap-2 bg-surface px-6 text-center">
          <GithubLogoIcon size={30} weight="fill" className="text-muted" />
          <p className="font-display text-base font-semibold">{project.name}</p>
        </div>
      ) : (
        <img
          src={`https://opengraph.githubassets.com/1/FLD-TN/${repo}`}
          alt={`Thẻ kho mã ${project.name} trên GitHub`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="aspect-[2/1] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      )}
      <p className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-muted">
        github.com/FLD-TN/{repo}
      </p>
    </a>
  );
}

export default function Work() {
  const reduce = useReducedMotion();
  const hasPointer = useHasPointer();
  const [tab, setTab] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [hoverId, setHoverId] = useState(null);

  const group = projectGroups[tab];
  const hovered = group.projects.find((p) => p.id === hoverId) ?? null;
  const showPreview = hasPointer && !reduce && Boolean(hovered);

  const switchTab = (i) => {
    setTab(i);
    setOpenId(null);
    setHoverId(null);
  };

  return (
    <section id="du-an" className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading className="max-w-[16ch]">Dự án cá nhân</SectionHeading>
        <Reveal delay={0.1}>
          <p className="max-w-[34ch] text-[15px] text-muted">{group.blurb}</p>
        </Reveal>
      </div>

      <Reveal delay={0.15}>
        <div role="tablist" aria-label="Nhóm dự án" className="mb-4 flex flex-wrap gap-1 md:mb-6">
          {projectGroups.map((g, i) => {
            const selected = i === tab;
            return (
              <button
                key={g.id}
                role="tab"
                type="button"
                id={`tab-${g.id}`}
                aria-selected={selected}
                aria-controls={`panel-${g.id}`}
                onClick={() => switchTab(i)}
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

      <div
        id={`panel-${group.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${group.id}`}
        className="border-b border-line"
        onMouseLeave={() => setHoverId(null)}
      >
        {group.projects.map((p) => (
          <ProjectRow
            key={p.id}
            project={p}
            open={openId === p.id}
            onToggle={(id) => setOpenId((cur) => (cur === id ? null : id))}
            onHover={setHoverId}
            dimmed={Boolean(hoverId) && hoverId !== p.id}
            reduce={reduce}
          />
        ))}
      </div>

      <CursorPreview project={hovered} active={showPreview} isOpen={Boolean(hovered) && hovered.id === openId} />
    </section>
  );
}
