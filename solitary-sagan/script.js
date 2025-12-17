// Data Definitions
const METALS = {
    Mg: { name: "マグネシウム", symbol: "Mg", reactivity: 3, colorClass: "metal-mg", ion: "Mg²⁺", electrons: 2 },
    Zn: { name: "亜鉛", symbol: "Zn", reactivity: 2, colorClass: "metal-zn", ion: "Zn²⁺", electrons: 2 },
    Fe: { name: "鉄", symbol: "Fe", reactivity: 1, colorClass: "metal-fe", ion: "Fe²⁺", electrons: 2 },
    Cu: { name: "銅", symbol: "Cu", reactivity: 0, colorClass: "metal-cu", ion: "Cu²⁺", electrons: 2 }
};

const SOLUTIONS = {
    HCl: { name: "塩酸 (HCl)", type: "acid", colorClass: "sol-clear" },
    H2SO4: { name: "硫酸 (H₂SO₄)", type: "acid", colorClass: "sol-clear" },
    NaCl: { name: "食塩水 (NaCl)", type: "neutral", colorClass: "sol-clear" },
    CuSO4: { name: "硫酸銅水溶液 (CuSO₄)", type: "salt", colorClass: "sol-cuso4" },
    ZnSO4: { name: "硫酸亜鉛水溶液 (ZnSO₄)", type: "salt", colorClass: "sol-clear" },
    MgSO4: { name: "硫酸マグネシウム (MgSO₄)", type: "salt", colorClass: "sol-clear" }
};

// ... (State, DOM Elements, Init, Update UI etc remain the same) ...

// ...

function triggerReactionCycle(anodeSide, cathodeSide, anodeMetal, activeSol, anodeContainer, cathodeContainer) {
    // 1. Anode Reaction Position
    const anodeId = anodeSide === 'left' ? 'electrode-left' : 'electrode-right';
    const anodeEl = document.getElementById(anodeId);
    if (!anodeEl) return;

    // Find Anode Surface Point (for Atom popping off)
    const aRect = anodeEl.getBoundingClientRect();
    const spawnY_abs = aRect.bottom - (Math.random() * 50 + 20);
    const spawnX_abs = aRect.left + (aRect.width / 2);

    // 1. Visual: "Zn" atom pops off
    spawnAnodeAtomReaction(anodeSide, anodeMetal, spawnX_abs, spawnY_abs, anodeContainer, () => {
        // Callback: Atom became Ion. 
        // NOW spawn Continuous Electrons.

        // Use defined electron valency
        const electronCount = anodeMetal.electrons || 2;

        for (let i = 0; i < electronCount; i++) {
            setTimeout(() => {
                animateContinuousElectron(anodeSide, cathodeSide, spawnX_abs, spawnY_abs, cathodeContainer, activeSol, i === electronCount - 1);
            }, i * 1200);
        }
    });
}

// ... animateContinuousElectron ... (no change needed except call signature if refined, but passed args are fine)
// Assuming animateContinuousElectron looks something like this, based on the instruction's snippet:
function animateContinuousElectron(anodeSide, cathodeSide, startX, startY, cathodeContainer, activeSol, triggerReaction) {
    const e = document.createElement('div');
    e.className = 'electron';
    e.style.position = 'fixed';
    e.style.left = `${startX}px`;
    e.style.top = `${startY}px`;
    e.style.zIndex = 2000;
    document.body.appendChild(e);

    const cathodeId = cathodeSide === 'left' ? 'electrode-left' : 'electrode-right';
    const cathodeEl = document.getElementById(cathodeId);
    if (!cathodeEl) { e.remove(); return; }

    const cRect = cathodeEl.getBoundingClientRect();
    const endX = cRect.left + (cRect.width / 2) + (Math.random() * 30 - 15); // Land randomly on electrode
    const endY = cRect.bottom - (Math.random() * 60 + 20);

    const anim = e.animate([
        { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0.8 },
        { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1, offset: 0.5 },
        { left: `${endX}px`, top: `${endY}px`, transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0.8 }
    ], {
        duration: 2000,
        easing: 'ease-in-out',
        fill: 'forwards'
    });

    // Cleanup & Trigger Reaction at End
    anim.onfinish = () => {
        e.remove();
        // TRIGGER ONLY IF FINAL ELECTRON
        if (triggerReaction) {
            // Pass the landing coordinates so the reaction happens EXACTLY where electron hit
            spawnCathodeReactionVisuals(cathodeContainer, cathodeSide, activeSol, endX, endY);
        }
    };
}

