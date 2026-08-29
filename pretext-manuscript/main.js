import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

// --- Canvas Setup ---
const canvas = document.getElementById('manuscript');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;
const catEl = document.getElementById('cat');

// --- Config ---
const FONT_SIZE = 22;
const LINE_HEIGHT = 36;
const FONT = FONT_SIZE + 'px "Playfair Display", serif';
const TEXT_COLOR = '#2a1a0a';
const BG_COLOR = '#f4eee0';
const REPEL_RADIUS = 100;
const REPEL_STRENGTH = 70;
const EASING = 0.08;

const MANUSCRIPT_TEXT = '“Dẫu sao, mình cứ hình dung ra cảnh lũ trẻ đang chơi một trò gì đó trên cánh đồng lúa mạch rộng lớn. Hàng ngàn đứa trẻ, và xung quanh chẳng có ai — ý mình là không có người lớn nào cả — ngoại trừ mình. Và mình đứng trên rìa của một vách đá điên rồ. Việc mình phải làm là bắt lấy bất cứ đứa nào lỡ chạy đến gần vách đá — ý mình là, nếu chúng đang mải chạy mà không nhìn xem mình đang đi đâu, thì mình sẽ nhảy ra từ một nơi nào đó và bắt lấy chúng. Đó là tất cả những gì mình làm cả ngày. Mình chỉ muốn làm người bắt trẻ đồng xanh.”';

// --- State ---
let W = 0, H = 0;
let mouseX = -9999, mouseY = -9999;
let catX = -9999, catY = -9999;
let lastFacingLeft = false;
let charData = [];
let prepared = null;

function buildCharLayout() {
  if (!prepared) return;
  const padding = W > 900 ? 120 : 40;
  const maxW = Math.max(280, W - padding * 2);
  const result = layoutWithLines(prepared, maxW, LINE_HEIGHT);
  const lines = result.lines;
  const totalHeight = result.height;
  const startX = (W - maxW) / 2;
  const startY = Math.max(40, (H - totalHeight) / 2);
  charData = [];
  ctx.font = FONT;
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].text;
    const y = startY + i * LINE_HEIGHT;
    let x = startX;
    for (let j = 0; j < lineText.length; j++) {
      const ch = lineText[j];
      const charWidth = ctx.measureText(ch).width;
      charData.push({
        char: ch, baseX: x, baseY: y,
        curX: x, curY: y, targetX: x, targetY: y, width: charWidth,
      });
      x += charWidth;
    }
  }
}

// --- Mouse tracking ---
window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; }
}, { passive: true });

// --- Resize ---
function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = FONT;
  buildCharLayout();
}
window.addEventListener('resize', resize);

// --- Animation loop ---
function render() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // Smooth cat easing
  catX += (mouseX - catX) * EASING;
  catY += (mouseY - catY) * EASING;

  // Flip the GIF img element based on direction
  const facingLeft = mouseX < catX;
  if (facingLeft !== lastFacingLeft) {
    catEl.style.transform = 'translate(-50%, -50%) scaleX(' + (facingLeft ? '1' : '-1') + ')';
    lastFacingLeft = facingLeft;
  }

  // Position the GIF element
  catEl.style.left = catX + 'px';
  catEl.style.top = catY + 'px';

  // Repel characters from cat
  for (let i = 0; i < charData.length; i++) {
    const c = charData[i];
    const dx = c.baseX - catX;
    const dy = c.baseY - catY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < REPEL_RADIUS && dist > 0.01) {
      const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
      c.targetX = c.baseX + (dx / dist) * force;
      c.targetY = c.baseY + (dy / dist) * force;
    } else {
      c.targetX = c.baseX;
      c.targetY = c.baseY;
    }
    c.curX += (c.targetX - c.curX) * 0.15;
    c.curY += (c.targetY - c.curY) * 0.15;
  }

  // Draw characters on canvas
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = FONT;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  for (let i = 0; i < charData.length; i++) {
    const c = charData[i];
    ctx.fillText(c.char, c.curX, c.curY);
  }

  requestAnimationFrame(render);
}

// --- Init ---
document.fonts.ready.then(() => {
  resize();
  prepared = prepareWithSegments(MANUSCRIPT_TEXT, FONT, { whiteSpace: 'normal' });
  buildCharLayout();
  requestAnimationFrame(render);
});
