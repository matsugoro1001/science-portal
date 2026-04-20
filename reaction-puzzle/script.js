// Game State
let currentEquationIndex = 0;
let currentCoefficients = { left: [], right: [] }; // [0, 0]
let isPlaying = false;
let activeEquations = []; 

// Time Attack & Combo State
let timeLeft = 60.0;
let score = 0;
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

// Initialize
document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
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

    if (typeof equations === 'undefined') {
        alert("Error: Data not loaded.");
        return;
    }

    // Shuffle and play infinitely or up to max
    shuffleArray(equations);
    activeEquations = equations; // Play all available questions
    currentEquationIndex = 0;
    
    // Time Attack variables reset
    timeLeft = 60.0;
    score = 0;
    combo = 0;
    scoreEl.textContent = score;
    comboDisplayEl.style.opacity = 0;
    
    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(gameTick, 100);

    isPlaying = true;
    loadEquation();
}

function gameTick() {
    if (!isPlaying) return;
    
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
        timeLeft = 0;
        timeDisplayEl.textContent = "0.0";
        gameOver();
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

    // Win! 
    isPlaying = false;
    balanceDisplayEl.textContent = "PERFECT!";

    // Combo & Score calculation
    combo++;
    let baseScore = 100 * combo;
    score += baseScore;
    timeLeft = Math.min(99.0, timeLeft + 10.0); // Recover 10 seconds, cap at 99
    
    scoreEl.textContent = score;
    comboDisplayEl.textContent = `${combo} CHAIN!`;
    comboDisplayEl.style.opacity = 1;
    
    // Combo Animation
    comboDisplayEl.classList.remove('combo-pop');
    void comboDisplayEl.offsetWidth; // trigger reflow
    comboDisplayEl.classList.add('combo-pop');

    showWinOverlay(eq);

    setTimeout(() => {
        winOverlay.classList.add('hidden');
        currentEquationIndex++;
        
        isPlaying = true;
        loadEquation();
    }, 2000); // reduced from 3s to 2s for better flow
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
    
    // ランクと合否の判定
    let rank = "C";
    let isPassed = false;
    let rankColor = "#a0a0a0"; // default C

    if (isAllClear) {
        // 全問クリアの場合（最低Aランク）
        if (combo === activeEquations.length) {
            // ノーミス
            rank = "S";
            isPassed = true;
            rankColor = "#ffdd00"; // gold
        } else {
            rank = "A";
            isPassed = true;
            rankColor = "#4cc9f0"; // cyan
        }
    } else {
        // タイムアップで終了の場合（BまたはCランク）
        if (currentEquationIndex >= 8) {
            rank = "B";
            isPassed = false; // 未合格
            rankColor = "#4ce0b3"; // green-ish
        } else {
            rank = "C";
            isPassed = false; // 未合格
            rankColor = "#a0a0a0"; // gray
        }
    }
    
    // UIの更新
    const rankDisplay = document.getElementById('rank-display');
    const passDisplay = document.getElementById('pass-display');
    
    if (rankDisplay && passDisplay) {
        rankDisplay.style.display = 'block';
        rankDisplay.textContent = `${rank} ランク`;
        rankDisplay.style.color = rankColor;
        
        passDisplay.style.display = 'inline-block';
        passDisplay.textContent = isPassed ? "合格！" : "未合格";
        passDisplay.className = "pass-result " + (isPassed ? "passed" : "failed");
    }
    
    document.querySelector('.title').textContent = isAllClear ? "ALL CLEAR!" : "TIME UP!";
    // Result screen can serve as game over screen
    document.querySelector('.final-time').innerHTML = `Final Score: <span style="color:#f72585">${score}</span><br>Max Combo: ${combo}`;
    resultScreen.classList.remove('hidden');
}
