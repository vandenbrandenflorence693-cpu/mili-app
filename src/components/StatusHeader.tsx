import React, { useState, useRef } from 'react';
import { PuppyStatus } from '../types';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  status: PuppyStatus;
  /** 本周奖励点击次数 */
  weeklyClicks?: number;
}

/** 服从度进度环 */
function ObedienceRing({ clicks }: { clicks: number }) {
  // 10次点击 = 100%，最高封顶
  const percent = Math.min((clicks / 10) * 100, 100);
  const R = 28;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - percent / 100);

  // 颜色随进度变化：红 → 橙 → 金 → 绿
  const getColor = (p: number) => {
    if (p < 33) return { stroke: '#f87171', text: '#ef4444' };
    if (p < 66) return { stroke: '#fb923c', text: '#f97316' };
    if (p < 90) return { stroke: '#fbbf24', text: '#f59e0b' };
    return { stroke: '#4ade80', text: '#22c55e' };
  };
  const { stroke, text } = getColor(percent);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: 72, height: 72 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
          {/* 底环 */}
          <circle
            cx="36" cy="36" r={R}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="5"
          />
          {/* 进度环 */}
          <circle
            cx="36" cy="36" r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        {/* 中心文字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: 13, fontWeight: 800, color: text, lineHeight: 1, transition: 'color 0.3s ease' }}>
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      <span className="text-slate-400 text-[10px] font-medium mt-1 tracking-wide">
        本周服从度
      </span>
    </div>
  );
}

export function StatusHeader({ status, weeklyClicks = 0 }: Props) {
  // 头像彩蛋状态
  const [avatarPopup, setAvatarPopup] = useState<string | null>(null);
  const avatarClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 用 ref 追踪连续点击次数
  const avatarClickCountRef = useRef(0);

  // 头像彩蛋处理
  const handleAvatarClick = () => {
    if (avatarClickTimer.current) {
      clearTimeout(avatarClickTimer.current);
    }

    avatarClickCountRef.current++;

    if (avatarClickCountRef.current === 5) {
      // 第5次点击：显示弹窗
      setAvatarPopup('tease');
      avatarClickCountRef.current = 0;
      setTimeout(() => setAvatarPopup(null), 4000);
    } else {
      // 2秒无操作重置计数
      avatarClickTimer.current = setTimeout(() => {
        avatarClickCountRef.current = 0;
      }, 2000);
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case '开心': return '🥰';
      case '乖巧': return '🐶';
      case '委屈': return '🥺';
      case '思过': return '🤐';
      default: return '🐶';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-300"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* 可点击的头像 */}
            <div
              onClick={handleAvatarClick}
              className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-4xl shadow-inner border border-blue-100 cursor-pointer select-none hover:scale-105 hover:border-blue-300 active:scale-95 transition-all duration-200"
            >
              {getMoodEmoji(status.mood)}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">小狗 米粒</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100">
                {status.levelName} (Lv.{status.level})
              </span>
              <span className="text-slate-500 text-sm">今日心情: {status.mood}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
          {/* 服从度环 */}
          <ObedienceRing clicks={weeklyClicks} />

          {/* 积分卡 */}
          <div className="flex-1 md:flex-none bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center min-w-[120px]">
            <Heart className="w-5 h-5 text-blue-500 mb-2" />
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">当前积分</span>
            <span className="text-2xl font-bold text-slate-800 mb-1">{status.points}</span>
          </div>
        </div>
      </motion.div>

      {/* 头像彩蛋弹窗 */}
      {avatarPopup === 'tease' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-popup-appear">
            <div className="relative">
              {/* 背景装饰 */}
              <div className="absolute -inset-4 rounded-3xl blur-xl animate-pulse bg-gradient-to-r from-purple-500/20 via-pink-400/30 to-purple-500/20" />
              <div className="relative border-2 border-purple-400/50 rounded-2xl px-8 py-6 shadow-2xl shadow-purple-900/50 bg-purple-900/95">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl animate-bounce">😈</div>
                <p className="text-2xl font-bold text-purple-100 text-center tracking-wide drop-shadow-lg">
                  这么想被我玩弄吗？
                </p>
                <p className="text-xl text-pink-300 text-center mt-1 font-medium">
                  胆子越来越大了
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
