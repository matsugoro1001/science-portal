// Game State
let currentMode = 'practice'; // 'practice' or 'test'
let testPlayerName = "";
let correctAnswersCount = 0;

let currentEquationIndex = 0;
let currentCoefficients = { left: [], right: [] }; // [0, 0]
let isPlaying = false;
let activeEquations = []; 

// Time Attack & Combo State
let timeLeft = 60.0;
let combo = 0;
let gameTimer = null;

// CPK Coloring
const atomColors = {
    'H': '#FFFFFF', 'C': '#909090', 'N': '#3050F8', 'O': '#FF0D0D',
    'F': '#90E050', 'Cl': '#1FF01F', 'Br': '#A62929', 'I': '#940094',
    'He': '#FFFFC0', 'Ne': '#B3E3F5', 'Ar': '#80D1E3', 'S': '#FFFF30',
    'P': '#FF8000', 'Fe': '#E06633', 'Cu': '#C88033', 'Mg': '#8AFF00',
    'Ca': '#3DFF00', 'Na': '#AB5CF2', 'K': '#8F40D4', 'Al': '#BFA6A6',
    'Ag': '#C0C0C0', 'Au': '#FFD123', 'default': '#FF00FF'
};

// DOM Elements
let scoreEl, questionTextEl, equationAreaEl, balanceArmEl, balanceDisplayEl;
let leftCounterEl, rightCounterEl, stockContainerEl, leftPanContentEl, rightPanContentEl;
let resultScreen, winOverlay, winEquationEl, timeDisplayEl, comboDisplayEl;
let startScreen, nameInputModal, quizScreen, submitBtn;

// Initialize
document.addEventListener('DOMContentLoaded', initDOM);

function initDOM() {
    scoreEl = document.getElementById('score');
    questionTextEl = document.getElementById('question-text');
    equationAreaEl = document.getElementById('equation-area');
    balanceArmEl = document.getElementById('balance-arm');
    balanceDisplayEl = document.getElementById('balance-display');
    leftCounterEl = document.getElementById('left-counter');
    rightCounterEl = document.getElementById('right-counter');
    stockContainerEl = document.getElementById('stock-container');
    leftPanContentEl = document.querySelector('#left-pan .pan-content');
    rightPanContentEl = document.querySelector('#right-pan .pan-content');
    resultScreen = document.getElementById('result-screen');
    winOverlay = document.getElementById('win-overlay');
    winEquationEl = document.getElementById('win-equation');
    timeDisplayEl = document.getElementById('time-display');
    comboDisplayEl = document.getElementById('combo-display');
    
    startScreen = document.getElementById('start-screen');
    nameInputModal = document.getElementById('name-input-modal');
    quizScreen = document.getElementById('quiz-screen');
    submitBtn = document.getElementById('submit-btn');

    if (typeof equations === 'undefined') {
        alert("Error: Data not loaded.");
        return;
    }
}

// UI Functions for Start up
window.startTestModeSetup = () => {
    nameInputModal.classList.remove('hidden');
    document.getElementById('test-player-name').focus();
};

window.closeNameInput = () => {
    nameInputModal.classList.add('hidden');
};

window.confirmTestStart = () => {
    const nameInput = document.getElementById('test-player-name');
    if (!nameInput.value.trim()) {
        alert("名前を入力してください");
        return;
    }
    testPlayerName = nameInput.value.trim();
    closeNameInput();
    window.startGame('test');
};

window.startGame = (mode) => {
    currentMode = mode;
    correctAnswersCount = 0;
    
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    // Test mode specfics
    if (currentMode === 'test') {
        submitBtn.style.display = 'inline-block';
        comboDisplayEl.style.display = 'none'; // テスト時はコンボ非表示
    } else {
        submitBtn.style.display = 'none';
        comboDisplayEl.style.display = 'block';
    }

    shuffleArray(equations);
    activeEquations = equations;
    currentEquationIndex = 0;
    
    combo = 0;
    if (currentMode !== 'test') comboDisplayEl.style.opacity = 0;
    
    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(gameTick, 100);

    isPlaying = true;
    loadEquation();
};

