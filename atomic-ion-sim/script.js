// 元素データ（原子番号1〜20）
const ELEMENTS_DATA = [
    {
        number: 1,
        symbol: "H",
        name: "水素 (すいそ)",
        protons: 1,
        neutrons: 0,
        stableElectrons: 0,
        stableCharge: 1,
        shells: [1],
        row: 1,
        col: 1,
        description: "水素原子は最もシンプルで、電子を1個持っています。この電子を放出して陽イオン（水素イオン H⁺）になります。水溶液の中で酸性を示す原因になる、とても重要なイオンです。",
        trivia: "水素イオン（H⁺）は実際には水溶液中で水分子と合体してオキソニウムイオン（H₃O⁺）として存在しますが、中学校では「水素イオン H⁺」として学習します。酸っぱさの正体です！"
    },
    {
        number: 2,
        symbol: "He",
        name: "ヘリウム",
        protons: 2,
        neutrons: 2,
        stableElectrons: 2,
        stableCharge: 0,
        shells: [2],
        row: 1,
        col: 18,
        description: "ヘリウムはK殻（一番内側の殻）に最大数の2個の電子がぴったり入っています（閉殻）。この状態は極めて安定しているため、電子を失ったり受け取ったりせず、イオンになりません（希ガス）。",
        trivia: "ヘリウムは非常に安定していて他の物質と絶対に反応しないため、風船や気球に安全なガスとして使われています。宇宙で2番目に多い元素です。"
    },
    {
        number: 3,
        symbol: "Li",
        name: "リチウム",
        protons: 3,
        neutrons: 4,
        stableElectrons: 2,
        stableCharge: 1,
        shells: [2, 1],
        row: 2,
        col: 1,
        description: "リチウムは一番外側のL殻に電子が1個だけあります。この1個を捨てることで、内側のK殻（電子2個で満タン）が最外殻になり、ヘリウムと同じ安定した電子配置の陽イオン（リチウムイオン Li⁺）になります。",
        trivia: "リチウムイオンは、スマホやゲーム機、電気自動車に使われる「リチウムイオン電池」の中で、電気を運ぶ主役として大活躍しています！"
    },
    {
        number: 4,
        symbol: "Be",
        name: "ベリリウム",
        protons: 4,
        neutrons: 5,
        stableElectrons: 2,
        stableCharge: 2,
        shells: [2, 2],
        row: 2,
        col: 2,
        description: "ベリリウムは一番外側のL殻に電子が2個あります。この2個を捨てることで、内側のK殻（電子2個で満タン）が最外殻になり、ヘリウムと同じ安定した電子配置の陽イオン（ベリリウムイオン Be²⁺）になります。",
        trivia: "ベリリウムは非常に軽くて硬い金属です。宇宙望遠鏡の鏡や、航空宇宙産業の特殊な合金に広く使われています。"
    },
    {
        number: 5,
        symbol: "B",
        name: "ホウ素 (ほうそ)",
        protons: 5,
        neutrons: 6,
        stableElectrons: 2,
        stableCharge: 3,
        shells: [2, 3],
        row: 2,
        col: 13,
        description: "ホウ素は一番外側のL殻に電子が3個あります。通常はイオンになりにくいですが、これらを失うとヘリウムと同じ電子配置の陽イオン（ホウ素イオン B³⁺）になります。",
        trivia: "ホウ素化合物（ホウ酸）は、ゴキブリ駆除の団子や、目の洗浄剤（防腐剤）、耐熱ガラスの原料として身近に使われています。"
    },
    {
        number: 6,
        symbol: "C",
        name: "炭素 (たんそ)",
        protons: 6,
        neutrons: 6,
        stableElectrons: 6,
        stableCharge: 0,
        shells: [2, 4],
        row: 2,
        col: 14,
        description: "炭素は一番外側のL殻に4個の電子を持っています。4個の電子を捨てることも、新しく4個得ることもエネルギー的に難しいため、通常は電子のやり取りによるイオンにはならず、共有結合を作ります。",
        trivia: "炭素はすべての有機物（プラスチック、紙、私たちの体など）の骨格をなす元素です。また、ダイヤモンドと鉛筆の芯（黒鉛）はどちらも炭素だけでできています！"
    },
    {
        number: 7,
        symbol: "N",
        name: "窒素 (ちっそ)",
        protons: 7,
        neutrons: 7,
        stableElectrons: 10,
        stableCharge: -3,
        shells: [2, 5],
        row: 2,
        col: 15,
        description: "窒素は一番外側のL殻に5個の電子を持っています。あと3個電子を受け取ると、L殻が満タン（8個）になり、ネオンと同じ安定した電子配置の陰イオン（窒化物イオン N³⁻）になります。",
        trivia: "窒素イオン（N³⁻）は、アンモニアやアミノ酸、DNAの塩基など、生命活動に必要な窒素化合物の基礎となります。空気の約78%は窒素分子です。"
    },
    {
        number: 8,
        symbol: "O",
        name: "酸素 (さんそ)",
        protons: 8,
        neutrons: 8,
        stableElectrons: 10,
        stableCharge: -2,
        shells: [2, 6],
        row: 2,
        col: 16,
        description: "酸素は一番外側のL殻に6個の電子を持っています。あと2個電子を受け取ると、L殻が満タン（8個）になり、ネオンと同じ安定した電子配置の陰イオン（酸化物イオン O²⁻）になります。",
        trivia: "酸化物イオン（O²⁻）は、金属と結びついて「さび」や酸化銅などの化合物を作ります。私たちの身の回りの岩石やガラスの主成分でもあります。"
    },
    {
        number: 9,
        symbol: "F",
        name: "フッ素 (ふっそ)",
        protons: 9,
        neutrons: 10,
        stableElectrons: 10,
        stableCharge: -1,
        shells: [2, 7],
        row: 2,
        col: 17,
        description: "フッ素は一番外側のL殻に7個の電子を持っています。あと1個電子を受け取ると、L殻が満タン（8個）になり、ネオンと同じ安定した電子配置の陰イオン（フッ化物イオン F⁻）になります。",
        trivia: "フッ化物イオン（F⁻）は、歯を強くして虫歯を予防する効果があるため、歯磨き粉によく配合されています。"
    },
    {
        number: 10,
        symbol: "Ne",
        name: "ネオン",
        protons: 10,
        neutrons: 10,
        stableElectrons: 10,
        stableCharge: 0,
        shells: [2, 8],
        row: 2,
        col: 18,
        description: "ネオンはL殻に最大数の8個の電子がぴったり入っています（オクテット）。この状態は極めて安定しているため、電子を失ったり受け取ったりせず、イオンになりません（希ガス）。",
        trivia: "ネオンガスをガラス管に閉じ込めて電気を流すと、美しい赤オレンジ色に光ります。これが街を彩る「ネオンサイン」の仕組みです。"
    },
    {
        number: 11,
        symbol: "Na",
        name: "ナトリウム",
        protons: 11,
        neutrons: 12,
        stableElectrons: 10,
        stableCharge: 1,
        shells: [2, 8, 1],
        row: 3,
        col: 1,
        description: "ナトリウムは一番外側のM殻に電子が1個だけあります。この1個を捨てることで、内側のL殻（電子8個で満タン）が最外殻になり、ネオンと同じ安定した電子配置の陽イオン（ナトリウムイオン Na⁺）になります。",
        trivia: "ナトリウムイオン（Na⁺）は、食塩（塩化ナトリウム NaCl）の成分です。私たちの体の中で、神経の命令を伝えたり、水分バランスを保ったりする非常に重要な役割を持っています。"
    },
    {
        number: 12,
        symbol: "Mg",
        name: "マグネシウム",
        protons: 12,
        neutrons: 12,
        stableElectrons: 10,
        stableCharge: 2,
        shells: [2, 8, 2],
        row: 3,
        col: 2,
        description: "マグネシウムは一番外側のM殻に電子が2個あります。この2個を捨てることで、内側のL殻（電子8個で満タン）が最外殻になり、ネオンと同じ安定した電子配置の陽イオン（マグネシウムイオン Mg²⁺）になります。",
        trivia: "マグネシウムイオン（Mg²⁺）は、海水やにがりに多く含まれます。また、植物が光合成を行うための緑色色素「クロロフィル（葉緑素）」の中心にもマグネシウムが位置しています。"
    },
    {
        number: 13,
        symbol: "Al",
        name: "アルミニウム",
        protons: 13,
        neutrons: 14,
        stableElectrons: 10,
        stableCharge: 3,
        shells: [2, 8, 3],
        row: 3,
        col: 13,
        description: "アルミニウムは一番外側のM殻に電子が3個あります。この3個を捨てることで、内側のL殻（電子8個で満タン）が最外殻になり、ネオンと同じ安定した電子配置 of 陽イオン（アルミニウムイオン Al³⁺）になります。",
        trivia: "アルミニウムは非常に軽くて頑丈な金属で、一円玉やアルミホイル、缶ジュース、新幹線や飛行機の機体など、現代社会に欠かせない金属です。"
    },
    {
        number: 14,
        symbol: "Si",
        name: "ケイ素 (けいそ)",
        protons: 14,
        neutrons: 14,
        stableElectrons: 14,
        stableCharge: 0,
        shells: [2, 8, 4],
        row: 3,
        col: 14,
        description: "ケイ素は一番外側のM殻に4個の電子を持っています。炭素と同様、4個の電子を完全に失うか得ることは難しいため、イオンにはならず、主に共有結合を作ります。",
        trivia: "ケイ素は「シリコン」とも呼ばれ、パソコンやスマホの頭脳である半導体チップの原料として極めて重要な元素です。地球の地殻に酸素の次に多く含まれます。"
    },
    {
        number: 15,
        symbol: "P",
        name: "リン",
        protons: 15,
        neutrons: 16,
        stableElectrons: 18,
        stableCharge: -3,
        shells: [2, 8, 5],
        row: 3,
        col: 15,
        description: "リンは一番外側のM殻に5個の電子を持っています。あと3個電子を受け取ることで、M殻が満タン（8個）になり、アルゴンと同じ安定した電子配置の陰イオン（リン化物イオン P³⁻）になります。",
        trivia: "リンは骨や歯、さらに遺伝物質であるDNAや生物のエネルギー源であるATPの主成分として、すべての生物の生命維持に必要不可欠な元素です。"
    },
    {
        number: 16,
        symbol: "S",
        name: "硫黄 (いおう)",
        protons: 16,
        neutrons: 16,
        stableElectrons: 18,
        stableCharge: -2,
        shells: [2, 8, 6],
        row: 3,
        col: 16,
        description: "硫黄は一番外側のM殻に6個の電子を持っています。あと2個電子を受け取ることで、M殻が満タン（8個）になり、アルゴンと同じ安定した電子配置の陰イオン（硫化物イオン S²⁻）になります。",
        trivia: "硫化物イオン（S²⁻）は温泉地で見られる特有の卵の腐ったような臭いの原因物質（硫化水素など）になります。体の中では、タンパク質を作るアミノ酸に含まれています。"
    },
    {
        number: 17,
        symbol: "Cl",
        name: "塩素 (えんそ)",
        protons: 17,
        neutrons: 18,
        stableElectrons: 18,
        stableCharge: -1,
        shells: [2, 8, 7],
        row: 3,
        col: 17,
        description: "塩素は一番外側のM殻に7個の電子を持っています。あと1個電子を受け取ると、M殻が満タン（8個）になり、アルゴンと同じ安定した電子配置の陰イオン（塩化物イオン Cl⁻）になります。",
        trivia: "塩化物イオン（Cl⁻）は、ナトリウムイオンとともに食塩の主成分です。また、胃の中で分泌される強い酸「胃液（塩酸）」の主成分でもあり、食べ物の消化や殺菌を助けています。"
    },
    {
        number: 18,
        symbol: "Ar",
        name: "アルゴン",
        protons: 18,
        neutrons: 22,
        stableElectrons: 18,
        stableCharge: 0,
        shells: [2, 8, 8],
        row: 3,
        col: 18,
        description: "アルゴンはM殻に8個の電子がぴったり入っています（閉殻・オクテット）。この状態は極めて安定しているため、電子を失ったり受け取ったりせず、イオンになりません（希ガス）。",
        trivia: "アルゴンは、反応しない性質を利用して、電球の内部に封入されるガスや、高品質な溶接の保護ガス、古い美術品を劣化から守る保存ガスとして使われています。"
    },
    {
        number: 19,
        symbol: "K",
        name: "カリウム",
        protons: 19,
        neutrons: 20,
        stableElectrons: 18,
        stableCharge: 1,
        shells: [2, 8, 8, 1],
        row: 4,
        col: 1,
        description: "カリウムは一番外側のN殻に電子が1個あります。この1個を捨てることで、内側のM殻（電子8個で満タン）が最外殻になり、アルゴンと同じ安定した電子配置の陽イオン（カリウムイオン K⁺）になります。",
        trivia: "カリウムイオン（K⁺）は、バナナや野菜に多く含まれ、体内のナトリウムイオンとバランスを取りながら、筋肉の動きや血圧を調整する重要な栄養素です。"
    },
    {
        number: 20,
        symbol: "Ca",
        name: "カルシウム",
        protons: 20,
        neutrons: 20,
        stableElectrons: 18,
        stableCharge: 2,
        shells: [2, 8, 8, 2],
        row: 4,
        col: 2,
        description: "カルシウムは一番外側のN殻に電子が2個あります。この2個を捨てることで、内側のM殻（電子8個で満タン）が最外殻になり、アルゴンと同じ安定した電子配置の陽イオン（カルシウムイオン Ca²⁺）になります。",
        trivia: "カルシウムイオン（Ca²⁺）は、骨や歯を作る主成分です。また、筋肉を動かしたり、脳からの情報を細胞に伝えたりするシグナルとしても欠かせないイオンです。"
    }
];

