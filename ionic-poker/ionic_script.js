
// --- Strategic Ion Poker Script (v=fix51) ---

// GAS URL for logging (optional)
const GAS_URL = '';

// --- ION DATA Definitions ---
const CARD_DATA = {
    // Cations (陽イオン)
    'H⁺': { name: '水素イオン', charge: 1, type: 'cation', count: 8, color: '#e0f2fe', textColor: '#0369a1' },
    'Na⁺': { name: 'ナトリウムイオン', charge: 1, type: 'cation', count: 6, color: '#e0f2fe', textColor: '#0369a1' },
    'Mg²⁺': { name: 'マグネシウムイオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' },
    'Ca²⁺': { name: 'カルシウムイオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' },
    'Cu²⁺': { name: '銅(II)イオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' },
    'Ba²⁺': { name: 'バリウムイオン', charge: 2, type: 'cation', count: 5, color: '#dbeafe', textColor: '#1e40af' },
    'Fe³⁺': { name: '鉄(III)イオン', charge: 3, type: 'cation', count: 5, color: '#bfdbfe', textColor: '#172554' },
    'Al³⁺': { name: 'アルミニウムイオン', charge: 3, type: 'cation', count: 5, color: '#bfdbfe', textColor: '#172554' },

    // Anions (陰イオン)
    'Cl⁻': { name: '塩化物イオン', charge: -1, type: 'anion', count: 6, color: '#fef2f2', textColor: '#b91c1c' },
    'OH⁻': { name: '水酸化物イオン', charge: -1, type: 'anion', count: 8, color: '#fef2f2', textColor: '#b91c1c' },
    'NO₃⁻': { name: '硝酸イオン', charge: -1, type: 'anion', count: 4, color: '#fef2f2', textColor: '#b91c1c' },
    'HCO₃⁻': { name: '炭酸水素イオン', charge: -1, type: 'anion', count: 4, color: '#fef2f2', textColor: '#b91c1c' },
    'O²⁻': { name: '酸化物イオン', charge: -2, type: 'anion', count: 4, color: '#fee2e2', textColor: '#991b1b' },
    'S²⁻': { name: '硫化物イオン', charge: -2, type: 'anion', count: 4, color: '#fee2e2', textColor: '#991b1b' },
    'CO₃²⁻': { name: '炭酸イオン', charge: -2, type: 'anion', count: 5, color: '#fee2e2', textColor: '#991b1b' },
    'SO₄²⁻': { name: '硫酸イオン', charge: -2, type: 'anion', count: 5, color: '#fee2e2', textColor: '#991b1b' },
    'PO₄³⁻': { name: 'リン酸イオン', charge: -3, type: 'anion', count: 6, color: '#fecaca', textColor: '#7f1d1d' },
};

// Yaku / Bonus Logic
const SPECIAL_COMPOUNDS = {
    'H2O': { name: '水 (Water)', points: 500 },
    'BaSO4': { name: '硫酸バリウム', points: 300 },
    'CaCO3': { name: '炭酸カルシウム', points: 300 },
    'BaCO3': { name: '炭酸バリウム', points: 300 },
    'AgCl': { name: '塩化銀', points: 300 },
    'Al2O3': { name: '酸化アルミニウム', points: 2000 },
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
    players: [],
    startTime: 0
};

let myHand = [];
let mySelectedIndices = [];
let myFormedSets = [];
let myScore = 0;
let sortableInstance = null;

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
    try {
        if (!gameState) throw new Error("gameState is null");
        gameState.deck = generateDeck();
        gameState.phase = 'exchange1';
        gameState.players.forEach(p => {
            p.hand = drawFromDeck(7); // 7 Cards Start
            p.isDone = false;
            p.formedSets = [];
            p.score = 0;
            p.hasFullBonus = false;
        });
        broadcastState();
        handleStateUpdate(gameState);
    } catch (e) {
        alert("Error in startGameHost: " + e.message + "\n" + e.stack);
    }
}

