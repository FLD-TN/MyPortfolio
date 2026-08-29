import { HandTapIcon, GaugeIcon, WifiSlashIcon, BatteryChargingIcon } from '@phosphor-icons/react';
import { craft } from '../data.js';
import { SectionHeading, Reveal } from './ui.jsx';

const ICONS = {
  hand: HandTapIcon,
  gauge: GaugeIcon,
  wifi: WifiSlashIcon,
  battery: BatteryChargingIcon,
};

export default function Craft() {
  return (
    <section id="cach-lam" className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <SectionHeading className="max-w-[12ch]">Bốn thứ tôi không bỏ qua</SectionHeading>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed text-muted">
              Đây là những chỗ ứng dụng di động hay hỏng, và cũng là chỗ người dùng nhận ra ngay
              khi có ai đó chịu khó làm cho tử tế.
            </p>
          </Reveal>
        </div>

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
          {craft.map((item, i) => {
            const Icon = ICONS[item.icon];
            return (
              <Reveal as="li" key={item.title} delay={i * 0.08} className="bg-surface p-7 md:p-9">
                <Icon size={26} weight="duotone" color="#4ade80" />
                <h3 className="font-display mt-5 text-lg leading-snug font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{item.body}</p>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
