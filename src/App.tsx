/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { initialStatus, rules, initialDebts, shopItems, initialDiary } from './data';
import { Role, Rule, InventoryItem, ShopItem, DiaryEntry } from './types';
import { StatusHeader } from './components/StatusHeader';
import { Collar } from './components/Collar';
import { RulesSection } from './components/RulesSection';
import { DebtSection } from './components/DebtSection';
import { ShopSection } from './components/ShopSection';
import { DiarySection } from './components/DiarySection';
import { Navigation, TabId } from './components/Navigation';
import { supabase } from './lib/supabase';

export default function App() {
  const loadData = <T,>(key: string, defaultData: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultData;
    } catch {
      return defaultData;
    }
  };

  const [role, setRole] = useState<Role | null>(() => loadData('app_role', null));
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('status');
  
  const [loading, setLoading] = useState(true);

  // 小狗按钮彩蛋状态
  const [puppyClickCount, setPuppyClickCount] = useState(0);
  const [puppyPopup, setPuppyPopup] = useState<string | null>(null);
  const puppyClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { localStorage.setItem('app_role', JSON.stringify(role)); }, [role]);

  // 小狗按钮彩蛋处理
  const handlePuppyClick = () => {
    // 清除之前的计时器
    if (puppyClickTimer.current) {
      clearTimeout(puppyClickTimer.current);
    }

    const newCount = puppyClickCount + 1;

    if (newCount === 5) {
      // 第5次点击：显示第一个弹窗
      setPuppyPopup('discovered');
      setPuppyClickCount(0);
      setTimeout(() => setPuppyPopup(null), 3000);
    } else if (newCount >= 10) {
      // 再5次点击（共10次）：显示第二个弹窗
      setPuppyPopup('tease');
      setPuppyClickCount(0);
      setTimeout(() => setPuppyPopup(null), 4000);
    } else {
      setPuppyClickCount(newCount);
      // 2秒无操作重置计数
      puppyClickTimer.current = setTimeout(() => {
        setPuppyClickCount(0);
      }, 2000);
    }
  };

  const handleMasterLogin = () => {
    if (passwordInput === '201874') {
      setRole('master');
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };
  
  const [status, setStatus] = useState(initialStatus);
  const [rulesList, setRulesList] = useState<Rule[]>(rules);
  const [debtsList, setDebtsList] = useState(initialDebts);
  const [shopItemsList, setShopItemsList] = useState<ShopItem[]>(shopItems);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);

  // 本周服从度：按 ISO 周数作为 key，bonus 点击即 +1
  const getWeekKey = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
  };

  const [weeklyClicks, setWeeklyClicks] = useState<number>(() => {
    const saved = loadData<{ key: string; count: number } | null>('weekly_obedience', null);
    return saved && saved.key === getWeekKey() ? saved.count : 0;
  });

  // 每次 bonus 点击计数
  const recordBonusClick = () => {
    setWeeklyClicks(prev => {
      const next = prev + 1;
      localStorage.setItem('weekly_obedience', JSON.stringify({ key: getWeekKey(), count: next }));
      return next;
    });
  };

  // 日记
  const [diaryEntries, setDiaryEntries] = useState(() => loadData('app_diary', initialDiary));

  const handleAddDiaryEntry = (entry: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = { ...entry, id: Date.now().toString() };
    setDiaryEntries(prev => [newEntry, ...prev]);
  };

  const handleUseInventoryItem = (id: string) => {
    const item = inventoryList.find(i => i.id === id);
    if (!item) return;
    setInventoryList(prev => prev.filter(i => i.id !== id));
    // 追加卡牌使用记录
    const cardEntry: DiaryEntry = {
      id: `card-${Date.now()}`,
      type: 'card',
      cardItem: item.item.title,
      content: `主人批准使用了「${item.item.title}」，效果已生效。`,
      date: new Date().toISOString().split('T')[0],
    };
    setDiaryEntries(prev => [cardEntry, ...prev]);
  };

  // Load from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        // Fallback to localStorage if Supabase is not configured
        setStatus(loadData('app_status', initialStatus));
        setRulesList(loadData('app_rules', rules));
        setDebtsList(loadData('app_debts', initialDebts));
        setShopItemsList(loadData('app_shopItems', shopItems));
        setInventoryList(loadData('app_inventory', []));
        setDiaryEntries(loadData('app_diary', initialDiary));
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.from('app_data').select('data').eq('id', 1).single();
        if (data && data.data) {
          const dbData = data.data;
          if (dbData.status) setStatus(dbData.status);
          if (dbData.rulesList) setRulesList(dbData.rulesList);
          if (dbData.debtsList) setDebtsList(dbData.debtsList);
          if (dbData.shopItemsList) setShopItemsList(dbData.shopItemsList);
          if (dbData.inventoryList) setInventoryList(dbData.inventoryList);
          if (dbData.diaryEntries) setDiaryEntries(dbData.diaryEntries);
        }
      } catch (err) {
        console.error("Failed to load from Supabase:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Save to Supabase (or localStorage fallback)
  useEffect(() => {
    if (loading) return; // Don't override with initial state during load
    
    if (supabase) {
      const syncData = async () => {
        const dataToSave = { status, rulesList, debtsList, shopItemsList, inventoryList, diaryEntries };
        await supabase.from('app_data').upsert({ id: 1, data: dataToSave, updated_at: new Date().toISOString() });
      };
      syncData();
    } else {
      localStorage.setItem('app_status', JSON.stringify(status));
      localStorage.setItem('app_rules', JSON.stringify(rulesList));
      localStorage.setItem('app_debts', JSON.stringify(debtsList));
      localStorage.setItem('app_shopItems', JSON.stringify(shopItemsList));
      localStorage.setItem('app_inventory', JSON.stringify(inventoryList));
      localStorage.setItem('app_diary', JSON.stringify(diaryEntries));
    }
  }, [status, rulesList, debtsList, shopItemsList, inventoryList, diaryEntries, loading]);

  const handleApplyRule = (rule: Rule) => {
    if (rule.category === 'bonus') {
      handleUpdatePoints(rule.points || 0);
      recordBonusClick(); // 记录服从度
      setActiveTab('status'); // 直接跳转状态查看获得积分
    } else {
      setDebtsList(prev => [{
        id: Date.now().toString(),
        reason: rule.title,
        punishment: rule.punishment || rule.effect.replace('记债: ', ''),
        createdAt: new Date().toISOString().split('T')[0],
        status: 'pending'
      }, ...prev]);
      setActiveTab('debts'); // 自动跳转债务列表查看被记债
    }
  };

  const handleAddRule = (newRule: Omit<Rule, 'id'>) => {
    setRulesList(prev => [...prev, { ...newRule, id: Date.now().toString() }]);
  };

  const handleDeleteRule = (id: string) => {
    setRulesList(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdatePoints = (delta: number) => {
    setStatus(prev => ({ ...prev, points: Math.max(0, prev.points + delta) }));
  };

  const handleAddShopItem = (newItem: Omit<ShopItem, 'id'>) => {
    setShopItemsList(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
  };

  const handleDeleteShopItem = (id: string) => {
    setShopItemsList(prev => prev.filter(i => i.id !== id));
  };

  const handleCompleteDebt = (id: string) => {
    setDebtsList(prev => prev.map(d => d.id === id ? { ...d, status: 'completed' } : d));
  };

  const handlePurchaseShopItem = (cost: number) => {
    handleUpdatePoints(-cost);
  };

  const handleAddInventoryItems = (items: ShopItem[]) => {
    const newItems = items.map(item => ({ id: Date.now().toString() + Math.random(), item, createdAt: new Date().toISOString() }));
    setInventoryList(prev => [...newItems, ...prev]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="animate-spin text-blue-500 mb-4 rounded-full border-t-2 border-b-2 border-current w-12 h-12"></div>
        <p className="text-slate-500 font-medium">加载数据中...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="mb-12 flex flex-col items-center gap-2">
          <p className="text-[10px] tracking-[0.35em] text-slate-400 uppercase font-medium">Private · Exclusive</p>
          <h1 className="text-4xl font-black tracking-[0.08em] bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400 bg-clip-text text-transparent">
            米粒の領域
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-300"></span>
            <p className="text-[10px] tracking-[0.25em] text-slate-400">DISCIPLINE · SYSTEM</p>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-sky-300"></span>
          </div>
        </div>
        {showPasswordPrompt ? (
          <div className="space-y-4 w-full max-w-sm bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-blue-900/5">
            <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">请输入主人密码</h2>
            <input 
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMasterLogin()}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-3 text-slate-800 text-center tracking-widest outline-none transition-colors placeholder-slate-400"
              placeholder="******"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center">密码错误，请重试</p>
            )}
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setShowPasswordPrompt(false); setPasswordInput(''); setPasswordError(false); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors"
              >
                返回
              </button>
              <button 
                onClick={handleMasterLogin}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
              >
                验证
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 w-full max-w-sm">
            <button 
              onClick={() => setShowPasswordPrompt(true)}
              className="w-full py-6 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5 rounded-3xl flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl relative z-10">👑</span>
              <span className="font-bold text-slate-800 group-hover:text-blue-600 relative z-10">我是主人 (金渔)</span>
              <span className="text-xs text-slate-400 relative z-10">进入后台管理系统</span>
            </button>
            
            <button
              onClick={() => {
                handlePuppyClick();
                // 只有正常进入时才设置角色（不被彩蛋拦截时）
                setTimeout(() => {
                  if (puppyClickCount < 4) {
                    setRole('puppy');
                  }
                }, 50);
              }}
              className="w-full py-6 bg-white border border-slate-200 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-900/5 rounded-3xl flex flex-col items-center gap-2 transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl relative z-10">🐶</span>
              <span className="font-bold text-slate-800 group-hover:text-sky-600 relative z-10">我是小狗 (米粒)</span>
              <span className="text-xs text-slate-400 relative z-10">进入小狗专属终端</span>
            </button>

            <Collar />

            {/* 小狗按钮彩蛋弹窗 */}
            {puppyPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className={`puppy-frenzy-popup animate-popup-appear ${
                  puppyPopup === 'discovered' ? 'bg-sky-900/95' : 'bg-purple-900/95'
                }`}>
                  <div className="relative">
                    {/* 背景装饰 */}
                    <div className={`absolute -inset-4 rounded-3xl blur-xl animate-pulse ${
                      puppyPopup === 'discovered'
                        ? 'bg-gradient-to-r from-sky-500/20 via-cyan-400/30 to-sky-500/20'
                        : 'bg-gradient-to-r from-purple-500/20 via-pink-400/30 to-purple-500/20'
                    }`} />
                    <div className={`relative border-2 rounded-2xl px-8 py-6 shadow-2xl ${
                      puppyPopup === 'discovered'
                        ? 'border-sky-400/50 shadow-sky-900/50'
                        : 'border-purple-400/50 shadow-purple-900/50'
                    }`}>
                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-5xl animate-bounce ${
                        puppyPopup === 'discovered' ? '' : ''
                      }`}>
                        {puppyPopup === 'discovered' ? '👀' : '😈'}
                      </div>
                      {puppyPopup === 'discovered' ? (
                        <>
                          <p className="text-2xl font-bold text-sky-100 text-center tracking-wide drop-shadow-lg">
                            被发现了呢……
                          </p>
                          <p className="text-xl text-cyan-300 text-center mt-1 font-medium">
                            小狗
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-purple-100 text-center tracking-wide drop-shadow-lg">
                            这么想被我玩弄吗？
                          </p>
                          <p className="text-xl text-pink-300 text-center mt-1 font-medium">
                            胆子越来越大了
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans selection:bg-blue-500/20">
      <header className="sticky top-0 z-40 bg-[#f8fafc]/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center">
        <div className="w-14"></div>
        <h1 className="text-center font-bold tracking-[0.12em] text-sm bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent uppercase">
          米粒の領域
        </h1>
        <button 
          onClick={() => setRole(null)}
          className="w-14 text-xs font-medium text-slate-400 hover:text-blue-500 text-right transition-colors"
        >
          切换身份
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="mb-6">
          <StatusHeader status={status} weeklyClicks={weeklyClicks} />
        </div>

        <div className="pt-2">
          {activeTab === 'status' && (
            <div className="space-y-6 text-center py-12">
              <h2 className="text-2xl font-bold text-slate-800">欢迎回来，{role === 'master' ? '金渔' : '米粒'}。</h2>
              <p className="text-slate-500">
                {role === 'master' ? '小狗米粒今天也很乖哦。请通过下方导航栏查看各项指标或下达指令。' : '今天有乖乖听主人的话吗？记得查看规训清单哦。'}
              </p>
            </div>
          )}
          {activeTab === 'rules' && <RulesSection role={role} rules={rulesList} onAddRule={handleAddRule} onDeleteRule={handleDeleteRule} onApplyRule={handleApplyRule} />}
          {activeTab === 'debts' && <DebtSection role={role} debts={debtsList} onCompleteDebt={handleCompleteDebt} />}
          {activeTab === 'shop' && <ShopSection 
            role={role}
            items={shopItemsList} 
            points={status.points} 
            inventory={inventoryList}
            onAddItem={handleAddShopItem} 
            onDeleteItem={handleDeleteShopItem} 
            onPurchaseItem={handlePurchaseShopItem} 
            onAddInventoryItems={handleAddInventoryItems}
            onUseInventoryItem={handleUseInventoryItem}
          />}
          {activeTab === 'diary' && (
            <DiarySection
              entries={diaryEntries}
              inventory={inventoryList}
              onAddEntry={handleAddDiaryEntry}
              role={role}
            />
          )}
        </div>
      </main>

      <Navigation activeTab={activeTab} onChange={setActiveTab} role={role} />
    </div>
  );
}