function gameTick() {
    if (!isPlaying) return;
    
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
        timeLeft = 0;
        timeDisplayEl.textContent = "0.0";
        // 時間切れはパスと同じ扱いにする
        window.skipQuestion();
    } else {
        timeDisplayEl.textContent = timeLeft.toFixed(1);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadEquation() {
    // If we run out of equations, finish the game
    if (currentEquationIndex >= activeEquations.length) {
        gameOver(true);
        return;
    }

    const eq = activeEquations[currentEquationIndex];
    questionTextEl.textContent = eq.name;

    // Reset Time for this question (1問あたり60秒)
    timeLeft = 60.0;
    
    // Reset Coefficients
    currentCoefficients = {
        left: new Array(eq.left.length).fill(0),
        right: new Array(eq.right.length).fill(0)
    };

    renderStock();
    updateGameState();
}

function renderStock() {
    const eq = activeEquations[currentEquationIndex];
    stockContainerEl.innerHTML = '';

    const createStockItem = (formula, side, index) => {
        const el = document.createElement('div');
        el.className = 'stock-item';
        
        // 物質名の取得
        const name = (typeof formulaNames !== 'undefined' && formulaNames[formula]) ? formulaNames[formula] : "";

        el.innerHTML = `
            ${renderMoleculeVisual(formula)}
            <div class="molecule-name">${getFormulaHTML(formula)}</div>
            <div class="stock-item-name">${name}</div>
            <div class="stock-controls">
                <button class="control-btn increase" onclick="incrementCoefficient('${side}', ${index})">▲</button>
                <div class="control-count" id="count-${side}-${index}">${currentCoefficients[side][index]}</div>
                <button class="control-btn decrease" onclick="decrementCoefficient('${side}', ${index})">▼</button>
            </div>
        `;
        return el;
    };

    // Reactants (Left)
    eq.left.forEach((mol, idx) => {
        stockContainerEl.appendChild(createStockItem(mol, 'left', idx));
    });

    // Products (Right)
    eq.right.forEach((mol, idx) => {
        stockContainerEl.appendChild(createStockItem(mol, 'right', idx));
    });
}

function updateGameState() {
    renderEquation();
    updateBalance();
    
    // ストック内の個数表示更新
    const eq = activeEquations[currentEquationIndex];
    eq.left.forEach((mol, idx) => {
        const el = document.getElementById(`count-left-${idx}`);
        if(el) el.textContent = currentCoefficients.left[idx];
    });
    eq.right.forEach((mol, idx) => {
        const el = document.getElementById(`count-right-${idx}`);
        if(el) el.textContent = currentCoefficients.right[idx];
    });

    checkWin();
}

function renderEquation() {
    const eq = activeEquations[currentEquationIndex];

    const renderSide = (molecules, side) => {
        return molecules.map((mol, idx) => {
            const coeff = currentCoefficients[side][idx];
            let displayCoeff = coeff === 0 ? '0' : (coeff === 1 ? '' : coeff);
            let coeffClass = 'coeff' + (coeff === 0 ? ' zero' : '');

            return `
                <div class="equation-part">
                    <span class="${coeffClass}">${displayCoeff}</span>
                    <span class="formula">${getFormulaHTML(mol)}</span>
                </div>
            `;
        }).join('<span class="operator">+</span>');
    };

    equationAreaEl.innerHTML = `
        ${renderSide(eq.left, 'left')}
        <span class="operator">→</span>
        ${renderSide(eq.right, 'right')}
    `;
}

function updateBalance() {
    const eq = activeEquations[currentEquationIndex];

    const leftAtoms = calculateTotalAtoms(eq.left, currentCoefficients.left);
    const rightAtoms = calculateTotalAtoms(eq.right, currentCoefficients.right);

    renderCounter(leftCounterEl, leftAtoms, rightAtoms);
    renderCounter(rightCounterEl, rightAtoms, leftAtoms);

    renderPan(leftPanContentEl, eq.left, currentCoefficients.left);
    renderPan(rightPanContentEl, eq.right, currentCoefficients.right);

    // Calculate Tilt
    const getAtomSum = (atoms) => Object.values(atoms).reduce((a, b) => a + b, 0);
    const leftSum = getAtomSum(leftAtoms);
    const rightSum = getAtomSum(rightAtoms);
    const diff = leftSum - rightSum;

    const maxTilt = 20;
    const tilt = Math.max(Math.min(diff * 2, maxTilt), -maxTilt);
    balanceArmEl.style.transform = `rotate(${-tilt}deg)`;

    // Display Status
    if (diff === 0 && leftSum > 0) {
        balanceDisplayEl.textContent = "BALANCED";
        balanceDisplayEl.classList.remove('error');
        balanceDisplayEl.style.color = "#0f0";
    } else {
        balanceDisplayEl.textContent = "UNBALANCED";
        balanceDisplayEl.classList.add('error');
    }
}

function renderPan(container, molecules, coeffs) {
    container.innerHTML = '';
    molecules.forEach((mol, idx) => {
        const count = coeffs[idx];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'molecule-object pan-object'; // no longer draggable
            el.innerHTML = renderMoleculeVisual(mol);
            container.appendChild(el);
        }
    });
}