function handleHostData(peerId, data) {
    const player = gameState.players.find(p => p.id === peerId);
    if (!player) return;

    if (data.type === 'action_exchange') {
        const keeps = data.kept;
        console.log(`[Host] Exchange Request from ${player.name} (${peerId}). Kept: ${keeps.length}, Current Deck: ${gameState.deck.length}, Discards: ${gameState.discards.length}`);

        // Identify discarded cards to recycle
        const currentHand = player.hand || [];
        let tempHand = [...currentHand];
        keeps.forEach(k => {
            const idx = tempHand.indexOf(k);
            if (idx > -1) tempHand.splice(idx, 1);
        });

        console.log(`[Host] Discarded cards: ${tempHand.join(',')}`);
        gameState.discards.push(...tempHand);

        // Logic: Discard rest, Draw new (Check against Hand Size 7)
        const countNeeded = 7 - keeps.length;

        const newCards = drawFromDeck(countNeeded);
        console.log(`[Host] Drew new cards: ${newCards.join(',')}`);

        player.hand = [...keeps, ...newCards];
        player.isDone = true;

        console.log(`[Host] New Hand for ${player.name}: ${player.hand.join(',')}`);

        checkPhaseCompletion();

    } else if (data.type === 'action_finish_form') {
        player.formedSets = data.formedSets;
        player.isDone = true;
        checkPhaseCompletion();
    }

    broadcastState();

    // Fix: If Host, force UI update to show new hand/status
    if (player.id === myId) {
        handleStateUpdate(gameState);
    }
}

function checkPhaseCompletion() {
    if (gameState.players.every(p => p.isDone)) {
        if (gameState.phase === 'exchange1') {
            gameState.phase = 'exchange2';
            gameState.players.forEach(p => p.isDone = false);
        } else if (gameState.phase === 'exchange2') {
            gameState.phase = 'form';
            gameState.players.forEach(p => p.isDone = false);
        } else if (gameState.phase === 'form') {
            resolveShowdown();
            gameState.phase = 'result';
        }
        broadcastState();
        handleStateUpdate(gameState);
    }
}

function resolveShowdown() {
    try {
        const allFormulas = [];
        gameState.players.forEach(p => {
            if (!p.formedSets) p.formedSets = [];
            p.formedSets.forEach(set => {
                allFormulas.push({
                    formula: set.formula,
                    playerId: p.id,
                    setRef: set
                });
            });
        });

        const formulaCounts = {};
        allFormulas.forEach(item => {
            formulaCounts[item.formula] = (formulaCounts[item.formula] || 0) + 1;
        });

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

            // Full Bonus Check (7 Cards)
            const cardsUsed = p.formedSets.reduce((sum, s) => sum + (s.cards ? s.cards.length : 0), 0);
            if (cardsUsed === 7) {
                totalScore += 500;
                p.hasFullBonus = true;
            } else {
                p.hasFullBonus = false;
            }

            p.score = totalScore;
        });
    } catch (e) {
        console.error("Showdown Error", e);
    }
}

function restartGameHost() {
    gameState.deck = generateDeck();
    gameState.phase = 'exchange1';
    gameState.discards = [];

    gameState.players.forEach(p => {
        p.hand = drawFromDeck(7); // 7 Cards
        p.isDone = false;
        p.formedSets = [];
        p.score = 0;
        p.hasFullBonus = false;
    });

    broadcastState();
    handleStateUpdate(gameState);
}

// --- Common Logic ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateDeck() {
    let d = [];
    Object.keys(CARD_DATA).forEach(k => {
        for (let i = 0; i < CARD_DATA[k].count; i++) d.push(k);
    });
    return shuffleArray(d);
}

