import React, { useState } from 'react';
import { Rule, RuleCategory, Role } from '../types';
import { ScrollText, AlertTriangle, Plus, Trash2, Heart, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  role: Role;
  rules: Rule[];
  onAddRule: (rule: Omit<Rule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
  onApplyRule: (rule: Rule) => void;
}

export function RulesSection({ role, rules, onAddRule, onDeleteRule, onApplyRule }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState({
    title: '',
    category: 'bonus' as RuleCategory,
    points: 1,
    punishment: 3 // 惩罚等级 1-5
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'punishment': return <Flame className="w-5 h-5 text-slate-400" />;
      case 'bonus': return <Heart className="w-5 h-5 text-blue-500" />;
      default: return <ScrollText className="w-5 h-5 text-slate-400" />;
    }
  };

  const renderStars = (level: number, interactive: boolean, onChange?: (l: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={`text-2xl transition-all ${interactive ? 'cursor-pointer hover:scale-110' : ''} ${
              star <= level ? 'opacity-100' : 'opacity-30'
            }`}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  const categories = [
    { id: 'bonus', title: '加分项' },
    { id: 'punishment', title: '记债项' }
  ];

  const handleAdd = () => {
    if (!newRule.title) return;
    
    let effect = '';
    if (newRule.category === 'bonus') {
      effect = `+${newRule.points} 积分`;
    } else {
      effect = `记债: ⭐${newRule.punishment}`;
    }

    onAddRule({
      title: newRule.title,
      category: newRule.category,
      effect,
      points: newRule.category === 'bonus' ? newRule.points : undefined,
      punishment: String(newRule.punishment) // 存储为字符串如 "3"
    });
    
    setNewRule({ title: '', category: 'bonus', points: 1, punishment: 3 });
    setIsCreating(false);
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <p className="text-sky-800 text-sm leading-relaxed">
          <strong>规训说明：</strong> 一切规矩皆由主人亲手制定。违反规定不扣除积分，直接计入债务系统折算为 Play 债务。表现良好则予以积分奖励。
        </p>
      </div>

      {role === 'master' && (
        <div className="flex justify-between items-center bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <div>
            <h3 className="text-slate-800 font-bold">定制惩奖条款</h3>
            <p className="text-slate-500 text-sm mt-1">手写新的规训，由主人说了算</p>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-[0_4px_10px_rgba(59,130,246,0.3)] shrink-0"
          >
            <Plus className={`w-5 h-5 transition-transform ${isCreating ? 'rotate-45' : ''}`} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-blue-200 shadow-sm rounded-2xl p-6 space-y-5 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">类别</label>
                  <select 
                    value={newRule.category}
                    onChange={(e) => setNewRule({...newRule, category: e.target.value as RuleCategory})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                  >
                    <option value="bonus">加分奖励</option>
                    <option value="punishment">违规记债</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">行为 / 规则名称</label>
                  <input 
                    type="text"
                    placeholder={newRule.category === 'bonus' ? "例如：主动做家务" : "例如：未按时报备"}
                    value={newRule.title}
                    onChange={(e) => setNewRule({...newRule, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {newRule.category === 'bonus' ? (
                <div className="space-y-1.5">
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">选择积分</label>
                  <select 
                    value={newRule.points}
                    onChange={(e) => setNewRule({...newRule, points: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(points => (
                      <option key={points} value={points}>+{points} 积分</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">惩罚等级</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">轻微</span>
                        {renderStars(newRule.punishment, true, (l) => setNewRule({...newRule, punishment: l}))}
                        <span className="text-xs text-slate-500">严重</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700 ml-4">
                        {newRule.punishment === 1 && '轻微'}
                        {newRule.punishment === 2 && '较轻'}
                        {newRule.punishment === 3 && '一般'}
                        {newRule.punishment === 4 && '较重'}
                        {newRule.punishment === 5 && '严重'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleAdd}
                disabled={!newRule.title}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:border text-white rounded-xl font-bold transition-colors shadow-sm"
              >
                存入规训清单
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10">
        {categories.map((cat) => {
          const catRules = rules.filter(r => r.category === cat.id);
          if (catRules.length === 0 && !isCreating) return null; // Hide empty categories unless we are creating
          
          return (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                {cat.title}
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{catRules.length}</span>
              </h3>
              
              {catRules.length === 0 ? (
                <div className="text-slate-400 text-sm italic py-6 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                  暂无条款，主人请手写添加。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catRules.map((rule, index) => {
                    const isPunishment = rule.effect.includes('记债') || rule.effect.includes('罚');
                    return (
                      <div key={rule.id} className="relative group bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
                        {role === 'master' && (
                          <button 
                            onClick={() => onDeleteRule(rule.id)}
                            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className="flex justify-between items-start mb-4 pr-8">
                          <h4 className="text-slate-800 font-bold flex items-center gap-2">
                            {getIcon(rule.category)}
                            {rule.title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold ${isPunishment ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                            {rule.effect}
                          </span>
                          
                          {role === 'master' && (
                            <button 
                              onClick={() => onApplyRule(rule)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                isPunishment 
                                ? 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'
                                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-[0_4px_10px_rgba(59,130,246,0.3)]'
                              }`}
                            >
                              {isPunishment ? '记录违规' : '执行奖励'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
