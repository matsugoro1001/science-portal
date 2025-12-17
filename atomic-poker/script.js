const GAS_URL = 'https://script.google.com/macros/s/AKfycbyoPJnTzenD0Af8Fg0F7xUA2UW9-gIKepeGiG2ouQ0MGBSq8k7_ZFDXjwKV3TbIAbpEWA/exec';

// PeerJS Setup
let peer = null;
let conn = null; // For client: connection to host
let connections = []; // For host: list of connections
let role = 'none'; // 'host' or 'client'
let myId = '';
let hostId = '';
let players = []; // List of {id, name, hand, score, status}

// Game State
let gameState = {
    phase: 'lobby', // lobby, exchange1, exchange2, form, result
    deck: [],
    discards: [], // Array of symbols
    players: [], // [ {id, name, hand, formedSets, score, isDone} ]
    startTime: 0,
    // Note: turnIndex is no longer used for exchange phases in simultaneous mode
    // We rely on players[i].isDone to track progress
};

let myHand = [];
let mySelectedIndices = [];
let myFormedSets = [];
let myScore = 0;

// DOM Elements
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const hostInfo = document.getElementById('host-info');
const myRoomIdEl = document.getElementById('my-room-id');
const playerCountEl = document.getElementById('player-count');
const memberListEl = document.getElementById('member-list');
const startBtn = document.getElementById('start-btn');
const joinStatusEl = document.getElementById('join-status');
const waitingEl = document.getElementById('instruction'); // Status message
const handEl = document.getElementById('player-hand');
const opponentsContainer = document.getElementById('opponents-container');
const phaseDisplay = document.getElementById('phase-display');
const formedContainer = document.getElementById('formed-sets-container');
// Table Elements
const deckCountEl = document.getElementById('deck-count');
const discardPoolEl = document.getElementById('discard-pool');

// --- Lobby Logic ---

const usernameInput = document.getElementById('username-input');

function createRoom() {
    role = 'host';
    // Initialize Peer
    peer = new Peer(generateShortId());

    peer.on('open', (id) => {
        myId = id;
        myRoomIdEl.textContent = id;
        hostInfo.classList.remove('hidden');
        // Add self to players
        gameState.players = [{ id: myId, name: 'Player 1', isDone: false, score: 0 }];
        updateLobbyUI();
    });

    peer.on('connection', (c) => {
        // Incoming connection
        c.on('open', () => {
            console.log('Peer connected:', c.peer);
            connections.push(c);

            // Auto-assign name
            const name = `Player ${gameState.players.length + 1}`;
            gameState.players.push({ id: c.peer, name: name, isDone: false, score: 0 });

            // Send current lobby state
            broadcastState();
            updateLobbyUI();

            // Listen for data
            c.on('data', (data) => handleHostData(c.peer, data));
        });
    });
}

function joinRoom() {
    const inputId = document.getElementById('join-id').value.trim();

    if (!inputId) {
        joinStatusEl.textContent = 'IDを入力してください';
        return;
    }

    role = 'client';
    hostId = inputId;
    peer = new Peer(); // Auto ID

    peer.on('open', (id) => {
        myId = id;
        joinStatusEl.textContent = '接続中...';

        // Connect with metadata
        conn = peer.connect(hostId);

        conn.on('open', () => {
            joinStatusEl.textContent = '接続成功！ホストの開始を待っています...';
            // Disable inputs
            document.querySelector('.lobby-card button').disabled = true;
        });

        conn.on('data', (data) => handleClientData(data));

        conn.on('error', (err) => {
            joinStatusEl.textContent = '接続エラー: ' + err;
        });
    });
}

