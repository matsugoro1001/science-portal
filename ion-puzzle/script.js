// Matter.js aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Body = Matter.Body,
    Vector = Matter.Vector;

// Game State
let engine, render, runner;
let cards = []; // Array of { body, element, type, id }
let selectedCards = [];
let currentCompound = null;
let score = 0;
let isPlaying = false;
let startTime = 0;
let timerInterval;

// DOM Elements
const gameArea = document.getElementById('game-area');
const targetCompoundEl = document.getElementById('target-compound');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const menuScreen = document.getElementById('menu-screen');
const startBtn = document.getElementById('start-btn');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackText = document.getElementById('feedback-text');
const feedbackFormula = document.getElementById('feedback-formula');

// Constants
const CARD_WIDTH = 80;
const CARD_HEIGHT = 80;
const WALL_THICKNESS = 60;

// Initialize Game
function init() {
    // Create engine
    engine = Engine.create();
    engine.world.gravity.y = 0; // Zero gravity

    // Create renderer (debug only, we use DOM for visuals)
    // render = Render.create({
    //     element: gameArea,
    //     engine: engine,
    //     options: {
    //         width: window.innerWidth,
    //         height: window.innerHeight,
    //         wireframes: false,
    //         background: 'transparent'
    //     }
    // });

    // Create runner
    runner = Runner.create();

    // Add walls to keep cards in screen
    createWalls();

    // Handle resize
    window.addEventListener('resize', () => {
        Composite.clear(engine.world, false, true); // Clear walls
        createWalls();
    });

    // Start loop
    Runner.run(runner, engine);
    // Render.run(render);

    // Custom Update Loop for DOM syncing and "AntiGravity"
    Events.on(engine, 'beforeUpdate', updatePhysics);

    // Start animation loop for rendering
    requestAnimationFrame(renderLoop);

    // Auto Start
    startGame();
}

function createWalls() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const walls = [
        Bodies.rectangle(width / 2, -WALL_THICKNESS / 2, width, WALL_THICKNESS, { isStatic: true }), // Top
        Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width, WALL_THICKNESS, { isStatic: true }), // Bottom
        Bodies.rectangle(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height, { isStatic: true }), // Right
        Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height, { isStatic: true }) // Left
    ];

    Composite.add(engine.world, walls);
}

let questionDeck = [];

function startGame() {
    // menuScreen.classList.add('hidden'); // Removed menu
    isPlaying = true;
    score = 0;
    scoreEl.textContent = score;
    startTime = Date.now();

    // Initialize Deck
    questionDeck = [...compounds].sort(() => Math.random() - 0.5);

    // Start Timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    nextRound();
}

function nextRound() {
    // Clear existing cards (Board Clearing)
    cards.forEach(c => {
        Composite.remove(engine.world, c.body);
        if (c.domEl) c.domEl.remove();
    });
    cards = [];
    selectedCards = [];

    // Pick from Deck (No Duplicates)
    if (questionDeck.length === 0) {
        questionDeck = [...compounds].sort(() => Math.random() - 0.5);
    }
    currentCompound = questionDeck.pop();

    targetCompoundEl.textContent = currentCompound.name;

    // Spawn required cards
    for (let i = 0; i < currentCompound.cation.count; i++) {
        spawnIon(currentCompound.cation.symbol, 'cation');
    }
    for (let i = 0; i < currentCompound.anion.count; i++) {
        spawnIon(currentCompound.anion.symbol, 'anion');
    }

    // Spawn Tricky Distractors (Balanced: 4 Cations, 4 Anions)

    // Helper to spawn specific type of distractor
    const spawnDistractor = (targetType, trickyList) => {
        let symbol;

        // 70% chance to pick a tricky distractor if available
        if (trickyList.length > 0 && Math.random() < 0.7) {
            symbol = trickyList[Math.floor(Math.random() * trickyList.length)];

            // Verify type matches targetType (fix for color coding)
            // If symbol has opposite charge, we shouldn't use it as this type, 
            // OR we should trust the targetType and let it be a "wrong color" distractor?
            // User said "Anions showing as cations (blue line) is wrong".
            // So we must ensure the visual class matches the actual charge.

            // Actually, if we pick a tricky ion like "K+" for "Ca2+", it IS a cation.
            // If we pick "Cl-" for "Na+", it IS an anion.
            // The issue was likely guessing type from symbol failed or was random.

            // We will trust the charge in the symbol to determine the visual class.
            // But we want to spawn 4 "Cation-like things" and 4 "Anion-like things".

            // If the tricky ion has a different charge type than intended, 
            // it might confuse the "Balance" count, but visually it must be correct.

            // Let's strictly pick tricky ions that match the requested type if possible,
            // or just pick them and assign the CORRECT type based on their symbol.
        } else {
            // Fallback to random compound part
            const randomComp = compounds[Math.floor(Math.random() * compounds.length)];
            symbol = targetType === 'cation' ? randomComp.cation.symbol : randomComp.anion.symbol;
        }

        // Determine actual type based on symbol to ensure correct color
        // (e.g. if we somehow picked Cl- but intended cation, it should still look like anion)
        const actualType = symbol.includes('+') ? 'cation' : (symbol.includes('-') ? 'anion' : targetType);

        spawnIon(symbol, actualType);
    };

    const cationTricky = trickyIons[currentCompound.cation.symbol] || [];
    const anionTricky = trickyIons[currentCompound.anion.symbol] || [];

    // Spawn 4 Cations
    for (let i = 0; i < 4; i++) {
        spawnDistractor('cation', cationTricky);
    }

    // Spawn 4 Anions
    for (let i = 0; i < 4; i++) {
        spawnDistractor('anion', anionTricky);
    }
}