function incrementCoefficient(side, index) {
    if (!isPlaying) return;
    currentCoefficients[side][index]++;
    updateGameState();
}

function decrementCoefficient(side, index) {
    if (!isPlaying) return;
    // 減らす操作をしたらコンボが途切れるペナルティ
    if (combo > 0) {
        combo = 0;
        comboDisplayEl.style.opacity = 0;
    }
    
    if (currentCoefficients[side][index] > 0) {
        currentCoefficients[side][index]--;
        updateGameState();
    }
}

function parseFormula(formula) {
    const counts = {};
    const regex = /([A-Z][a-z]*)(\d*)/g;
    let match;
    while ((match = regex.exec(formula)) !== null) {
        const element = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;
        counts[element] = (counts[element] || 0) + count;
    }
    return counts;
}

function calculateTotalAtoms(formulas, coeffs) {
    const total = {};
    formulas.forEach((formula, idx) => {
        const coeff = coeffs[idx];
        const counts = parseFormula(formula);
        for (const [atom, count] of Object.entries(counts)) {
            total[atom] = (total[atom] || 0) + count * coeff;
        }
    });
    return total;
}

function renderMoleculeVisual(formula) {
    const counts = parseFormula(formula);
    let html = '<div class="molecule-visual">';
    Object.entries(counts).forEach(([atom, count]) => {
        const color = atomColors[atom] || atomColors['default'];
        for (let i = 0; i < count; i++) {
            html += `<div class="atom-circle" style="background-color: ${color};">${atom}</div>`;
        }
    });
    html += '</div>';
    return html;
}

function getFormulaHTML(formula) {
    return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}

function renderCounter(el, atoms, compareAtoms) {
    el.innerHTML = Object.entries(atoms).map(([atom, count]) => {
        const otherCount = compareAtoms[atom] || 0;
        const className = count !== otherCount ? 'mismatch' : 'match';
        return `<div class="${className}">${atom}: ${count}</div>`;
    }).join('');
}

function checkWin() {
    if (!isPlaying) return;

    const eq = activeEquations[currentEquationIndex];

    const allFilled = [...currentCoefficients.left, ...currentCoefficients.right].every(c => c > 0);
    if (!allFilled) return;

    const leftAtoms = calculateTotalAtoms(eq.left, currentCoefficients.left);
    const rightAtoms = calculateTotalAtoms(eq.right, currentCoefficients.right);

    const allAtoms = new Set([...Object.keys(leftAtoms), ...Object.keys(rightAtoms)]);
    for (const atom of allAtoms) {
        if ((leftAtoms[atom] || 0) !== (rightAtoms[atom] || 0)) return;
    }

    if (currentMode === 'practice') {
        // Win!
        processCorrectAnswer(eq);
    }
}

function processCorrectAnswer(eq) {
    isPlaying = false;
    balanceDisplayEl.textContent = "PERFECT!";
    correctAnswersCount++;

    // Combo calculation (practice only)
    if (currentMode === 'practice') {
        combo++;
        timeLeft = 60.0; // 1問60秒なので完全リセット、または継続なら調整。今回は1問ごとに60秒とするため不要かもだが。
        
        comboDisplayEl.textContent = `${combo} CHAIN!`;
        comboDisplayEl.style.opacity = 1;
        
        // Combo Animation
        comboDisplayEl.classList.remove('combo-pop');
        void comboDisplayEl.offsetWidth; // trigger reflow
        comboDisplayEl.classList.add('combo-pop');
    }

    showWinOverlay(eq);

    setTimeout(() => {
        winOverlay.classList.add('hidden');
        currentEquationIndex++;
        
        isPlaying = true;
        loadEquation();
    }, 2000); 
}

window.submitAnswer = () => {
    if (!isPlaying) return;

    const eq = activeEquations[currentEquationIndex];
    const leftAtoms = calculateTotalAtoms(eq.left, currentCoefficients.left);
    const rightAtoms = calculateTotalAtoms(eq.right, currentCoefficients.right);

    // Check balance
    let isCorrect = true;
    const allAtoms = new Set([...Object.keys(leftAtoms), ...Object.keys(rightAtoms)]);
    for (const atom of allAtoms) {
        if ((leftAtoms[atom] || 0) !== (rightAtoms[atom] || 0)) {
            isCorrect = false;
            break;
        }
    }
    const allFilled = [...currentCoefficients.left, ...currentCoefficients.right].every(c => c > 0);
    if (!allFilled) isCorrect = false;

    if (isCorrect && getAtomSum(leftAtoms) > 0) {
        processCorrectAnswer(eq);
    } else {
        processWrongAnswer();
    }
};

window.skipQuestion = () => {
    if (!isPlaying) return;
    processWrongAnswer();
};