function generateShortId() {
    // Generate a random 4-char string for easier typing
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function updateLobbyUI() {
    playerCountEl.textContent = gameState.players.length;
    memberListEl.innerHTML = gameState.players.map(p => `<li>${p.name} ${p.id === myId ? '(自分)' : ''}</li>`).join('');

    // Enable start button if > 1 player (or testing with 1 is fine too)
    startBtn.disabled = false;
}

// --- Host Logic ---

function startGameHost() {
    // Initialize Game
    gameState.deck = generateDeck();
    gameState.phase = 'exchange1';
    gameState.turnIndex = 0; // Legacy / Reserved


    // Deal hands
    gameState.players.forEach(p => {
        p.hand = drawFromDeck(7);
        p.isDone = false;
        p.formedSets = [];
        p.score = 0;
    });

    broadcastState();
    // Local update for host
    handleStateUpdate(gameState);
}

function handleHostData(peerId, data) {
    // Handle actions from clients
    const playerIndex = gameState.players.findIndex(p => p.id === peerId);
    if (playerIndex === -1) return;
    const player = gameState.players[playerIndex];

    // Simultaneous Turn Logic:
    // Any player can act if they haven't done so yet for this phase.
    if (gameState.phase.startsWith('exchange')) {
        if (player.isDone) {
            console.warn(`${player.name} already acted this phase.`);
            return;
        }

        if (data.type === 'action_exchange') {
            // Processing Exchange
            const keptCards = data.kept;
            const discardedCards = data.discarded;

            gameState.discards.push(...discardedCards);
            const newCards = drawFromDeck(discardedCards.length);
            player.hand = [...keptCards, ...newCards];

            // Turn Complete for this player
            player.isDone = true;
            checkPhaseProgression();
        }
    } else if (data.type === 'action_finish_form') {
        // Form phase is simultaneous (or we can make it sequential too? User said "discarding is sequential").
        // Let's keep Form phase simultaneous for now as it's just submitting results.
        player.score = data.score;
        player.formedSets = data.formedSets;
        player.isDone = true;

        checkPhaseProgression();
    }
}

function advanceTurn() {
    gameState.turnIndex++;

    // Check if round is over
    if (gameState.turnIndex >= gameState.players.length) {
        // End of this exchange round
        gameState.turnIndex = 0; // Reset for next phase

        if (gameState.phase === 'exchange1') {
            gameState.phase = 'exchange2';
        } else if (gameState.phase === 'exchange2') {
            gameState.phase = 'form';
        }
    }

    broadcastState();
    handleStateUpdate(gameState);
}

function checkPhaseProgression() {
    const allDone = gameState.players.every(p => p.isDone);

    if (allDone) {
        // Reset isDone for next phase
        gameState.players.forEach(p => p.isDone = false);

        if (gameState.phase === 'exchange1') {
            gameState.phase = 'exchange2';
        } else if (gameState.phase === 'exchange2') {
            gameState.phase = 'form';
        } else if (gameState.phase === 'form') {
            gameState.phase = 'result';
        }
        broadcastState();
        handleStateUpdate(gameState);
    } else {
        broadcastState();
        handleStateUpdate(gameState);
    }
}

function broadcastState() {
    const stateStr = JSON.stringify(gameState);
    connections.forEach(c => c.send({ type: 'state_update', state: stateStr }));
}

function drawFromDeck(n) {
    const drawn = [];
    for (let i = 0; i < n; i++) {
        if (gameState.deck.length > 0) drawn.push(gameState.deck.pop());
    }
    return drawn;
}

// --- Client Logic ---

function handleClientData(data) {
    if (data.type === 'state_update') {
        const newState = JSON.parse(data.state);
        handleStateUpdate(newState);
    }
}

function sendAction(actionData) {
    if (role === 'host') {
        // Direct call
        handleHostData(myId, actionData);
    } else {
        conn.send(actionData);
    }
}

// --- Common Game Logic ---

// --- Common Game Logic ---

let lastPhase = 'lobby';

function handleStateUpdate(newState) {
    // Detect Game Start / Reset
    if (lastPhase === 'result' && newState.phase === 'exchange1') {
        // Reset local state
        myScore = 0;
        myFormedSets = [];
        mySelectedIndices = [];
        scoreSubmitted = false;
        console.log('Local state reset for new game');
    }
    // Also reset if coming from lobby
    if (lastPhase === 'lobby' && newState.phase === 'exchange1') {
        myScore = 0;
        myFormedSets = [];
        mySelectedIndices = [];
        scoreSubmitted = false;
    }

    lastPhase = gameState.phase; // Update history (Wait, gameState is updated below, so save old phase first?)
    // Actually handleStateUpdate receives newState. gameState is old state? No, logic below sets gameState = newState.
    // So distinct oldState vs newState.
}

function handleStateUpdate(newState) {
    const oldPhase = gameState.phase;
    gameState = newState;

    // Reset local state on new game
    if ((oldPhase === 'lobby' || oldPhase === 'result') && gameState.phase === 'exchange1') {
        myScore = 0;
        myFormedSets = [];
        mySelectedIndices = [];
        scoreSubmitted = false;
        // Make sure to clear the formed sets container visually
        document.getElementById('formed-sets-container').innerHTML = '<div style="width: 100%; text-align: center; color: #64748b; font-size: 0.9rem;">作った化学式がここに置かれます</div>';
    }

    // Find my data
    const me = gameState.players.find(p => p.id === myId);
    if (me) {
        // Only sync hand if NOT in form phase (preserve local edits)
        // OR if it's the very start of form phase (transition)
        if (gameState.phase !== 'form') {
            myHand = me.hand;
        } else if (oldPhase !== 'form' && gameState.phase === 'form') {
            // Initial sync for form phase
            myHand = me.hand;
        }
    }

    // Update UI
    if (gameState.phase !== 'lobby') {
        lobbyScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        phaseDisplay.classList.remove('hidden');
        updatePhaseDisplay();
        renderOpponents();
        renderTable();
    }

    // Link header
    const statusHeader = document.getElementById('game-status-header');
    const myIdDisplay = document.getElementById('my-player-id-display');
    const scoreDisplay = document.getElementById('current-score-display');

    if (me && myIdDisplay) {
        myIdDisplay.textContent = `${me.name} (あなた)`;
    }

    if (scoreDisplay) {
        scoreDisplay.textContent = myScore;
    }

    // Determine Turn Status
    let isMyTurn = false;
    let waitingText = '';

    if (gameState.phase.startsWith('exchange')) {
        // Simultaneous
        if (!me.isDone) {
            isMyTurn = true;
        } else {
            waitingText = '他のプレイヤーを待っています...';
        }
    } else if (gameState.phase === 'form') {
        // Simultaneous
        if (!me.isDone) isMyTurn = true;
        else waitingText = '他のプレイヤーの完了待ち...';
    }

    if (me && isMyTurn) {
        // I need to act
        renderHand(true); // Interactive
        updateInstruction();
        if (statusHeader) {
            // Simplify text for simultaneous play
            statusHeader.textContent = `アクションを選択してください (${getPhaseName(gameState.phase)})`;
            statusHeader.style.backgroundColor = '#dbeafe'; // Light blue
            statusHeader.style.color = '#0369a1';
        }
    } else {
        // I am waiting
        renderHand(false); // Locked

        if (statusHeader) {
            statusHeader.textContent = waitingText || '待機中...';
            statusHeader.style.backgroundColor = '#f3f4f6'; // Gray
            statusHeader.style.color = '#4b5563';
        }

        if (waitingEl) waitingEl.textContent = waitingText;

        // Hide action button or disable
        const btn = document.getElementById('action-btn');
        if (btn) {
            btn.classList.add('hidden');
            btn.disabled = true;
        }
    }

    if (gameState.phase === 'result') {
        showResultScreen();
    }
}

let scoreSubmitted = false;

function getPhaseName(p) {
    if (p === 'exchange1') return 'カード交換 1回目';
    if (p === 'exchange2') return 'カード交換 2回目';
    if (p === 'form') return '役作り（結合）';
    return '';
}

function updatePhaseDisplay() {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    if (gameState.phase === 'exchange1') document.getElementById('step-ex1').classList.add('active');
    if (gameState.phase === 'exchange2') document.getElementById('step-ex2').classList.add('active');
    if (gameState.phase === 'form') document.getElementById('step-form').classList.add('active');
    if (gameState.phase === 'result') document.getElementById('step-result').classList.add('active');
}

function updateInstruction() {
    const btn = document.getElementById('action-btn');
    const finishBtn = document.getElementById('finish-btn');

    // Default visibility
    if (finishBtn) finishBtn.classList.add('hidden');
    if (btn) {
        btn.classList.remove('hidden');
        btn.disabled = false;
    }

    if (gameState.phase.startsWith('exchange')) {
        waitingEl.textContent = 'いらないカードを選んで「交換」を押してください';
        btn.textContent = 'これらを捨てる (交換)';
        btn.className = 'btn danger';

        // Special: If no cards selected, "Skip Exchange"
        if (mySelectedIndices.length === 0) {
            btn.textContent = '交換せずに次へ';
            btn.className = 'btn primary';
        }
    } else if (gameState.phase === 'form') {
        waitingEl.textContent = '手札を選んで「結合」！ 終わったら「終了」ボタン';
        btn.textContent = '結合！ (Bond)';
        btn.className = 'btn accent'; // Make it stand out more
        btn.disabled = false; // Always enabled

        // Show Finish Button
        if (finishBtn) {
            finishBtn.classList.remove('hidden');
            // Style it differently
            finishBtn.className = 'btn secondary';
            finishBtn.style.backgroundColor = '#64748b';
            finishBtn.style.color = 'white';
        }
    }
}

function handleFinishTurn() {
    if (gameState.phase !== 'form') return;

    // No confirmation needed per user request
    console.log('Finishing Form Phase. Score:', myScore);
    sendAction({
        type: 'action_finish_form',
        score: myScore,
        formedSets: myFormedSets
    });
}

function renderOpponents() {
    opponentsContainer.innerHTML = '';
    gameState.players.forEach(p => {
        if (p.id === myId) return;
        const badge = document.createElement('div');
        badge.className = `opponent-badge ${p.isDone ? 'done' : 'thinking'}`;
        badge.innerHTML = `
            <div>${p.name}</div>
            <div class="status-dot"></div>
            <div style="font-size:0.7rem; color:#666;">${p.isDone ? '完了' : '考え中'}</div>
        `;
        opponentsContainer.appendChild(badge);
    });
}

// Sortable Instance
let handSortable = null;

function renderHand(interactive) {
    handEl.innerHTML = '';
    myHand.forEach((symbol, index) => {
        const cardData = CARD_DATA[symbol];
        const card = document.createElement('div');
        card.className = `atom-card ${mySelectedIndices.includes(index) ? 'selected' : ''}`;
        card.dataset.symbol = symbol; // For state sync

        if (interactive) {
            // Click to toggle selection
            card.onclick = (e) => {
                // Prevent click processing if it was a drag (Sortable handles this usually, but good to be sure)
                // Actually Sortable prevents click event on drag.

                // We need to fetch the CURRENT index because Dragging changes indices
                const currentIdx = Array.from(handEl.children).indexOf(card);

                const idxInSelection = mySelectedIndices.indexOf(currentIdx);
                if (idxInSelection > -1) {
                    mySelectedIndices.splice(idxInSelection, 1);
                    card.classList.remove('selected');
                } else {
                    mySelectedIndices.push(currentIdx);
                    card.classList.add('selected');
                }
                updateInstruction();
            };
        } else {
            card.style.opacity = 0.7;
        }

        card.innerHTML = `
            <div class="atom-symbol" style="color: ${cardData.textColor}">${symbol === 'Blank' ? '' : symbol}</div>
            <div class="atom-name" style="color: ${cardData.textColor}">${cardData.name}</div>
        `;
        card.style.backgroundColor = cardData.color;
        handEl.appendChild(card);
    });

    // Initialize Sortable if needed and interactive
    if (interactive) {
        if (!handSortable) {
            handSortable = new Sortable(handEl, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                delay: 100, // Slight delay to prevent accidental drag when clicking
                delayOnTouchOnly: true,
                onEnd: function (evt) {
                    // Sync myHand state with new DOM order
                    const newHand = [];
                    const newSelected = [];

                    Array.from(handEl.children).forEach((card, newIndex) => {
                        newHand.push(card.dataset.symbol);
                        if (card.classList.contains('selected')) {
                            newSelected.push(newIndex);
                        }
                    });

                    myHand = newHand;
                    mySelectedIndices = newSelected;
                }
            });
        }
        handSortable.option('disabled', false);
    } else {
        if (handSortable) {
            handSortable.option('disabled', true);
        }
    }
}