function spawnCathodeReactionVisuals(container, side, sol, targetAbsX, targetAbsY) {
    // 1. Identify Ion (Cu2+ or H+)
    let label = '', isCu = false, isGas = false, cls = '';

    if (sol.type === 'acid') {
        label = 'H⁺'; cls = 'ion-h'; isGas = true;
    } else if (sol.name.includes('Cu')) {
        label = 'Cu²⁺'; cls = 'ion-cu'; isCu = true;
    } else { return; }

    // Target: Use passed coordinates if available, else calc default center
    let finalX, finalY;

    if (targetAbsX !== undefined && targetAbsY !== undefined) {
        finalX = targetAbsX;
        finalY = targetAbsY;
    } else {
        // Fallback
        const cathodeId = side === 'left' ? 'electrode-left' : 'electrode-right';
        const cathodeEl = document.getElementById(cathodeId);
        if (!cathodeEl) return;
        const cRect = cathodeEl.getBoundingClientRect();
        finalX = cRect.left + (cRect.width / 2);
        finalY = cRect.bottom - 60;
    }

    // Start: In Solution (offset from electrode)
    const offset = side === 'left' ? 60 : -60; // Move out into solution
    const startX = finalX + offset;
    const startY = finalY + 40; // Approaches from slightly below-side

    const ion = document.createElement('div');
    ion.className = `ion ${cls}`;
    ion.textContent = label;
    ion.style.position = 'fixed'; // FIXED positioning for overlay
    ion.style.left = `${startX}px`;
    ion.style.top = `${startY}px`;
    ion.style.zIndex = 2147483647; // Max Z-Index
    ion.style.transform = 'translate(-50%, -50%)';
    // Add distinct shadow/border for visibility against dark electrode
    ion.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.8), 0 0 10px rgba(0,0,0,0.5)';

    document.body.appendChild(ion);

    // Animate: Appear and Move to Impact Point
    const anim = ion.animate([
        { opacity: 0, left: `${startX}px`, top: `${startY}px`, transform: 'translate(-50%, -50%) scale(0.5)' },
        { opacity: 1, left: `${finalX}px`, top: `${finalY}px`, transform: 'translate(-50%, -50%) scale(1)' }
    ], {
        duration: 800, // Faster approach for snap reaction
        easing: 'ease-out',
        fill: 'forwards'
    });

    anim.onfinish = () => {
        // Transform on surface
        if (isCu) {
            // Cu2+ -> Cu Visual Change
            ion.style.transition = 'all 0.3s';
            ion.style.backgroundColor = 'var(--metal-cu)';
            ion.style.color = '#fff';
            ion.style.borderColor = '#ea580c';
            ion.style.boxShadow = '0 0 5px #ffd700'; // Gold glow for "New Metal"
            ion.textContent = 'Cu';
            ion.className = 'ion atom-cu';

            // Stick and scale up slightly to show "plating"
            ion.animate([
                { transform: 'translate(-50%, -50%) scale(1)' },
                { transform: 'translate(-50%, -50%) scale(1.3)' },
                { transform: 'translate(-50%, -50%) scale(1)' }
            ], { duration: 400 }).onfinish = () => {
                // Remain visible for longer then fade
                setTimeout(() => {
                    ion.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000 }).onfinish = () => ion.remove();
                }, 3000);
            };

        } else if (isGas) {
            // H+ -> H2 Gas
            // Transform to bubble
            ion.style.transition = 'all 0.2s';
            ion.textContent = '';
            ion.style.borderRadius = '50%';
            ion.style.backgroundColor = '#fff'; // Pure white bubble
            ion.style.border = '1px solid #999';
            ion.style.width = '20px'; // Larger bubble
            ion.style.height = '20px';
            ion.style.boxShadow = 'inset -2px -2px 5px rgba(0,0,0,0.1)';
            ion.className = 'bubble';

            // Rise UP
            ion.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: 'translate(-50%, -250px) scale(1.5)', opacity: 0 } // Rise higher and grow
            ], { duration: 2500, easing: 'ease-in' }).onfinish = () => ion.remove();
        }
    };
}

// State
let state = {
    mode: "voltaic", // 'voltaic' or 'daniell'
    leftMetal: "Zn",
    rightMetal: "Cu",
    leftSolution: "ZnSO4", // Match diagram defaults
    rightSolution: "CuSO4" // Used in Daniell mode
};

// DOM Elements
const els = {
    modeRadios: document.getElementsByName('cell-mode'),
    beakerContainer: document.getElementById('beaker-container'),
    selectLeft: document.getElementById('select-metal-left'),
    selectRight: document.getElementById('select-metal-right'),
    selectSolLeft: document.getElementById('select-solution-left'),
    selectSolRight: document.getElementById('select-solution-right'),
    groupSolRight: document.getElementById('group-sol-right'),
    labelSolLeft: document.getElementById('label-sol-left'),

    electrodeLeft: document.getElementById('electrode-left'),
    electrodeRight: document.getElementById('electrode-right'),
    labelLeft: document.getElementById('label-left'),
    labelRight: document.getElementById('label-right'),

    solutionLeft: document.getElementById('solution-left'),
    solutionRight: document.getElementById('solution-right'),

    voltageDisplay: document.getElementById('voltage-display'),
    motorIcon: document.querySelector('.motor-icon'),

    anodeBox: document.querySelector('.reaction-box.anode'),
    cathodeBox: document.querySelector('.reaction-box.cathode'),
    anodeMetalText: document.getElementById('anode-metal'),
    cathodeMetalText: document.getElementById('cathode-metal'),
    anodeEq: document.getElementById('anode-equation'),
    cathodeEq: document.getElementById('cathode-equation'),
    explanation: document.getElementById('explanation-text'),

    bubblesLeft: document.getElementById('bubbles-left'),
    bubblesRight: document.getElementById('bubbles-right'),
    electronContainer: document.getElementById('electron-flow-container')
};

