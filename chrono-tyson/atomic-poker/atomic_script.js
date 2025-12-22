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
    startTime: 0
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
const lobbyInstructionEl = document.getElementById('lobby-instruction'); // For Lobby
const gameInstructionEl = document.getElementById('game-instruction'); // For Game
const handEl = document.getElementById('player-hand');
const opponentsContainer = document.getElementById('opponents-container');
const phaseDisplay = document.getElementById('phase-display');
const formedContainer = document.getElementById('formed-sets-container');
// Table Elements
const deckCountEl = document.getElementById('deck-count');
const discardPoolEl = document.getElementById('discard-pool');

// --- Lobby Logic ---

const usernameInput = document.getElementById('username-input');

// --- PeerJS Config (Hybrid Optimized: Original Game + Robust Connection) ---
const PEER_OPTS = {
    key: 'peerjs',
    debug: 2,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    }
};

const CONNECT_OPTS = {
    reliable: true
};

function getPlayerName() {
    const el = document.getElementById('username-input');
    return (el && el.value.trim()) ? el.value.trim() : `Player`;
}



function createRoom() {
    role = 'host';
    // Initialize Peer with Short ID and Robust Config
    peer = new Peer(generateShortId(), PEER_OPTS);

    peer.on('open', (id) => {
        myId = id;
        myRoomIdEl.textContent = id;
        hostInfo.classList.remove('hidden');
        hostInfo.classList.remove('hidden');
        // Add self to players
        const myName = getPlayerName() === 'Player' ? 'Player 1 (Host)' : getPlayerName();
        gameState.players = [{ id: myId, name: myName, isDone: false, score: 0 }];
        updateLobbyUI();
    });

    peer.on('connection', (c) => {
        // Incoming connection
        c.on('open', () => {
            console.log('Peer connected:', c.peer);
            connections.push(c);

            // Auto-assign name or use Metadata
            let name = c.metadata && c.metadata.name ? c.metadata.name : `Player ${gameState.players.length + 1}`;
            // Prevent duplicate names? (Optional simple logic: append ID if duplicate... skipping for simplicity)

            gameState.players.push({ id: c.peer, name: name, isDone: false, score: 0 });

            // Send current lobby state
            broadcastState();
            updateLobbyUI();

            // Listen for data
            c.on('data', (data) => handleHostData(c.peer, data));
        });

        c.on('error', (err) => console.error('Connection Error:', err));
    });

    peer.on('error', (err) => console.error('Peer Error:', err));
}

