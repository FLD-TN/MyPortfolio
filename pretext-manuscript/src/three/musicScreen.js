/* =========================================================================
   Màn hình phát nhạc vẽ lên canvas rồi dán làm texture cho khối 3D.

   HITS là các vùng bấm, tính theo đúng lưới toạ độ 420x910 dùng để vẽ. Khi
   người dùng chạm vào mặt phẳng màn hình trong không gian 3D, R3F trả về toạ độ
   UV của điểm chạm; đổi UV sang lưới này là biết bấm trúng nút nào.
   ========================================================================= */

export const TEX_W = 420;
export const TEX_H = 910;

const ACCENT = '#4ade80';
const INK = '#f2f3f5';
const MUTED = 'rgba(242,243,245,0.45)';

const SANS = (size, weight = 400) =>
  `${weight} ${size}px "Geist Variable", ui-sans-serif, system-ui, sans-serif`;

export const HITS = {
  art: { x: 40, y: 92, w: 340, h: 340 },
  progress: { x: 30, y: 548, w: 360, h: 40 },
  prev: { x: 84, y: 638, w: 72, h: 72 },
  toggle: { x: 168, y: 626, w: 84, h: 84 },
  next: { x: 264, y: 638, w: 72, h: 72 },
  volume: { x: 62, y: 764, w: 328, h: 44 },
};

/* Hình học của hai thanh kéo, dùng chung cho lúc vẽ và lúc quy đổi điểm chạm
   thành giá trị. Để hai chỗ tự khai báo số riêng là sớm muộn cũng lệch nhau. */
export const BARS = {
  progress: { x: 40, w: TEX_W - 80 },
  volume: { x: 72, w: TEX_W - 112 },
};

