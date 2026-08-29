import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { TRACKS } from '../audio/tracks.js';
import { drawMusicScreen, TEX_W, TEX_H, uvToCanvas } from './musicScreen.js';

const ACCENT = '#4ade80';
const PHONE_W = 2.05;
const PHONE_H = 4.2;
const PHONE_D = 0.2;
const CORNER = 0.34;
const REST_Y = -0.32;

/* Toạ độ vẽ giữ nguyên theo lưới 420x910 cho dễ đọc, còn canvas thật lớn gấp SS
   lần rồi ctx được phóng theo. */
const SS = 2;

/* Thân máy dựng bằng hình chữ nhật bo góc rồi ép khối. Không dùng hộp bo góc
   đều: hộp đều giới hạn bán kính theo chiều mỏng nhất nên góc máy sẽ quá nhọn. */
function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* Ảnh bìa lấy từ trường cover của từng bài. Bài nào bỏ trống thì trả về null,
   màn hình sẽ tự vẽ một tấm bìa chuyển sắc thay thế.
   Bắt buộc đặt crossOrigin TRƯỚC khi gán src: nếu sau này dùng ảnh ở tên miền
   khác mà thiếu dòng này, canvas bị coi là nhiễm và WebGL từ chối làm texture. */
function useAlbumArt() {
  return useMemo(
    () =>
      TRACKS.map((t) => {
        if (!t.cover) return null;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = t.cover;
        return img;
      }),
    []
  );
}

function useScreenTexture(playerRef, reduceMotion) {
  const art = useAlbumArt();

  const state = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_W * SS;
    canvas.height = TEX_H * SS;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return { canvas, ctx: canvas.getContext('2d'), texture, last: -1 };
  }, []);

  // Chữ trên canvas phải đợi phông tải xong, nếu không nó vẽ bằng phông dự phòng
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && (state.last = -1));
    return () => {
      alive = false;
    };
  }, [state]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const player = playerRef.current;
    if (!player) return;

    // Đang phát thì vẽ lại đều để dải phổ nhảy, dừng thì chỉ vẽ khi có thay đổi
    const rate = player.playing && !reduceMotion ? 1 / 24 : 1 / 6;
    if (state.last >= 0 && t - state.last < rate) return;
    state.last = t;

    const { ctx } = state;
    ctx.setTransform(SS, 0, 0, SS, 0, 0);
    ctx.clearRect(0, 0, TEX_W, TEX_H);

    drawMusicScreen(
      ctx,
      {
        track: player.track,
        playing: player.playing,
        progress: player.progress,
        volume: player.volume,
        duration: player.duration,
        elapsed: player.elapsed,
        error: player.error,
        hasTracks: player.hasTracks,
        levels: reduceMotion ? null : player.levels(),
      },
      reduceMotion ? 0 : t,
      art[player.index]
    );

    state.texture.needsUpdate = true;
  });

  return state.texture;
}

