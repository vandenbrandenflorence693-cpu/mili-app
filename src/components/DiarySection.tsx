import React, { useState, useRef } from 'react';
import { DiaryEntry, Mood, Role } from '../types';
import { InventoryItem } from '../types';
import {
  Image as ImageIcon,
  Heart,
  MessageSquare,
  Sparkles,
  BookOpen,
  Send,
  Star,
  Plus,
  Camera,
  X,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  entries: DiaryEntry[];
  inventory: InventoryItem[];
  onAddEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  role?: Role;
}

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: '乖巧', label: '乖巧', emoji: '🐶' },
  { value: '开心', label: '开心', emoji: '🥰' },
  { value: '委屈', label: '委屈', emoji: '🥺' },
  { value: '思过', label: '思过', emoji: '🤐' },
];

function getTypeLabel(type: DiaryEntry['type']) {
  switch (type) {
    case 'praise': return '随手夸奖';
    case 'reflection': return '检讨书';
    case 'photo': return '任务记录';
    case 'card': return '使用卡片';
    case 'diary': return '小狗日记';
    default: return '';
  }
}

function getTypeStyle(type: DiaryEntry['type']) {
  switch (type) {
    case 'praise': return 'bg-rose-50 border-rose-200 text-rose-600';
    case 'reflection': return 'bg-blue-50 border-blue-200 text-blue-600';
    case 'photo': return 'bg-indigo-50 border-indigo-200 text-indigo-600';
    case 'card': return 'bg-amber-50 border-amber-200 text-amber-600';
    case 'diary': return 'bg-emerald-50 border-emerald-200 text-emerald-600';
    default: return '';
  }
}

function getIcon(type: DiaryEntry['type']) {
  switch (type) {
    case 'praise': return <Heart className="w-4 h-4 text-rose-500" />;
    case 'reflection': return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'photo': return <ImageIcon className="w-4 h-4 text-indigo-500" />;
    case 'card': return <Sparkles className="w-4 h-4 text-amber-500" />;
    case 'diary': return <BookOpen className="w-4 h-4 text-emerald-500" />;
    default: return null;
  }
}

