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
