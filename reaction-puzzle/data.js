const equations = [
    {
        id: 1,
        name: "炭酸水素ナトリウムの熱分解",
        left: ["NaHCO3"],
        right: ["Na2CO3", "H2O", "CO2"],
        solution: { left: [2], right: [1, 1, 1] }
    },
    {
        id: 2,
        name: "酸化銀の熱分解",
        left: ["Ag2O"],
        right: ["Ag", "O2"],
        solution: { left: [2], right: [4, 1] }
    },
    {
        id: 3,
        name: "水の電気分解",
        left: ["H2O"],
        right: ["H2", "O2"],
        solution: { left: [2], right: [2, 1] }
    },
    {
        id: 4,
        name: "水素の燃焼（水の生成）",
        left: ["H2", "O2"],
        right: ["H2O"],
        solution: { left: [2, 1], right: [2] }
    },
    {
        id: 5,
        name: "鉄と硫黄の化合",
        left: ["Fe", "S"],
        right: ["FeS"],
        solution: { left: [1, 1], right: [1] }
    },
    {
        id: 6,
        name: "硫化鉄と塩酸の反応",
        left: ["FeS", "HCl"],
        right: ["FeCl2", "H2S"],
        solution: { left: [1, 2], right: [1, 1] }
    },
    {
        id: 7,
        name: "銅と硫黄の化合",
        left: ["Cu", "S"],
        right: ["CuS"],
        solution: { left: [1, 1], right: [1] }
    },
    {
        id: 8,
        name: "炭素の燃焼",
        left: ["C", "O2"],
        right: ["CO2"],
        solution: { left: [1, 1], right: [1] }
    },
    {
        id: 9,
        name: "銅の酸化",
        left: ["Cu", "O2"],
        right: ["CuO"],
        solution: { left: [2, 1], right: [2] }
    },
    {
        id: 10,
        name: "マグネシウムの燃焼",
        left: ["Mg", "O2"],
        right: ["MgO"],
        solution: { left: [2, 1], right: [2] }
    },
    {
        id: 11,
        name: "酸化銅の炭素による還元",
        left: ["CuO", "C"],
        right: ["Cu", "CO2"],
        solution: { left: [2, 1], right: [2, 1] }
    },
    {
        id: 12,
        name: "酸化銅の水素による還元",
        left: ["CuO", "H2"],
        right: ["Cu", "H2O"],
        solution: { left: [1, 1], right: [1, 1] }
    }
];

const formulaNames = {
    "NaHCO3": "炭酸水素ナトリウム",
    "Na2CO3": "炭酸ナトリウム",
    "H2O": "水",
    "CO2": "二酸化炭素",
    "Ag2O": "酸化銀",
    "Ag": "銀",
    "O2": "酸素",
    "H2": "水素",
    "Fe": "鉄",
    "S": "硫黄",
    "FeS": "硫化鉄",
    "HCl": "塩化水素(塩酸)",
    "FeCl2": "塩化鉄",
    "H2S": "硫化水素",
    "Cu": "銅",
    "CuS": "硫化銅",
    "C": "炭素",
    "CuO": "酸化銅",
    "Mg": "マグネシウム",
    "MgO": "酸化マグネシウム"
};