// アプリのグローバル状態
let currentElementIndex = 0;
let currentElectrons = 0;
let isSandboxMode = true;

// ミッションモードの状態
let currentMissionIndex = 0;
const MISSIONS = [
    { elIndex: 10, targetElectrons: 10, text: "ナトリウム原子 (Na) をイオンにしよう！", hint: "ナトリウムは一番外側の電子が1個邪魔です。電子を1個取ってみましょう。" },
    { elIndex: 16, targetElectrons: 18, text: "塩素原子 (Cl) をイオンにしよう！", hint: "塩素は一番外側の電子があと1個で満タンになります。電子を1個入れてみましょう。" },
    { elIndex: 0, targetElectrons: 0, text: "水素原子 (H) をイオンにしよう！", hint: "水素は持っている1個の電子を失って H⁺ になります。電子を1個取ってみましょう。" },
    { elIndex: 7, targetElectrons: 10, text: "酸素原子 (O) をイオンにしよう！", hint: "酸素は一番外側の電子があと2個で満タンになります。電子を2個入れてみましょう。" },
    { elIndex: 11, targetElectrons: 10, text: "マグネシウム原子 (Mg) をイオンにしよう！", hint: "マグネシウムは一番外側の電子が2個邪魔です。電子を2個取ってみましょう。" },
    { elIndex: 8, targetElectrons: 10, text: "フッ素原子 (F) をイオンにしよう！", hint: "フッ素は一番外側の電子があと1個で満タンになります。電子を1個入れてみましょう。" },
    { elIndex: 1, targetElectrons: 2, text: "ヘリウム (He) を安定させよう！", hint: "ヘリウムはもともと安定しています。現在の状態で「判定」するか「リセット」してみましょう。" }
];

