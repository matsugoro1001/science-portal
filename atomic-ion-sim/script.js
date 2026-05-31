// 元素データ
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
        description: "リチウムは一番外側のL殻に電子が1個だけあります。この1個を捨てることで、内側のK殻（電子2個で満タン）が最外殻になり、ヘリウムと同じ安定した電子配置の陽イオン（リチウムイオン Li⁺）になります。",
        trivia: "リチウムイオンは、スマホやゲーム機、電気自動車に使われる「リチウムイオン電池」の中で、電気を運ぶ主役として大活躍しています！"
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
        description: "酸素は一番外側のL殻に6個の電子を持っています。あと2個電子を受け取ると、L殻が満タン（8個）になり、ネオンと同じ安定した電子配置の陰イオン（酸化物イオン O²⁻）になります。",
        trivia: "酸化物イオン（O²⁻）は、金属と結びついて「酸化鉄（さび）」や「酸化銅」などの化合物を作ります。私たちの身の回りの岩石やガラスの主成分でもあります。"
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
        description: "マグネシウムは一番外側のM殻に電子が2個あります。この2個を捨てることで、内側のL殻（電子8個で満タン）が最外殻になり、ネオンと同じ安定した電子配置の陽イオン（マグネシウムイオン Mg²⁺）になります。",
        trivia: "マグネシウムイオン（Mg²⁺）は、海水やにがりに多く含まれます。また、植物が光合成を行うための緑色色素「クロロフィル（葉緑素）」の中心にもマグネシウムが位置しています。"
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
        description: "塩素は一番外側のM殻に7個の電子を持っています。あと1個電子を受け取ると、M殻が満タン（8個）になり、アルゴンと同じ安定した電子配置の陰イオン（塩化物イオン Cl⁻）になります。",
        trivia: "塩化物イオン（Cl⁻）は、ナトリウムイオンとともに食塩の主成分です。また、胃の中で分泌される強い酸「胃液（塩酸）」の主成分でもあり、食べ物の消化や殺菌を助けています。"
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
    { elIndex: 6, targetElectrons: 10, text: "ナトリウム原子 (Na) をイオンにしよう！", hint: "ナトリウムは一番外側の電子が1個邪魔です。電子を1個取ってみましょう。" },
    { elIndex: 8, targetElectrons: 18, text: "塩素原子 (Cl) をイオンにしよう！", hint: "塩素は一番外側の電子があと1個で満タンになります。電子を1個入れてみましょう。" },
    { elIndex: 0, targetElectrons: 0, text: "水素原子 (H) をイオンにしよう！", hint: "水素は持っている1個の電子を失って H⁺ になります。電子を1個取ってみましょう。" },
    { elIndex: 3, targetElectrons: 10, text: "酸素原子 (O) をイオンにしよう！", hint: "酸素は一番外側の電子があと2個で満タンになります。電子を2個入れてみましょう。" },
    { elIndex: 7, targetElectrons: 10, text: "マグネシウム原子 (Mg) をイオンにしよう！", hint: "マグネシウムは一番外側の電子が2個邪魔です。電子を2個取ってみましょう。" },
    { elIndex: 4, targetElectrons: 10, text: "フッ素原子 (F) をイオンにしよう！", hint: "フッ素は一番外側の電子があと1個で満タンになります。電子を1個入れてみましょう。" },
    { elIndex: 1, targetElectrons: 2, text: "ヘリウム (He) を安定させよう！", hint: "ヘリウムはもともと安定しています。現在の状態で「判定」するか「リセット」してみましょう。" }
];