function spawnIon(symbol, type) {
    const x = Math.random() * (window.innerWidth - 100) + 50;
    // Adjust Y to avoid header (approx 200px height)
    const y = Math.random() * (window.innerHeight - 250) + 200;

    const body = Bodies.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, {
        restitution: 0.9, // Bouncy
        friction: 0.005,
        frictionAir: 0.02, // Drag
        chamfer: { radius: 10 }
    });

    // Random initial velocity
    Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5
    });

    Composite.add(engine.world, body);

    // Create DOM Element
    const domEl = document.createElement('div');
    domEl.className = `ion-card ${type}`;
    domEl.style.width = `${CARD_WIDTH}px`;
    domEl.style.height = `${CARD_HEIGHT}px`;

    const html = ionHTMLMap[symbol] || symbol;
    domEl.innerHTML = `<span class="ion-content">${html}</span>`;

    // Click Handler
    domEl.addEventListener('mousedown', (e) => handleCardClick(e, body));
    domEl.addEventListener('touchstart', (e) => handleCardClick(e, body));

    gameArea.appendChild(domEl);

    cards.push({
        body: body,
        domEl: domEl,
        symbol: symbol,
        type: type,
        id: Math.random().toString(36).substr(2, 9)
    });
}

function handleCardClick(e, body) {
    if (!isPlaying) return;
    e.preventDefault();

    const card = cards.find(c => c.body === body);
    if (!card) return;

    const idx = selectedCards.indexOf(card);
    if (idx === -1) {
        // Select
        selectedCards.push(card);
        card.domEl.classList.add('selected');
        checkAnswer();
    } else {
        // Deselect
        selectedCards.splice(idx, 1);
        card.domEl.classList.remove('selected');
    }
}

function checkAnswer() {
    // Check if selected cards match the target compound
    const cations = selectedCards.filter(c => c.type === 'cation');
    const anions = selectedCards.filter(c => c.type === 'anion');

    // Only check if we have at least one of each (or if we have too many of one type)
    if (cations.length === 0 && anions.length === 0) return;

    // 1. Check for Wrong Types immediately
    const wrongCation = cations.some(c => c.symbol !== currentCompound.cation.symbol);
    const wrongAnion = anions.some(c => c.symbol !== currentCompound.anion.symbol);

    if (wrongCation || wrongAnion) {
        handleWrong();
        return;
    }

    // 2. Check for Excess Counts immediately
    if (cations.length > currentCompound.cation.count || anions.length > currentCompound.anion.count) {
        handleWrong();
        return;
    }

    // 3. Check for Correct Complete Set
    // We know types are correct and counts are not excessive at this point
    // So we just need to check if counts match exactly AND we have at least one of each (implied by logic, but be safe)
    // Actually, we need to trigger only when BOTH are present to avoid premature wrong on partial selection?
    // No, the user said "If 2 types are selected and wrong -> Wrong".
    // But if I select 1 correct cation, I shouldn't lose.
    // If I select 1 correct cation and 1 correct anion, but need 2 anions -> Continue.

    if (cations.length === currentCompound.cation.count && anions.length === currentCompound.anion.count) {
        handleCorrect();
    }

    // If we are here, it means we have a partial correct selection (e.g. Ba2+ selected, waiting for OH-).
    // Do nothing.
}

