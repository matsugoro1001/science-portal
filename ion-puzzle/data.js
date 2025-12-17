const compounds = [
    {
        name: "水酸化バリウム",
        formula: "Ba(OH)₂",
        cation: { symbol: "Ba²⁺", count: 1 },
        anion: { symbol: "OH⁻", count: 2 }
    },
    {
        name: "塩化ナトリウム",
        formula: "NaCl",
        cation: { symbol: "Na⁺", count: 1 },
        anion: { symbol: "Cl⁻", count: 1 }
    },
    {
        name: "酸化銅",
        formula: "CuO",
        cation: { symbol: "Cu²⁺", count: 1 },
        anion: { symbol: "O²⁻", count: 1 } // Note: O2- wasn't in original list, adding for variety or stick to list
    },
    {
        name: "塩化銅",
        formula: "CuCl₂",
        cation: { symbol: "Cu²⁺", count: 1 },
        anion: { symbol: "Cl⁻", count: 2 }
    },
    {
        name: "水酸化ナトリウム",
        formula: "NaOH",
        cation: { symbol: "Na⁺", count: 1 },
        anion: { symbol: "OH⁻", count: 1 }
    },
    {
        name: "硫酸銅",
        formula: "CuSO₄",
        cation: { symbol: "Cu²⁺", count: 1 },
        anion: { symbol: "SO₄²⁻", count: 1 }
    },
    {
        name: "炭酸カルシウム",
        formula: "CaCO₃",
        cation: { symbol: "Ca²⁺", count: 1 },
        anion: { symbol: "CO₃²⁻", count: 1 }
    },
    {
        name: "硝酸銀",
        formula: "AgNO₃",
        cation: { symbol: "Ag⁺", count: 1 },
        anion: { symbol: "NO₃⁻", count: 1 }
    },
    {
        name: "塩化アンモニウム",
        formula: "NH₄Cl",
        cation: { symbol: "NH₄⁺", count: 1 },
        anion: { symbol: "Cl⁻", count: 1 }
    },
    {
        name: "硫酸バリウム",
        formula: "BaSO₄",
        cation: { symbol: "Ba²⁺", count: 1 },
        anion: { symbol: "SO₄²⁻", count: 1 }
    },
    // New Complex Compounds
    {
        name: "塩化マグネシウム",
        formula: "MgCl₂",
        cation: { symbol: "Mg²⁺", count: 1 },
        anion: { symbol: "Cl⁻", count: 2 }
    },
    {
        name: "炭酸ナトリウム",
        formula: "Na₂CO₃",
        cation: { symbol: "Na⁺", count: 2 },
        anion: { symbol: "CO₃²⁻", count: 1 }
    },
    {
        name: "塩化アルミニウム",
        formula: "AlCl₃",
        cation: { symbol: "Al³⁺", count: 1 },
        anion: { symbol: "Cl⁻", count: 3 }
    },
    {
        name: "酸化鉄(III)",
        formula: "Fe₂O₃",
        cation: { symbol: "Fe³⁺", count: 2 },
        anion: { symbol: "O²⁻", count: 3 }
    },
    {
        name: "塩化カルシウム",
        formula: "CaCl₂",
        cation: { symbol: "Ca²⁺", count: 1 },
        anion: { symbol: "Cl⁻", count: 2 }
    },
    {
        name: "酸化ナトリウム",
        formula: "Na₂O",
        cation: { symbol: "Na⁺", count: 2 },
        anion: { symbol: "O²⁻", count: 1 }
    },
    {
        name: "酸化アルミニウム",
        formula: "Al₂O₃",
        cation: { symbol: "Al³⁺", count: 2 },
        anion: { symbol: "O²⁻", count: 3 }
    },
    {
        name: "硝酸カリウム",
        formula: "KNO₃",
        cation: { symbol: "K⁺", count: 1 },
        anion: { symbol: "NO₃⁻", count: 1 }
    },
    {
        name: "酸化マグネシウム",
        formula: "MgO",
        cation: { symbol: "Mg²⁺", count: 1 },
        anion: { symbol: "O²⁻", count: 1 }
    },
    {
        name: "硫化鉄(II)",
        formula: "FeS",
        cation: { symbol: "Fe²⁺", count: 1 },
        anion: { symbol: "S²⁻", count: 1 }
    },
    // Acids & Others (User Requested)
    {
        name: "硝酸",
        formula: "HNO₃",
        cation: { symbol: "H⁺", count: 1 },
        anion: { symbol: "NO₃⁻", count: 1 }
    },
    {
        name: "塩化水素",
        formula: "HCl",
        cation: { symbol: "H⁺", count: 1 },
        anion: { symbol: "Cl⁻", count: 1 }
    },
    {
        name: "硫酸",
        formula: "H₂SO₄",
        cation: { symbol: "H⁺", count: 2 },
        anion: { symbol: "SO₄²⁻", count: 1 }
    },
    {
        name: "炭酸水素ナトリウム",
        formula: "NaHCO₃",
        cation: { symbol: "Na⁺", count: 1 },
        anion: { symbol: "HCO₃⁻", count: 1 }
    }
];

