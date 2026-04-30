import React from 'react';
import { Debt, Role } from '../types';
import { Flame, Check, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  role: Role;
  debts: Debt[];
  onCompleteDebt: (id: string) => void;
}

export function DebtSection({ role, debts, onCompleteDebt }: Props) {
  const pendingDebts = debts.filter(d => d.status === 'pending');
  const completedDebts = debts.filter(d => d.status === 'completed');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-blue-500" />
          待结清债务
        </h3>
        <div className="space-y-4">
          {pendingDebts.length === 0 ? (
            <p className="text-slate-500 italic p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">当前没有债务，真是一只乖小狗。</p>
          ) : (
            pendingDebts.map((debt, idx) => (
              <motion.div 
                key={debt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden transition-all hover:shadow-md"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>
                <div className="pl-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-slate-800 font-bold text-lg">{debt.punishment}</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      {debt.createdAt}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">原因: <span className="font-medium text-slate-600">{debt.reason}</span></p>
                </div>
                {role === 'master' && (
                  <button 
                    onClick={() => onCompleteDebt(debt.id)}
                    className="self-start md:self-auto px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_10px_rgba(59,130,246,0.2)] flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> 标记为已结清
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-lg font-bold text-slate-600 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-slate-400" />
          历史债务
        </h3>
        <div className="space-y-3">
          {completedDebts.length === 0 ? (
            <p className="text-slate-400 text-sm italic py-6 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              暂无历史记录。
            </p>
          ) : (
            completedDebts.map((debt) => (
              <div key={debt.id} className="flex justify-between items-center p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div>
                  <span className="text-slate-400 font-medium line-through decoration-slate-300">{debt.punishment}</span>
                  <p className="text-slate-400 text-xs mt-1">原因: {debt.reason}</p>
                </div>
                <span className="text-slate-400 text-xs font-medium bg-white px-2 py-1 rounded-md border border-slate-100">{debt.createdAt} 已结清</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
