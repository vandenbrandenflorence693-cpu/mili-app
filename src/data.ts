import { Debt, DiaryEntry, PuppyStatus, Rule, ShopItem } from './types';

export const initialStatus: PuppyStatus = {
  points: 0,
  level: 1,
  levelName: '见习小狗',
  mood: '乖巧',
};

export const rules: Rule[] = [];

export const initialDebts: Debt[] = [];

export const shopItems: ShopItem[] = [];

export const initialDiary: DiaryEntry[] = [
  {
    id: 'diary1',
    type: 'praise',
    content: '今天米粒特别乖，主动做完了所有的家务，甚至还帮我把明天的衣服准备好了。真是我的好狗狗！奖励了摸摸头。',
    date: '2023-10-28',
  },
  {
    id: 'diary2',
    type: 'reflection',
    content: '检讨书：今天我不小心把主人的杯子打碎了，试图掩盖还被发现了。我是一个坏小狗，我已经深刻认识到了自己的错误。',
    date: '2023-10-25',
  },
  {
    id: 'diary3',
    type: 'photo',
    content: '新买的项圈很适合他。戴上的那一刻特别乖。',
    date: '2023-10-20',
    imageUrl: 'https://images.unsplash.com/photo-1544376483-376df8b8ba55?w=500&auto=format&fit=crop&q=60', 
  },
];