function DiaryCard({ entry }: { entry: DiaryEntry }) {
  const isPhoto = entry.type === 'photo';
  const isCard = entry.type === 'card';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-xs font-semibold">{entry.date}</span>
        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getTypeStyle(entry.type)}`}>
          {getTypeLabel(entry.type)}
        </span>
      </div>

      {isCard && entry.cardItem && (
        <div className="mb-2 flex items-center gap-2 text-xs text-amber-600 font-medium">
          <Star className="w-3 h-3" />
          使用了「{entry.cardItem}」
        </div>
      )}

      {entry.mood && (
        <div className="mb-2 flex items-center gap-1 text-xs text-slate-500">
          {MOODS.find(m => m.value === entry.mood)?.emoji}
          <span>当时心情：{entry.mood}</span>
        </div>
      )}

      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>

      {isPhoto && entry.imageUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 relative group/img shadow-sm">
          <img
            src={entry.imageUrl}
            alt="任务记录"
            className="w-full h-auto object-cover transform group-hover/img:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-[2px]">
            <span className="text-white text-sm font-bold tracking-wider drop-shadow-md">主人专属视角查收 ♡</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/** 写日记表单 */
function WriteDiaryForm({ onSubmit, role }: { onSubmit: (entry: Omit<DiaryEntry, 'id'>) => void; role?: Role }) {
  const isMaster = role === 'master';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('乖巧');
  const [expanded, setExpanded] = useState(false);
  const [entryType, setEntryType] = useState<DiaryEntry['type']>(isMaster ? 'praise' : 'diary');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // 主人端只能夸奖，小狗端可选日记或检讨书
  const typeOptions: { value: DiaryEntry['type']; label: string; emoji: string; color: string }[] = isMaster
    ? [{ value: 'praise', label: '随手夸奖', emoji: '💕', color: 'rose' }]
    : [
        { value: 'diary', label: '小狗日记', emoji: '📖', color: 'emerald' },
        { value: 'reflection', label: '检讨书', emoji: '😢', color: 'blue' },
      ];

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({
      type: imageUrl ? 'photo' : entryType,
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      mood: entryType === 'reflection' ? '思过' : mood, // 检讨书自动设置心情为"思过"
      imageUrl: imageUrl || undefined,
    });
    setContent('');
    setExpanded(false);
    setImageUrl('');
  };

  const accentColor = isMaster ? 'rose' : 'emerald';
  const colorClasses = {
    border: `border-${accentColor}-200`,
    bg: `bg-${accentColor}-50`,
    button: `bg-${accentColor}-500 hover:bg-${accentColor}-600`,
    active: `bg-${accentColor}-500 border-${accentColor}-500 text-white`,
    inactive: 'bg-white border-slate-200 text-slate-500',
  };

  const placeholder = isMaster
    ? '夸夸今天表现好的地方...'
    : entryType === 'reflection'
    ? '深刻反省自己的错误...'
    : '今天想记录些什么...';

  if (!expanded) {
    return (
      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] ml-auto md:mr-[calc(50%-2.5rem)]">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setExpanded(true)}
          className={`w-full py-3 rounded-2xl border-2 border-dashed border-${accentColor}-300 bg-${accentColor}-50/50
            text-${accentColor}-600 text-sm font-medium hover:border-${accentColor}-400 hover:bg-${accentColor}-50
            transition-all flex items-center justify-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          {isMaster ? '随手夸奖' : '写日记'}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] ml-auto md:mr-[calc(50%-2.5rem)]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border ${colorClasses.border} bg-white shadow-md overflow-hidden`}
      >
        {/* 类型选择（仅小狗端显示） */}
        {!isMaster && (
          <div className={`px-4 pt-4 pb-2 border-b ${colorClasses.border.replace('border', 'border-').replace('-200', '-100')}`}>
            <p className="text-xs text-slate-400 font-medium mb-2">记录类型</p>
            <div className="flex gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEntryType(opt.value)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    entryType === opt.value ? colorClasses.active : colorClasses.inactive
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 心情选择（仅日记类型显示） */}
        {isMaster || entryType === 'diary' ? (
          <div className={`px-4 pt-4 pb-2 border-b ${colorClasses.border.replace('border', 'border-').replace('-200', '-100')}`}>
            <p className="text-xs text-slate-400 font-medium mb-2">此刻心情</p>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    mood === m.value ? colorClasses.active : colorClasses.inactive
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* 文本输入 */}
        <div className="px-4 py-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full bg-transparent text-slate-700 text-sm leading-relaxed resize-none outline-none placeholder-slate-300"
            autoFocus
          />
        </div>

        {/* 图片上传区域 */}
        <div className="px-4 pb-3">
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={imageUrl} alt="预览" className="w-full h-40 object-cover" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl py-4 flex flex-col items-center gap-2 cursor-pointer transition-colors"
            >
              {isUploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-indigo-300 border-t-indigo-500 rounded-full"></div>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-400">点击上传照片</span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* 操作栏 */}
        <div className={`px-4 py-3 ${colorClasses.bg}/50 border-t ${colorClasses.border.replace('border', 'border-').replace('-200', '-100')} flex justify-end gap-2`}>
          <button
            onClick={() => { setExpanded(false); setContent(''); }}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`px-4 py-2 rounded-xl ${colorClasses.button} disabled:bg-slate-200 disabled:text-slate-400
              text-white text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm`}
          >
            <Send className="w-3.5 h-3.5" />
            记录
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** 卡包使用记录列表 */
function CardUsagePanel({ inventory }: { inventory: InventoryItem[] }) {
  const [open, setOpen] = useState(false);
  const usedItems = inventory.filter(i => i.createdAt); // 全部显示，有createdAt即表示已获得

  if (usedItems.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-amber-200 bg-amber-50/60
          hover:bg-amber-100 transition-all text-sm"
      >
        <div className="flex items-center gap-2 text-amber-700 font-medium">
          <Sparkles className="w-4 h-4" />
          卡包收藏 ({usedItems.length} 张)
        </div>
        <span className="text-amber-400 text-xs">{open ? '收起' : '展开'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 grid grid-cols-3 gap-2">
              {usedItems.map((inv) => {
                const rarityColors: Record<string, string> = {
                  N: 'border-slate-300 bg-slate-50',
                  R: 'border-blue-300 bg-blue-50',
                  SR: 'border-purple-300 bg-purple-50',
                  SSR: 'border-amber-400 bg-gradient-to-br from-yellow-50 to-orange-50',
                };
                const color = rarityColors[inv.item.rarity] || rarityColors.N;
                return (
                  <div
                    key={inv.id}
                    className={`rounded-xl border p-3 text-center ${color}`}
                  >
                    <p className="text-xs font-bold text-slate-700 mb-0.5 leading-tight">
                      {inv.item.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{inv.item.rarity}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DiarySection({ entries, inventory, onAddEntry, role }: Props) {
  const isMaster = role === 'master';
  
  return (
    <div>
      {/* 卡包使用记录 */}
      <CardUsagePanel inventory={inventory} />

      {/* 写日记入口 */}
      <div className="mb-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-200 before:to-transparent">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full border-4 border-white bg-emerald-100 shrink-0 z-10 flex items-center justify-center shadow-sm">
            {isMaster ? <Heart className="w-4 h-4 text-rose-500" /> : <BookOpen className="w-4 h-4 text-emerald-500" />}
          </div>
          <WriteDiaryForm onSubmit={onAddEntry} role={role} />
        </div>
      </div>

      {/* 日记时间线 */}
      <div className="relative md:before:absolute md:before:inset-0 md:before:ml-5 md:before:-translate-x-px md:before:mx-auto md:before:translate-x-0 md:before:h-full md:before:w-0.5 md:before:bg-gradient-to-b md:before:from-transparent md:before:via-blue-200 md:before:to-transparent">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 flex items-center justify-center">
              {getIcon(entry.type)}
            </div>
            <DiaryCard entry={entry} />
          </div>
        ))}
      </div>
    </div>
  );
}