// Initialization
function init() {
    // Populate Selects
    Object.keys(METALS).forEach(key => {
        const opt1 = new Option(METALS[key].name, key);
        const opt2 = new Option(METALS[key].name, key);
        els.selectLeft.add(opt1);
        els.selectRight.add(opt2);
    });

    Object.keys(SOLUTIONS).forEach(key => {
        const opt1 = new Option(SOLUTIONS[key].name, key);
        const opt2 = new Option(SOLUTIONS[key].name, key);
        els.selectSolLeft.add(opt1);
        els.selectSolRight.add(opt2);
    });

    // Set Defaults to match diagram
    state.leftMetal = "Zn";
    state.rightMetal = "Cu";
    state.leftSolution = "ZnSO4";
    state.rightSolution = "CuSO4";

    els.selectLeft.value = state.leftMetal;
    els.selectRight.value = state.rightMetal;
    els.selectSolLeft.value = state.leftSolution;
    els.selectSolRight.value = state.rightSolution;

    // Event Listeners
    els.modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.mode = e.target.value;
            updateModeUI();
            update();
        });
    });

    els.selectLeft.addEventListener('change', (e) => { state.leftMetal = e.target.value; update(); });
    els.selectRight.addEventListener('change', (e) => { state.rightMetal = e.target.value; update(); });
    els.selectSolLeft.addEventListener('change', (e) => { state.leftSolution = e.target.value; update(); });
    els.selectSolRight.addEventListener('change', (e) => { state.rightSolution = e.target.value; update(); });

    updateModeUI();
    update();
}

function updateModeUI() {
    if (state.mode === 'voltaic') {
        els.beakerContainer.className = 'beaker-container voltaic-mode';
        els.groupSolRight.style.display = 'none';
        els.labelSolLeft.textContent = '水溶液';
        state.leftSolution = "H2SO4"; // Reset to common voltaic
        els.selectSolLeft.value = state.leftSolution;
    } else {
        els.beakerContainer.className = 'beaker-container daniell-mode';
        els.groupSolRight.style.display = 'flex';
        els.labelSolLeft.textContent = '左の水溶液 (負極側)';
        state.leftSolution = "ZnSO4";
        state.rightSolution = "CuSO4";
        els.selectSolLeft.value = state.leftSolution;
        els.selectSolRight.value = state.rightSolution;
    }
}

// Core Logic
function update() {
    const mLeft = METALS[state.leftMetal];
    const mRight = METALS[state.rightMetal];
    const solLeft = SOLUTIONS[state.leftSolution];
    const solRight = SOLUTIONS[state.rightSolution];

    // Update Visuals
    els.electrodeLeft.className = `electrode ${mLeft.colorClass}`;
    els.electrodeRight.className = `electrode ${mRight.colorClass}`;

    // Add Labels for poles
    els.electrodeLeft.innerHTML = ``;
    els.electrodeRight.innerHTML = ``;

    els.labelLeft.textContent = mLeft.symbol;
    els.labelRight.textContent = mRight.symbol;

    els.solutionLeft.className = `solution-area ${solLeft.colorClass}`;
    els.solutionRight.className = `solution-area ${solRight.colorClass}`;

    // Calculate Reaction
    let voltage = 0;
    let anode = null; // 'left' or 'right'
    let cathode = null;

    // Fix Solution Color for Voltaic (homogenous)
    if (state.mode === 'voltaic') {
        // Visual hack: Render right side same as left side
        els.solutionRight.className = `solution-area ${solLeft.colorClass}`;
    }

    if (state.leftMetal !== state.rightMetal) {
        // Determine Anode/Cathode by reactivity
        if (mLeft.reactivity > mRight.reactivity) {
            anode = 'left';
            cathode = 'right';
        } else {
            anode = 'right';
            cathode = 'left';
        }

        // Add Pole Labels
        const anodeEl = anode === 'left' ? els.electrodeLeft : els.electrodeRight;
        const cathodeEl = cathode === 'left' ? els.electrodeLeft : els.electrodeRight;

        anodeEl.innerHTML = `<div class="pole-label neg">一極</div>`;
        cathodeEl.innerHTML = `<div class="pole-label pos">＋極</div>`;


        // Voltage Calculation
        voltage = Math.abs(mLeft.reactivity - mRight.reactivity) * 1.1;
    }

    // Update Voltage Display
    els.voltageDisplay.textContent = `${voltage.toFixed(2)} V`;

    // Update Motor Animation
    if (voltage > 0) {
        els.motorIcon.style.animationDuration = `${2 / voltage}s`;
    } else {
        els.motorIcon.style.animationDuration = '0s';
    }

    // Update Info Panel & Effects
    updateInfoAndEffects(anode, cathode, mLeft, mRight, solLeft, solRight, voltage);

    // Background Ions
    populateBackgroundIons(state.mode, solLeft, solRight);
}