// Canvas アニメーション関連
const canvas = document.getElementById("atom-canvas");
const ctx = canvas.getContext("2d");
let animationFrameId = null;
let electronRotationAngles = [0, 0, 0, 0]; // 4つの殻の回転角度
let ionizedAnimations = []; // イオン化アニメーション中の電子エフェクト { x, y, vx, vy, color, alpha, size, type: 'in' | 'out' }
let nucleusParticles = []; // 現在選択中の元素の原子核内粒子リスト

// 原子核内の陽子と中性子の粒子配置を決定的に生成（フィボナッチ螺旋を使用）
function generateNucleusParticles(protons, neutrons) {
    const particles = [];
    const pool = [];
    for (let i = 0; i < protons; i++) pool.push('proton');
    for (let i = 0; i < neutrons; i++) pool.push('neutron');
    
    // 決定的な疑似乱数シードを使ってシャッフル（元素切り替え時に毎回同じ形状にするため）
    let seed = 42;
    function random() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const temp = pool[i];
        pool[i] = pool[j];
        pool[j] = temp;
    }

    const N = pool.length;
    // 粒子数が多い場合はサイズを小さくして、原子核の範囲に収まるようにする
    const pRadius = N > 25 ? 3.0 : (N > 10 ? 3.8 : 4.8); 
    const c = N > 25 ? 5.5 : (N > 10 ? 6.5 : 8.0); // フィボナッチ螺旋の間隔係数
    
    for (let i = 0; i < N; i++) {
        const theta = i * 137.5 * (Math.PI / 180);
        const r = c * Math.sqrt(i + 0.5);
        
        particles.push({
            x: Math.cos(theta) * r,
            y: Math.sin(theta) * r,
            type: pool[i],
            radius: pRadius
        });
    }
    
    return particles;
}

