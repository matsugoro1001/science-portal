
// --- Strategic Ion Poker Script ---

// GAS URL for logging (optional, reusing similar endpoint or keeping empty for now)
const GAS_URL = '';

// --- ION DATA Definitions ---
const CARD_DATA = {
    // Cations (阳イオン)
    'H⁺': { name: '水素イオン', charge: 1, type: 'cation', count: 8, color: '#e0f2fe', textColor: '#0369a1' }, // Blue-50
    'Na⁺': { name: 'ナトリウムイオン', charge: 1, type: 'cation', count: 6, color: '#e0f2fe', textColor: '#0369a1' },
    'Mg²⁺': { name: 'マグネシウムイオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' }, // Blue-100
    'Ca²⁺': { name: 'カルシウムイオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' },
    'Cu²⁺': { name: '銅(II)イオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' },
    'Ba²⁺': { name: 'バリウムイオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' },
    'Fe³⁺': { name: '鉄(III)イオン', charge: 3, type: 'cation', count: 5, color: '#bfdbfe', textColor: '#172554' }, // Blue-200
    'Al³⁺': { name: 'アルミニウムイオン', charge: 3, type: 'cation', count: 5, color: '#bfdbfe', textColor: '#172554' },

    // Anions (阴イオン)
    'Cl⁻': { name: '塩化物イオン', charge: -1, type: 'anion', count: 6, color: '#fef2f2', textColor: '#b91c1c' }, // Red-50
    'OH⁻': { name: '水酸化物イオン', charge: -1, type: 'anion', count: 8, color: '#fef2f2', textColor: '#b91c1c' },
    'NO₃⁻': { name: '硝酸イオン', charge: -1, type: 'anion', count: 4, color: '#fef2f2', textColor: '#b91c1c' },
    'HCO₃⁻': { name: '炭酸水素イオン', charge: -1, type: 'anion', count: 4, color: '#fef2f2', textColor: '#b91c1c' },
    'O²⁻': { name: '酸化物イオン', charge: -2, type: 'anion', count: 4, color: '#fee2e2', textColor: '#991b1b' }, // Red-100
    'S²⁻': { name: '硫化物イオン', charge: -2, type: 'anion', count: 4, color: '#fee2e2', textColor: '#991b1b' },
    'CO₃²⁻': { name: '炭酸イオン', charge: -2, type: 'anion', count: 5, color: '#fee2e2', textColor: '#991b1b' },
    'SO₄²⁻': { name: '硫酸イオン', charge: -2, type: 'anion', count: 5, color: '#fee2e2', textColor: '#991b1b' },
    'PO₄³⁻': { name: 'リン酸イオン', charge: -3, type: 'anion', count: 6, color: '#fecaca', textColor: '#7f1d1d' }, // Red-200
};

// Yaku / Bonus Logic
const SPECIAL_COMPOUNDS = {
    'H2O': { name: '水 (Water)', points: 500 }, // Neutralization
    'BaSO4': { name: '硫酸バリウム', points: 300 }, // Precipitation
    'CaCO3': { name: '炭酸カルシウム', points: 300 }, // Precipitation
    'BaCO3': { name: '炭酸バリウム', points: 300 }, // Precipitation
    'AgCl': { name: '塩化銀', points: 300 }, // Precipitation (Extension)
    'Al2O3': { name: '酸化アルミニウム', points: 2000 }, // Ruby/Sapphire
};

// PeerJS Variables
let peer = null;
let conn = null;
let connections = [];
let role = 'none';
let myId = '';
let hostId = '';

// Game State
let gameState = {
    phase: 'lobby', // lobby, exchange1, exchange2, form, result
    deck: [],
    discards: [],
    players: [], // {id, name, hand, formedSets: [], score: 0, rawScore: 0, isDone: false}
    startTime: 0
};

let myHand = [];
let mySelectedIndices = [];
let myFormedSets = []; // Local tentative sets
let myScore = 0; // Local tentative score

// DOM Elements
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