function updateInfoAndEffects(anodeSide, cathodeSide, mLeft, mRight, solLeft, solRight, voltage) {
    // Clear previous effects
    els.bubblesLeft.innerHTML = '';
    els.bubblesRight.innerHTML = '';
    els.electronContainer.innerHTML = '';

    if (!anodeSide) {
        els.anodeMetalText.textContent = "--";
        els.cathodeMetalText.textContent = "--";
        els.anodeEq.textContent = "--";
        els.cathodeEq.textContent = "--";
        els.explanation.textContent = "電圧が発生していません。異なる金属を選んでください。";
        return;
    }

    const anodeMetal = anodeSide === 'left' ? mLeft : mRight;
    const cathodeMetal = cathodeSide === 'left' ? mLeft : mRight;
    const activeSol = (state.mode === 'voltaic') ? solLeft : (cathodeSide === 'left' ? solLeft : solRight);

    // Text Updates
    els.anodeMetalText.textContent = `${anodeMetal.name} (${anodeMetal.symbol})`;
    els.cathodeMetalText.textContent = `${cathodeMetal.name} (${cathodeMetal.symbol})`;

    // Anode Equation
    els.anodeEq.textContent = `${anodeMetal.symbol} → ${anodeMetal.ion} + 2e⁻`;

    // Cathode Equation
    let explanationText = "";
    let isValidReaction = true;
    let reactionType = ''; // 'h2' or 'cu'

    // Universal Logic for Cathode Reaction in this Sim:
    // 1. If solution contains reducible metal ions (Cu2+), they reduce.
    // 2. Otherwise (Acids, Salts of active metals like Na, Zn, Mg), Hydrogen is produced (from H+ or H2O).

    if (activeSol.name.includes('Cu')) {
        // Cu reduces
        reactionType = 'cu';
        els.cathodeEq.textContent = `Cu²⁺ + 2e⁻ → Cu`;
        explanationText = `溶液中の銅イオンが電子を受け取り、銅が析出します。`;
    } else if (activeSol.type === 'acid') {
        // Acid -> Hydrogen generates
        reactionType = 'h2';
        els.cathodeEq.textContent = `2H⁺ + 2e⁻ → H₂`;
        explanationText = `溶液中の水素イオンが電子を受け取り、水素が発生します。`;
    } else {
        // Neutral/Salt w/o Reducible Metal -> Oxygen reacts
        reactionType = 'o2';
        els.cathodeEq.textContent = `O₂ + 2H₂O + 4e⁻ → 4OH⁻`;

        // ... (Voltaic explanation stays mostly similar for O2/H2O context if used for NaCl)
        explanationText = (state.mode === 'daniell')
            ? `ダニエル電池：${anodeMetal.name}が溶け、正極では酸素が反応します。`
            : `ボルタ電池（食塩水など）：溶存酸素が電子を受け取ります。`;
        explanationText += `\n(※水溶液中の酸素と水が反応し、水酸化物イオン(OH⁻)が生じます)`;
    }

    els.explanation.textContent = explanationText;

    // Electron Flow Animation
    if (voltage > 0 && isValidReaction) {
        animateReaction(anodeSide, cathodeSide, mLeft, mRight, activeSol);
        if (state.mode === 'daniell') animateMembraneTransfer(anodeSide, cathodeSide);
    }
}

// ... (skipping creatingWireFlow definition as we removed call) ...

// ...

function triggerReactionCycle(anodeSide, cathodeSide, anodeMetal, activeSol, anodeContainer, cathodeContainer) {
    // 1. Anode Reaction Position
    const anodeId = anodeSide === 'left' ? 'electrode-left' : 'electrode-right';
    const anodeEl = document.getElementById(anodeId);
    if (!anodeEl) return;

    // Find Anode Surface Point (for Atom popping off)
    const aRect = anodeEl.getBoundingClientRect();
    const spawnY_abs = aRect.bottom - (Math.random() * 50 + 20);
    const spawnX_abs = aRect.left + (aRect.width / 2);

    // 1. Visual: "Zn" atom pops off
    spawnAnodeAtomReaction(anodeSide, anodeMetal, spawnX_abs, spawnY_abs, anodeContainer, () => {
        // Callback: Atom became Ion. 
        // NOW spawn Continuous Electrons.

        const electronCount = 2; // Zn -> 2e- (All current metals are divalent)

        for (let i = 0; i < electronCount; i++) {
            setTimeout(() => {
                animateContinuousElectron(anodeSide, cathodeSide, spawnX_abs, spawnY_abs, cathodeContainer, activeSol);
            }, i * 1200); // 1.2s delay: distinct but closer together like a pair
        }
    });
}

function createWireFlow(anodeSide) {
    // Current Flow Arrow (Red) - Opposite to electrons
    // Anode -> Cathode is Electron flow.
    // Cathode -> Anode is Current flow.

    // Electron (Blue): Anode to Cathode
    const e = document.createElement('div');
    e.className = 'electron';
    e.style.top = '-7px';
    const startE = anodeSide === 'left' ? '10%' : '90%';
    const endE = anodeSide === 'left' ? '90%' : '10%';
    e.animate([{ left: startE }, { left: endE }], { duration: 2000, iterations: Infinity });
    els.electronContainer.appendChild(e);

    // Current Arrow (Red): Cathode to Anode
    const arrow = document.createElement('div');
    arrow.className = 'current-arrow';
    arrow.textContent = anodeSide === 'left' ? '←' : '→'; // Pointing to Anode (Left) means Right to Left arrows? No.
    // Current flows Cathode (+) to Anode (-).
    // If Anode is Left (-), Cathode is Right (+). Current goes Right -> Left. Arrow: <-

    arrow.style.top = '-35px';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';

    // Label
    const label = document.createElement('div');
    label.textContent = "電流";
    label.style.position = 'absolute';
    label.style.color = '#ef4444';
    label.style.fontWeight = 'bold';
    label.style.top = '-55px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';

    els.electronContainer.appendChild(arrow);
    els.electronContainer.appendChild(label);
}

