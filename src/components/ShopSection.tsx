import React, { useState } from 'react';
import { ShopItem, Rarity, InventoryItem, Role } from '../types';
import { Bone, Star, Lock, Plus, Trash2, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GachaModal } from './GachaModal';

interface Props {
  role: Role;
  items: ShopItem[];
  points: number;
  inventory: InventoryItem[];
  onAddItem: (item: Omit<ShopItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onPurchaseItem: (cost: number) => void;
  onAddInventoryItems: (items: ShopItem[]) => void;
  onUseInventoryItem: (id: string) => void;
}

export function ShopSection({ role, items, points, inventory, onAddItem, onDeleteItem, onPurchaseItem, onAddInventoryItems, onUseInventoryItem }: Props) {
  const [activeTab, setActiveTab] = useState<'store' | 'gacha' | 'inventory'>('gacha');
  const [isCreating, setIsCreating] = useState(false);
  const [gachaResults, setGachaResults] = useState<ShopItem[] | null>(null);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    cost: 50,
    rarity: 'N' as Rarity
  });

  const getRarityDecor = (rarity: Rarity) => {
    switch (rarity) {
      case 'SSR': return 'bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-[0_4px_14px_rgba(245,158,11,0.1)]';
      case 'SR': return 'bg-gradient-to-br from-white to-indigo-50 border-indigo-200 shadow-[0_4px_10px_rgba(79,70,229,0.1)]';
      case 'R': return 'bg-gradient-to-br from-white to-emerald-50 border-emerald-200 shadow-sm';
      case 'N': return 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm';
    }
  };

  const getRarityBadge = (rarity: Rarity) => {
    switch (rarity) {
      case 'SSR': return 'bg-amber-100 text-amber-600 border-amber-200 font-black';
      case 'SR': return 'bg-indigo-100 text-indigo-600 border-indigo-200 font-bold';
      case 'R': return 'bg-emerald-100 text-emerald-600 border-emerald-200 font-medium';
      case 'N': return 'bg-slate-100 text-slate-500 border-slate-200 font-normal';
    }
  };

  const handleAdd = () => {
    if (!newItem.title) return;
    onAddItem(newItem);
    setNewItem({ title: '', description: '', cost: 50, rarity: 'N' });
    setIsCreating(false);
  };

  const handleGacha = (times: number) => {
    const cost = times === 1 ? 10 : 90;
    if (points < cost) return;
    
    onPurchaseItem(cost); // Deduct points

    const results: ShopItem[] = [];
    let hasSRorSSRThisTenPull = false;
    
    for (let i = 0; i < times; i++) {
        let rand = Math.random() * 100;
        let rarity: Rarity;

        if (times === 10 && i === 9 && !hasSRorSSRThisTenPull) {
            // Pity for 10th pull
            rarity = (Math.random() * 100 < 2) ? 'SSR' : 'SR';
        } else {
            if (rand < 70) rarity = 'N'; // 70%
            else if (rand < 90) rarity = 'R'; // 20%
            else if (rand < 98) rarity = 'SR'; // 8%
            else rarity = 'SSR'; // 2%
        }

        if (rarity === 'SR' || rarity === 'SSR') {
            hasSRorSSRThisTenPull = true;
        }

        const pool = items.filter(it => it.rarity === rarity);
        if (pool.length > 0) {
            results.push(pool[Math.floor(Math.random() * pool.length)]);
        } else {
            results.push({ id: `fb-${Date.now()}-${i}`, title: `神秘碎片 (${rarity})`, description: `卡池中没有 ${rarity} 卡牌`, cost: 0, rarity });
        }
    }
    
    onAddInventoryItems(results);
    setGachaResults(results);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header and Points */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Bone className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-slate-800">骨头商店</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            可用积分: <span className="text-xl font-bold text-blue-600 ml-1">{points}</span>
          </div>
          {activeTab === 'store' && (
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-[0_4px_10px_rgba(59,130,246,0.3)] shrink-0"
            >
              <Plus className={`w-5 h-5 transition-transform ${isCreating ? 'rotate-45' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button 
          onClick={() => setActiveTab('gacha')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'gacha' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
        >
          <Sparkles className="w-4 h-4" />
          抽卡区
        </button>
        {role === 'master' && (
          <button 
            onClick={() => setActiveTab('store')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'store' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
          >
            <Star className="w-4 h-4" />
            卡池商品
          </button>
        )}
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
        >
          <Package className="w-4 h-4" />
          我的卡包
          {inventory.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{inventory.length}</span>}
        </button>
      </div>

      {/* Gacha Tab */}
      {activeTab === 'gacha' && (
        <div className="space-y-8 py-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-800 italic">奇迹小狗祈愿</h2>
            <p className="text-slate-500 text-sm">卡牌掉落率: N(70%) R(20%) SR(8%) SSR(2%)</p>
            <p className="text-blue-500 font-medium text-xs italic">10连抽保底必出SR或以上珍稀卡牌！</p>
          </div>

          <div className="flex gap-4 max-w-sm mx-auto">
            <button 
              onClick={() => handleGacha(1)}
              disabled={points < 10}
              className="flex-1 py-4 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
            >
              <span className="font-bold text-slate-700">单次祈愿</span>
              <span className="text-sm font-mono text-slate-500 flex items-center gap-1"><Bone className="w-3 h-3"/> 10 积分</span>
            </button>
            <button 
              onClick={() => handleGacha(10)}
              disabled={points < 90}
              className="flex-1 py-4 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <span className="font-black italic drop-shadow-md relative z-10">10 连祈愿</span>
              <span className="text-sm font-mono flex items-center gap-1 relative z-10"><Bone className="w-3 h-3"/> 90 积分</span>
            </button>
          </div>
        </div>
      )}

      {/* Store Tab */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <AnimatePresence>
            {isCreating && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-blue-200 shadow-sm rounded-2xl p-6 space-y-5 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">稀有度</label>
                      <select 
                        value={newItem.rarity}
                        onChange={(e) => setNewItem({...newItem, rarity: e.target.value as 'N'|'R'|'SR'|'SSR'})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                      >
                        <option value="N">N (普通)</option>
                        <option value="R">R (稀有)</option>
                        <option value="SR">SR (超稀有)</option>
                        <option value="SSR">SSR (极品稀有)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">卡牌名称</label>
                      <input 
                        type="text"
                        placeholder="例如：主人的摸摸头"
                        value={newItem.title}
                        onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 opacity-50 cursor-not-allowed">
                      <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">单购价格 (暂不可用)</label>
                      <input 
                        type="number"
                        disabled
                        value={newItem.cost || ''}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-400 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">具体描述 (可选)</label>
                      <input 
                        type="text"
                        placeholder="详细描述卡牌特效..."
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleAdd}
                    disabled={!newItem.title}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:border text-white rounded-xl font-bold transition-colors shadow-sm"
                  >
                    存入卡池
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.length === 0 && !isCreating ? (
            <div className="text-slate-400 text-sm italic py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              卡池目前空空如也，主人请添加卡牌。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group block"
                >
                  <div className={`h-full flex flex-col p-5 rounded-2xl border ${getRarityDecor(item.rarity)} overflow-hidden transition-all duration-300 relative`} >
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 z-20"
                      title="从卡池移除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex justify-between items-start mb-3 pr-8 relative z-10">
                      <span className={`px-2.5 py-0.5 text-[10px] rounded border uppercase italic ${getRarityBadge(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1 relative z-10">{item.title}</h4>
                    <p className="text-slate-500 text-xs flex-grow relative z-10">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {inventory.length === 0 ? (
            <div className="text-slate-400 text-sm italic py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              小狗还没有抽到任何奖励卡哦。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {inventory.map((inv, idx) => (
                <motion.div
                  key={`${inv.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`flex flex-col p-5 rounded-2xl border ${getRarityDecor(inv.item.rarity)} overflow-hidden relative shadow-sm hover:shadow-md transition-all group bg-white`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 text-[10px] rounded border uppercase italic ${getRarityBadge(inv.item.rarity)}`}>
                      {inv.item.rarity}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      {new Date(parseInt(inv.id)).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="text-md font-bold text-slate-800 mb-2 line-clamp-1">{inv.item.title}</h4>
                  <p className="text-slate-500 text-xs flex-grow line-clamp-2 mb-5">{inv.item.description}</p>
                  
                  <button 
                    onClick={() => onUseInventoryItem(inv.id)}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-[0_4px_10px_rgba(59,130,246,0.2)]"
                  >
                    立即使用
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {gachaResults && (
        <GachaModal 
          results={gachaResults} 
          onClose={() => setGachaResults(null)} 
        />
      )}
    </div>
  );
}