// --- Initialization ---
function generateShortId() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getPlayerName() {
    const el = document.getElementById('username-input');
    return (el && el.value.trim()) ? el.value.trim() : `Player`;
}

// --- PeerJS Setup ---
const PEER_OPTS = {
    key: 'peerjs',
    debug: 2,
    config: { iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }] }
};

function createRoom() {
    role = 'host';
    peer = new Peer(generateShortId(), PEER_OPTS);
    peer.on('open', (id) => {
        myId = id;
        document.getElementById('my-room-id').textContent = id;
        document.getElementById('host-info').classList.remove('hidden');
        gameState.players = [{ id: myId, name: getPlayerName(), score: 0, isDone: false, formedSets: [] }];
        updateLobbyUI();
    });

    peer.on('connection', (c) => {
        c.on('open', () => {
            connections.push(c);
            const name = c.metadata && c.metadata.name ? c.metadata.name : `Player ${gameState.players.length + 1}`;
            gameState.players.push({ id: c.peer, name: name, score: 0, isDone: false, formedSets: [] });
            broadcastState();
            updateLobbyUI();
            c.on('data', (d) => handleHostData(c.peer, d));
        });
    });
}

function joinRoom() {
    role = 'client';
    const inputId = document.getElementById('join-id').value.trim().toUpperCase();
    if (!inputId) return alert("IDを入力してください");

    document.getElementById('join-btn').textContent = "接続中...";
    document.getElementById('join-btn').disabled = true;

    peer = new Peer(generateShortId(), PEER_OPTS);
    peer.on('open', (id) => {
        myId = id;
        conn = peer.connect(inputId, { metadata: { name: getPlayerName() } });
        conn.on('open', () => {
            document.getElementById('join-status').textContent = "接続成功！";
            document.getElementById('join-status').style.color = "green";
            document.getElementById('lobby-instruction').textContent = "ホストが開始するのを待っています...";
        });
        conn.on('data', (d) => handleClientData(d));
        conn.on('error', (e) => {
            alert("接続エラー: " + e);
            document.getElementById('join-btn').disabled = false;
        });
    });
}

// --- Game Logic (Host) ---
function startGameHost() {
    gameState.deck = generateDeck();
    gameState.phase = 'exchange1';
    gameState.players.forEach(p => {
        p.hand = drawFromDeck(5); // 5 Cards Start
        p.isDone = false;
        p.formedSets = [];
        p.score = 0;
    });
    broadcastState();
    handleStateUpdate(gameState);
}

function handleHostData(peerId, data) {
    const player = gameState.players.find(p => p.id === peerId);
    if (!player) return;

    if (data.type === 'action_exchange') {
        const keeps = data.kept;
        // Logic: Discard rest, Draw new
        const countNeeded = 5 - keeps.length;
        const newCards = drawFromDeck(countNeeded);
        player.hand = [...keeps, ...newCards];
        player.isDone = true;

        checkPhaseCompletion();

    } else if (data.type === 'action_finish_form') {
        // Player submitted their formed sets
        player.formedSets = data.formedSets; // These are tentative objects { formula, score, cards }
        player.isDone = true;
        checkPhaseCompletion();
    } // else if (data.type === 'action_restart') ...

    // Send immediate update so everyone sees "Done" status
    broadcastState();
}

function checkPhaseCompletion() {
    if (gameState.players.every(p => p.isDone)) {
        // Move Phase
        if (gameState.phase === 'exchange1') {
            gameState.phase = 'exchange2';
            gameState.players.forEach(p => p.isDone = false);
        } else if (gameState.phase === 'exchange2') {
            gameState.phase = 'form';
            gameState.players.forEach(p => p.isDone = false);
        } else if (gameState.phase === 'form') {
            // End of Game -> Calculate Results
            resolveShowdown();
            gameState.phase = 'result';
        }
        broadcastState();
        handleStateUpdate(gameState);
    }
}