// Background Icons
function populateBackgroundIons(mode, solLeft, solRight) {
    const containers = [document.getElementById('ions-left'), document.getElementById('ions-right')];
    containers.forEach(c => c.innerHTML = '');

    const sols = [solLeft, solRight];
    if (mode === 'voltaic') sols[1] = solLeft;

    sols.forEach((sol, index) => {
        const container = containers[index];

        let cation = 'H⁺', anion = 'SO₄²⁻'; // Default
        let cClass = 'ion-h', aClass = 'ion-so4';

        if (sol.name.includes("Zn")) { cation = "Zn²⁺"; cClass = "ion-zn"; }
        if (sol.name.includes("Cu")) { cation = "Cu²⁺"; cClass = "ion-cu"; }
        if (sol.name.includes("Mg")) { cation = "Mg²⁺"; cClass = "ion-mg"; }
        if (sol.name.includes("Na")) { cation = "Na⁺"; cClass = "ion-cation"; }

        if (sol.name.includes("Cl")) { anion = "Cl⁻"; aClass = "ion-cl"; }

        for (let i = 0; i < 4; i++) {
            createBgIon(container, cation, cClass);
            createBgIon(container, anion, aClass);
        }
    });
}

function createBgIon(container, text, cls) {
    const ion = document.createElement('div');
    ion.className = `ion ion-bg ${cls}`;
    ion.textContent = text;

    // Safe Zones to avoid electrodes
    // Left Half: Electrode 50-90 (approx). Container width is ~240px. 50-90 is ~20%-37%.
    // Right Half: Electrode 150-190. ~62%-79%.

    // We want to avoid these ranges to keep the "reaction zone" clear.
    let valid = false;
    let attempts = 0;
    let xPer = 0;

    while (!valid && attempts < 10) {
        xPer = Math.random() * 100;
        // Approximation: Avoid 20-40% and 60-80%
        if ((xPer > 20 && xPer < 40) || (xPer > 60 && xPer < 80)) {
            // Unsafe
        } else {
            valid = true;
        }
        attempts++;
    }

    ion.style.left = `${xPer}%`;
    ion.style.bottom = `${Math.random() * 80 + 10}%`;

    // Random float animation
    ion.animate([
        { transform: 'translate(0,0)' },
        { transform: `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)` },
        { transform: 'translate(0,0)' }
    ], {
        duration: 3000 + Math.random() * 2000,
        iterations: Infinity,
        easing: 'ease-in-out'
    });

    container.appendChild(ion);
}

// Ion Animation Logic
// Ion Animation Logic
// Ion Animation Logic
// Ion Animation Logic
// Ion Animation Logic
let animationInterval = null;

function animateReaction(anodeSide, cathodeSide, mLeft, mRight, activeSol) {
    if (animationInterval) clearInterval(animationInterval);

    const anodeContainer = anodeSide === 'left' ? document.getElementById('ions-left') : document.getElementById('ions-right');
    const cathodeContainer = cathodeSide === 'left' ? document.getElementById('ions-left') : document.getElementById('ions-right');

    const anodeMetal = anodeSide === 'left' ? mLeft : mRight;

    // Initial Trigger
    triggerReactionCycle(anodeSide, cathodeSide, anodeMetal, activeSol, anodeContainer, cathodeContainer);

    // Loop
    animationInterval = setInterval(() => {
        triggerReactionCycle(anodeSide, cathodeSide, anodeMetal, activeSol, anodeContainer, cathodeContainer);
    }, 10000); // 10s cycle for slower animation
}

function triggerReactionCycle(anodeSide, cathodeSide, anodeMetal, activeSol, anodeContainer, cathodeContainer) {
    // 1. Anode Reaction Position
    const anodeId = anodeSide === 'left' ? 'electrode-left' : 'electrode-right';
    const anodeEl = document.getElementById(anodeId);
    if (!anodeEl) return;

    // Find Anode Surface Point (for Atom popping off)
    const aRect = anodeEl.getBoundingClientRect();
    const spawnY_abs = aRect.bottom - (Math.random() * 50 + 20);
    const spawnX_abs = aRect.left + (aRect.width / 2);

    // 1. Visual: "Zn" atom pops off
    spawnAnodeAtomReaction(anodeSide, anodeMetal, spawnX_abs, spawnY_abs, anodeContainer, () => {
        // Callback: Atom became Ion. 
        // NOW spawn Continuous Electrons.

        // Use defined electron valency
        const electronCount = anodeMetal.electrons || 2;

        for (let i = 0; i < electronCount; i++) {
            // Simultaneous release (very slight offset for visibility so they don't perfectly overlap)
            setTimeout(() => {
                const isFinalElectron = (i === electronCount - 1);
                // Offset the start X slightly for the second electron so they look like a pair
                const offsetX = (i === 0) ? -6 : 6;
                animateContinuousElectron(anodeSide, cathodeSide, spawnX_abs + offsetX, spawnY_abs, cathodeContainer, activeSol, isFinalElectron);
            }, i * 300); // 300ms offset (Simultaneous feel but distinguishable)
        }
    });
}

