import { ArrowUpRightIcon, GithubLogoIcon, LinkedinLogoIcon } from '@phosphor-icons/react';
import { profile } from '../data.js';
import { Reveal, MagneticButton } from './ui.jsx';

export default function Contact() {
  return (
    <section id="lien-he" className="relative overflow-hidden border-t border-line">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-50" />
      <div className="accent-bloom bottom-[-30%] left-1/2 h-[560px] w-[560px] -translate-x-1/2" />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 py-28 sm:px-8 md:py-40 lg:px-12">
        <Reveal>
          <p className="font-mono text-[12px] tracking-[0.16em] text-accent uppercase">Còn nhận việc</p>
        </Reveal>

        <Reveal as="h2" delay={0.06} className="font-display mt-6 max-w-[15ch] text-[clamp(2.4rem,7vw,5rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
          Có ứng dụng cần làm cho tử tế?
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-7 max-w-[46ch] text-[15px] leading-relaxed text-muted sm:text-base">
            Gửi cho tôi vài dòng về sản phẩm và nền tảng bạn nhắm tới. Tôi trả lời trong vòng hai ngày làm việc.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-6">
            {/* TODO: điền email thật vào profile.email trong src/data.js */}
            <MagneticButton href={profile.email ? `mailto:${profile.email}` : '#lien-he'}>
              Gửi email
              <ArrowUpRightIcon size={20} weight="bold" />
            </MagneticButton>

            <div className="flex items-center gap-5">
              <a
                href={profile.github}
                aria-label="GitHub"
                className="text-muted transition-colors hover:text-accent"
              >
                <GithubLogoIcon size={26} weight="fill" />
              </a>
              <a
                href={profile.linkedin}
                aria-label="LinkedIn"
                className="text-muted transition-colors hover:text-accent"
              >
                <LinkedinLogoIcon size={26} weight="fill" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