function getAtomSum(atoms) {
    return Object.values(atoms).reduce((a, b) => a + b, 0);
}

function processWrongAnswer() {
    isPlaying = false;
    balanceDisplayEl.textContent = "FAILED";
    balanceDisplayEl.classList.add('error');
    balanceDisplayEl.style.color = "#ff0d0d";

    if (currentMode === 'practice') {
        combo = 0;
        comboDisplayEl.style.opacity = 0;
    }

    // ちょっとだけ見せてから次へ
    setTimeout(() => {
        balanceDisplayEl.textContent = "START";
        balanceDisplayEl.style.color = "inherit";
        balanceDisplayEl.classList.remove('error');
        
        currentEquationIndex++;
        isPlaying = true;
        loadEquation();
    }, 1000);
}


function showWinOverlay(eq) {
    const renderSide = (molecules, side) => {
        return molecules.map((mol, idx) => {
            const coeff = currentCoefficients[side][idx];
            const displayCoeff = coeff === 1 ? '' : coeff;
            return `${displayCoeff}${getFormulaHTML(mol)}`;
        }).join(' + ');
    };

    const equationHTML = `
        ${renderSide(eq.left, 'left')}
        →
        ${renderSide(eq.right, 'right')}
    `;

    winEquationEl.innerHTML = equationHTML;
    winOverlay.classList.remove('hidden');
}

function gameOver(isAllClear = false) {
    isPlaying = false;
    clearInterval(gameTimer);
    
    const rankDisplay = document.getElementById('rank-display');
    const passDisplay = document.getElementById('pass-display');
    const titleEl = document.querySelector('#result-screen .title');
    const finalInfoEl = document.querySelector('.final-time');

    if (currentMode === 'practice') {
        titleEl.textContent = isAllClear ? "ALL CLEAR!" : "FINISH!";
        
        let rank = "C";
        let isPassed = false;
        let rankColor = "#a0a0a0"; 

        if (correctAnswersCount === activeEquations.length) {
            if (combo === activeEquations.length) {
                rank = "S"; isPassed = true; rankColor = "#ffdd00"; 
            } else {
                rank = "A"; isPassed = true; rankColor = "#4cc9f0"; 
            }
        } else if (correctAnswersCount >= 8) {
            rank = "B"; isPassed = false; rankColor = "#4ce0b3"; 
        } else {
            rank = "C"; isPassed = false; rankColor = "#a0a0a0"; 
        }

        if (rankDisplay && passDisplay) {
            rankDisplay.style.display = 'block';
            rankDisplay.textContent = `${rank} ランク`;
            rankDisplay.style.color = rankColor;
            
            passDisplay.style.display = 'inline-block';
            passDisplay.textContent = isPassed ? "合格！" : "未合格";
            passDisplay.className = "pass-result " + (isPassed ? "passed" : "failed");
        }
        
        finalInfoEl.innerHTML = `正解数: <span style="color:#f72585">${correctAnswersCount}</span> / ${activeEquations.length}<br>MAXコンボ: ${combo}`;
    } else {
        // Test Mode Result
        titleEl.textContent = "テスト終了";
        if (rankDisplay) rankDisplay.style.display = 'none';
        
        const isPassed = correctAnswersCount >= 8; // テストの合格基準は任意（今は仮に8とする）
        if (passDisplay) {
            passDisplay.style.display = 'inline-block';
            passDisplay.textContent = isPassed ? "合格！" : "不合格";
            passDisplay.className = "pass-result " + (isPassed ? "passed" : "failed");
        }
        
        finalInfoEl.innerHTML = `${testPlayerName}さんの成績<br><br>得点: <span style="color:#4ecca3; font-size: 2rem;">${correctAnswersCount}</span> / ${activeEquations.length}`;

        saveScoreToGas('test', testPlayerName, correctAnswersCount);
    }
    
    resultScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
}

// --- GAS API ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyGtS6zkCFBwf3ymgndBjaEZamV2dWOyz1-nUx7S9dE-t4DQ2oiTzMmULcXMdGCBYrJ/exec';
const SHEET_TYPE = '化学反応式テスト';

async function saveScoreToGas(mode, name, score) {
    try {
        const url = `${GAS_URL}?type=${encodeURIComponent(SHEET_TYPE)}&action=save&gameMode=${encodeURIComponent(mode)}&name=${encodeURIComponent(name)}&score=${score}&t=${Date.now()}`;
        console.log("Saving to GAS:", url);
        await fetch(url, { mode: 'no-cors' });
        console.log("Data sent to GAS.");
    } catch (e) {
        console.error('GAS Save Error:', e);
    }
}