function animateContinuousElectron(anodeSide, cathodeSide, startX, startY, cathodeContainer, activeSol, triggerReaction) {
    // 1. Setup Elements & Path
    const wirePath = document.querySelector('.wire-path');
    const wpRect = wirePath.getBoundingClientRect();

    // Wire Level Y (Connect horizontally to the TOP wire path)
    const wireY = wpRect.top - 7;

    // Cathode Target
    const cathodeId = cathodeSide === 'left' ? 'electrode-left' : 'electrode-right';
    const cathodeEl = document.getElementById(cathodeId);
    const cRect = cathodeEl.getBoundingClientRect();
    const endX = cRect.left + (cRect.width / 2);
    const endY = cRect.bottom - 100; // Target landing spot on cathode

    // Create SINGLE Electron
    const e = document.createElement('div');
    e.className = 'surface-electron';
    e.style.position = 'fixed';
    e.style.zIndex = 2000;
    e.style.left = '0px';
    e.style.top = '0px';
    // Initial Pos
    e.style.transform = `translate(${startX}px, ${startY}px)`;
    e.style.marginLeft = '-6px';
    e.style.marginTop = '-6px';

    document.body.appendChild(e);

    // Keyframes for Continuous Path
    // P1: Start
    // P2: Top of Anode Lead
    // P3: Top of Cathode Lead
    // P4: End

    // Timing: Slower
    const totalTime = 6000; // 6 seconds travel time
    const p1 = 0;
    const p2 = 0.3; // Up
    const p3 = 0.7; // Across
    const p4 = 1.0; // Down

    // Trigger the APPROACHING Ion when electron is on the horizontal wire (approx 40% through)
    // The ion needs to get from solution to endX,endY in the remaining time (60% of 6000 = 3600ms)
    // Or simpler: Trigger it immediately but with a delay/slower speed? 
    // Let's trigger it when electron reaches p3 (Top of Cathode Lead). 
    // Time to reach p3 is 0.7 * 6000 = 4200ms.
    // Remaining time is 1800ms.

    const anim = e.animate([
        { transform: `translate(${startX}px, ${startY}px)`, offset: p1 },
        { transform: `translate(${startX}px, ${wireY}px)`, offset: p2 },
        { transform: `translate(${endX}px, ${wireY}px)`, offset: p3 },
        { transform: `translate(${endX}px, ${endY}px)`, offset: p4 }
    ], {
        duration: totalTime,
        easing: 'linear',
        fill: 'forwards'
    });

    // Schedule Ion Approach
    if (triggerReaction) {
        // Ion travel time matches approximately the electron's descent + a bit of "waiting" time
        const ionTravelTime = 2500;
        const delay = totalTime - ionTravelTime;

        setTimeout(() => {
            spawnApproachingIon(cathodeContainer, cathodeSide, activeSol, endX, endY, ionTravelTime);
        }, delay);
    }

    // Cleanup & Trigger Reaction at End
    anim.onfinish = () => {
        e.remove();
        // TRIGGER ONLY IF FINAL ELECTRON
        if (triggerReaction) {
            // Pass the landing coordinates so the reaction happens EXACTLY where electron hit
            // And pass 'true' to indicate the ion is arguably already there/arriving
            performCathodeImpact(activeSol, endX, endY);
        }
    };
}

function spawnApproachingIon(container, side, sol, targetX, targetY, duration) {
    // 1. Identify Ion
    let label = '', cls = '';
    let count = 1;

    // Logic: Cu -> Cu. Acid -> H+. Salt -> O2.
    if (sol.name.includes('Cu')) {
        label = 'Cu²⁺'; cls = 'ion-cu';
    } else if (sol.type === 'acid') {
        label = 'H⁺'; cls = 'ion-h';
        count = 2; // Need 2H+
    } else {
        // Neutral/Salt -> Oxygen reacts
        label = 'O₂'; cls = 'ion-o2';
        count = 1;
    }

    window.lastTargetIons = [];

    // Helper to spawn one
    const spawnOne = (offsetX, offsetY, customLabel, customCls) => {
        const txt = customLabel || label;
        const className = customCls || cls;

        const startX = targetX + (Math.random() * 80 - 40) + offsetX;
        const startY = targetY + (Math.random() * 80 + 40) + offsetY;

        const ion = document.createElement('div');
        ion.className = `ion ${className}`;
        ion.textContent = txt;
        ion.style.position = 'fixed';
        ion.style.left = `${startX}px`;
        ion.style.top = `${startY}px`;
        ion.style.zIndex = 3000;
        ion.style.transform = 'translate(-50%, -50%) scale(1.0)';
        ion.style.boxShadow = '0 0 10px rgba(255,255,255,0.5)';

        // Inline styles
        if (className === 'ion-o2') {
            ion.style.backgroundColor = '#fee2e2'; // Light red
            ion.style.border = '1px solid #ef4444';
            ion.style.color = '#991b1b';
            ion.style.fontSize = '12px';
            ion.style.borderRadius = '50%';
        } else if (className === 'ion-h2o') {
            ion.style.backgroundColor = '#e0f2fe'; // Light blue
            ion.style.border = '1px solid #0ea5e9';
            ion.style.color = '#0369a1';
            ion.style.fontSize = '12px';
            ion.style.borderRadius = '50%';
        } else if (className === 'ion-h') {
            // Hydrogen visual
            ion.style.backgroundColor = '#fdf2f8';
            ion.style.border = '1px solid #db2777';
            ion.style.color = '#be185d';
        }

        document.body.appendChild(ion);

        // Move to target
        ion.animate([
            { left: `${startX}px`, top: `${startY}px` },
            { left: `${targetX}px`, top: `${targetY}px` }
        ], {
            duration: duration,
            easing: 'ease-out',
            fill: 'forwards'
        });

        window.lastTargetIons.push(ion);
    };

    if (cls === 'ion-o2') {
        // O2 logic
        spawnOne(0, 0, 'O₂', 'ion-o2');
        spawnOne(-25, 20, 'H₂O', 'ion-h2o');
        spawnOne(25, 20, 'H₂O', 'ion-h2o');
    } else {
        // Cu or H (spawn count)
        if (count === 1) {
            spawnOne(0, 0, label, cls);
        } else {
            // Pair for H+
            spawnOne(-15, 10, label, cls);
            spawnOne(15, 10, label, cls);
        }
    }
}

