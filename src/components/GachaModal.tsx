import React, { useEffect, useState } from 'react';
import { ShopItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, X } from 'lucide-react';

interface Props {
  results: ShopItem[];
  onClose: () => void;
}

export function GachaModal({ results, onClose }: Props) {
  const [step, setStep] = useState<'animating' | 'revealed'>('animating');
  const hasSSR = results.some(r => r.rarity === 'SSR');
  const hasSR = results.some(r => r.rarity === 'SR');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('revealed');
    }, 2000); // 2 second suspense
    return () => clearTimeout(timer);
  }, []);

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'from-amber-400 via-rose-400 to-amber-500 text-transparent bg-clip-text drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)]';
      case 'SR': return 'from-indigo-400 to-purple-500 text-transparent bg-clip-text drop-shadow-[0_2px_4px_rgba(99,102,241,0.3)]';
      case 'R': return 'from-emerald-400 to-teal-500 text-transparent bg-clip-text';
      default: return 'text-slate-400';
    }
  };

  const getCardStyle = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'bg-gradient-to-br from-white to-amber-50 border-amber-300 shadow-[0_8px_30px_rgba(245,158,11,0.2)]';
      case 'SR': return 'bg-gradient-to-br from-white to-indigo-50 border-indigo-300 shadow-[0_8px_20px_rgba(99,102,241,0.2)]';
      case 'R': return 'bg-gradient-to-br from-white to-emerald-50 border-emerald-200 shadow-lg';
      default: return 'bg-white border-slate-200 shadow-md';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md overflow-hidden">
      {/* Background Magic Effects */}
      {hasSSR && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-rose-100/50 to-amber-200/50 animate-pulse"></div>
          {/* Confetti or Stars placeholder - we'll just use floating elements */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100vh', x: Math.random() * window.innerWidth, scale: 0 }}
              animate={{ 
                y: -100, 
                x: Math.random() * window.innerWidth, 
                scale: Math.random() * 1.5 + 0.5,
                rotate: 360 
              }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute text-amber-500 z-0"
            >
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </motion.div>
          ))}
          {/* Rainbow ring around center */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full w-[800px] h-[800px] border-[10px] border-dashed border-amber-300/30 blur-xl"
          />
        </>
      )}

      {hasSR && !hasSSR && (
        <div className="absolute inset-0 bg-indigo-100/50 blur-3xl animate-pulse"></div>
      )}

      <AnimatePresence mode="wait">
        {step === 'animating' ? (
          <motion.div
            key="suspense"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: 1 }}
            className="relative z-10 flex flex-col items-center justify-center"
          >
            {hasSSR ? (
              <Sparkles className="w-24 h-24 text-amber-500 animate-spin" />
            ) : hasSR ? (
              <Sparkles className="w-24 h-24 text-indigo-500 animate-spin" />
            ) : (
              <Star className="w-24 h-24 text-blue-400 animate-spin" />
            )}
            <h2 className="mt-8 text-2xl font-bold tracking-widest text-slate-800 animate-pulse">
              小狗祈愿中...
            </h2>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative z-10 max-w-4xl w-full p-4 h-[80vh] flex flex-col items-center justify-center"
          >
            <div className="flex items-center justify-between w-full mb-8">
              <h2 className={`text-4xl font-black italic bg-gradient-to-r ${hasSSR ? 'from-amber-500 via-rose-500 to-amber-600 shadow-[0_4px_20px_rgba(245,158,11,0.2)]' : hasSR ? 'from-indigo-500 to-purple-600' : 'from-blue-500 to-cyan-500'} text-transparent bg-clip-text drop-shadow-sm text-center flex-grow pl-10`}>
                {hasSSR ? "奇迹降临！SSR获得！🐶🌸" : hasSR ? "紫光乍现！SR获得！" : "祈愿成功！"}
              </h2>
              <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className={`grid gap-4 w-full place-items-center ${results.length > 1 ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-1'}`}>
              {results.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, y: 50, rotateY: 90 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className={`w-full max-w-[200px] aspect-[3/4] p-4 flex flex-col items-center justify-center text-center rounded-2xl border ${getCardStyle(item.rarity)} relative overflow-hidden group`}
                >
                  {/* Sheen effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  
                  <div className={`text-3xl font-black italic mb-2 bg-gradient-to-b ${getRarityColors(item.rarity)}`}>
                    {item.rarity}
                  </div>
                  <h3 className="text-slate-800 font-bold text-sm mb-2 relative z-10">{item.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-3 relative z-10">{item.description}</p>
                </motion.div>
              ))}
            </div>

            {hasSSR && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center"
              >
                <div className="text-5xl mb-4">🐶🌸✨</div>
                <p className="text-amber-500 font-bold drop-shadow-sm">小狗开心地跳了起来并撒出鲜花！</p>
              </motion.div>
            )}
            
            <button 
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              收下奖励
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
