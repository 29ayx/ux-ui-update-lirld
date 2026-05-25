export interface LuxuryItem {
    id: string;
    name: string;
    price: number;
    icon: string;
    category: 'status' | 'gift' | 'perk';
    description: string;
    gradient: string;
}

export const LUXURY_ITEMS: LuxuryItem[] = [
    {
        id: 'private_jet',
        name: 'Gulfstream G700',
        price: 75000,
        icon: '✈️',
        category: 'status',
        description: 'Fly above the clouds. Unlocks the "Elite Flyer" profile badge.',
        gradient: 'from-slate-900 to-slate-700'
    },
    {
        id: 'diamond_ring',
        name: 'Eternal Solitaire',
        price: 15000,
        icon: '💎',
        category: 'gift',
        description: 'The ultimate gesture of affection. Shows up in their "Vault".',
        gradient: 'from-cyan-400 to-blue-500'
    },
    {
        id: 'supercar',
        name: 'Aventador SVJ',
        price: 45000,
        icon: '🏎️',
        category: 'status',
        description: 'Pure adrenaline. Adds a custom engine-rev sound to your profile.',
        gradient: 'from-orange-500 to-red-600'
    },
    {
        id: 'vintage_wine',
        name: 'Château Margaux 1787',
        price: 5000,
        icon: '🍷',
        category: 'gift',
        description: 'For those with refined taste. A classic ice-breaker.',
        gradient: 'from-rose-800 to-purple-900'
    },
    {
        id: 'neon_aura',
        name: 'Cyber Aura',
        price: 10000,
        icon: '✨',
        category: 'perk',
        description: 'Glow in the dark. Makes your profile card pulse with neon light.',
        gradient: 'from-purple-400 via-pink-500 to-red-500'
    },
    {
        id: 'crypto_crown',
        name: 'HODL Crown',
        price: 25000,
        icon: '👑',
        category: 'status',
        description: 'For the kings of the digital age.',
        gradient: 'from-amber-300 to-yellow-600'
    }
];
