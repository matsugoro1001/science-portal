const CARD_DATA = {
    'H': { name: '水素', color: '#ffffff', textColor: '#000000', count: 20 },
    'C': { name: '炭素', color: '#333333', textColor: '#ffffff', count: 10 },
    'N': { name: '窒素', color: '#3b82f6', textColor: '#ffffff', count: 5 },
    'O': { name: '酸素', color: '#ef4444', textColor: '#ffffff', count: 15 },
    'Cl': { name: '塩素', color: '#10b981', textColor: '#ffffff', count: 5 },
    'Na': { name: 'ナトリウム', color: '#8b5cf6', textColor: '#ffffff', count: 5 },
    'Ag': { name: '銀', color: '#9ca3af', textColor: '#000000', count: 5 },
    'Fe': { name: '鉄', color: '#f59e0b', textColor: '#000000', count: 3 },
    'Cu': { name: '銅', color: '#b91c1c', textColor: '#ffffff', count: 3 },
    'S': { name: '硫黄', color: '#fbbf24', textColor: '#000000', count: 3 }
};

// "Blank" in Atom Poker often acts as a wildcard or just a dud.
// The manual doesn't explicitly say "Wildcard". "無地" (Plain/Blank).
// Usually these are spares. But "Total 80 cards" includes them.
// Let's treat them as useless for now unless user clarifies or I see "Wildcard" rule.
// Actually, looking at the crop 2 image... "Blank... 6 cards". No special rule listed. 
// I will treat them as non-combining cards (duds) to dilute the deck, making high scores harder.

const SCORING_RULES = [
    { formula: 'H2SO4', name: '硫酸', points: 20, atoms: { 'H': 2, 'S': 1, 'O': 4 }, components: 'HHSOOOO' },
    { formula: 'Na2CO3', name: '炭酸ナトリウム', points: 18, atoms: { 'Na': 2, 'C': 1, 'O': 3 }, components: 'NaNaCOOO' },
    { formula: 'NaHCO3', name: '炭酸水素ナトリウム', points: 14, atoms: { 'Na': 1, 'H': 1, 'C': 1, 'O': 3 }, components: 'NaHCOOO' },
    { formula: 'CuCl2', name: '塩化銅(II)', points: 10, atoms: { 'Cu': 1, 'Cl': 2 }, components: 'CuClCl' },
    { formula: 'FeCl2', name: '塩化鉄(II)', points: 10, atoms: { 'Fe': 1, 'Cl': 2 }, components: 'FeClCl' },
    { formula: 'Ag2S', name: '硫化銀', points: 10, atoms: { 'Ag': 2, 'S': 1 }, components: 'AgAgS' },
    { formula: 'CH4', name: 'メタン', points: 6, atoms: { 'C': 1, 'H': 4 }, components: 'CHHHH' },
    { formula: 'Ag2O', name: '酸化銀', points: 6, atoms: { 'Ag': 2, 'O': 1 }, components: 'AgAgO' },
    { formula: 'CuS', name: '硫化銅(II)', points: 5, atoms: { 'Cu': 1, 'S': 1 }, components: 'CuS' },
    { formula: 'FeS', name: '硫化鉄(II)', points: 5, atoms: { 'Fe': 1, 'S': 1 }, components: 'FeS' },
    { formula: 'H2S', name: '硫化水素', points: 5, atoms: { 'H': 2, 'S': 1 }, components: 'HHS' },
    { formula: 'NH3', name: 'アンモニア', points: 5, atoms: { 'N': 1, 'H': 3 }, components: 'NHHH' },
    { formula: 'N2', name: '窒素', points: 4, atoms: { 'N': 2 }, components: 'NN' },
    { formula: 'Cl2', name: '塩素', points: 4, atoms: { 'Cl': 2 }, components: 'ClCl' },
    { formula: 'CuO', name: '酸化銅(II)', points: 4, atoms: { 'Cu': 1, 'O': 1 }, components: 'CuO' },
    { formula: 'NaCl', name: '塩化ナトリウム', points: 4, atoms: { 'Na': 1, 'Cl': 1 }, components: 'NaCl' },
    { formula: 'AgCl', name: '塩化銀', points: 4, atoms: { 'Ag': 1, 'Cl': 1 }, components: 'AgCl' },
    { formula: 'FeO', name: '酸化鉄(II)', points: 4, atoms: { 'Fe': 1, 'O': 1 }, components: 'FeO' },
    { formula: 'NaOH', name: '水酸化ナトリウム', points: 4, atoms: { 'Na': 1, 'O': 1, 'H': 1 }, components: 'NaOH' },
    { formula: 'H2O', name: '水', points: 3, atoms: { 'H': 2, 'O': 1 }, components: 'HHO' },
    { formula: 'HCl', name: '塩化水素', points: 3, atoms: { 'H': 1, 'Cl': 1 }, components: 'HCl' },
    { formula: 'CO2', name: '二酸化炭素', points: 3, atoms: { 'C': 1, 'O': 2 }, components: 'COO' },
    { formula: 'O2', name: '酸素', points: 2, atoms: { 'O': 2 }, components: 'OO' },
    { formula: 'H2', name: '水素', points: 1, atoms: { 'H': 2 }, components: 'HH' },
    // Special
    { formula: 'C (Diamond)', name: 'ダイヤモンド', points: 30, atoms: { 'C': 6 }, components: 'CCCCCCC (7枚)' }
];