export function hitTest(x, y) {
  for (const [name, r] of Object.entries(HITS)) {
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return name;
  }
  return null;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function text(ctx, str, x, y, { size = 15, weight = 400, color = INK, align = 'left' } = {}) {
  ctx.font = SANS(size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}

function clip(ctx, str, maxW, size, weight) {
  ctx.font = SANS(size, weight);
  if (ctx.measureText(str).width <= maxW) return str;
  let s = str;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}

const mmss = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r < 10 ? '0' : ''}${r}`;
};

function statusBar(ctx) {
  ctx.fillStyle = '#05070a';
  rr(ctx, TEX_W / 2 - 47, 20, 94, 30, 15);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.arc(TEX_W / 2 + 30, 35, 5.5, 0, Math.PI * 2);
  ctx.fill();

  text(ctx, '9:41', 30, 44, { size: 14, weight: 500 });
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i < 3 ? INK : 'rgba(242,243,245,0.3)';
    rr(ctx, TEX_W - 96 + i * 7, 40 - i * 2.5, 4.5, 6 + i * 2.5, 1.5);
  }
  ctx.strokeStyle = 'rgba(242,243,245,0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(TEX_W - 60, 30, 26, 13, 4);
  ctx.stroke();
  ctx.fillStyle = INK;
  rr(ctx, TEX_W - 57.5, 32.5, 18, 8, 2.5);
}

/* Bìa dự phòng khi bài hát không khai báo ảnh: một mảng chuyển sắc suy ra từ
   tên bài, nên mỗi bài có một tấm bìa riêng và ổn định qua các lần tải. */
function fallbackCover(ctx, x, y, w, h, seed) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = n % 360;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, `hsl(${hue} 42% 26%)`);
  g.addColorStop(1, `hsl(${(hue + 48) % 360} 38% 11%)`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, i * 26 + (n % 17), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function albumArt(ctx, img, seed, t, playing, levels) {
  const { x, y, w, h } = HITS.art;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 28);
  ctx.clip();

  if (img && img.complete && img.naturalWidth) {
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    ctx.drawImage(
      img,
      x + (w - img.naturalWidth * s) / 2,
      y + (h - img.naturalHeight * s) / 2,
      img.naturalWidth * s,
      img.naturalHeight * s
    );
  } else {
    fallbackCover(ctx, x, y, w, h, seed || 'nhac');
  }

  const veil = ctx.createLinearGradient(x, y, x, y + h);
  veil.addColorStop(0, 'rgba(8,9,10,0.15)');
  veil.addColorStop(1, 'rgba(8,9,10,0.72)');
  ctx.fillStyle = veil;
  ctx.fillRect(x, y, w, h);

  /* Dải phổ. Có dữ liệu từ AnalyserNode thì vẽ đúng theo nhạc đang phát; không
     có thì rơi về một dao động nhẹ để chỗ này không trông như bị hỏng. */
  const bars = 28;
  const bw = w / bars;
  for (let i = 0; i < bars; i++) {
    let amp;
    if (levels && levels.length) {
      // Bỏ phần tần số rất cao vì gần như luôn im, dồn về dải nghe rõ
      const idx = Math.floor((i / bars) * levels.length * 0.7);
      amp = levels[idx] / 255;
    } else {
      const seedN = Math.sin(i * 12.9898) * 43758.5453;
      const phase = seedN - Math.floor(seedN);
      amp = playing ? 0.18 + (Math.sin(t * 3.1 + phase * 6.28) * 0.5 + 0.5) * 0.7 : 0.1;
    }
    const bh = Math.max(3, amp * 78);
    ctx.fillStyle = `rgba(74,222,128,${playing ? 0.6 : 0.2})`;
    rr(ctx, x + i * bw + 1.5, y + h - bh - 10, bw - 3, bh, 2);
  }
  ctx.restore();
}

function playIcon(ctx, cx, cy, playing) {
  ctx.fillStyle = '#08090a';
  if (playing) {
    rr(ctx, cx - 11, cy - 14, 8, 28, 2.5);
    rr(ctx, cx + 3, cy - 14, 8, 28, 2.5);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 15);
    ctx.lineTo(cx + 15, cy);
    ctx.lineTo(cx - 9, cy + 15);
    ctx.closePath();
    ctx.fill();
  }
}

function skipIcon(ctx, cx, cy, dir) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(dir, 1);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-9, -11);
  ctx.lineTo(5, 0);
  ctx.lineTo(-9, 11);
  ctx.closePath();
  ctx.fill();
  rr(ctx, 7, -11, 4, 22, 2);
  ctx.restore();
}

function speakerIcon(ctx, x, y, muted) {
  ctx.fillStyle = muted ? MUTED : INK;
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x + 6, y - 5);
  ctx.lineTo(x + 13, y - 12);
  ctx.lineTo(x + 13, y + 12);
  ctx.lineTo(x + 6, y + 5);
  ctx.lineTo(x, y + 5);
  ctx.closePath();
  ctx.fill();
  if (!muted) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x + 15, y, 7, -0.9, 0.9);
    ctx.stroke();
  }
}

function background(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, TEX_H);
  g.addColorStop(0, '#101a14');
  g.addColorStop(0.5, '#0a0d0b');
  g.addColorStop(1, '#08090a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
}

/* Chưa khai báo bài nào: nói thẳng phải làm gì, thay vì để một trình phát chết */
function emptyState(ctx) {
  background(ctx);
  statusBar(ctx);
  text(ctx, 'Chưa có bài nào', TEX_W / 2, 420, { size: 26, weight: 600, align: 'center' });
  text(ctx, 'Chép tệp nhạc vào thư mục', TEX_W / 2, 460, { size: 14, color: MUTED, align: 'center' });
  text(ctx, 'public/music/', TEX_W / 2, 486, { size: 15, weight: 600, color: ACCENT, align: 'center' });
  text(ctx, 'rồi khai báo trong src/audio/tracks.js', TEX_W / 2, 514, {
    size: 14, color: MUTED, align: 'center',
  });
  ctx.fillStyle = 'rgba(242,243,245,0.32)';
  rr(ctx, TEX_W / 2 - 62, TEX_H - 16, 124, 5.5, 3);
}

export function drawMusicScreen(ctx, state, t, art) {
  const { track, playing, progress, volume, duration, elapsed, error, hasTracks, levels } = state;

  if (!hasTracks || !track) return emptyState(ctx);

  background(ctx);
  statusBar(ctx);
  albumArt(ctx, art, track.id, t, playing, levels);

  text(ctx, clip(ctx, track.title, TEX_W - 80, 30, 600), 40, 500, { size: 30, weight: 600 });
  text(ctx, clip(ctx, track.artist, TEX_W - 80, 13, 400), 40, 528, { size: 13, color: MUTED });

  // Thanh tiến trình
  const pb = { ...BARS.progress, y: 566 };
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  rr(ctx, pb.x, pb.y, pb.w, 6, 3);
  ctx.fillStyle = ACCENT;
  rr(ctx, pb.x, pb.y, Math.max(6, pb.w * progress), 6, 3);
  ctx.beginPath();
  ctx.arc(pb.x + pb.w * progress, pb.y + 3, 8, 0, Math.PI * 2);
  ctx.fill();

  text(ctx, mmss(elapsed), pb.x, pb.y + 30, { size: 12, color: MUTED });
  text(ctx, duration ? mmss(duration) : '--:--', pb.x + pb.w, pb.y + 30, {
    size: 12, color: MUTED, align: 'right',
  });

  // Cụm nút điều khiển
  skipIcon(ctx, HITS.prev.x + HITS.prev.w / 2, HITS.prev.y + HITS.prev.h / 2, -1);
  skipIcon(ctx, HITS.next.x + HITS.next.w / 2, HITS.next.y + HITS.next.h / 2, 1);

  const tcx = HITS.toggle.x + HITS.toggle.w / 2;
  const tcy = HITS.toggle.y + HITS.toggle.h / 2;
  if (playing) {
    ctx.fillStyle = 'rgba(74,222,128,0.18)';
    ctx.beginPath();
    ctx.arc(tcx, tcy, 42 + Math.sin(t * 2.2) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(tcx, tcy, 36, 0, Math.PI * 2);
  ctx.fill();
  playIcon(ctx, tcx, tcy, playing);

  // Âm lượng
  speakerIcon(ctx, 34, 786, volume < 0.02);
  const vb = { ...BARS.volume, y: 783 };
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  rr(ctx, vb.x, vb.y, vb.w, 5, 2.5);
  ctx.fillStyle = ACCENT;
  rr(ctx, vb.x, vb.y, Math.max(5, vb.w * volume), 5, 2.5);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(vb.x + vb.w * volume, vb.y + 2.5, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Không tải được tệp: hiện luôn đường dẫn sai để khỏi phải mở bảng điều khiển
  if (error) {
    ctx.fillStyle = 'rgba(255,86,64,0.16)';
    rr(ctx, 30, 834, TEX_W - 60, 46, 14);
    text(ctx, 'Không tải được tệp', 44, 854, { size: 12, weight: 600, color: '#ff9d86' });
    text(ctx, clip(ctx, error, TEX_W - 88, 11, 400), 44, 870, { size: 11, color: MUTED });
  } else {
    text(ctx, `${Math.round(volume * 100)}%`, TEX_W / 2, 840, {
      size: 12, color: MUTED, align: 'center',
    });
  }

  ctx.fillStyle = 'rgba(242,243,245,0.32)';
  rr(ctx, TEX_W / 2 - 62, TEX_H - 16, 124, 5.5, 3);
}

/* Đổi toạ độ UV của điểm chạm trên mặt phẳng 3D sang lưới toạ độ vẽ.
   v = 1 là mép trên của texture, còn canvas đánh số dòng từ trên xuống. */
export function uvToCanvas(u, v) {
  return { x: u * TEX_W, y: (1 - v) * TEX_H };
}