function resolveShowdown() {
    try {
        // 1. Collect all formulas
        const allFormulas = [];
        gameState.players.forEach(p => {
            if (!p.formedSets) p.formedSets = []; // Safety
            p.formedSets.forEach(set => {
                allFormulas.push({
                    formula: set.formula,
                    playerId: p.id,
                    setRef: set
                });
            });
        });

        // 2. Count occurrences (Duplicate Check)
        const formulaCounts = {};
        allFormulas.forEach(item => {
            formulaCounts[item.formula] = (formulaCounts[item.formula] || 0) + 1;
        });

        // 3. Mark duplicates and calculate final score
        gameState.players.forEach(p => {
            let totalScore = 0;
            p.formedSets.forEach(set => {
                if (formulaCounts[set.formula] > 1) {
                    set.isDuplicated = true;
                    set.finalPoints = 0;
                } else {
                    set.isDuplicated = false;
                    set.finalPoints = set.points;
                }
                totalScore += set.finalPoints;
            });

            // Special Hand Bonus (Full House: 5 cards used)
            // Ensure cards is array
            const cardsUsed = p.formedSets.reduce((sum, s) => sum + (s.cards ? s.cards.length : 0), 0);
            if (cardsUsed === 5) {
                totalScore += 1000;
                p.hasFullBonus = true;
            }

            p.score = totalScore;
        });
    } catch (e) {
        alert("Error in Showdown Logic: " + e.message);
        console.error(e);
    }
}

// ...

function renderResult(players) {
    try {
        const table = document.getElementById('ranking-list');
        if (!table) return;

        // Sort by score
        const sorted = [...players].sort((a, b) => b.score - a.score);

        table.innerHTML = sorted.map((p, i) => `
            <tr class="${p.id === myId ? 'me' : ''}">
                <td>${i + 1}</td>
                <td>${p.name}</td>
                <td>${p.score}</td>
                <td style="font-size:0.8rem">
                    ${(p.formedSets || []).map(s => {
            const style = s.isDuplicated ? 'text-decoration: line-through; color: red;' : 'color: green;';
            const suffix = s.isDuplicated ? '(被り💥)' : '';
            return `<span style="${style}">${formatFormula(s.formula)}${suffix}</span>`;
        }).join(', ') || 'なし'}
                    ${p.hasFullBonus ? '<br><span style="color:gold">★FULL BONUS</span>' : ''}
                </td>
            </tr>
        `).join('');

        // Inject Restart Button for Host
        const bar = document.querySelector('#result-screen .action-bar');
        if (bar) {
            bar.innerHTML = role === 'host'
                ? `<button class="btn primary" onclick="restartGameHost()">もう一度遊ぶ</button>`
                : `<div style="color:#666">ホストの操作待ち...</div>`;
        }
    } catch (e) {
        alert("Error in Render Result: " + e.message);
        console.error(e);
    }
}
function restartGameHost() {
    // Regenerate Deck and reset everything
    startDate = Date.now();
    gameState.deck = generateDeck(); // NEW DECK
    gameState.phase = 'exchange1';
    gameState.discards = [];

    // Reset players
    gameState.players.forEach(p => {
        p.hand = drawFromDeck(5); // NEW HAND
        p.isDone = false;
        p.formedSets = [];
        p.score = 0;
        p.hasFullBonus = false;
    });

    broadcastState();
    handleStateUpdate(gameState);
}

// --- Common Logic ---
function generateDeck() {
    let d = [];
    Object.keys(CARD_DATA).forEach(k => {
        for (let i = 0; i < CARD_DATA[k].count; i++) d.push(k);
    });
    return d.sort(() => Math.random() - 0.5);
}

function drawFromDeck(n) {
    const drawn = [];
    for (let i = 0; i < n; i++) {
        if (gameState.deck.length > 0) drawn.push(gameState.deck.pop());
    }
    return drawn;
}

function broadcastState() {
    const s = JSON.stringify(gameState);
    connections.forEach(c => c.send({ type: 'update', state: s }));
}

// --- Client Logic ---
function handleClientData(data) {
    if (data.type === 'update') {
        handleStateUpdate(JSON.parse(data.state));
    }
}