function handlePlayerAction() {
    // Safety Check for Turn
    if (gameState.phase.startsWith('exchange')) {
        const me = gameState.players.find(p => p.id === myId);
        if (me && me.isDone) {
            alert('他のプレイヤーを待っています');
            return;
        }
    }

    if (gameState.phase.startsWith('exchange')) {
        // Identify kept and discarded based on current local hand
        const keptCards = myHand.filter((_, i) => !mySelectedIndices.includes(i));
        const discardedCards = myHand.filter((_, i) => mySelectedIndices.includes(i));

        // Send exchange Action
        sendAction({
            type: 'action_exchange',
            kept: keptCards,
            discarded: discardedCards
        });
        mySelectedIndices = [];
    } else if (gameState.phase === 'form') {
        // Only Attempt Bond
        if (mySelectedIndices.length === 0) {
            // Should be disabled, but just in case
            return;
        } else {
            // Attempt Bond
            attemptBondLocal();
        }
    }
}

// ... attemptBondLocal ...

function attemptBondLocal() {
    const selectedSymbols = mySelectedIndices.map(i => myHand[i]);
    const matchedFormula = checkFormula(selectedSymbols);

    if (matchedFormula) {
        addFormedSet(matchedFormula);
        console.log('Bond formed! New Score:', myScore);

        // Update display immediately
        const sd = document.getElementById('current-score-display');
        if (sd) sd.textContent = myScore;

        // Remove from local hand
        myHand = myHand.filter((_, i) => !mySelectedIndices.includes(i));
        mySelectedIndices = [];
        renderHand(true);
        updateInstruction();
    } else {
        alert('できません！');
        mySelectedIndices = [];
        renderHand(true);
    }
}