// DOM 要素
const elementButtonsContainer = document.getElementById("element-buttons");
const btnSubElectron = document.getElementById("btn-sub-electron");
const btnAddElectron = document.getElementById("btn-add-electron");
const btnAutoIonize = document.getElementById("btn-auto-ionize");
const btnReset = document.getElementById("btn-reset");
const formulaOutput = document.getElementById("formula-output");
const statusBadge = document.getElementById("status-badge");
const protonBar = document.getElementById("proton-bar");
const electronBar = document.getElementById("electron-bar");
const balanceProtons = document.getElementById("balance-protons");
const balanceElectrons = document.getElementById("balance-electrons");
const chargeDescription = document.getElementById("charge-description");
const stabilityCard = document.getElementById("stability-card");
const stabilityText = document.getElementById("stability-text");
const stabilityDesc = document.getElementById("stability-desc");
const explanationText = document.getElementById("explanation-text");

// 情報カード DOM
const infoName = document.getElementById("info-name");
const infoNumber = document.getElementById("info-number");
const infoSymbol = document.getElementById("info-symbol");
const infoProtons = document.getElementById("info-protons");
const infoNeutrons = document.getElementById("info-neutrons");
const infoElectrons = document.getElementById("info-electrons");

// モード・ミッション DOM
const modeSandbox = document.getElementById("mode-sandbox");
const modeMission = document.getElementById("mode-mission");
const missionBox = document.getElementById("mission-box");
const missionText = document.getElementById("mission-text");
const missionHint = document.getElementById("mission-hint");
const missionStatus = document.getElementById("mission-status");

// モーダル DOM
const clearModal = document.getElementById("clear-modal");
const modalClearText = document.getElementById("modal-clear-text");
const modalTriviaText = document.getElementById("modal-trivia-text");
const modalNextBtn = document.getElementById("modal-next-btn");

// 初期化
function init() {
    createInterface();
    selectElement(0); // デフォルトで水素を選択
    setupEventListeners();
    resizeCanvas();
    startAnimationLoop();
}

// 画面のリサイズに対応
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
window.addEventListener("resize", resizeCanvas);

// 元素選択インターフェースの生成
function createInterface() {
    elementButtonsContainer.innerHTML = "";
    ELEMENTS_DATA.forEach((el, index) => {
        const btn = document.createElement("button");
        btn.className = "element-btn";
        btn.style.gridRow = el.row;
        btn.style.gridColumn = el.col;
        btn.innerHTML = `
            <span class="el-num">${el.number}</span>
            <span class="el-symbol">${el.symbol}</span>
            <span class="el-name">${el.name.split(" ")[0]}</span>
        `;
        btn.addEventListener("click", () => {
            if (isSandboxMode) {
                selectElement(index);
            }
        });
        elementButtonsContainer.appendChild(btn);
    });
}

// 元素の選択
function selectElement(index) {
    currentElementIndex = index;
    const el = ELEMENTS_DATA[index];
    currentElectrons = el.protons; // 初期状態は中性原子（陽子数＝電子数）

    // 原子核内の粒子位置を決定
    nucleusParticles = generateNucleusParticles(el.protons, el.neutrons);

    // ボタンのactiveクラスを更新
    const buttons = elementButtonsContainer.querySelectorAll(".element-btn");
    buttons.forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    ionizedAnimations = []; // アニメーションエフェクトをリセット
    updateUI();
}