function Phone({ scrollRef, spinRef, playerRef, onScreenHit, reduceMotion }) {
  const group = useRef();
  const screenTexture = useScreenTexture(playerRef, reduceMotion);

  const bodyGeometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(PHONE_W, PHONE_H, CORNER), {
      depth: PHONE_D,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 6,
      curveSegments: 32,
    });
    g.center();
    return g;
  }, []);

  /* ShapeGeometry sinh UV bằng chính toạ độ của hình, không chuẩn hoá về 0..1.
     Để nguyên thì texture bị lấy mẫu ngoài khung, màn hình đen thui, và toạ độ
     UV trả về khi chạm cũng vô nghĩa. */
  const screenGeometry = useMemo(() => {
    const g = new THREE.ShapeGeometry(roundedRect(PHONE_W - 0.16, PHONE_H - 0.16, CORNER - 0.08), 32);
    g.computeBoundingBox();
    const { min, max } = g.boundingBox;
    const w = max.x - min.x;
    const h = max.y - min.y;
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - min.x) / w, (pos.getY(i) - min.y) / h);
    }
    uv.needsUpdate = true;
    return g;
  }, []);

  useFrame((s, delta) => {
    if (!group.current) return;
    const spin = spinRef.current;

    if (reduceMotion) {
      group.current.rotation.set(0, REST_Y, 0);
      group.current.position.y = 0;
      return;
    }

    if (!spin.dragging) {
      spin.offsetY += spin.velY;
      spin.offsetX += spin.velX;
      spin.velY *= 0.94;
      spin.velX *= 0.94;
      spin.offsetY *= 0.94;
      spin.offsetX *= 0.9;
    }
    spin.offsetX = THREE.MathUtils.clamp(spin.offsetX, -0.5, 0.5);

    const scroll = scrollRef?.current ?? 0;
    const k = Math.min(1, delta * 4);
    const idleY = spin.dragging ? 0 : s.pointer.x * 0.22;
    const idleX = spin.dragging ? 0 : -s.pointer.y * 0.12;

    const targetY = REST_Y + idleY + spin.offsetY + scroll * 1.4;
    const targetX = idleX + spin.offsetX + scroll * 0.25;

    group.current.rotation.y += (targetY - group.current.rotation.y) * k;
    group.current.rotation.x += (targetX - group.current.rotation.x) * k;
    group.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.4) * 0.025;
    group.current.position.y = Math.sin(s.clock.elapsedTime * 0.7) * 0.08 - scroll * 1.2;
  });

  return (
    <group ref={group} rotation={[0, REST_Y, 0]}>
      <mesh geometry={bodyGeometry} castShadow>
        <meshStandardMaterial color="#2b3138" metalness={0.7} roughness={0.26} />
      </mesh>

      <mesh geometry={bodyGeometry} scale={[1.012, 1.006, 0.96]}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0.22} side={THREE.BackSide} />
      </mesh>

      {/* Chạm vào mặt phẳng này trả về toạ độ UV của đúng điểm chạm, nhờ đó biết
          ngón tay rơi vào nút nào trên giao diện đã vẽ. */}
      <mesh
        geometry={screenGeometry}
        position={[0, 0, PHONE_D / 2 + 0.043]}
        onPointerDown={(e) => {
          if (!e.uv) return;
          onScreenHit?.(uvToCanvas(e.uv.x, e.uv.y));
        }}
      >
        <meshBasicMaterial map={screenTexture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function OrbitingTiles({ reduceMotion }) {
  const group = useRef();
  const tiles = useMemo(
    () => [
      { r: 2.1, y: 1.45, speed: 0.24, size: 0.34, accent: true, phase: 0 },
      { r: 2.4, y: -0.6, speed: -0.18, size: 0.27, accent: false, phase: 1.7 },
      { r: 1.95, y: -1.6, speed: 0.3, size: 0.23, accent: true, phase: 3.1 },
      { r: 2.55, y: 0.7, speed: -0.22, size: 0.19, accent: false, phase: 4.6 },
      { r: 2.25, y: 2.0, speed: 0.2, size: 0.16, accent: true, phase: 5.5 },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!group.current || reduceMotion) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const cfg = tiles[i];
      const a = cfg.phase + t * cfg.speed;
      child.position.set(Math.cos(a) * cfg.r, cfg.y + Math.sin(t * 0.5 + cfg.phase) * 0.16, Math.sin(a) * cfg.r);
      child.rotation.y = a;
      child.rotation.x = Math.sin(t * 0.4 + cfg.phase) * 0.3;
    });
  });

  return (
    <group ref={group}>
      {tiles.map((cfg, i) => {
        const a = cfg.phase;
        return (
          <mesh key={i} position={[Math.cos(a) * cfg.r, cfg.y, Math.sin(a) * cfg.r]}>
            <boxGeometry args={[cfg.size, cfg.size, cfg.size * 0.28]} />
            <meshStandardMaterial
              color={cfg.accent ? ACCENT : '#464e57'}
              emissive={cfg.accent ? ACCENT : '#0b0d10'}
              emissiveIntensity={cfg.accent ? 0.9 : 0}
              metalness={0.55}
              roughness={0.32}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function PhoneScene({
  scrollRef,
  spinRef,
  playerRef,
  onScreenHit,
  reduceMotion = false,
  active = true,
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7.4], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      fallback={null}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} castShadow />
      <pointLight position={[-4, 1, 3]} intensity={26} distance={14} color={ACCENT} />
      <pointLight position={[3.5, -3, 2]} intensity={14} distance={12} color="#7dd3fc" />

      <Phone
        scrollRef={scrollRef}
        spinRef={spinRef}
        playerRef={playerRef}
        onScreenHit={onScreenHit}
        reduceMotion={reduceMotion}
      />
      <OrbitingTiles reduceMotion={reduceMotion} />

      <ContactShadows position={[0, -2.9, 0]} opacity={0.5} scale={11} blur={2.8} far={4.5} color="#000000" />
    </Canvas>
  );
}