function joinRoom() {
    const roomId = document.getElementById('join-id').value.trim().toUpperCase(); // Correct ID
    const nickname = document.getElementById('username-input').value || 'Player'; // Correct ID
    const joinBtn = document.getElementById('join-btn'); // Get button

    if (!roomId) {
        alert('部屋IDを入力してください');
        if (joinBtn) {
            joinBtn.disabled = false;
            joinBtn.textContent = '参加する';
        }
        return;
    }

    // Disable button to prevent double clicks
    if (joinBtn) {
        joinBtn.disabled = true;
        joinBtn.textContent = '接続中...';
    }

    role = 'client';
    hostId = roomId; // Changed inputId to roomId

    // Client also uses Short ID + Robust Config
    peer = new Peer(generateShortId(), PEER_OPTS);

    peer.on('open', (id) => {
        myId = id;
        joinStatusEl.textContent = '接続中... (15秒待ちます)';

        // Connect with metadata
        const connectOptions = { ...CONNECT_OPTS, metadata: { name: getPlayerName() } };
        conn = peer.connect(hostId, connectOptions);

        // Timeout Safety
        const connectionTimeout = setTimeout(() => {
            if (!conn || !conn.open) {
                joinStatusEl.textContent = 'タイムアウト: 接続できませんでした';
                if (conn) conn.close();
            }
        }, 15000);

        conn.on('open', () => {
            clearTimeout(connectionTimeout);
            joinStatusEl.textContent = '接続成功！ (Connected)';
            joinStatusEl.style.color = 'green';

            // Show waiting message in LOBBY
            if (lobbyInstructionEl) {
                lobbyInstructionEl.textContent = "ホストがゲームを開始するのを待っています...";
                lobbyInstructionEl.classList.remove('hidden');
            }

            // Lock UI
            document.getElementById('join-id').disabled = true;
            document.querySelector('.lobby-card button').disabled = true;

            // Do NOT hide lobbyScreen here. Wait for state update to switch to game.
        });

        conn.on('data', (data) => handleClientData(data));
        conn.on('error', (err) => {
            console.error('Conn Error:', err);
            joinStatusEl.textContent = '通信エラー発生';
        });
    });

    peer.on('error', (err) => {
        console.error('Peer Error:', err);
        joinStatusEl.textContent = 'ID作成エラー';
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
    gameState.phase = 'exchange1';
    // gameState.turnIndex = 0; // Removed for Simultaneous Play

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

    if (gameState.phase.startsWith('exchange')) {
        // Allow simultaneous actions


        if (data.type === 'action_exchange') {
            // Simultaneous Processing: Just update hand and mark done
            const keptCards = data.kept;
            const discardedCards = data.discarded;

            gameState.discards.push(...discardedCards);
            const newCards = drawFromDeck(discardedCards.length);
            player.hand = [...keptCards, ...newCards];
            player.isDone = true; // Mark as done for this phase

            // Broadcast immediately so others see "Thinking" -> "Done"
            broadcastState();

            // Check if everyone is done
            checkRoundCompletion();
        }
    } else if (data.type === 'action_finish_form') {
        // Form phase is simultaneous
        player.score = data.score;
        player.formedSets = data.formedSets;
        player.isDone = true;

        // Broadcast immediately so status updates
        broadcastState();

        checkRoundCompletion();
    }
}

function checkRoundCompletion() {
    const allDone = gameState.players.every(p => p.isDone);

    if (allDone) {
        // Move to next phase
        if (gameState.phase === 'exchange1') {
            gameState.phase = 'exchange2';
            resetPlayerStatus();
        } else if (gameState.phase === 'exchange2') {
            gameState.phase = 'form';
            resetPlayerStatus();
        } else if (gameState.phase === 'form') {
            gameState.phase = 'result';
            // result phase doesn't need status reset per se, but good practice
        }

        broadcastState();
        handleStateUpdate(gameState);
    } else {
        // Just update state (already broadcast inside handleHostData for individual updates)
        handleStateUpdate(gameState);
    }
}

function resetPlayerStatus() {
    gameState.players.forEach(p => p.isDone = false);
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
    } else if (data.type === 'force_restart') {
        console.log("Received Force Restart command");
        const newState = JSON.parse(data.state);
        resetLocalGame();
        handleStateUpdate(newState);
    }
}

function resetLocalGame() {
    myScore = 0;
    myFormedSets = [];
    mySelectedIndices = [];
    myHand = []; // Clear hand to allow new deal sync
    scoreSubmitted = false;
    document.getElementById('formed-sets-container').innerHTML =
        '<div style="width: 100%; text-align: center; color: #64748b; font-size: 0.9rem;">作った化学式がここに置かれます</div>';

    // Explicitly hide result screen to ensure transition
    document.getElementById('result-screen').classList.add('hidden');
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
        // Simultaneous Turn
        // Use 'me' found above
        if (me && !me.isDone) {
            isMyTurn = true;
        } else {
            waitingText = '他のプレイヤーの完了待ち...';
        }
    } else if (gameState.phase === 'form') {
        // Simultaneous
        if (me && !me.isDone) isMyTurn = true;
        else waitingText = '他のプレイヤーの完了待ち...';
    }

    if (me && isMyTurn) {
        // I need to act
        renderHand(true); // Interactive
        updateInstruction();
        if (statusHeader) {
            statusHeader.textContent = `${getPhaseName(gameState.phase)}`; // Neutral text
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

        if (gameInstructionEl) gameInstructionEl.textContent = waitingText;

        // Hide action button or disable
        const btn = document.getElementById('action-btn');
        if (btn) {
            btn.classList.add('hidden');
            btn.disabled = true;
        }
    }

    if (gameState.phase === 'result') {
        lobbyScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        showResultScreen();
    } else if (gameState.phase !== 'lobby') {
        // Game active
        document.getElementById('result-screen').classList.add('hidden');
        gameScreen.classList.remove('hidden');
        // ...
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
        if (gameInstructionEl) gameInstructionEl.textContent = 'いらないカードを選んで「交換」を押してください';
        btn.textContent = 'これらを捨てる (交換)';
        btn.className = 'btn danger';

        // Special: If no cards selected, "Skip Exchange"
        if (mySelectedIndices.length === 0) {
            btn.textContent = '交換せずに次へ';
            btn.className = 'btn primary';
        }
    } else if (gameState.phase === 'form') {
        if (gameInstructionEl) gameInstructionEl.textContent = '手札を選んで「結合」！ 終わったら「終了」ボタン';
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

    // UI Update for Waiting
    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
        finishBtn.textContent = '役作り完了！ 他のプレイヤーを待っています...';
        finishBtn.disabled = true;
        finishBtn.classList.remove('secondary');
        finishBtn.classList.add('disabled-look'); // styling
        finishBtn.style.backgroundColor = '#ccc';
        finishBtn.style.cursor = 'not-allowed';
    }
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

    // Auto submit if not done yet
    if (me && !scoreSubmitted) {
        submitScoreToGas(me.name, me.score);
        scoreSubmitted = true;
    }

    const resultScreen = document.getElementById('result-screen');
    const rankingList = document.getElementById('ranking-list');
    const finalScoreEl = document.getElementById('final-score');

    // Update Score
    if (finalScoreEl) finalScoreEl.textContent = me ? me.score : 0;

    // Calculate Rank for display (optional, can be done inside map)
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const myRank = sortedPlayers.findIndex(p => p.id === myId) + 1;

    // Update Ranking Table
    if (rankingList) {
        rankingList.innerHTML = gameState.players.sort((a, b) => b.score - a.score).map((p, i) => `
            <tr class="${p.id === myId ? 'highlight-row' : ''}">
                <td>${i + 1}</td>
                <td>${p.name}</td>
                <td>
                    <div style="font-weight:bold;">${p.score}</div>
                    <div style="font-size:0.8rem; color:#64748b;">${formatPlayerSets(p.formedSets)}</div>
                </td>
            </tr>
        `).join('');
    }

    // Make sure Replay button exists for Host
    // In index.html, the structure is static. We might need to inject the button if it's not there.
    // Let's check index.html. It has a 'action-bar' div (line 146).
    // We can inject buttons there.
    const actionBar = resultScreen.querySelector('.action-bar');
    if (actionBar) {
        actionBar.innerHTML = `
            ${role === 'host' ? `<button class="btn primary" onclick="restartGameHost()">同じメンバーで再戦</button>` : ''}
            <button class="btn" onclick="location.reload()">部屋から退出 (Topへ)</button>
        `;
    }

    resultScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
}

function formatPlayerSets(sets) {
    if (!sets || sets.length === 0) return 'なし';
    return sets.map(s => `${toSubscript(s.formula)}`).join(', ');
}

function restartGameHost() {
    try {
        console.log("Restarting game...");
        if (role !== 'host') {
            alert("Error: You are not host (" + role + ")");
            return;
        }

        // Create new state based on current simplified structure
        // We create a NEW object so handleStateUpdate can see the difference in 'oldPhase'
        const nextState = JSON.parse(JSON.stringify(gameState));

        nextState.deck = generateDeck();
        nextState.phase = 'exchange1';
        nextState.discards = [];

        nextState.players.forEach(p => {
            p.hand = drawFromDeck(7); // Note: drawFromDeck uses global gameState.deck? 
            // drawFromDeck modifies gameState.deck. We need to be careful.
            // Let's manually implement draw for nextState to avoid side effects on current global state 
            // until we switch.
        });

        // Actually, simpler:
        // 1. Manually reset UI because we know we are restarting.
        // 2. Then just update state.

        // Let's do the Copy method correctly.
        // However, drawFromDeck relies on 'gameState.deck'.

        // Better Fix:
        // Update global deck first (it's internal state).
        gameState.deck = generateDeck();

        // Create the 'new state' snapshot for players
        const players = gameState.players.map(p => ({
            ...p,
            hand: drawFromDeck(7), // Modifies gameState.deck
            isDone: false,
            formedSets: [],
            score: 0
        }));

        const newState = {
            phase: 'exchange1',
            deck: gameState.deck, // Remaining deck
            discards: [],
            players: players,
            startTime: Date.now()
        };

        // Broadcast
        console.log("Broadcasting FORCE RESTART...");
        const stateStr = JSON.stringify(newState);
        connections.forEach(c => c.send({ type: 'force_restart', state: stateStr }));

        // Local Update
        resetLocalGame(); // Host also resets local
        handleStateUpdate(newState);
        console.log("Game restarted successfully.");
    } catch (e) {
        console.error("Error restarting game:", e);
        alert("再戦エラー: " + e.message);
    }
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
window.restartGameHost = restartGameHost;

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
            <td style="font-size: 0.9rem; color: #555;">${rule.components || ''}</td>
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

// --- Yaku Modal Logic (Restored) ---
// Duplicate removed. Using original openYakuModal defined above.

// --- Deck Modal Logic ---
window.openDeckModal = openDeckModal;
window.closeDeckModal = closeDeckModal;

function openDeckModal() {
    document.getElementById('deck-modal').classList.remove('hidden');
    renderDeckInfo();
}

function closeDeckModal() {
    document.getElementById('deck-modal').classList.add('hidden');
}

function renderDeckInfo() {
    const deckContainer = document.getElementById('deck-info-container');
    if (deckContainer && deckContainer.children.length === 0) {
        let totalCards = 0;
        const rows = Object.entries(CARD_DATA).map(([symbol, data]) => {
            totalCards += data.count;
            return `
                <div style="display:flex; justify-content:space-between; padding: 4px; border-bottom: 1px solid #eee;">
                    <div>
                        <span style="display:inline-block; width:20px; text-align:center; font-weight:bold; color:${data.textColor}; background-color:${data.color}; border-radius:4px; margin-right:5px; border:1px solid #ccc;">${symbol}</span>
                        ${data.name}
                    </div>
                    <div style="font-weight:bold;">${data.count}枚</div>
                </div>
            `;
        }).join('');

        deckContainer.innerHTML = `
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                ${rows}
                <div style="margin-top:10px; font-size:0.8rem; color:#666;">※ +α は予備カード(無地)など</div>
            </div>
        `;
    }
}

// Close deck modal if clicked outside content
document.getElementById('deck-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'deck-modal') {
        closeDeckModal();
    }
});