function sendAction(data) {
    if (role === 'host') handleHostData(myId, data);
    else conn.send(data);
}

function handleStateUpdate(newState) {
    // Clear UI if phase reset (Restart detected)
    if (newState.phase === 'exchange1' && (gameState.phase === 'result' || gameState.phase === 'form')) {
        clearGameUI();
        myFormedSets = []; // Reset local state
        mySelectedIndices = [];
        // Also force clear container just in case
        document.getElementById('formed-sets-container').innerHTML = '';
    }

    gameState = newState;
    const me = gameState.players.find(p => p.id === myId);

    // Switch Screen
    if (gameState.phase === 'lobby') {
        lobbyScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
    } else if (gameState.phase === 'result') {
        gameScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        renderResult(gameState.players);
    } else {
        // Game Playing
        lobbyScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        resultScreen.classList.add('hidden');

        // Render UI
        updatePhaseIndicator();
        renderOpponents();

        // Hand & Interaction
        if (me) {
            // Sync local hand ONLY if phase changed or first load (to avoid overwrite during drag)
            // But for exchange/form, we should just trust server state at start of phase
            // For MVP, just render server hand.
            myHand = me.hand;
            renderMyHand(me);
            updateInstruction();
        }
    }
}

function updatePhaseIndicator() {
    const steps = ['exchange1', 'exchange2', 'form'];
    steps.forEach(s => {
        const el = document.getElementById(`step-${s === 'form' ? 'form' : (s === 'exchange1' ? 'ex1' : 'ex2')}`);
        // Simple mapping correction
    });
    // Just map manually
    document.querySelector('.step-container').innerHTML = `
        <div class="step ${gameState.phase === 'exchange1' ? 'active' : ''}">交換1</div>
        <div class="step ${gameState.phase === 'exchange2' ? 'active' : ''}">交換2</div>
        <div class="step ${gameState.phase === 'form' ? 'active' : ''}">結合</div>
        <div class="step ${gameState.phase === 'result' ? 'active' : ''}">結果</div>
    `;
}

function renderOpponents() {
    const container = document.getElementById('opponents-container');
    container.innerHTML = '';
    gameState.players.forEach(p => {
        if (p.id === myId) return;
        container.innerHTML += `
            <div class="opponent-badge ${p.isDone ? 'done' : ''}">
                <div>${p.name}</div>
                <div style="font-size:0.8rem">${p.isDone ? '完了' : '考え中...'}</div>
            </div>
        `;
    });
}

function renderMyHand(me) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';

    myHand.forEach((symbol, idx) => {
        const data = CARD_DATA[symbol];
        const isSelected = mySelectedIndices.includes(idx);
        const card = document.createElement('div');
        card.className = `atom-card ${data.type} ${isSelected ? 'selected' : ''}`;
        card.style.borderColor = data.textColor;
        card.style.backgroundColor = data.color;

        // Sup logic
        const displaySym = symbol.replace(/(\d+)([+-])/g, '<sup>$1$2</sup>').replace(/([+-])(?!\d)/g, '<sup>$1</sup>');

        card.innerHTML = `
            <div class="atom-symbol" style="color:${data.textColor}">${displaySym}</div>
            <div class="atom-name" style="color:${data.textColor}">${data.name}</div>
        `;

        card.onclick = () => toggleSelect(idx);
        handContainer.appendChild(card);
    });
}

function toggleSelect(idx) {
    if (gameState.phase === 'result') return; // Locked

    const pos = mySelectedIndices.indexOf(idx);
    if (pos >= 0) mySelectedIndices.splice(pos, 1);
    else mySelectedIndices.push(idx);

    // Re-render to show selection
    const me = gameState.players.find(p => p.id === myId);
    renderMyHand(me);
    updateInstruction();
}