function handleWrong() {
    // Visual feedback for Wrong
    feedbackText.textContent = "Wrong...";
    feedbackText.style.color = "#e94560"; // Red
    feedbackFormula.textContent = `正解: ${currentCompound.formula}`;
    feedbackOverlay.classList.add('active');

    // Shake selected cards
    selectedCards.forEach(c => {
        Body.setVelocity(c.body, {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
        });
        c.domEl.classList.add('wrong-shake');
    });

    setTimeout(() => {
        feedbackOverlay.classList.remove('active');
        feedbackText.style.color = ""; // Reset color

        // Reset or Next Round? User said "Show correct answer and move to new problem"
        // So we treat it as a skip/fail.
        // Maybe no score increment? Or penalty?
        // For now, just next round without score increment.
        nextRound();
    }, 2000);
}

function handleCorrect() {
    // Visual feedback
    feedbackText.textContent = "Excellent!";
    feedbackText.style.color = "#4ecca3"; // Green/Primary
    feedbackFormula.textContent = currentCompound.formula;
    feedbackOverlay.classList.add('active');

    // Animate cards merging (pull to center)
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    selectedCards.forEach(c => {
        Body.setVelocity(c.body, {
            x: (center.x - c.body.position.x) * 0.1,
            y: (center.y - c.body.position.y) * 0.1
        });
        c.domEl.style.transition = 'all 0.5s';
        c.domEl.style.opacity = '0';
        c.domEl.style.transform = 'scale(0)';
    });

    setTimeout(() => {
        // Remove cards
        selectedCards.forEach(c => {
            Composite.remove(engine.world, c.body);
            c.domEl.remove();
            const idx = cards.indexOf(c);
            if (idx > -1) cards.splice(idx, 1);
        });
        selectedCards = [];

        feedbackOverlay.classList.remove('active');
        score++;
        scoreEl.textContent = score;

        if (score >= 10) {
            gameClear();
        } else {
            nextRound();
        }
    }, 1000);
}

function gameClear() {
    isPlaying = false;
    clearInterval(timerInterval);

    // Show Result Screen
    const resultScreen = document.getElementById('result-screen');
    const finalTimeEl = document.getElementById('final-time');

    finalTimeEl.textContent = timerEl.textContent;
    resultScreen.classList.remove('hidden');

    // Convert time string "MM:SS" to seconds for comparison
    const timeParts = timerEl.textContent.split(':');
    const totalSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

    // Save Local History automatically
    saveLocalHistory(totalSeconds);

    checkRanking(totalSeconds);
}

// --- Ranking System (Google Sheets) ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyoPJnTzenD0Af8Fg0F7xUA2UW9-gIKepeGiG2ouQ0MGBSq8k7_ZFDXjwKV3TbIAbpEWA/exec';
const SHEET_TYPE = 'ion_puzzle';

async function getRankings() {
    try {
        const response = await fetch(`${GAS_URL}?type=${SHEET_TYPE}&t=${Date.now()}`);
        const data = await response.json();
        // Sort ascending (Lower time is better)
        return data.sort((a, b) => a.score - b.score);
    } catch (e) {
        console.error('Ranking Fetch Error:', e);
        return [];
    }
}

async function saveScoreToGas(name, score) {
    try {
        // gameMode is 'normal' or could be 'ion'
        const url = `${GAS_URL}?type=${SHEET_TYPE}&action=save&gameMode=normal&name=${encodeURIComponent(name)}&score=${score}`;
        await fetch(url);
    } catch (e) {
        console.error('Ranking Save Error:', e);
    }
}

async function checkRanking(scoreSeconds) {
    const newRecordForm = document.getElementById('new-record-form');
    // Show loading...
    document.getElementById('ranking-list').innerHTML = '<tr><td colspan="4">読み込み中...</td></tr>';

    const rankings = await getRankings();

    // Check if score qualifies for top 10 (Lower time is better)
    if (rankings.length < 10 || scoreSeconds < rankings[rankings.length - 1].score) {
        newRecordForm.classList.remove('hidden');
        document.getElementById('player-name').value = '';
        document.getElementById('player-name').focus();
    } else {
        newRecordForm.classList.add('hidden');
    }

    renderRankingList(rankings);
}