// Helper to get HTML representation
function getIonHTML(symbol) {
    if (ionHTMLMap[symbol]) return ionHTMLMap[symbol];
    // Fallback regex
    return symbol
        .replace(/(\d+)([+-])/, '<sup>$1$2</sup>') // 2+, 2-
        .replace(/([A-Za-z])([+-])/, '$1<sup>$2</sup>') // +, - (single)
        .replace(/(\d+)(?!.*[+-])/, '<sub>$1</sub>'); // Subscript numbers
}

// Better HTML parser for specific ions
const ionHTMLMap = {
    "Ba²⁺": "Ba<sup>2+</sup>",
    "OH⁻": "OH<sup>-</sup>",
    "Na⁺": "Na<sup>+</sup>",
    "Cl⁻": "Cl<sup>-</sup>",
    "Cu²⁺": "Cu<sup>2+</sup>",
    "O²⁻": "O<sup>2-</sup>",
    "SO₄²⁻": "SO<sub>4</sub><sup>2-</sup>",
    "Ca²⁺": "Ca<sup>2+</sup>",
    "CO₃²⁻": "CO<sub>3</sub><sup>2-</sup>",
    "Ag⁺": "Ag<sup>+</sup>",
    "NO₃⁻": "NO<sub>3</sub><sup>-</sup>",
    "NH₄⁺": "NH<sub>4</sub><sup>+</sup>",
    // New Ions
    "S²⁻": "S<sup>2-</sup>",
    "Mg²⁺": "Mg<sup>2+</sup>",
    "Al³⁺": "Al<sup>3+</sup>",
    "Fe²⁺": "Fe<sup>2+</sup>",
    "Fe³⁺": "Fe<sup>3+</sup>",
    "K⁺": "K<sup>+</sup>",
    "H⁺": "H<sup>+</sup>",
    // Tricky Ions
    "HCO₃⁻": "HCO<sub>3</sub><sup>-</sup>",
    "Ba⁺": "Ba<sup>+</sup>",
    "Zn²⁺": "Zn<sup>2+</sup>",
    "Pb²⁺": "Pb<sup>2+</sup>",
    "PO₄³⁻": "PO<sub>4</sub><sup>3-</sup>"
};

const trickyIons = {
    "Ba²⁺": ["Ba⁺", "Mg²⁺", "Ca²⁺"],
    "OH⁻": ["H⁺", "O²⁻", "Cl⁻"], // H2O removed
    "Na⁺": ["K⁺", "Li⁺", "Ag⁺"],
    "Cl⁻": ["F⁻", "Br⁻", "I⁻"],
    "Cu²⁺": ["Cu⁺", "Fe²⁺", "Zn²⁺"],
    "O²⁻": ["OH⁻", "S²⁻"],
    "SO₄²⁻": ["SO₃²⁻", "PO₄³⁻"],
    "Ca²⁺": ["K⁺", "Mg²⁺", "Ba²⁺"],
    "CO₃²⁻": ["HCO₃⁻", "SO₄²⁻"],
    "Ag⁺": ["Au⁺", "Cu⁺"],
    "NO₃⁻": ["NO₂⁻", "CO₃²⁻"],
    "NH₄⁺": ["NH₃", "K⁺"],
    "H⁺": ["Li⁺", "Na⁺", "OH⁻"],
    "HCO₃⁻": ["CO₃²⁻", "HSO₄⁻"]
};
