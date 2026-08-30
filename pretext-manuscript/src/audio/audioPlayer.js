import { TRACKS } from './tracks.js';

/* =========================================================================
   Trình phát tệp nhạc.

   Phần phát dùng thẳng thẻ <audio> của trình duyệt: nó lo sẵn giải mã, đệm,
   tua và thời lượng. Web Audio chỉ được cắm thêm vào để lấy phổ tần số vẽ dải
   nhảy trên màn hình 3D, và chỉ dựng ở lần bấm Phát đầu tiên vì trình duyệt
   chặn âm thanh cho tới khi có thao tác thật của người dùng.
   ========================================================================= */

/* Một bài có dùng được bộ phân tích phổ hay không.

   Cùng gốc với trang thì luôn được. Khác gốc thì chỉ được khi máy chủ có gửi
   header CORS, và điều đó phải do người khai báo tự xác nhận bằng cờ cors: true.

   Vì sao phải cẩn thận: nếu nối một nguồn khác gốc mà thiếu CORS vào Web Audio,
   trình duyệt KHÔNG báo lỗi, nó chỉ phát ra im lặng. Rất khó lần ra. */
function analyserSafe(track) {
  if (!track?.src) return false;
  if (track.cors === true) return true;
  try {
    return new URL(track.src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

export class AudioPlayer {
  constructor() {
    this.tracks = TRACKS;
    this.index = 0;
    this.volume = 0.7;
    this.playing = false;
    /* Người dùng đã yêu cầu phát nhưng chưa có tiếng ra: hoặc đang tải, hoặc
       đang phải chờ nạp thêm giữa chừng. Tệp nhạc ở đây nặng 6-9 MB nên trên
       mạng chậm khoảng chờ này rất dễ thấy, không có dấu hiệu gì thì người xem
       tưởng bấm hụt. */
    this.loading = false;
    this.error = null;
    this.onChange = null;
    this._gen = 0;

    this.ctx = null;
    this.analyser = null;
    this.freq = null;
    this.sourceNode = null;
    this.gain = null;

    /* Quyết định một lần cho cả danh sách, không phải từng bài:
       createMediaElementSource chỉ gọi được đúng một lần trên mỗi phần tử audio.
       Chỉ cần một bài không an toàn là phải bỏ hẳn bộ phân tích, nếu không bài
       đó sẽ phát ra im lặng. */
    this.canAnalyse = this.tracks.length > 0 && this.tracks.every(analyserSafe);

    this.audio = typeof Audio === 'undefined' ? null : new Audio();
    if (this.audio) {
      this.audio.preload = 'metadata';
      // Chỉ đặt khi chắc chắn có CORS. Đặt bừa lên host không gửi header CORS
      // sẽ làm chính việc tải tệp thất bại.
      if (this.canAnalyse) this.audio.crossOrigin = 'anonymous';
      this.audio.volume = this.volume;

      this.audio.addEventListener('ended', () => this.next());
      this.audio.addEventListener('error', () => {
        this.loading = false;
        // Chỉ tính là lỗi khi phần tử audio thật sự báo mã lỗi. Sự kiện này còn
        // bắn ra khi src bị đổi giữa chừng, lúc đó không có mã lỗi nào cả.
        if (!this.audio.error) return;
        this.error = this.track ? this.track.src : 'không rõ';
        this.playing = false;
        this._notify();
      });
      this.audio.addEventListener('loadedmetadata', () => {
        this.error = null;
        this._notify();
      });
      this.audio.addEventListener('play', () => {
        this.playing = true;
        this._notify();
      });
      this.audio.addEventListener('pause', () => {
        this.playing = false;
        this.loading = false;
        this._notify();
      });

      /* playing bắn ra đúng lúc có tiếng thật, kể cả sau khi phải dừng chờ nạp
         giữa bài. canplay thì chỉ nói là đủ dữ liệu, chưa chắc đã kêu. */
      this.audio.addEventListener('playing', () => {
        this.loading = false;
        this._notify();
      });
      this.audio.addEventListener('waiting', () => {
        if (!this.audio.paused) {
          this.loading = true;
          this._notify();
        }
      });
      this.audio.addEventListener('stalled', () => {
        if (!this.audio.paused) {
          this.loading = true;
          this._notify();
        }
      });

      this._load();
    }
  }

  get track() {
    return this.tracks[this.index] ?? null;
  }

  get hasTracks() {
    return this.tracks.length > 0;
  }

  get duration() {
    const d = this.audio?.duration;
    return Number.isFinite(d) && d > 0 ? d : 0;
  }

  get elapsed() {
    return this.audio?.currentTime ?? 0;
  }

  get progress() {
    return this.duration ? Math.min(1, this.elapsed / this.duration) : 0;
  }

  /* Tỉ lệ đã tải xong tính từ đầu bài, dùng vẽ vệt mờ phía sau thanh tiến trình
     để thấy nhạc đang được nạp tới đâu. */
  get buffered() {
    const b = this.audio?.buffered;
    if (!b || !b.length || !this.duration) return 0;
    for (let i = 0; i < b.length; i++) {
      if (b.start(i) <= this.elapsed && this.elapsed <= b.end(i)) {
        return Math.min(1, b.end(i) / this.duration);
      }
    }
    return Math.min(1, b.end(b.length - 1) / this.duration);
  }

  _notify() {
    this.onChange?.();
  }

  _load() {
    if (!this.audio || !this.track) return;
    // Mỗi lần nạp tăng số thế hệ. Lời hứa play() của bài cũ có thể thất bại sau
    // khi đã đổi bài; nhờ số này mà biết lỗi đó đã lỗi thời và bỏ qua.
    this._gen++;
    this.error = null;
    this.audio.src = this.track.src;
    this.audio.load();
  }

  /* Cắm bộ phân tích phổ. Sau khi createMediaElementSource, âm thanh KHÔNG còn
     tự chảy ra loa nữa: bắt buộc phải nối tiếp tới destination. */
  _ensureAnalyser() {
    if (this.ctx || !this.audio || !this.canAnalyse) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 1;

      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.gain);
      this.gain.connect(this.ctx.destination);

      this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    } catch {
      // Không dựng được thì thôi, tiếng vẫn phát bình thường qua thẻ audio
      this.ctx = null;
      this.analyser = null;
    }
  }

  /* Trả về mảng mức năng lượng 0..1 theo dải tần, hoặc null nếu chưa có phân
     tích phổ. Màn hình dùng nó để vẽ dải nhảy đúng theo nhạc đang phát. */
  levels() {
    if (!this.analyser || !this.freq || !this.playing) return null;
    this.analyser.getByteFrequencyData(this.freq);
    return this.freq;
  }

  async play() {
    if (!this.audio || !this.track) return;
    this._ensureAnalyser();
    if (this.ctx?.state === 'suspended') await this.ctx.resume();

    const gen = this._gen;
    const src = this.track.src;
    this.loading = true;
    this._notify();
    try {
      await this.audio.play();
    } catch (err) {
      // Đã chuyển sang bài khác trong lúc chờ: lỗi này thuộc về bài cũ, bỏ qua
      if (gen !== this._gen) return;
      // Trình duyệt huỷ play() vì có lệnh nạp mới. Không phải tệp hỏng.
      if (err && err.name === 'AbortError') return;
      this.error = src;
      this.playing = false;
      this.loading = false;
      this._notify();
    }
  }

  pause() {
    this.loading = false;
    this.audio?.pause();
  }

  toggle() {
    this.playing ? this.pause() : this.play();
  }

  setTrack(i) {
    if (!this.hasTracks) return;
    const wasPlaying = this.playing;
    this.pause();
    this.index = (i + this.tracks.length) % this.tracks.length;
    this._load();
    this._notify();
    if (wasPlaying) this.play();
  }

  next() {
    this.setTrack(this.index + 1);
  }

  prev() {
    // Quá 3 giây thì bấm lùi là về đầu bài, giống mọi trình phát khác
    if (this.elapsed > 3) {
      if (this.audio) this.audio.currentTime = 0;
      this._notify();
      return;
    }
    this.setTrack(this.index - 1);
  }

  seek(ratio) {
    if (!this.audio || !this.duration) return;
    this.audio.currentTime = Math.max(0, Math.min(1, ratio)) * this.duration;
    this._notify();
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio) this.audio.volume = this.volume;
    this._notify();
  }

  dispose() {
    this.pause();
    if (this.audio) this.audio.src = '';
    this.ctx?.close();
    this.ctx = null;
  }
}
