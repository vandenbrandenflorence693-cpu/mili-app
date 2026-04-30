import { useRef, useState, useCallback, useEffect } from 'react';

interface CollarProps {
  label?: string;
}

export function Collar({ label = "mili" }: CollarProps) {
  const bellRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [bellRinging, setBellRinging] = useState(false);
  const [mouseIn, setMouseIn] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 疯狂彩蛋状态
  const [isFrenzy, setIsFrenzy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // 追踪快速点击
  const clickTimestamps = useRef<number[]>([]);
  const frenzyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frenzyInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const playBellSound = useCallback((frenzy = false) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sine';
      // 疯狂模式下音调稍低，更狂野
      osc1.frequency.setValueAtTime(frenzy ? 2400 : 2200, t);
      osc1.frequency.exponentialRampToValueAtTime(frenzy ? 1200 : 1400, t + (frenzy ? 0.18 : 0.25));
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frenzy ? 1200 : 1100, t);
      osc2.frequency.exponentialRampToValueAtTime(frenzy ? 800 : 900, t + 0.1);

      // 疯狂模式音量稍大
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(frenzy ? 0.4 : 0.35, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (frenzy ? 0.5 : 0.6));
      filter.type = 'highpass';
      filter.frequency.value = 600;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.6);
      osc2.stop(t + 0.6);
    } catch (_) {}
  }, []);

  // 触发疯狂模式
  const triggerFrenzy = useCallback(() => {
    setIsFrenzy(true);
    setScreenShake(true);

    // 疯狂响铃
    let count = 0;
    const maxRings = 20;
    frenzyInterval.current = setInterval(() => {
      playBellSound(true);
      if (bellRef.current) {
        bellRef.current.classList.remove('bell-frenzy-swing');
        void bellRef.current.offsetWidth;
        bellRef.current.classList.add('bell-frenzy-swing');
      }
      count++;
      if (count >= maxRings) {
        if (frenzyInterval.current) clearInterval(frenzyInterval.current);
        setIsFrenzy(false);
        setScreenShake(false);
      }
    }, 120);

    // 弹出文字
    setTimeout(() => setShowPopup(true), 800);

    // 5秒后关闭弹窗
    if (frenzyTimer.current) clearTimeout(frenzyTimer.current);
    frenzyTimer.current = setTimeout(() => {
      setShowPopup(false);
      setIsFrenzy(false);
      setScreenShake(false);
    }, 5000);
  }, [playBellSound]);

  const handleBellClick = useCallback(() => {
    // 如果正在疯狂模式，不处理
    if (isFrenzy) return;

    const now = Date.now();
    clickTimestamps.current.push(now);

    // 只保留2秒内的点击
    clickTimestamps.current = clickTimestamps.current.filter(t => now - t < 2000);

    // 正常响铃
    setBellRinging(true);
    playBellSound();
    if (bellRef.current) {
      bellRef.current.classList.remove('bell-swing');
      void bellRef.current.offsetWidth;
      bellRef.current.classList.add('bell-swing');
    }
    setTimeout(() => setBellRinging(false), 700);

    // 检测是否10次以上快速点击
    if (clickTimestamps.current.length >= 10) {
      clickTimestamps.current = []; // 重置计数
      triggerFrenzy();
    }
  }, [bellRinging, playBellSound, isFrenzy, triggerFrenzy]);

  // 鼠标移入时给铃铛一个自然的初始摆动
  useEffect(() => {
    if (mouseIn && bellRef.current && !bellRinging) {
      bellRef.current.classList.remove('bell-idle-sway');
      void bellRef.current.offsetWidth;
      bellRef.current.classList.add('bell-idle-sway');
    }
  }, [mouseIn]);

  // 鼠标追踪产生轻微 parallax 3D 倾斜
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setParallax({ x: dx, y: dy });
    };
    const handleMouseLeave = () => setParallax({ x: 0, y: 0 });
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`flex flex-col items-center select-none mt-10 ${screenShake ? 'animate-screen-shake' : ''}`}
      onMouseEnter={() => setMouseIn(true)}
      onMouseLeave={() => setMouseIn(false)}
    >
      {/* 3D 透视场景 */}
      <div
        className="collar-scene"
        style={{
          perspective: '900px',
          perspectiveOrigin: '50% 10%',
        }}
      >
        {/* 整个项圈（含铃铛）—— 呼吸 + 跟随鼠标轻微倾斜 */}
        <div
          className="collar-float"
          style={{
            transformStyle: 'preserve-3d',
            transform: `
              rotateX(-18deg)
              rotateZ(${parallax.x * 3}deg)
              rotateY(${parallax.y * -4}deg)
            `,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* === D 环 === */}
          <div
            style={{
              width: 40,
              height: 12,
              margin: '0 auto 1px',
              borderRadius: '0 0 50% 50% / 0 0 100% 100%',
              border: '3.5px solid #c9a020',
              borderTop: 'none',
              background: 'linear-gradient(180deg, #8b6914 0%, #d4a017 35%, #f0c040 60%, #d4a017 80%, #8b6508 100%)',
              boxShadow: `
                inset 0 -4px 8px rgba(0,0,0,0.5),
                0 0 0 0.5px rgba(0,0,0,0.4),
                0 2px 6px rgba(0,0,0,0.3),
                0 0 12px rgba(217,160,46,0.35)
              `,
              transform: 'translateZ(2px)',
              position: 'relative',
            }}
          />

          {/* === 皮革连接片 === */}
          <div style={{
            width: 22,
            height: 10,
            margin: '0 auto',
            background: 'linear-gradient(180deg, #111 0%, #222 40%, #1a1a1a 100%)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9), 0 1px 0 #000',
            position: 'relative',
            zIndex: 10,
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '15%',
              right: '15%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(80,80,80,0.3), transparent)',
              transform: 'translateY(-50%)',
            }} />
          </div>

          {/* === 统一居中容器（项圈 + 铃铛） === */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

          {/* === 项圈整体（带顶/侧/底三层深度） === */}
          <div
            className="collar-body"
            style={{ transformStyle: 'preserve-3d', position: 'relative' }}
          >
            {/* 顶面（厚度的上边缘） */}
            <div style={{
              position: 'absolute',
              top: -6,
              left: 0,
              right: 0,
              height: 14,
              borderRadius: 9999,
              background: 'linear-gradient(180deg, #3a3a3a 0%, #252525 100%)',
              boxShadow: 'inset 0 1.5px 3px rgba(255,255,255,0.07)',
              transform: 'translateZ(12px)',
              zIndex: 3,
            }} />
            {/* 顶面高光 */}
            <div style={{
              position: 'absolute',
              top: 2,
              left: '4%',
              right: '4%',
              height: 3,
              borderRadius: 9999,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.04) 60%, transparent)',
              transform: 'translateZ(12.5px)',
              zIndex: 3,
            }} />

            {/* 正面主体 */}
            <div style={{
              position: 'relative',
              width: 272,
              height: 30,
              borderRadius: 9999,
              background: 'linear-gradient(180deg, #080808 0%, #111 12%, #1e1e1e 42%, #141414 68%, #0a0a0a 100%)',
              boxShadow: `
                /* 内壁阴影制造厚度 */
                inset 0 4px 8px rgba(255,255,255,0.03),
                inset 0 -5px 10px rgba(0,0,0,0.95),
                inset 3px 0 5px rgba(255,255,255,0.015),
                inset -3px 0 5px rgba(0,0,0,0.5),
                /* 底部边缘 */
                0 2px 0 #060606,
                0 5px 0 #050505,
                /* 外阴影 */
                0 8px 24px rgba(0,0,0,0.85),
                0 20px 50px rgba(0,0,0,0.5),
                0 2px 4px rgba(0,0,0,0.6)
              `,
              transform: 'translateZ(0px)',
              zIndex: 2,
            }}>
              {/* 皮革纹理层 */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 9999,
                background: `
                  repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    transparent 18px,
                    rgba(255,255,255,0.012) 18px,
                    rgba(255,255,255,0.012) 19px
                  )
                `,
                pointerEvents: 'none',
              }} />

              {/* 左侧金色扣环 */}
              <div style={{
                position: 'absolute',
                left: 10,
                top: 3,
                width: 20,
                height: 24,
                borderRadius: 9999,
                background: 'linear-gradient(180deg, #f5d76e 0%, #d4a017 25%, #b8860b 65%, #8b6508 100%)',
                boxShadow: `
                  inset 0 3px 5px rgba(255,255,255,0.6),
                  inset 0 -3px 5px rgba(0,0,0,0.45),
                  0 1px 0 rgba(255,255,255,0.12),
                  0 3px 6px rgba(0,0,0,0.5)
                `,
                transform: 'translateZ(1px)',
              }}>
                {/* 扣环中心孔 */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8,
                  height: 10,
                  borderRadius: 9999,
                  background: 'linear-gradient(180deg, #060606 0%, #111 100%)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9)',
                }} />
              </div>

              {/* 右侧金色扣环 */}
              <div style={{
                position: 'absolute',
                right: 10,
                top: 3,
                width: 20,
                height: 24,
                borderRadius: 9999,
                background: 'linear-gradient(180deg, #f5d76e 0%, #d4a017 25%, #b8860b 65%, #8b6508 100%)',
                boxShadow: `
                  inset 0 3px 5px rgba(255,255,255,0.6),
                  inset 0 -3px 5px rgba(0,0,0,0.45),
                  0 1px 0 rgba(255,255,255,0.12),
                  0 3px 6px rgba(0,0,0,0.5)
                `,
                transform: 'translateZ(1px)',
              }}>
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8,
                  height: 10,
                  borderRadius: 9999,
                  background: 'linear-gradient(180deg, #060606 0%, #111 100%)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9)',
                }} />
              </div>

              {/* 刻字 */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateZ(2px)',
              }}>
                <span style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  color: '#c9a227',
                  textShadow: `
                    0 0 10px rgba(217,160,46,0.6),
                    0 0 3px rgba(0,0,0,0.95),
                    0 1px 0 rgba(0,0,0,0.8),
                    0 -1px 0 rgba(0,0,0,0.6)
                  `,
                  userSelect: 'none',
                }}>
                  ✧ mili ✧
                </span>
              </div>

              {/* 车缝线 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '14%',
                right: '14%',
                height: 1,
                transform: 'translateY(-50%)',
                background: 'linear-gradient(90deg, transparent 0%, rgba(55,55,55,0.5) 8%, rgba(55,55,55,0.5) 92%, transparent 100%)',
              }} />
            </div>

            {/* 底面阴影（投射在底部） */}
            <div style={{
              position: 'absolute',
              bottom: -10,
              left: 8,
              right: 8,
              height: 20,
              borderRadius: 9999,
              background: 'transparent',
              boxShadow: '0 8px 24px rgba(0,0,0,0.65)',
              transform: 'translateZ(-8px)',
              zIndex: 1,
            }} />

            {/* 两侧边缘厚度 */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 8,
              borderRadius: '9999px 0 0 9999px',
              background: 'linear-gradient(90deg, #080808, #1a1a1a, #0d0d0d)',
              transform: 'translateZ(-3px)',
              boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.8)',
              zIndex: 1,
            }} />
            <div style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 8,
              borderRadius: '0 9999px 9999px 0',
              background: 'linear-gradient(270deg, #080808, #1a1a1a, #0d0d0d)',
              transform: 'translateZ(-3px)',
              boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.8)',
              zIndex: 1,
            }} />
          </div>

          {/* === 连接绳 === */}
          <div style={{
            width: 5,
            height: 36,
            margin: '-1px auto 0',
            borderRadius: 9999,
            background: 'linear-gradient(180deg, #2a2a2a 0%, #d4a017 45%, #8b6508 80%, #5c4008 100%)',
            boxShadow: '0 0 6px rgba(217,160,46,0.35), 0 2px 4px rgba(0,0,0,0.5)',
            transform: 'translateZ(0px)',
          }} />

          {/* === 铃铛 === */}
          <div
            ref={bellRef}
            className="cursor-pointer group bell-container"
            onClick={handleBellClick}
            title="点击铃铛"
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'top center' }}
          >
            {/* 铃铛主体 */}
            <div
              className="group-hover:scale-105 transition-transform duration-150"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse at 28% 22%, #fffdf0 0%, #fff8dc 5%, #f5d76e 12%, #e6b820 22%, #d4a017 38%, #b8860b 58%, #8b6508 78%, #5c4008 100%)',
                boxShadow: `
                  inset 5px 5px 14px rgba(255,255,255,0.65),
                  inset -5px -5px 14px rgba(0,0,0,0.38),
                  inset 0 -7px 18px rgba(0,0,0,0.35),
                  0 10px 28px rgba(0,0,0,0.55),
                  0 4px 10px rgba(0,0,0,0.45),
                  0 0 24px rgba(217,160,46,0.35),
                  0 0 50px rgba(217,160,46,0.12)
                `,
                position: 'relative',
                transform: 'translateZ(4px)',
              }}
            >
              {/* 主高光 */}
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '16%',
                width: '22%',
                height: '18%',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.92) 0%, transparent 70%)',
                filter: 'blur(1.5px)',
              }} />
              {/* 次高光 */}
              <div style={{
                position: 'absolute',
                top: '26%',
                left: '8%',
                width: '12%',
                height: '9%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.55)',
                filter: 'blur(0.5px)',
              }} />

              {/* X 形凹槽 */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden' }}>
                {[0, 60, 120].map((deg) => (
                  <div key={deg} style={{
                    position: 'absolute',
                    top: '44%',
                    left: 0,
                    right: 0,
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(139,101,8,0.45), rgba(139,101,8,0.7) 50%, rgba(139,101,8,0.45), transparent)',
                    transform: `rotate(${deg}deg)`,
                  }} />
                ))}
              </div>

              {/* 悬孔 */}
              <div style={{
                position: 'absolute',
                top: -3,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #0a0a0a 50%, #050505 100%)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.95), 0 0 0 1px rgba(80,60,10,0.4)',
                transformStyle: 'flat',
              }} />
            </div>

            {/* 铃铛底部开口 */}
            <div style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 16,
              height: 16,
              borderRadius: '0 0 50% 50% / 0 0 100% 100%',
              background: 'linear-gradient(180deg, #e6b820 0%, #d4a017 30%, #b8860b 65%, #8b6508 100%)',
              boxShadow: `
                inset 0 -4px 8px rgba(0,0,0,0.5),
                0 2px 6px rgba(0,0,0,0.5)
              `,
              transform: 'translateZ(-2px)',
            }}>
              {/* 开口内壁 */}
              <div style={{
                position: 'absolute',
                inset: 2,
                borderRadius: '0 0 50% 50%',
                background: 'radial-gradient(ellipse, #100500 0%, #201000 100%)',
                boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.9)',
              }} />
              {/* 铃舌 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 35%, #f5d76e 0%, #d4a017 40%, #8b6508 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.65)',
              }} />
            </div>

            {/* 点击波纹 */}
            {bellRinging && (
              <>
                <div className="ping-wave" style={{
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  borderRadius: '50%',
                  border: '2px solid rgba(245,215,110,0.7)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  right: -20,
                  bottom: -20,
                  borderRadius: '50%',
                  border: '1px solid rgba(245,215,110,0.35)',
                  animation: 'pingBell 0.7s 0.2s ease-out forwards',
                  pointerEvents: 'none',
                }} />
              </>
            )}
          </div>

          {/* 投影 */}
          <div style={{
            width: 90,
            height: 8,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 75%)',
            filter: 'blur(5px)',
            marginTop: 8,
            transform: 'translateZ(-10px)',
          }} />
          </div>{/* end center wrapper */}
        </div>
      </div>

      {/* 彩蛋弹出文字 */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="frenzy-popup animate-popup-appear">
            <div className="relative">
              {/* 背景装饰 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 rounded-3xl blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-amber-900/95 to-yellow-900/95 border-2 border-amber-400/50 rounded-2xl px-8 py-6 shadow-2xl shadow-amber-900/50">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl animate-bounce">🔔</div>
                <p className="text-2xl font-bold text-amber-100 text-center tracking-wide drop-shadow-lg">
                  这么急着挨罚吗？
                </p>
                <p className="text-xl text-yellow-300 text-center mt-1 font-medium">
                  小狗。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* 整个项圈呼吸浮动 */
        @keyframes collarFloat {
          0%, 100% { transform: rotateX(-18deg) translateY(0px); }
          50%       { transform: rotateX(-18deg) translateY(-5px); }
        }
        .collar-float {
          animation: collarFloat 3.5s ease-in-out infinite;
        }

        /* 铃铛点击摇摆 */
        @keyframes bellSwing {
          0%   { transform: rotate(0deg); }
          12%  { transform: rotate(26deg); }
          30%  { transform: rotate(-20deg); }
          50%  { transform: rotate(13deg); }
          70%  { transform: rotate(-7deg); }
          85%  { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-swing {
          animation: bellSwing 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        /* 鼠标进入时铃铛轻微摇晃 */
        @keyframes bellIdleSway {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(4deg); }
          75%  { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-idle-sway {
          animation: bellIdleSway 0.9s ease-in-out forwards;
        }

        /* 波纹扩散 */
        @keyframes pingBell {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2); }
        }
        .ping-wave {
          animation: pingBell 0.7s ease-out forwards;
        }

        /* 疯狂摇摆 */
        @keyframes bellFrenzySwing {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(35deg); }
          30%  { transform: rotate(-30deg); }
          45%  { transform: rotate(25deg); }
          60%  { transform: rotate(-20deg); }
          75%  { transform: rotate(15deg); }
          90%  { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-frenzy-swing {
          animation: bellFrenzySwing 0.12s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        /* 屏幕震动 */
        @keyframes screenShake {
          0%   { transform: translateX(0); }
          10%  { transform: translateX(-4px) rotate(-0.5deg); }
          20%  { transform: translateX(4px) rotate(0.5deg); }
          30%  { transform: translateX(-4px) rotate(-0.3deg); }
          40%  { transform: translateX(4px) rotate(0.3deg); }
          50%  { transform: translateX(-3px) rotate(-0.2deg); }
          60%  { transform: translateX(3px) rotate(0.2deg); }
          70%  { transform: translateX(-2px); }
          80%  { transform: translateX(2px); }
          90%  { transform: translateX(-1px); }
          100% { transform: translateX(0); }
        }
        .animate-screen-shake {
          animation: screenShake 0.4s ease-in-out infinite;
        }

        /* 弹出文字动画 */
        @keyframes popupAppear {
          0%   { opacity: 0; transform: scale(0.5) translateY(20px); }
          50%  { opacity: 1; transform: scale(1.1) translateY(-5px); }
          70%  { transform: scale(0.95) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popup-appear {
          animation: popupAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