function addFormedSet(rule) {
    myFormedSets.push(rule);
    myScore += rule.points;
    const setEl = document.createElement('div');
    setEl.className = 'formed-set';
    setEl.innerHTML = `<span class="set-formula">${toSubscript(rule.formula)}</span> +${rule.points}`;
    formedContainer.classList.remove('hidden');
    formedContainer.appendChild(setEl);
}

// Reuse logic
function checkFormula(symbols) {
    const counts = {};
    symbols.forEach(s => counts[s] = (counts[s] || 0) + 1);
    for (const rule of SCORING_RULES) {
        const ruleAtoms = rule.atoms;
        if (Object.keys(ruleAtoms).length !== Object.keys(counts).length) continue;
        let match = true;
        for (const atom in ruleAtoms) {
            if (counts[atom] !== ruleAtoms[atom]) { match = false; break; }
        }
        if (match) return rule;
    }
    return null;
}

function toSubscript(str) {
    if (str.includes('Diamond')) return 'C (Diamond)';
    return str.replace(/(\d+)/g, '<sub>$1</sub>');
}

function generateDeck() {
    let d = [];
    Object.keys(CARD_DATA).forEach(symbol => {
        const count = CARD_DATA[symbol].count;
        for (let i = 0; i < count; i++) d.push(symbol);
    });
    return d.sort(() => Math.random() - 0.5);
}