function updateInstruction() {
    const btn = document.getElementById('action-btn');
    const instruction = document.getElementById('game-instruction');
    const me = gameState.players.find(p => p.id === myId);

    if (me.isDone) {
        instruction.textContent = "他のプレイヤーを待っています...";
        btn.classList.add('hidden');
        return;
    }

    btn.classList.remove('hidden');
    if (gameState.phase.startsWith('exchange')) {
        instruction.textContent = "いらないカードを選んで捨ててください";
        btn.textContent = mySelectedIndices.length === 0 ? "交換しない" : "交換する";
        btn.className = "btn danger";
        btn.onclick = () => {
            const kept = myHand.filter((_, i) => !mySelectedIndices.includes(i));
            sendAction({ type: 'action_exchange', kept: kept });
            mySelectedIndices = [];
        };
    } else if (gameState.phase === 'form') {
        instruction.textContent = "カードを選んで「結合」してください。終わったら「完了」";
        btn.textContent = "結合する (Bond)";
        btn.className = "btn primary";
        btn.onclick = attemptBond;

        // Add Finish Button if not exists
        let finBtn = document.getElementById('finish-form-btn');
        if (!finBtn) {
            finBtn = document.createElement('button');
            finBtn.id = 'finish-form-btn';
            finBtn.className = 'btn secondary';
            finBtn.textContent = '結合終了 (完了)';
            finBtn.onclick = () => {
                sendAction({ type: 'action_finish_form', formedSets: myFormedSets });
                document.getElementById('finish-form-btn').remove();
            };
            document.querySelector('.action-bar').appendChild(finBtn);
        }
    }
}

// --- Bonding Logic ---

// --- Global Error Handler for Debugging on Mobile ---
window.onerror = function (msg, url, line, col, error) {
    alert("Error: " + msg + "\nLine: " + line);
    return false;
};

function attemptBond() {
    try {
        if (mySelectedIndices.length < 2) {
            alert("2枚以上選んでください");
            return;
        }

        const selectedCards = mySelectedIndices.map(i => myHand[i]);
        const counts = {};
        let totalCharge = 0;

        selectedCards.forEach(s => {
            counts[s] = (counts[s] || 0) + 1;
            totalCharge += CARD_DATA[s].charge;
        });

        if (totalCharge !== 0) {
            alert(`電荷の合計が0になりません (現在: ${totalCharge > 0 ? '+' + totalCharge : totalCharge})`);
            return;
        }

        // Check if Cation + Anion logic exists
        const hasCation = selectedCards.some(s => CARD_DATA[s].type === 'cation');
        const hasAnion = selectedCards.some(s => CARD_DATA[s].type === 'anion');

        if (!hasCation || !hasAnion) {
            alert("陽イオンと陰イオンを組み合わせてください");
            return;
        }

        // Success!
        const formula = generateFormula(selectedCards);
        const points = calculatePoints(selectedCards, formula);

        // Add to local formed sets
        myFormedSets.push({
            formula: formula,
            cards: selectedCards,
            points: points
        });

        // Visualize
        renderFormedSets();

        // Remove from hand
        myHand = myHand.filter((_, i) => !mySelectedIndices.includes(i));
        mySelectedIndices = [];

        // Update UI
        const me = gameState.players.find(p => p.id === myId);
        me.hand = myHand;
        renderMyHand(me);
    } catch (e) {
        alert("System Error in Bond: " + e.message);
        console.error(e);
    }
}



function calculatePoints(cards, formula) {
    let pts = 0;
    // 1. Count Bonus
    const len = cards.length;
    if (len === 2) pts = 100;
    else if (len === 3) pts = 300;
    else if (len === 4) pts = 600;
    else if (len >= 5) pts = 1200;

    // 2. Special Formula Bonus
    // Need to normalize formula for lookup (e.g., remove sub HTML if any)
    // My formula gen outputs plain text like H2O or Al2(SO4)3

    // Check H2O
    if (formula === 'HOH' || formula === 'H2O') { pts += SPECIAL_COMPOUNDS['H2O'].points; formula = 'H2O'; }
    if (SPECIAL_COMPOUNDS[formula]) {
        pts += SPECIAL_COMPOUNDS[formula].points;
    }

    return pts;
}