// UIの表示更新
function updateUI() {
    const el = ELEMENTS_DATA[currentElementIndex];
    const charge = el.protons - currentElectrons;

    // 左側：元素詳細
    infoName.textContent = el.name;
    infoNumber.textContent = el.number;
    infoSymbol.textContent = el.symbol;
    infoProtons.textContent = `${el.protons} 個`;
    infoNeutrons.textContent = `${el.neutrons} 個`;
    infoElectrons.textContent = `${currentElectrons} 個`;

    // 右側：電荷表示（化学式・イオン式の組み立て）
    if (charge === 0) {
        formulaOutput.innerHTML = el.symbol;
        statusBadge.textContent = "中性原子";
        statusBadge.className = "status-badge neutral";
    } else {
        const sign = charge > 0 ? "＋" : "ー";
        const val = Math.abs(charge);
        const chargeStr = val === 1 ? sign : `${val}${sign}`;
        formulaOutput.innerHTML = `${el.symbol}<sup>${chargeStr}</sup>`;
        
        if (charge > 0) {
            statusBadge.textContent = "陽イオン";
            statusBadge.className = "status-badge cation";
        } else {
            statusBadge.textContent = "陰イオン";
            statusBadge.className = "status-badge anion";
        }
    }

    // 電荷メーター（天秤バー）
    const total = el.protons + currentElectrons;
    if (total > 0) {
        const protonPct = (el.protons / total) * 100;
        const electronPct = (currentElectrons / total) * 100;
        protonBar.style.width = `${protonPct}%`;
        electronBar.style.width = `${electronPct}%`;
    } else {
        protonBar.style.width = "0%";
        electronBar.style.width = "0%";
    }
    balanceProtons.textContent = `+${el.protons}`;
    balanceElectrons.textContent = `-${currentElectrons}`;

    // 電荷の説明文
    if (charge === 0) {
        chargeDescription.innerHTML = `陽子のプラス（+${el.protons}）と 電子のマイナス（-${currentElectrons}）の数が同じで、完全に引き算されて<strong>0（電気的に中性）</strong>になっています。`;
    } else if (charge > 0) {
        chargeDescription.innerHTML = `電子を失ったため、陽子のプラスが電子のマイナスより <strong>${charge}個分多く</strong> なり、全体として <strong>+${charge}</strong> の電気を帯びています。`;
    } else {
        chargeDescription.innerHTML = `電子を受け取ったため、電子のマイナスが陽子のプラスより <strong>${Math.abs(charge)}個分多く</strong> なり、全体として <strong>${charge}</strong> の電気を帯びています。`;
    }

    // 安定度判定
    // 安定電子数は 0, 2, 10, 18
    const isStable = currentElectrons === el.stableElectrons;
    if (isStable) {
        stabilityCard.className = "stability-card stable";
        if (el.stableCharge === 0) {
            stabilityText.textContent = "✨ 安定（希ガス配置）";
            stabilityDesc.textContent = "一番外側の電子殻（最外殻）が電子で完全に満たされており、非常に安定しています。他の物質と反応したりイオンになったりしません。";
        } else {
            const ionName = getIonName(el, charge);
            stabilityText.textContent = `✨ 安定（イオン: ${ionName}）`;
            stabilityDesc.textContent = `一番外側の電子殻が、安定な希ガス（${el.stableElectrons === 2 ? 'ヘリウム' : (el.stableElectrons === 10 ? 'ネオン' : 'アルゴン')}）と同じ満タンの電子配置になり、とても安定したイオンです。`;
        }
    } else {
        stabilityCard.className = "stability-card";
        stabilityText.textContent = "⚠️ 不安定";
        
        let targetText = "";
        if (el.stableElectrons < el.protons) {
            targetText = `電子を ${el.protons - el.stableElectrons} 個「失う」`;
        } else if (el.stableElectrons > el.protons) {
            targetText = `電子を ${el.stableElectrons - el.protons} 個「受け取る」`;
        } else {
            targetText = "電子を増減させない";
        }

        stabilityDesc.textContent = `最外殻の電子の数が中途半端で不安定です。この原子は、${targetText}ことで安定になろうとします。`;
    }

    // 解説テキスト
    if (charge === 0) {
        explanationText.textContent = el.description;
    } else if (isStable) {
        explanationText.innerHTML = `<strong>【安定したイオン状態】</strong><br>${el.name}が安定したイオン（${getIonName(el, charge)}）になりました。中学生で習う非常に重要なイオンです。右下のミッションに挑戦してみましょう！`;
    } else {
        explanationText.innerHTML = `<strong>【不安定なイオン・原子状態】</strong><br>現在の電子数は ${currentElectrons} 個です。これは自然界ではきわめて不安定で、すぐに他の電子と反応するか、安定な状態へ変化してしまいます。`;
    }

    // ミッションモードの判定
    if (!isSandboxMode) {
        const mission = MISSIONS[currentMissionIndex];
        if (currentElectrons === mission.targetElectrons) {
            missionStatus.textContent = "クリア！";
            missionStatus.className = "mission-status cleared";
            setTimeout(showMissionClear, 1000);
        } else {
            missionStatus.textContent = "未クリア";
            missionStatus.className = "mission-status";
        }
    }

    // ボタンの無効化制御
    btnSubElectron.disabled = (currentElectrons <= 0);
    btnAddElectron.disabled = (currentElectrons >= 22); // Ca(20)の少し上まで
}