function showResultScreen() {
    const me = gameState.players.find(p => p.id === myId);

    // Calculate Rank
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const myRank = sortedPlayers.findIndex(p => p.id === myId) + 1;

    // Auto submit if not done yet
    if (me && !scoreSubmitted) {
        submitScoreToGas(me.name, me.score);
        scoreSubmitted = true;
    }

    gameScreen.innerHTML = `
        <div style="text-align: center;">
            <h2>最終結果</h2>
            
            <div style="font-size: 1.5rem; color: #666; font-weight: bold; margin-bottom: 0.5rem;">
                第 ${myRank} 位
            </div>

            <div style="font-size: 3rem; margin-bottom:1rem;">
                ${me ? me.score : 0} <span style="font-size:1rem;">Points</span>
            </div>
            
            <div class="ranking-display">
                <table class="ranking-table">
                    <thead><tr><th>Rank</th><th>Name</th><th>Score</th></tr></thead>
                    <tbody>
                        ${gameState.players.sort((a, b) => b.score - a.score).map((p, i) => `
                            <tr class="${p.id === myId ? 'highlight-row' : ''}">
                                <td>${i + 1}</td>
                                <td>${p.name}</td>
                                <td>${p.score}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <button class="btn" onclick="location.reload()">もう一度</button>
        </div>
    `;
    gameScreen.classList.remove('hidden');
}

async function submitScoreToGas(name, score) {
    console.log(`Submitting score for ${name}: ${score}`);
    const url = `${GAS_URL}?type=原子ポーカー&action=save&gameMode=multi&name=${encodeURIComponent(name)}&score=${score}`;
    fetch(url).then(res => res.json()).then(data => console.log(data)).catch(e => console.error(e));
}


// Alias for HTML button
function handleAction() {
    handlePlayerAction();
}

function renderTable() {
    // Safety check
    if (!gameState.discards) gameState.discards = [];

    // Update Deck Count
    if (deckCountEl) deckCountEl.textContent = gameState.deck.length;

    // Update Discards
    if (discardPoolEl) {
        discardPoolEl.innerHTML = '';
        gameState.discards.forEach(symbol => {
            const cardData = CARD_DATA[symbol];
            if (!cardData) return; // Skip invalid cards

            const card = document.createElement('div');
            card.className = 'discard-card';
            card.innerHTML = toSubscript(symbol);
            card.style.color = cardData.textColor;
            card.style.backgroundColor = cardData.color;
            // Optional: add subtle border
            card.style.border = '1px solid rgba(0,0,0,0.1)';
            discardPoolEl.appendChild(card);
        });
    }
}

// --- Yaku Modal Logic ---
// Make global for button onclick
window.openYakuModal = openYakuModal;
window.closeYakuModal = closeYakuModal;

function openYakuModal() {
    document.getElementById('yaku-modal').classList.remove('hidden');
    renderYakuList();
}

function closeYakuModal() {
    document.getElementById('yaku-modal').classList.add('hidden');
}

function renderYakuList() {
    const tbody = document.getElementById('yaku-list-body');
    // If already rendered, don't re-render unless empty (e.g. initial load)
    if (tbody.children.length > 0) return;

    // Use SCORING_RULES from data.js
    tbody.innerHTML = SCORING_RULES.map(rule => `
        <tr>
            <td style="font-weight:bold; font-family: 'Times New Roman', serif; font-size: 1.1rem; white-space: nowrap;">
                ${formatFormulaScoring(rule.formula)}
            </td>
            <td>${rule.name || '-'}</td>
            <td style="font-weight:bold; color:#10b981; white-space: nowrap;">${rule.points} pts</td>
        </tr>
    `).join('');
}

function formatFormulaScoring(formula) {
    // Basic H2O -> H<sub>2</sub>O replacement logic
    return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}

// Close modal if clicked outside content
document.getElementById('yaku-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'yaku-modal') {
        closeYakuModal();
    }
});