function renderFormedSets() {
    const container = document.getElementById('formed-sets-container');
    container.innerHTML = myFormedSets.map(set => `
        <div class="formed-set">
            <span class="formula">${formatFormula(set.formula)}</span>
            <span class="pts">${set.points}pt</span>
        </div>
    `).join('');
    container.classList.remove('hidden');
}

function generateFormula(cards) {
    const counts = {};
    cards.forEach(c => {
        // Strip charge symbols for counting (H+ -> H, CO32- -> CO3)
        // Actually, we must be careful. Let's map card symbol to element composition.
        // Simple heuristic for this game set:
        counts[c] = (counts[c] || 0) + 1;
    });

    // Order: Cations then Anions
    const cations = Object.keys(counts).filter(k => CARD_DATA[k].charge > 0);
    const anions = Object.keys(counts).filter(k => CARD_DATA[k].charge < 0);

    let formula = "";

    // Helper to format part
    const formatPart = (ionList) => {
        let partStr = "";
        ionList.forEach(ion => {
            let count = counts[ion];
            // Remove charge from string: Na+ -> Na, Mg2+ -> Mg, SO42- -> SO4
            let sym = ion.replace(/[0-9]*[+-]+$/, '');

            // Special Case: H + HCO3 -> H2CO3
            // This is tricky if handled generically.
            // Let's rely on standard logic: cation count + anion count.
            // But H+ is H, HCO3- is HCO3. Combined H H HCO3 ?? No.
            // Standard chemical nomenclature:
            // Cation(Count) Anion(Count)

            // If polyatomic ion has count > 1, need parenthesis?
            // Mg(OH)2
            const isPoly = /[A-Z].*[A-Z]/.test(sym) || /\d/.test(sym); // Very rough check

            if (count > 1) {
                if (isPoly && sym !== 'H' && sym !== 'O' && sym !== 'Cl') { // Simple exclusion
                    partStr += `(${sym})${count}`;
                } else {
                    partStr += `${sym}${count}`;
                }
            } else {
                partStr += sym;
            }
        });
        return partStr;
    };

    // Special Merges for cleanliness (e.g. H + HCO3 -> H2CO3)
    // Construct raw string first then clean up?
    // H + HCO3 -> H HCO3 -> H2CO3
    // H + H + O -> H2 O -> H2O

    // Let's manually handle specific combinations if needed or use the simple concat.
    // The previous HHCO3 suggests we just concatenated H and HCO3.
    // H (1) + HCO3 (1)

    let rawC = formatPart(cations);
    let rawA = formatPart(anions);

    // Merge logic for Hydrogen special cases to look like acids
    if (rawC.startsWith('H') && !rawC.includes('(')) {
        // e.g. H + Cl -> HCl (OK)
        // H + HCO3 -> HHCO3 (Bad) -> H2CO3
        // H + H + SO4 -> H2SO4 (OK)

        if (rawA.startsWith('H')) {
            // Anion starts with H (HCO3, HSO4 etc)
            // We sum the H's.
            // But parsing 'HCO3' is hard.
            // Hardcode fix for H + HCO3 -> H2CO3
            if (rawA.startsWith('HCO3')) return 'H2CO3';
        }
    }

    // Default fallback
    return rawC + rawA;
}

function formatFormula(f) {
    if (!f) return '';
    return f.replace(/(\d+)/g, '<sub>$1</sub>');
}

// Clear UI helper called on Reset
function clearGameUI() {
    document.getElementById('formed-sets-container').innerHTML = '';
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('ranking-list').innerHTML = '';
}

function updateLobbyUI() {
    document.getElementById('player-count').textContent = gameState.players.length;
    document.getElementById('member-list').innerHTML = gameState.players.map(p => `<li>${p.name}</li>`).join('');

    // Always enable start button for testing if host
    if (role === 'host') {
        const btn = document.getElementById('start-btn');
        if (btn) btn.disabled = false;
    }
}

function toggleRuleModal() {
    const modal = document.getElementById('rule-modal');
    if (modal) modal.classList.toggle('hidden');
}

