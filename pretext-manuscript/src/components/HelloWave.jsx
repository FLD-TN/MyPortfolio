import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/* Nhân vật vẫy tay chào, tựa vào góc nhọn dưới bên trái.

   Nhân vật nằm nghiêng hẳn, chân cắm vào đúng đỉnh góc, thân ngả chéo ra giữa
   trang. Trồi lên theo chính đường chéo đó rồi rút về cũng theo đường đó. Chạy
   lại mỗi lần tải trang, cố ý không ghi nhớ gì.

   Muốn cho nhân vật nằm nghiêng tựa vào góc thì ngoài TILT_NGHI còn phải thêm
   transformOrigin '0% 100%'. Xoay quanh tâm khối thì cả nhân vật bị hất ra khỏi
   góc, thành ra treo lơ lửng.

   pointer-events none trên toàn khối: dù nhân vật có che lên nút nào của trang
   thì cú bấm vẫn xuyên qua nó. Ở màn hình thấp, nút của phần đầu trang nằm khá
   sát đáy nên đây là điều bắt buộc, không phải cho chắc ăn.

   Dùng bản nhẹ của lottie-web. Animation này không chứa biểu thức nên bản đầy
   đủ là thừa: 168 KB so với 258 KB.

   Tôn trọng giảm chuyển động: bỏ hẳn. Một nhân vật lớn tự trồi lên từ góc màn
   hình đúng là loại chuyển động gây chóng mặt cho người nhạy cảm. */

const SRC = '/Lottie/hello.json';
const START_DELAY = 900; // chờ trang vẽ xong rồi mới chào
const HOLD = 3400; // ở lại bao lâu sau khi trồi lên xong

/* Độ nghiêng. Lúc đứng yên để 0 nên nhân vật đứng thẳng; muốn nó nằm chéo
   tựa vào góc thì đặt TILT_NGHI khoảng 26. Lúc mới trồi lên vẫn ngả nhẹ rồi
   dựng dần về 0, cho động tác có sức nặng chứ không phải trượt vào rồi đứng im. */
const TILT_NGHI = 0;
const TILT_VAO = 12;

// Đi vào theo đúng đường chéo 45 độ: lệch trái và xuống dưới bằng nhau
const CHEO = { x: '-58%', y: '58%', rotate: TILT_VAO, opacity: 0 };

export default function HelloWave() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const boxRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setShow(true), START_DELAY);
    return () => clearTimeout(t);
  }, [reduce]);

  // Nạp và chạy hoạt ảnh khi khối đã có mặt trong cây
  useEffect(() => {
    if (!show || !boxRef.current) return;
    let cancelled = false;

    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (cancelled || !boxRef.current) return;
      animRef.current = lottie.loadAnimation({
        container: boxRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: SRC,
      });
    });

    const leave = setTimeout(() => setShow(false), HOLD);

    return () => {
      cancelled = true;
      clearTimeout(leave);
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-0 left-0 z-40 hidden h-[210px] w-[210px] sm:block"
          initial={CHEO}
          animate={{ x: '0%', y: '0%', rotate: TILT_NGHI, opacity: 1 }}
          exit={CHEO}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 18,
            mass: 0.9,
            opacity: { duration: 0.35 },
          }}
        >
          <div ref={boxRef} className="h-full w-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