// イオン名の取得
function getIonName(el, charge) {
    if (charge === 0) return el.name.split(" ")[0] + "原子";
    
    // 陽イオン
    if (charge > 0) {
        if (el.symbol === "H") return "水素イオン";
        if (el.symbol === "Li") return "リチウムイオン";
        if (el.symbol === "Be") return "ベリリウムイオン";
        if (el.symbol === "B") return "ホウ素イオン";
        if (el.symbol === "Na") return "ナトリウムイオン";
        if (el.symbol === "Mg") return "マグネシウムイオン";
        if (el.symbol === "Al") return "アルミニウムイオン";
        if (el.symbol === "K") return "カリウムイオン";
        if (el.symbol === "Ca") return "カルシウムイオン";
        return `${el.name.split(" ")[0]}イオン (価数: +${charge})`;
    }
    
    // 陰イオン
    if (el.symbol === "N") return "窒化物イオン";
    if (el.symbol === "O") return "酸化物イオン";
    if (el.symbol === "F") return "フッ化物イオン";
    if (el.symbol === "P") return "リン化物イオン";
    if (el.symbol === "S") return "硫化物イオン";
    if (el.symbol === "Cl") return "塩化物イオン";
    return `${el.name.split(" ")[0]}化物イオン (価数: ${charge})`;
}

// イベントリスナーの設定
function setupEventListeners() {
    btnSubElectron.addEventListener("click", () => {
        if (currentElectrons > 0) {
            createIonizedEffect(false); // 電子が飛び去るエフェクト
            currentElectrons--;
            updateUI();
        }
    });

    btnAddElectron.addEventListener("click", () => {
        if (currentElectrons < 22) {
            createIonizedEffect(true); // 電子が入ってくるエフェクト
            currentElectrons++;
            updateUI();
        }
    });

    btnReset.addEventListener("click", () => {
        const el = ELEMENTS_DATA[currentElementIndex];
        currentElectrons = el.protons;
        ionizedAnimations = [];
        updateUI();
    });

    btnAutoIonize.addEventListener("click", () => {
        runAutoIonizeAnimation();
    });

    // モード切り替え
    modeSandbox.addEventListener("click", () => {
        setMode(true);
    });

    modeMission.addEventListener("click", () => {
        setMode(false);
    });

    // モーダル
    modalNextBtn.addEventListener("click", () => {
        clearModal.classList.add("hidden");
        currentMissionIndex = (currentMissionIndex + 1) % MISSIONS.length;
        startMission(currentMissionIndex);
    });
}

// モード切り替え
function setMode(sandbox) {
    isSandboxMode = sandbox;
    if (sandbox) {
        modeSandbox.classList.add("active");
        modeMission.classList.remove("active");
        missionBox.classList.add("hidden");
        
        // 元素選択ボタンを有効化
        const buttons = elementButtonsContainer.querySelectorAll(".element-btn");
        buttons.forEach(btn => {
            btn.style.pointerEvents = "auto";
            btn.classList.remove("disabled");
        });
    } else {
        modeSandbox.classList.remove("active");
        modeMission.classList.add("active");
        missionBox.classList.remove("hidden");
        
        // 元素選択ボタンを無効化（ミッション中は固定）
        const buttons = elementButtonsContainer.querySelectorAll(".element-btn");
        buttons.forEach(btn => {
            btn.style.pointerEvents = "none";
            btn.classList.add("disabled");
        });

        startMission(currentMissionIndex);
    }
}

// ミッションの開始
function startMission(index) {
    currentMissionIndex = index;
    const mission = MISSIONS[index];
    selectElement(mission.elIndex);
    
    // 電子数を中性（原子）状態にリセット
    currentElectrons = ELEMENTS_DATA[mission.elIndex].protons;
    updateUI();

    missionText.textContent = mission.text;
    missionHint.textContent = `ヒント：${mission.hint}`;
}

// ミッションクリア表示
function showMissionClear() {
    const mission = MISSIONS[currentMissionIndex];
    const el = ELEMENTS_DATA[mission.elIndex];
    const charge = el.protons - currentElectrons;
    
    const ionName = getIonName(el, charge);
    
    modalClearText.innerHTML = `正解！<br><strong>${el.name}</strong> は、電子の数を <strong>${currentElectrons}個</strong> にすることで、<br>安定した <strong>${ionName}</strong> になります！`;
    modalTriviaText.textContent = el.trivia;
    
    clearModal.classList.remove("hidden");
}

