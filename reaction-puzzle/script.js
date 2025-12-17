// Game State
let currentEquationIndex = 0;
let currentCoefficients = { left: [], right: [] }; // [0, 0]
let isPlaying = false;
let activeEquations = []; // Subset of 10 equations

// CPK Coloring
const atomColors = {
    'H': '#FFFFFF', 'C': '#909090', 'N': '#3050F8', 'O': '#FF0D0D',
    'F': '#90E050', 'Cl': '#1FF01F', 'Br': '#A62929', 'I': '#940094',
    'He': '#FFFFC0', 'Ne': '#B3E3F5', 'Ar': '#80D1E3', 'S': '#FFFF30',
    'P': '#FF8000', 'Fe': '#E06633', 'Cu': '#C88033', 'Mg': '#8AFF00',
    'Ca': '#3DFF00', 'Na': '#AB5CF2', 'K': '#8F40D4', 'Al': '#BFA6A6',
    'Ag': '#C0C0C0', 'Au': '#FFD123', 'default': '#FF00FF'
};

// DOM Elements (Global references, populated in initGame)
let scoreEl, questionTextEl, equationAreaEl, balanceArmEl, balanceDisplayEl;
let leftCounterEl, rightCounterEl, stockContainerEl, leftPanContentEl, rightPanContentEl;
let resultScreen, winOverlay, winEquationEl;

