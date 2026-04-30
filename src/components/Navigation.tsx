import React from 'react';
import { Home, ScrollText, Flame, Store, BookHeart, Heart } from 'lucide-react';
import { Role } from '../types';

export type TabId = 'status' | 'rules' | 'debts' | 'shop' | 'diary';

interface Props {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  role?: Role;
}

export function Navigation({ activeTab, onChange, role }: Props) {
  // 主人端显示"随手夸奖"，小狗端显示"小狗日记"
  const isMaster = role === 'master';
  const tabs = [
    { id: 'status', label: '状态', icon: Home },
    { id: 'rules', label: '规训清单', icon: ScrollText },
    { id: 'debts', label: '债务系统', icon: Flame },
    { id: 'shop', label: '骨头商店', icon: Store },
    { id: 'diary', label: isMaster ? '随手夸奖' : '小狗日记', icon: isMaster ? Heart : BookHeart },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id as TabId)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`relative p-1 rounded-full ${isActive ? 'bg-blue-50' : ''}`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