function drawFromDeck(n) {
    const drawn = [];
    for (let i = 0; i < n; i++) {
        if (gameState.deck.length === 0) {
            // Deck empty, try to recycle discards
            if (gameState.discards.length > 0) {
                // Reshuffle discards
                console.log("Deck empty! Reshuffling " + gameState.discards.length + " cards.");
                gameState.deck = shuffleArray(gameState.discards);
                gameState.discards = [];
            } else {
                // Really empty
                console.warn("Deck and Discards both empty! Cannot draw.");
                break;
            }
        }

        if (gameState.deck.length > 0) {
            drawn.push(gameState.deck.pop());
        }
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


// State for button locking
let lastPhase = '';
let buttonLockedUntil = 0;

function handleStateUpdate(newState) {
    try {
        if (!newState) throw new Error("New State is null");

        const prevPhase = lastPhase;

        // Detect Phase Change
        if (newState.phase !== lastPhase) {
            // New Phase: Clear previous selections to prevent accidental discards
            mySelectedIndices = [];

            // If entering a new exchange phase or form phase, lock button briefly
            if (newState.phase === 'exchange2' || newState.phase === 'form') {
                buttonLockedUntil = Date.now() + 1000; // 1s lock
                setTimeout(updateInstruction, 1000); // Unlock after 1s
            }
            lastPhase = newState.phase;
        }

        // FORCE CLEAR UI if in Exchange Phase (New Game Started)
        if (newState.phase === 'exchange1') {
            clearGameUI();
            myFormedSets = [];
            mySelectedIndices = [];

            // Also lock for exchange1 start
            buttonLockedUntil = Date.now() + 1000;
            setTimeout(updateInstruction, 1000);

            const container = document.getElementById('formed-sets-container');
            if (container) {
                container.innerHTML = '';
                container.classList.add('hidden');
            }
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

            updatePhaseIndicator();
            renderOpponents();

            if (me) {
                // Fix: Do NOT overwrite hand during FORM phase to prevent "Infinite Cards" reset
                // Clients modify hand locally, server has stale hand.
                // EXCEPTION: If we JUST entered the form phase (from exchange2), we MUST update
                // to get the result of the last exchange!
                if (gameState.phase !== 'form' || (gameState.phase === 'form' && prevPhase !== 'form')) {
                    myHand = me.hand;
                }

                renderMyHand(me);
                updateInstruction();

                // Re-render local formed sets only if in FORM phase
                if (gameState.phase === 'form') {
                    renderFormedSets();
                }
            }
        }
    } catch (e) {
        alert("Error in handleStateUpdate: " + e.message + "\n" + e.stack);
    }
}

function updatePhaseIndicator() {
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

// --- Render Hand with SortableJS ---
function renderMyHand(me) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';

    myHand.forEach((symbol, idx) => {
        const data = CARD_DATA[symbol];
        const isSelected = mySelectedIndices.includes(idx);
        const card = document.createElement('div');
        card.className = `atom-card ${data.type} ${isSelected ? 'selected' : ''}`;
        card.setAttribute('data-symbol', symbol);
        card.style.borderColor = data.textColor;
        card.style.backgroundColor = data.color;

        let displaySym = symbol.replace(/(\d+)([+-])/g, '<sup>$1$2</sup>').replace(/([+-])(?!\d)/g, '<sup>$1</sup>');

        card.innerHTML = `
            <div class="atom-symbol" style="color:${data.textColor}">${displaySym}</div>
            <div class="atom-name" style="color:${data.textColor}">${data.name}</div>
        `;

        card.onclick = (e) => {
            toggleSelect(idx);
        };
        handContainer.appendChild(card);
    });

    // Check if SortableJS is loaded
    if (typeof Sortable === 'undefined') {
        console.warn("SortableJS not loaded");
        return;
    }

    if (!sortableInstance) {
        sortableInstance = new Sortable(handContainer, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            delay: 100,
            delayOnTouchOnly: true,
            onEnd: function (evt) {
                const newHand = [];
                const newSelection = [];
                const cards = handContainer.children;

                for (let i = 0; i < cards.length; i++) {
                    const el = cards[i];
                    const sym = el.getAttribute('data-symbol');
                    newHand.push(sym);
                    if (el.classList.contains('selected')) {
                        newSelection.push(i);
                    }
                }

                myHand = newHand;
                mySelectedIndices = newSelection;

                const p = gameState.players.find(pl => pl.id === myId);
                if (p) p.hand = myHand;

                renderMyHand(p);
                updateInstruction();
            }
        });
    }
}

function toggleSelect(idx) {
    if (gameState.phase === 'result') return;

    const pos = mySelectedIndices.indexOf(idx);
    if (pos >= 0) mySelectedIndices.splice(pos, 1);
    else mySelectedIndices.push(idx);

    // Re-render
    const me = gameState.players.find(p => p.id === myId);
    renderMyHand(me);
    updateInstruction();
}

function toggleRuleModal() {
    const el = document.getElementById('rule-modal');
    if (el.classList.contains('hidden')) el.classList.remove('hidden');
    else el.classList.add('hidden');
}

function updateInstruction() {
    const btn = document.getElementById('action-btn');
    const instruction = document.getElementById('game-instruction');
    const me = gameState.players.find(p => p.id === myId);

    // Check Lock
    const isLocked = Date.now() < buttonLockedUntil;
    if (isLocked) {
        btn.disabled = true;
        btn.textContent = "待機中... (Wait)";
        btn.classList.remove('primary', 'danger', 'secondary');
        btn.classList.add('secondary'); // Grey out
        // instruction.textContent = "準備中..."; 
        // Keep instruction visible so they know what to do next
    } else {
        btn.disabled = false;
    }

    if (me.isDone) {
        instruction.textContent = "他のプレイヤーを待っています...";
        btn.classList.add('hidden');
        return;
    }

    btn.classList.remove('hidden');
    if (gameState.phase.startsWith('exchange')) {
        const isSecond = gameState.phase === 'exchange2';
        instruction.textContent = isSecond
            ? "2回目(最後)の交換です。いらないカードを捨ててください"
            : "いらないカードを選んで捨ててください";

        if (!isLocked) {
            btn.textContent = mySelectedIndices.length === 0 ? "交換しない" : "交換する";
            btn.className = "btn danger";
            btn.onclick = () => {
                const kept = myHand.filter((_, i) => !mySelectedIndices.includes(i));
                sendAction({ type: 'action_exchange', kept: kept });
                mySelectedIndices = [];
            };
        }
    } else if (gameState.phase === 'form') {
        instruction.textContent = "カードを選んで「結合」してください。終わったら「完了」";

        if (!isLocked) {
            btn.textContent = "結合する (Bond)";
            btn.className = "btn primary";
            btn.onclick = attemptBond;
        }

        // Add Finish Button if not exists
        let finBtn = document.getElementById('finish-form-btn');
        if (!finBtn) {
            finBtn = document.createElement('button');
            finBtn.id = 'finish-form-btn';
            finBtn.className = 'btn secondary';
            finBtn.textContent = '結合終了 (完了)';
            finBtn.style.marginLeft = '10px';
            finBtn.onclick = () => {
                sendAction({ type: 'action_finish_form', formedSets: myFormedSets });
                document.getElementById('finish-form-btn').remove();
            };
            document.querySelector('.action-bar').appendChild(finBtn);
        }
    }
}

// --- Debug Logger ---
const originalLog = console.log;
console.log = function (...args) {
    originalLog.apply(console, args);
    const debugEl = document.getElementById('debug-console');
    if (debugEl) {
        const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        const line = document.createElement('div');
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        debugEl.insertBefore(line, debugEl.firstChild); // Newest top
    }
};

window.toggleDebug = () => {
    const el = document.getElementById('debug-console');
    if (el.style.display === 'none') {
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
};

// --- Bonding Logic ---
// Global Error Handler 
window.onerror = function (msg, url, line, col, error) {
    // Only show if not handled by try-catch
    if (!msg.includes("Error in")) {
        alert("System Error: " + msg + "\nLine: " + line);
    }
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

        // Strict Rule: 1 Cation Type + 1 Anion Type
        const uniqueCations = [...new Set(selectedCards.filter(c => CARD_DATA[c].type === 'cation'))];
        const uniqueAnions = [...new Set(selectedCards.filter(c => CARD_DATA[c].type === 'anion'))];

        if (uniqueCations.length === 0 || uniqueAnions.length === 0) {
            alert("陽イオンと陰イオンを組み合わせてください");
            return;
        }

        if (uniqueCations.length > 1 || uniqueAnions.length > 1) {
            alert("混ぜられるのは「1種類の陽イオン」と「1種類の陰イオン」だけです。");
            return;
        }

        const formula = generateFormula(selectedCards);
        const points = calculatePoints(selectedCards, formula);

        myFormedSets.push({
            formula: formula,
            cards: selectedCards,
            points: points
        });

        renderFormedSets();
        myHand = myHand.filter((_, i) => !mySelectedIndices.includes(i));
        mySelectedIndices = [];

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
    const len = cards.length;
    if (len === 2) pts = 100;
    else if (len === 3) pts = 300;
    else if (len === 4) pts = 600;
    else if (len >= 5) pts = 1200;

    if (formula === 'HOH' || formula === 'H2O') { pts += SPECIAL_COMPOUNDS['H2O'].points; formula = 'H2O'; }
    if (SPECIAL_COMPOUNDS[formula]) {
        pts += SPECIAL_COMPOUNDS[formula].points;
    }
    return pts;
}

function generateFormula(cards) {
    const counts = {};
    cards.forEach(c => {
        counts[c] = (counts[c] || 0) + 1;
    });

    const cations = Object.keys(counts).filter(k => CARD_DATA[k].charge > 0);
    const anions = Object.keys(counts).filter(k => CARD_DATA[k].charge < 0);

    const formatPart = (ionList) => {
        let partStr = "";
        ionList.forEach(ion => {
            let count = counts[ion];
            // Normalize subscripts and strip charges
            let sym = ion.replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2').replace(/₃/g, '3')
                .replace(/₄/g, '4').replace(/₅/g, '5').replace(/₆/g, '6').replace(/₇/g, '7')
                .replace(/₈/g, '8').replace(/₉/g, '9');
            sym = sym.replace(/[⁺⁻²³¹⁰⁴⁵⁶⁷⁸⁹]+$/g, '').replace(/[+-]+$/g, '');

            const isPoly = /[A-Z].*[A-Z]/.test(sym) || /\d/.test(sym);

            if (count > 1) {
                if (isPoly && sym !== 'H' && sym !== 'O' && sym !== 'Cl') {
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

    let rawC = formatPart(cations);
    let rawA = formatPart(anions);

    if (rawC.startsWith('H') && !rawC.includes('(')) {
        if (rawA.startsWith('HCO3')) return 'H2CO3';
    }

    return rawC + rawA;
}

function formatFormula(formula) {
    // Basic H2O -> H₂O formatting for HTML
    return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}

function clearGameUI() {
    // Helper to reset specific UI elements
    const h = document.getElementById('formed-sets-container');
    if (h) h.innerHTML = '';
}

function updateLobbyUI() {
    const list = document.getElementById('member-list');
    if (!list) return;

    list.innerHTML = gameState.players.map(p => `<li>${p.name} ${p.id === hostId ? '(HOST)' : ''}</li>`).join('');
    document.getElementById('player-count').textContent = gameState.players.length;

    if (role === 'host') {
        const btn = document.getElementById('start-btn');
        btn.classList.remove('hidden');
        btn.disabled = false; // Enable the button!
    }
}

function generateCompoundName(formula, cards) {
    if (SPECIAL_COMPOUNDS[formula]) {
        return SPECIAL_COMPOUNDS[formula].name;
    }
    const cations = cards.filter(c => CARD_DATA[c].type === 'cation');
    const anions = cards.filter(c => CARD_DATA[c].type === 'anion');
    const cat = cations[0];
    const ani = anions[0];
    if (!cat || !ani) return '';

    let catName = CARD_DATA[cat].name.replace('イオン', '');
    let aniName = CARD_DATA[ani].name.replace('イオン', '');

    if (aniName.endsWith('物')) {
        aniName = aniName.slice(0, -1);
    }

    if (cat === 'H⁺') {
        if (ani === 'Cl⁻') return '塩化水素';
        if (ani === 'SO₄²⁻') return '硫酸';
        if (ani === 'NO₃⁻') return '硝酸';
        if (ani === 'CO₃²⁻') return '炭酸';
        if (ani === 'HCO₃⁻') return '炭酸';
        if (ani === 'PO₄³⁻') return 'リン酸';
        return aniName + '水素';
    }
    return aniName + catName;
}

function renderFormedSets() {
    const container = document.getElementById('formed-sets-container');
    container.innerHTML = myFormedSets.map(set => {
        const name = generateCompoundName(set.formula, set.cards);
        return `
        <div class="formed-set">
            <div class="formula">${formatFormula(set.formula)}</div>
            <div style="font-size:0.8rem; color:#555;">${name}</div>
            <div class="pts">${set.points}pt</div>
        </div>
    `;
    }).join('');
    container.classList.remove('hidden');
}

function renderResult(players) {
    try {
        const table = document.getElementById('ranking-list');
        if (!table) return;
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
            const name = generateCompoundName(s.formula, s.cards || []);
            return `<div style="${style}">
                        <b>${formatFormula(s.formula)}</b> ${suffix}<br>
                        <span style="font-size:0.7em; color:#666">${name}</span>
                    </div>`;
        }).join('<hr style="margin:2px 0; border:0; border-top:1px dashed #ccc;">') || 'なし'}
                    ${p.hasFullBonus ? '<br><span style="color:gold">★FULL BONUS</span>' : ''}
                </td>
            </tr>
        `).join('');

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