// Initialize
document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    // Select Elements safely after DOM load
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

    if (typeof equations === 'undefined') {
        alert("Error: Data not loaded.");
        return;
    }

    // Shuffle and Pick 10
    shuffleArray(equations);
    activeEquations = equations.slice(0, 10);

    currentEquationIndex = 0;
    isPlaying = true;
    loadEquation();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadEquation() {
    const eq = activeEquations[currentEquationIndex];
    questionTextEl.textContent = eq.name;
    scoreEl.textContent = currentEquationIndex; // Show current progress (0-9) or completed count?
    // User said "Clear: /10". Usually means completed count.
    // Let's show currentEquationIndex (which is 0 at start).
    // Or maybe 1-based? "Question 1/10"?
    // The UI says "Clear: 0/10". So 0 is correct for start.

    // Reset Coefficients (0 for all)
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

    // Helper to create draggable stock item
    const createStockItem = (formula, side, index) => {
        const el = document.createElement('div');
        el.className = 'molecule-object';
        el.draggable = true;
        el.dataset.formula = formula;
        el.dataset.side = side;
        el.dataset.index = index;
        el.dataset.source = 'stock'; // From stock

        el.innerHTML = `
            ${renderMoleculeVisual(formula)}
            <div class="molecule-name">${getFormulaHTML(formula)}</div>
        `;

        el.addEventListener('dragstart', handleDragStart);
        setupTouchEvents(el); // Add Touch Support
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
    checkWin();
}

function renderEquation() {
    const eq = activeEquations[currentEquationIndex];

    const renderSide = (molecules, side) => {
        return molecules.map((mol, idx) => {
            const coeff = currentCoefficients[side][idx];

            // Logic: 
            // 0 -> Show "0" (Gray)
            // 1 -> Show "" (Implied)
            // >1 -> Show Number
            let displayCoeff;
            let coeffClass = 'coeff';

            if (coeff === 0) {
                displayCoeff = '0';
                coeffClass += ' zero';
            } else if (coeff === 1) {
                displayCoeff = ''; // Don't show 1
            } else {
                displayCoeff = coeff;
            }

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

    // Calculate Atoms
    const leftAtoms = calculateTotalAtoms(eq.left, currentCoefficients.left);
    const rightAtoms = calculateTotalAtoms(eq.right, currentCoefficients.right);

    // Render Counters
    renderCounter(leftCounterEl, leftAtoms, rightAtoms);
    renderCounter(rightCounterEl, rightAtoms, leftAtoms);

    // Render Pan Contents (Molecule Objects)
    renderPan(leftPanContentEl, eq.left, currentCoefficients.left, 'left');
    renderPan(rightPanContentEl, eq.right, currentCoefficients.right, 'right');

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

function renderPan(container, molecules, coeffs, side) {
    container.innerHTML = '';
    molecules.forEach((mol, idx) => {
        const count = coeffs[idx];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'molecule-object';
            el.draggable = true;
            el.dataset.formula = mol;
            el.dataset.side = side;
            el.dataset.index = idx;
            el.dataset.source = 'pan';

            el.innerHTML = renderMoleculeVisual(mol);

            el.addEventListener('dragstart', handleDragStart);
            setupTouchEvents(el); // Add Touch Support
            container.appendChild(el);
        }
    });
}

// --- Touch Support Logic ---
let activeTouchGhost = null;
let activeTouchData = null;

function setupTouchEvents(el) {
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
}

function handleTouchStart(e) {
    if (!isPlaying) return;
    e.preventDefault(); // Prevent scrolling

    const touch = e.touches[0];
    const target = e.currentTarget;

    // Create Ghost
    activeTouchGhost = target.cloneNode(true);
    activeTouchGhost.style.position = 'absolute';
    activeTouchGhost.style.opacity = '0.8';
    activeTouchGhost.style.pointerEvents = 'none'; // Let clicks pass through to detect drop zone
    activeTouchGhost.style.zIndex = '1000';
    activeTouchGhost.style.width = `${target.offsetWidth}px`;
    activeTouchGhost.style.height = `${target.offsetHeight}px`;

    document.body.appendChild(activeTouchGhost);
    moveGhost(touch.clientX, touch.clientY);

    // Store Data
    activeTouchData = {
        formula: target.dataset.formula,
        side: target.dataset.side,
        index: parseInt(target.dataset.index),
        source: target.dataset.source
    };
}

function handleTouchMove(e) {
    if (!activeTouchGhost) return;
    e.preventDefault();
    const touch = e.touches[0];
    moveGhost(touch.clientX, touch.clientY);
}

function handleTouchEnd(e) {
    if (!activeTouchGhost) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // Check if dropped on Pan
    const pan = dropTarget ? dropTarget.closest('.pan') : null;

    if (pan) {
        handleDropOnPan(pan, activeTouchData);
    } else {
        // Dropped outside
        if (activeTouchData.source === 'pan') {
            decrementCoefficient(activeTouchData.side, activeTouchData.index);
        }
    }

    // Cleanup
    activeTouchGhost.remove();
    activeTouchGhost = null;
    activeTouchData = null;
}

function moveGhost(x, y) {
    if (activeTouchGhost) {
        activeTouchGhost.style.left = `${x - activeTouchGhost.offsetWidth / 2}px`;
        activeTouchGhost.style.top = `${y - activeTouchGhost.offsetHeight / 2}px`;
    }
}

// Drag & Drop Logic (Mouse)
function handleDragStart(e) {
    if (!isPlaying) {
        e.preventDefault();
        return;
    }
    const data = {
        formula: e.currentTarget.dataset.formula,
        side: e.currentTarget.dataset.side,
        index: parseInt(e.currentTarget.dataset.index),
        source: e.currentTarget.dataset.source
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    e.dataTransfer.effectAllowed = data.source === 'stock' ? 'copy' : 'move';
}

// Drop Zones
// 1. Pans (Accept from Stock or Pan)
const pans = [document.getElementById('left-pan'), document.getElementById('right-pan')];
pans.forEach(pan => {
    pan.addEventListener('dragover', e => {
        e.preventDefault();
        pan.classList.add('drag-over');
    });
    pan.addEventListener('dragleave', () => pan.classList.remove('drag-over'));
    pan.addEventListener('drop', e => {
        e.preventDefault();
        pan.classList.remove('drag-over');
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        handleDropOnPan(pan, data);
    });
});

// 2. Global (Drop outside pan to remove if source is pan)
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', e => {
    // Only handle if NOT dropped on a pan (pans handle their own drop)
    if (e.target.closest('.pan')) return;

    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    const data = JSON.parse(rawData);
    if (data.source === 'pan') {
        // Remove from pan
        decrementCoefficient(data.side, data.index);
    }
});

function handleDropOnPan(panEl, data) {
    const isLeftPan = panEl.classList.contains('left-pan');
    const targetSide = isLeftPan ? 'left' : 'right';

    // Validate Side
    if (data.side !== targetSide) {
        // Wrong side
        panEl.classList.add('error-flash');
        setTimeout(() => panEl.classList.remove('error-flash'), 500);
        return;
    }

    if (data.source === 'stock') {
        // Add new molecule
        incrementCoefficient(data.side, data.index);
    } else if (data.source === 'pan') {
        // Moving within pan? Do nothing or reorder.
        // If dropped on SAME pan, do nothing.
        // If dropped on WRONG pan, handled above.
    }
}

function incrementCoefficient(side, index) {
    currentCoefficients[side][index]++;
    updateGameState();
}

function decrementCoefficient(side, index) {
    if (currentCoefficients[side][index] > 0) {
        currentCoefficients[side][index]--;
        updateGameState();
    }
}

// Helpers
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

    // 1. No empty sides (at least 1 molecule total? or all slots filled?)
    // User spec: "Coefficient 0 is empty".
    // Usually we need at least 1 of each reactant/product for a valid reaction.
    // So let's require ALL coefficients > 0.
    const allFilled = [...currentCoefficients.left, ...currentCoefficients.right].every(c => c > 0);
    if (!allFilled) return;

    // 2. Balanced
    const leftAtoms = calculateTotalAtoms(eq.left, currentCoefficients.left);
    const rightAtoms = calculateTotalAtoms(eq.right, currentCoefficients.right);

    const allAtoms = new Set([...Object.keys(leftAtoms), ...Object.keys(rightAtoms)]);
    for (const atom of allAtoms) {
        if ((leftAtoms[atom] || 0) !== (rightAtoms[atom] || 0)) return;
    }

    // Win!
    isPlaying = false; // Stop interactions
    balanceDisplayEl.textContent = "PERFECT!";

    // Show Win Overlay
    showWinOverlay(eq);

    setTimeout(() => {
        winOverlay.classList.add('hidden');
        currentEquationIndex++;
        scoreEl.textContent = currentEquationIndex;

        if (currentEquationIndex >= activeEquations.length) {
            gameClear();
        } else {
            isPlaying = true;
            loadEquation();
        }
    }, 3000); // 3 seconds delay
}

function showWinOverlay(eq) {
    // Construct balanced equation string
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

function gameClear() {
    isPlaying = false;
    // Remove timer display from result screen since we don't track time anymore
    document.querySelector('.final-time').style.display = 'none';
    resultScreen.classList.remove('hidden');
}