// 自動イオン化アニメーションの実行
function runAutoIonizeAnimation() {
    const el = ELEMENTS_DATA[currentElementIndex];
    const target = el.stableElectrons;
    
    if (currentElectrons === target) {
        return; // すでに安定配置
    }

    btnSubElectron.disabled = true;
    btnAddElectron.disabled = true;
    btnAutoIonize.disabled = true;
    btnReset.disabled = true;

    const diff = target - currentElectrons;
    let count = 0;
    const interval = setInterval(() => {
        if (currentElectrons < target) {
            createIonizedEffect(true);
            currentElectrons++;
        } else if (currentElectrons > target) {
            createIonizedEffect(false);
            currentElectrons--;
        }
        updateUI();
        count++;

        if (currentElectrons === target || count >= Math.abs(diff)) {
            clearInterval(interval);
            btnSubElectron.disabled = false;
            btnAddElectron.disabled = false;
            btnAutoIonize.disabled = false;
            btnReset.disabled = false;
            updateUI();
        }
    }, 400);
}

// 電子の吸い込み / 吹き出しエフェクト生成
function createIonizedEffect(isIn) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const dist = Math.max(canvas.width, canvas.height) / 2 + 50;
    
    if (isIn) {
        // 電子を入れる（currentElectronsはすでに+1されている）
        const shells = getShellsAllocation(currentElectrons);
        const shellIndex = shells.length - 1;
        const count = shells[shellIndex];
        const electronIndex = count - 1;
        
        const angle = electronRotationAngles[shellIndex] + (electronIndex * (Math.PI * 2) / count);
        const radius = (shellIndex + 1) * 40 + 10;
        
        // 画面外の開始位置
        const startX = centerX + Math.cos(angle) * dist;
        const startY = centerY + Math.sin(angle) * dist;
        
        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = centerY + Math.sin(angle) * radius;
        
        ionizedAnimations.push({
            startX: startX,
            startY: startY,
            x: startX,
            y: startY,
            tx: targetX,
            ty: targetY,
            shellIndex: shellIndex,
            totalInShell: count,
            electronIndex: electronIndex,
            size: 6, // 実際の電子と同じサイズ
            alpha: 1,
            life: 25,
            maxLife: 25,
            type: 'in',
            color: '#00d2d3'
        });
    } else {
        // 電子を取る（currentElectronsはすでに-1されている）
        // 削除される前の電子数を仮定
        const prevElectrons = currentElectrons + 1;
        const shells = getShellsAllocation(prevElectrons);
        const shellIndex = shells.length - 1;
        const count = shells[shellIndex];
        const electronIndex = count - 1;
        
        const angle = electronRotationAngles[shellIndex] + (electronIndex * (Math.PI * 2) / count);
        const radius = (shellIndex + 1) * 40 + 10;
        
        // 軌道上から開始
        const startX = centerX + Math.cos(angle) * radius;
        const startY = centerY + Math.sin(angle) * radius;
        
        // 画面外の終了位置
        const targetX = centerX + Math.cos(angle) * dist;
        const targetY = centerY + Math.sin(angle) * dist;
        
        ionizedAnimations.push({
            startX: startX,
            startY: startY,
            x: startX,
            y: startY,
            vx: (targetX - startX) / 25,
            vy: (targetY - startY) / 25,
            size: 6,
            alpha: 1,
            life: 25,
            maxLife: 25,
            type: 'out',
            color: '#ff4757'
        });
    }
}

// 現在の電子数を各殻（K, L, M, N）に分配する
function getShellsAllocation(electronsCount) {
    const capacities = [2, 8, 8, 2]; // K, L, M, N殻の収容限界
    const allocation = [];
    let remaining = electronsCount;

    for (let i = 0; i < capacities.length; i++) {
        if (remaining <= 0) break;
        const count = Math.min(remaining, capacities[i]);
        allocation.push(count);
        remaining -= count;
    }
    
    // 電子0個の場合は空の殻を表示（水素イオン表現用）
    if (allocation.length === 0) {
        allocation.push(0);
    }
    return allocation;
}

// アニメーションループ
function startAnimationLoop() {
    function tick() {
        draw();
        
        // 角度を更新
        const baseSpeed = 0.015;
        electronRotationAngles[0] += baseSpeed * 1.5;  // K殻：速め、右回り
        electronRotationAngles[1] -= baseSpeed * 1.0;  // L殻：遅め、左回り
        electronRotationAngles[2] += baseSpeed * 0.7;  // M殻：さらに遅め、右回り
        electronRotationAngles[3] -= baseSpeed * 0.5;  // N殻：最も遅い、左回り

        // エフェクトパーティクル更新
        updateParticles();

        animationFrameId = requestAnimationFrame(tick);
    }
    tick();
}

// パーティクルの状態更新
function updateParticles() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = ionizedAnimations.length - 1; i >= 0; i--) {
        const p = ionizedAnimations[i];
        p.life--;

        if (p.type === 'in') {
            // 公転で動くターゲット軌道座標に追従
            const radius = (p.shellIndex + 1) * 40 + 10;
            const angle = electronRotationAngles[p.shellIndex] + (p.electronIndex * (Math.PI * 2) / p.totalInShell);
            p.tx = centerX + Math.cos(angle) * radius;
            p.ty = centerY + Math.sin(angle) * radius;
            
            // 進行度 (0 から 1)
            const t = 1 - (p.life / p.maxLife);
            p.x = p.startX + (p.tx - p.startX) * t;
            p.y = p.startY + (p.ty - p.startY) * t;
            p.alpha = 1.0;
        } else {
            // 画面外へ直線移動
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = p.life / p.maxLife;
        }

        if (p.life <= 0) {
            ionizedAnimations.splice(i, 1);
        }
    }
}

