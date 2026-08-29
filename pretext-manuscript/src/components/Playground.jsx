import { SectionHeading, Reveal } from './ui.jsx';
import ManuscriptToy from '../toys/ManuscriptToy.jsx';
import HomeScreenToy from '../toys/HomeScreenToy.jsx';

export default function Playground() {
  return (
    <section id="san-choi" className="relative mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="accent-bloom top-1/4 left-1/2 h-[420px] w-[420px] -translate-x-1/2 opacity-40" />

      <div className="relative mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
        <SectionHeading className="max-w-[14ch]">Sân chơi</SectionHeading>
        <Reveal delay={0.1}>
          <p className="max-w-[36ch] text-[15px] text-muted">
            Hai thứ bấm được. Không có gì để bán ở đây, chỉ là chỗ tôi thử ý tưởng về cảm giác chạm.
          </p>
        </Reveal>
      </div>

      {/* Bento hai ô, đúng bằng số nội dung đang có */}
      <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Mỗi thẻ là một cột co giãn, phần đồ chơi chiếm chỗ còn lại. Khung
            chứa đồ chơi có chiều cao xác định để nội dung bên trong không bao
            giờ tự đẩy chiều cao của chính khung. */}
        <Reveal className="flex flex-col overflow-hidden rounded-card border border-line bg-surface">
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
            <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">Chữ né tay bạn</h3>
            <span className="font-mono text-[11px] text-muted">Canvas 2D</span>
          </div>
          <div className="relative min-h-[420px] flex-1">
            <ManuscriptToy />
          </div>
        </Reveal>

        <Reveal delay={0.12} className="flex flex-col overflow-hidden rounded-card border border-line bg-surface">
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
            <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">Bấm thử một ứng dụng</h3>
            <span className="font-mono text-[11px] text-muted">Shared element</span>
          </div>
          <div className="relative min-h-[420px] flex-1">
            <HomeScreenToy />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