// Canvas アニメーション関連
const canvas = document.getElementById("atom-canvas");
const ctx = canvas.getContext("2d");
let animationFrameId = null;
let electronRotationAngles = [0, 0, 0, 0]; // 4つの殻の回転角度
let ionizedAnimations = []; // イオン化アニメーション中の電子エフェクト { x, y, vx, vy, color, alpha, size, type: 'in' | 'out' }

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
            stabilityText.textContent = "安定（希ガス原子）";
            stabilityDesc.textContent = "一番外側の電子殻（最外殻）が電子で完全に満たされており、非常に安定しています。他の物質と反応したりイオンになったりしません。";
        } else {
            const ionName = getIonName(el, charge);
            stabilityText.textContent = `安定（イオン: ${ionName}）`;
            stabilityDesc.textContent = `一番外側の電子殻が、安定な希ガス（${el.stableElectrons === 2 ? 'ヘリウム' : (el.stableElectrons === 10 ? 'ネオン' : 'アルゴン')}）と同じ満タンの電子配置になり、とても安定したイオンです。`;
        }
    } else {
        stabilityCard.className = "stability-card";
        stabilityText.textContent = "不安定";
        
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
        if (el.symbol === "Na") return "ナトリウムイオン";
        if (el.symbol === "Mg") return "マグネシウムイオン";
        if (el.symbol === "Ca") return "カルシウムイオン";
        return `${el.name.split(" ")[0]}イオン (価数: +${charge})`;
    }
    
    // 陰イオン
    if (el.symbol === "O") return "酸化物イオン";
    if (el.symbol === "F") return "フッ化物イオン";
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
    
    // 殻の半径
    const el = ELEMENTS_DATA[currentElementIndex];
    const shellsCount = getShellsAllocation(currentElectrons).length;
    const targetRadius = Math.max(50, Math.min(4, shellsCount) * 40 + 10);

    if (isIn) {
        // 外部から吸い込まれる電子（複数パーティクル）
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = canvas.width / 2 + Math.random() * 50;
            const startX = centerX + Math.cos(angle) * dist;
            const startY = centerY + Math.sin(angle) * dist;
            
            const targetX = centerX + Math.cos(angle) * targetRadius;
            const targetY = centerY + Math.sin(angle) * targetRadius;

            ionizedAnimations.push({
                x: startX,
                y: startY,
                tx: targetX,
                ty: targetY,
                vx: (targetX - startX) / 20,
                vy: (targetY - startY) / 20,
                size: 4 + Math.random() * 3,
                alpha: 1,
                life: 20,
                type: 'in',
                color: '#00d2d3'
            });
        }
    } else {
        // 内部から吹き出す電子
        const shells = getShellsAllocation(currentElectrons);
        const maxShellRadius = shells.length * 40 + 10;
        const angle = Math.random() * Math.PI * 2;
        const startX = centerX + Math.cos(angle) * maxShellRadius;
        const startY = centerY + Math.sin(angle) * maxShellRadius;

        for (let i = 0; i < 8; i++) {
            const speed = 3 + Math.random() * 4;
            const pAngle = angle + (Math.random() - 0.5) * 0.5;
            ionizedAnimations.push({
                x: startX,
                y: startY,
                vx: Math.cos(pAngle) * speed,
                vy: Math.sin(pAngle) * speed,
                size: 2 + Math.random() * 3,
                alpha: 1,
                life: 30 + Math.random() * 20,
                type: 'out',
                color: '#ff4757'
            });
        }
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
    for (let i = ionizedAnimations.length - 1; i >= 0; i--) {
        const p = ionizedAnimations[i];
        p.life--;

        if (p.type === 'in') {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = p.life / 20;
        } else {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = p.life / 50;
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
    shells.forEach((count, index) => {
        const radius = (index + 1) * 40 + 10; // K殻:50px, L殻:90px, M殻:130px...
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]); // 点線にする
        ctx.stroke();
        ctx.setLineDash([]); // 実線に戻す

        // 殻のラベル（K, L, M, N）
        ctx.fillStyle = "rgba(94, 114, 228, 0.4)";
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
    // 原子核の本体円
    const nucleusRadius = 24;
    
    // グラデーションで立体感を出す
    const grad = ctx.createRadialGradient(centerX - 4, centerY - 4, 2, centerX, centerY, nucleusRadius);
    grad.addColorStop(0, "#ff7979");
    grad.addColorStop(0.3, "#ff5252");
    grad.addColorStop(1, "#b33939");

    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(255, 71, 87, 0.4)";
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // 陽子（＋）の数と中性子の数を原子核に重ねて表示
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    
    // 陽子数
    ctx.fillText(`陽子:${el.protons}+`, centerX, centerY - 4);
    // 中性子数
    ctx.fillStyle = "#ced6e0";
    ctx.font = "8px sans-serif";
    ctx.fillText(`中性子:${el.neutrons}`, centerX, centerY + 6);
}

// 起動
window.onload = init;