window.submitScore = async () => {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim() || 'Anonymous';

    const timeParts = document.getElementById('final-time').textContent.split(':');
    const score = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

    const btn = document.querySelector('#new-record-form button');
    btn.disabled = true;
    btn.textContent = '送信中...';

    await saveScoreToGas(name, score);

    document.getElementById('new-record-form').classList.add('hidden');

    // Optimistic Update
    let rankings = await getRankings();
    const alreadyExists = rankings.some(r => r.name === name && Math.abs(r.score - score) < 0.1);

    if (!alreadyExists) {
        rankings.push({ name, score, date: new Date().toISOString() });
    }

    // Sort ascending
    rankings.sort((a, b) => a.score - b.score);
    renderRankingList(rankings);

    btn.disabled = false;
    btn.textContent = 'Save';
};

const HISTORY_STORAGE_KEY = 'ion_puzzle_history';

function getLocalHistory() {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveLocalHistory(score) {
    let history = getLocalHistory();
    // Add new result to beginning
    history.unshift({
        score: score,
        date: new Date().toISOString()
    });
    // Keep only last 50 (store plenty, show fewer)
    if (history.length > 50) history.pop();
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function renderLocalHistory() {
    const listEl = document.getElementById('history-list');
    const history = getLocalHistory();

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (Math.floor(seconds) % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    };

    listEl.innerHTML = history.slice(0, 5).map((r, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td>${formatTime(r.score)}</td>
            <td>${formatDate(r.date)}</td>
        </tr>
    `).join('');

    if (history.length === 0) {
        listEl.innerHTML = '<tr><td colspan="3">No records yet</td></tr>';
    }
}

// Ensure this is called when Result Screen opens
function renderRankingList(rankingsData = null) {
    const listEl = document.getElementById('ranking-list');

    // Helper to format time (seconds -> MM:SS)
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (Math.floor(seconds) % 60).toString().padStart(2, '0');
        const ms = (seconds % 1).toFixed(2).substring(2);
        return `${m}:${s}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    // If data passed, use it. Otherwise fetch (if called independently, though usually called by checkRanking)
    // We assume checkRanking passes data.
    const rankings = rankingsData || [];

    listEl.innerHTML = rankings.slice(0, 10).map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r.name}</td>
            <td>${formatTime(r.score)}</td>
            <td>${formatDate(r.date)}</td>
        </tr>
    `).join('');

    // Fill empty spots
    for (let i = rankings.length; i < 10; i++) {
        listEl.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>-</td>
                <td>--:--</td>
                <td>-</td>
            </tr>
        `;
    }

    // Also render local history whenever ranking is rendered
    renderLocalHistory();
}

function updatePhysics() {
    // Apply "AntiGravity" forces
    cards.forEach(card => {
        // 1. Gentle random float
        Body.applyForce(card.body, card.body.position, {
            x: (Math.random() - 0.5) * 0.0005,
            y: (Math.random() - 0.5) * 0.0005
        });

        // 2. Repulsion from other cards (if too close)
        cards.forEach(other => {
            if (card === other) return;
            const d = Vector.magnitude(Vector.sub(card.body.position, other.body.position));
            if (d < 150) { // Repulsion range
                const force = Vector.mult(Vector.normalise(Vector.sub(card.body.position, other.body.position)), 0.002);
                Body.applyForce(card.body, card.body.position, force);
            }
        });

        // 3. Attraction to center if selected
        if (selectedCards.includes(card)) {
            const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

            // Stronger pull to center
            const force = Vector.mult(Vector.sub(center, card.body.position), 0.0005);
            Body.applyForce(card.body, card.body.position, force);

            // High damping to make them stop
            Body.setVelocity(card.body, {
                x: card.body.velocity.x * 0.9,
                y: card.body.velocity.y * 0.9
            });

            // Prevent rotation when selected for cleaner look
            Body.setAngularVelocity(card.body, 0);
            Body.setAngle(card.body, 0);
        }
    });
}

function renderLoop() {
    // Sync DOM positions with Physics Bodies
    cards.forEach(card => {
        const { x, y } = card.body.position;
        const angle = card.body.angle;
        card.domEl.style.left = `${x}px`;
        card.domEl.style.top = `${y}px`;
        card.domEl.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    });

    requestAnimationFrame(renderLoop);
}

function updateTimer() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
}

init();