// Canvas への描画処理
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (isNaN(centerX) || isNaN(centerY) || centerX === 0) {
        return; // Canvasサイズが未確定のときは描画しない
    }

    const el = ELEMENTS_DATA[currentElementIndex];
    const shells = getShellsAllocation(currentElectrons);

    // 1. 電子殻（同心円）の描画
    const isElementStable = (currentElectrons === el.stableElectrons);
    const capacities = [2, 8, 8, 2];

    shells.forEach((count, index) => {
        const radius = (index + 1) * 40 + 10; // K殻:50px, L殻:90px, M殻:130px...
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        const isLastShell = (index === shells.length - 1);
        const isShellFull = (count === capacities[index]);

        if (isElementStable) {
            // 全体が安定：すべての殻が輝く緑の実線
            ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
            ctx.lineWidth = 2.0;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#10b981";
            ctx.stroke();
            ctx.shadowBlur = 0; // シャドウをリセット
        } else {
            // 不安定な状態
            if (isLastShell && !isShellFull) {
                // 最外殻かつ不足：警告の赤点線（点滅アニメーション）
                const alpha = 0.25 + 0.25 * Math.sin(Date.now() / 200);
                ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
                ctx.lineWidth = 2.0;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                // 内側の満タンの殻：おだやかな緑の実線
                ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
                ctx.lineWidth = 1.0;
                ctx.stroke();
            }
        }

        // 殻のラベル（K, L, M, N）
        ctx.fillStyle = isElementStable ? "rgba(16, 185, 129, 0.7)" : "rgba(94, 114, 228, 0.4)";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = ["K", "L", "M", "N"][index];
        ctx.fillText(label, centerX + radius, centerY - 6);
    });

    // 2. 電子の描画
    shells.forEach((count, shellIndex) => {
        const radius = (shellIndex + 1) * 40 + 10;
        const baseAngle = electronRotationAngles[shellIndex];

        for (let i = 0; i < count; i++) {
            // もしこの電子が現在「進入（in）アニメーション中」なら、軌道上での描画をスキップする
            const isEntering = ionizedAnimations.some(p => 
                p.type === 'in' && 
                p.shellIndex === shellIndex && 
                p.electronIndex === i &&
                p.totalInShell === count
            );
            if (isEntering) continue;

            // 円周上に等間隔で配置
            const angle = baseAngle + (i * (Math.PI * 2) / count);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // 電子のグロー効果（発光）
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#00d2d3";

            // 電子本体 (マイナスの電気を帯びた光る球)
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#00d2d3";
            ctx.fill();

            // 電子の中の「ー」記号
            ctx.shadowBlur = 0; // テキストは影なし
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("-", x, y - 0.5);
        }
    });

    // 3. エフェクトパーティクルの描画
    ionizedAnimations.forEach(p => {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    // 4. 原子核（中心）の描画
    // 粒子数に応じた原子核の外枠の半径
    const totalParticlesCount = el.protons + el.neutrons;
    const nucleusRadius = Math.max(24, Math.min(36, 16 + Math.sqrt(totalParticlesCount) * 3));
    
    // 原子核のバックグラウンド（うっすらとした赤い半透明の膜）
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255, 71, 87, 0.4)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 71, 87, 0.15)";
    ctx.strokeStyle = "rgba(255, 71, 87, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 原子核内の粒子（陽子・中性子）の描画
    nucleusParticles.forEach(p => {
        const px = centerX + p.x;
        const py = centerY + p.y;
        const radius = p.radius;
        
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        
        if (p.type === 'proton') {
            // 陽子のグラデーション（ネオンレッド）
            const pGrad = ctx.createRadialGradient(px - radius/3, py - radius/3, radius/10, px, py, radius);
            pGrad.addColorStop(0, "#ff7675");
            pGrad.addColorStop(0.3, "#d63031");
            pGrad.addColorStop(1, "#800000");
            ctx.fillStyle = pGrad;
            ctx.fill();
            
            // 陽子の「＋」マーク（極小）
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${radius * 1.5}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("+", px, py - 0.5);
        } else {
            // 中性子のグラデーション（グレー）
            const nGrad = ctx.createRadialGradient(px - radius/3, py - radius/3, radius/10, px, py, radius);
            nGrad.addColorStop(0, "#ced6e0");
            nGrad.addColorStop(0.5, "#747d8c");
            nGrad.addColorStop(1, "#2f3542");
            ctx.fillStyle = nGrad;
            ctx.fill();
        }
    });

    // 原子核から少し離れた下部に、テキストで陽子数・中性子数を補足（中学生向けに正確な情報も提示）
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.font = "bold 11px 'Noto Sans JP', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const textY = centerY + nucleusRadius + 18;
    ctx.beginPath();
    // 丸角座布団の描画
    if (ctx.roundRect) {
        ctx.roundRect(centerX - 65, textY - 10, 130, 20, 10);
    } else {
        ctx.rect(centerX - 65, textY - 10, 130, 20); // フォールバック
    }
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`陽子: ${el.protons} (＋) / 中性子: ${el.neutrons}`, centerX, textY);
}

// 起動
window.onload = init;
