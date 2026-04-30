export type Mood = '开心' | '乖巧' | '委屈' | '思过';

export type Role = 'master' | 'puppy';

export interface PuppyStatus {
  points: number;
  level: number;
  levelName: string;
  mood: Mood;
}

export type RuleCategory = 'bonus' | 'punishment';

export interface Rule {
  id: string;
  category: RuleCategory;
  title: string;
  effect: string; // e.g., "+10 积分" or "记债: 鞭打x10"
  points?: number;
  punishment?: string;
}

export interface Debt {
  id: string;
  reason: string;
  punishment: string;
  createdAt: string;
  status: 'pending' | 'completed';
}

export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  rarity: Rarity;
  imageUrl?: string;
}

export type DiaryEntryType = 'reflection' | 'praise' | 'photo' | 'card' | 'diary';

export interface DiaryEntry {
  id: string;
  type: DiaryEntryType;
  content: string;
  date: string;
  imageUrl?: string;
  mood?: Mood;
  cardItem?: string; // 卡牌使用记录：卡片名称
}

export interface InventoryItem {
  id: string;
  item: ShopItem;
  createdAt: string;
}