function performCathodeImpact(sol, x, y) {
    const ions = window.lastTargetIons || [];
    if (ions.length === 0) return;

    let isCu = sol.name.includes('Cu');
    let isAcid = sol.type === 'acid';
    let isOxygenReaction = !isCu && !isAcid;

    // Flash
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.left = `${x}px`;
    flash.style.top = `${y}px`;
    flash.style.width = '40px';
    flash.style.height = '40px';
    flash.style.borderRadius = '50%';
    flash.style.backgroundColor = '#fff';
    flash.style.zIndex = 4000;
    flash.style.transform = 'translate(-50%, -50%)';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);

    flash.animate([
        { opacity: 1, transform: 'translate(-50%, -50%) scale(0)' },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(2)' }
    ], { duration: 300 }).onfinish = () => flash.remove();

    const resultIon = ions[0];

    // Cleanup input ions visually
    // For H2, we keep one to transform. For O2, we destroy all and spawn new OHs.
    // Let's adopt generic approach: Remove all inputs, spawn result.
    if (isCu) {
        // Keep one for Cu plating effect
        for (let i = 1; i < ions.length; i++) ions[i].remove(); // Remove extras if any
    } else {
        // Remove ALL inputs for Gas reactions, we spawn new bubble/OH
        ions.forEach(i => i.remove());
    }

    if (isCu) {
        // Cu Logic
        resultIon.textContent = 'Cu';
        resultIon.className = 'ion atom-cu';
        resultIon.style.backgroundColor = 'var(--metal-cu)';
        resultIon.style.borderColor = '#ea580c';
        resultIon.style.color = '#fff';
        resultIon.style.boxShadow = '0 0 15px #ffd700';

        resultIon.animate([
            { transform: 'translate(-50%, -50%) scale(1.2)' },
            { transform: 'translate(-50%, -50%) scale(1.5)' },
            { transform: 'translate(-50%, -50%) scale(1)' }
        ], { duration: 500 });

        setTimeout(() => {
            resultIon.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 2000 }).onfinish = () => resultIon.remove();
        }, 2000);

    } else if (isAcid) {
        // H2 Gas Logic
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.position = 'fixed';
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        bubble.style.width = '20px'; // Big bubble
        bubble.style.height = '20px';
        bubble.style.borderRadius = '50%';
        bubble.style.backgroundColor = 'rgba(255,255,255,0.9)';
        bubble.style.border = '1px solid #9ca3af';
        bubble.style.boxShadow = 'inset -2px -2px 5px rgba(0,0,0,0.1)';
        bubble.style.zIndex = 4000;

        document.body.appendChild(bubble);

        // Rise Up
        bubble.animate([
            { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0.5 },
            { transform: 'translate(-50%, -50%) scale(1.0)', opacity: 1, offset: 0.2 },
            { transform: 'translate(-50%, -200px) scale(1.5)', opacity: 0 }
        ], { duration: 2500, easing: 'ease-in' }).onfinish = () => bubble.remove();

    } else if (isOxygenReaction) {
        // O2 Reaction Logic: Spawn OH-
        // Spawn 4 OH- ions
        for (let k = 0; k < 4; k++) {
            const oh = document.createElement('div');
            oh.className = 'ion ion-oh';
            oh.innerHTML = 'OH⁻';
            oh.style.position = 'fixed';
            oh.style.left = `${x}px`;
            oh.style.top = `${y}px`;
            oh.style.zIndex = 4000;
            oh.style.transform = 'translate(-50%, -50%) scale(0.5)';
            oh.style.opacity = '1';
            // ... styling ...
            oh.style.backgroundColor = '#f0fdf4';
            oh.style.border = '1px solid #16a34a';
            oh.style.color = '#15803d';

            document.body.appendChild(oh);

            // Animate
            const angle = (k / 4) * 2 * Math.PI;
            const dist = 60 + Math.random() * 20;
            const destX = x + Math.cos(angle) * dist;
            const destY = y + Math.sin(angle) * dist + 20;

            oh.animate([
                { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
                { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1, offset: 0.2 },
                { left: `${destX}px`, top: `${destY}px`, transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8 }
            ], {
                duration: 2500,
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = () => {
                oh.animate([{ opacity: 0.8 }, { opacity: 0 }], { duration: 1000 }).onfinish = () => oh.remove();
            };
        }
    }
}

function spawnAnodeAtomReaction(side, metal, absX, absY, container, onIonFormed) {
    // Create "Zn" text at the absolute position
    const atom = document.createElement('div');
    atom.className = `ion`;
    atom.style.position = 'fixed';
    atom.style.left = `${absX}px`;
    atom.style.top = `${absY}px`;
    atom.style.zIndex = 1000;
    atom.textContent = metal.symbol;
    atom.style.backgroundColor = '#fff';
    atom.style.border = '2px solid #333';
    atom.style.color = '#333';
    atom.style.fontWeight = 'bold';
    atom.style.transform = 'translate(-50%, -50%) scale(1)';
    atom.style.transition = 'all 0.5s';

    document.body.appendChild(atom);

    // Animate: Pop out
    setTimeout(() => {
        const moveX = side === 'left' ? 40 : -40;
        atom.style.transform = `translate(calc(-50% + ${moveX}px), -50%)`;

        setTimeout(() => {
            // Transform to Ion
            atom.textContent = metal.ion;
            atom.className = `ion ion-${metal.symbol.toLowerCase()}`;
            atom.style.backgroundColor = '';
            atom.style.border = '';

            if (onIonFormed) onIonFormed();

            // Fade/Drift relative to the moved position
            atom.animate([
                { opacity: 1, transform: `translate(calc(-50% + ${moveX}px), -50%)` },
                { opacity: 0, transform: `translate(calc(-50% + ${moveX * 1.5}px), -50%) scale(0.8)` }
            ], { duration: 2000, fill: 'forwards' }).onfinish = () => atom.remove();

        }, 500);
    }, 100);
}

function spawnCathodeReactionVisuals(container, side, sol) {
    let label = '', isCu = false, isGas = false, cls = '';

    if (sol.type === 'acid') {
        label = 'H⁺'; cls = 'ion-h'; isGas = true;
    } else if (sol.name.includes('Cu')) {
        label = 'Cu²⁺'; cls = 'ion-cu'; isCu = true;
    } else { return; }

    const finalX = side === 'left' ? 70 : 170;
    const startX = side === 'left' ? 120 : 120;

    const ion = document.createElement('div');
    ion.className = `ion ${cls}`;
    ion.textContent = label;
    ion.style.left = `${startX}px`;
    ion.style.bottom = '100px';
    ion.style.opacity = 0;

    container.appendChild(ion);

    // Animate: Appear and Move to Electrode
    const anim = ion.animate([
        { opacity: 0, left: `${startX}px` },
        { opacity: 1, left: `${finalX}px` }
    ], {
        duration: 800,
        easing: 'ease-out',
        fill: 'forwards'
    });

    anim.onfinish = () => {
        // Transform
        if (isCu) {
            // Cu2+ -> Cu Visual Change
            ion.style.transition = 'all 0.5s';
            ion.style.backgroundColor = 'var(--metal-cu)';
            ion.style.color = '#fff';
            ion.style.borderColor = '#ea580c';
            ion.textContent = 'Cu';
            ion.className = 'ion atom-cu';

            ion.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { opacity: 0 }
            ], { duration: 2000 }).onfinish = () => ion.remove();

        } else if (isGas) {
            // H+ -> H2 Gas
            ion.style.transition = 'all 0.3s';
            ion.style.borderRadius = '50%';
            ion.style.backgroundColor = 'rgba(255,255,255,0.9)';
            ion.style.color = 'transparent';
            ion.style.width = '16px';
            ion.style.height = '16px';
            ion.style.border = '1px solid #ccc';
            ion.className = 'bubble';

            // Rise
            ion.animate([
                { transform: 'translateY(0)', opacity: 1 },
                { transform: 'translateY(-150px)', opacity: 0 }
            ], { duration: 2000 }).onfinish = () => ion.remove();
        }
    };
}


// Remove old helpers to keep file clean if needed,
// but replace_file_content replaces the block so old spawnAnodeIon etc are gone.


function animateMembraneTransfer(anodeSide, cathodeSide) {
    const beaker = document.getElementById('beaker-container');
    const ion = document.createElement('div');
    ion.className = 'ion ion-so4';
    ion.textContent = 'SO₄²⁻';
    ion.style.zIndex = 20;
    ion.style.bottom = '40px';

    const startX = anodeSide === 'left' ? '60%' : '40%';
    const endX = anodeSide === 'left' ? '40%' : '60%';

    ion.style.left = startX;

    beaker.appendChild(ion);

    ion.animate([
        { left: startX, opacity: 0 },
        { left: startX, opacity: 1, offset: 0.1 },
        { left: endX, opacity: 1, offset: 0.9 },
        { left: endX, opacity: 0 }
    ], { duration: 3000, easing: 'linear' }).onfinish = () => ion.remove();
}

// Start
init();
