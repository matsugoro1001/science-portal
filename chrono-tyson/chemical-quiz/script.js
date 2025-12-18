// Removed import, assuming elements is global from data.js

let currentLanguage = 'JP'; // 'JP' or 'CN'
let currentMode = 'choice'; // 'choice' or 'matching'
let questionPool = [];
let currentQuestion = null;
let isAnswering = false;

// Time Attack State
let startTime = 0;
let penaltyTime = 0;
let timerInterval = null;
let questionsAnswered = 0;
const TOTAL_QUESTIONS_CHOICE = 20;

// Matching Mode State
let matchingRound = 1;
const MATCHING_ROUNDS = 1;
const PAIRS_PER_ROUND = 10;
let selectedCards = [];
let matchedPairs = 0;

// DOM Elements
let startScreen, quizScreen, matchingScreen, certificateScreen;
let timerEl, penaltyEl, questionCountEl, questionLabel, questionContent, optionsGrid, finalTimeEl;
let matchTimerEl, matchPenaltyEl, matchedCountEl, matchingGrid;
let langButtons;

document.addEventListener('DOMContentLoaded', () => {
    startScreen = document.getElementById('start-screen');
    quizScreen = document.getElementById('quiz-screen');
    matchingScreen = document.getElementById('matching-screen');
    certificateScreen = document.getElementById('certificate-screen');

    timerEl = document.getElementById('timer');
    penaltyEl = document.getElementById('penalty-indicator');
    questionCountEl = document.getElementById('question-count');
    questionLabel = document.getElementById('question-label');
    questionContent = document.getElementById('question-content');
    optionsGrid = document.getElementById('options-grid');
    finalTimeEl = document.getElementById('final-time');

    matchTimerEl = document.getElementById('match-timer');
    matchPenaltyEl = document.getElementById('match-penalty-indicator');
    matchedCountEl = document.getElementById('matched-count');
    matchingGrid = document.getElementById('matching-grid');

    // Language Selection
    langButtons = document.querySelectorAll('.toggle-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.value;
            updateFont();
        });
    });
});

function updateFont() {
    if (currentLanguage === 'JP') {
        document.body.style.fontFamily = "var(--font-jp), var(--font-main)";
    } else {
        document.body.style.fontFamily = "var(--font-cn), var(--font-main)";
    }
}

// Expose to window for HTML buttons
window.startGame = (mode) => {
    currentMode = mode;
    questionsAnswered = 0;
    penaltyTime = 0;
    startTime = Date.now();

    updateFont();

    startScreen.classList.add('hidden');
    startScreen.classList.remove('active');

    // Start Timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 50);

    if (mode === 'choice') {
        quizScreen.classList.remove('hidden');
        setTimeout(() => quizScreen.classList.add('active'), 50);
        initQuestionPool(TOTAL_QUESTIONS_CHOICE);
        nextQuestion();
    } else {
        matchingScreen.classList.remove('hidden');
        setTimeout(() => matchingScreen.classList.add('active'), 50);
        matchingRound = 1;
        initMatchingGame();
    }
};

window.resetGame = () => {
    certificateScreen.classList.add('hidden');
    certificateScreen.classList.remove('active');
    startScreen.classList.remove('hidden');
    setTimeout(() => startScreen.classList.add('active'), 50);
};

function updateTimer() {
    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    const totalTime = elapsed + penaltyTime;
    const timeStr = totalTime.toFixed(2);

    if (currentMode === 'choice') {
        timerEl.textContent = timeStr;
    } else {
        matchTimerEl.textContent = timeStr;
    }
}

// --- Choice Mode Logic ---

function initQuestionPool(count) {
    // Shuffle all elements and take the first 'count'
    const shuffled = [...elements].sort(() => Math.random() - 0.5);
    questionPool = shuffled.slice(0, count);
}

function nextQuestion() {
    if (questionPool.length === 0) {
        endGame();
        return;
    }

    isAnswering = true;
    questionCountEl.textContent = Math.min(questionsAnswered + 1, TOTAL_QUESTIONS_CHOICE);

    const correctElement = questionPool.pop();

    // Decide question type: 0 = Symbol->Name, 1 = Name->Symbol
    const questionType = Math.random() > 0.5 ? 0 : 1;

    currentQuestion = {
        element: correctElement,
        type: questionType
    };

    // Prepare UI
    if (questionType === 0) {
        // Show Symbol, ask for Name
        questionLabel.textContent = currentLanguage === 'JP' ? '物質名は何？' : '物质名称是什么？';
        questionContent.textContent = correctElement.symbol;
    } else {
        // Show Name, ask for Symbol
        questionLabel.textContent = currentLanguage === 'JP' ? '化学式は何？' : '化学式是什么？';
        questionContent.textContent = currentLanguage === 'JP' ? correctElement.nameJP : correctElement.nameCN;
    }

    // Generate Options
    const options = generateOptions(correctElement, questionType);
    renderOptions(options);
}

function generateOptions(correctElement, type) {
    const options = [correctElement];

    if (correctElement.tricky) {
        const shuffledTricky = [...correctElement.tricky].sort(() => Math.random() - 0.5);
        for (const trickySymbol of shuffledTricky) {
            if (options.length >= 4) break;
            const realElement = elements.find(e => e.symbol === trickySymbol);
            if (realElement) {
                if (!options.some(o => o.number === realElement.number)) {
                    options.push(realElement);
                }
            } else {
                if (type === 1) {
                    options.push({
                        number: -1,
                        symbol: trickySymbol,
                        nameJP: '',
                        nameCN: ''
                    });
                }
            }
        }
    }

    const pool = elements.filter(e => e.number !== correctElement.number);
    while (options.length < 4) {
        const randomDistractor = pool[Math.floor(Math.random() * pool.length)];
        const isDuplicate = options.some(o => o.number === randomDistractor.number);
        if (!isDuplicate) {
            options.push(randomDistractor);
        }
    }

    return options.sort(() => Math.random() - 0.5);
}

function renderOptions(options) {
    optionsGrid.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.type = 'button';

        if (currentQuestion.type === 0) {
            btn.textContent = currentLanguage === 'JP' ? opt.nameJP : opt.nameCN;
        } else {
            btn.textContent = opt.symbol;
        }

        btn.onclick = () => handleAnswer(opt, btn);
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(selectedElement, btn) {
    if (!isAnswering) return;
    if (btn.classList.contains('wrong')) return;

    const isCorrect = selectedElement.number === currentQuestion.element.number;

    if (isCorrect) {
        isAnswering = false;
        btn.classList.add('correct');
        questionsAnswered++;
        setTimeout(nextQuestion, 500);
    } else {
        btn.classList.add('wrong');
        penaltyTime += 10;
        showPenalty(penaltyEl);
        // User must try again
    }
}

// --- Matching Mode Logic ---

function initMatchingGame() {
    matchedCountEl.textContent = matchedPairs;
    matchedPairs = 0;
    selectedCards = [];
    matchingGrid.innerHTML = '';

    // Select pairs for this round
    // We need to ensure we don't repeat pairs across rounds if possible, 
    // or just shuffle everything and take chunks.
    // Ideally, we shuffle 'elements' once at start, then take 0-10, 10-20.

    // For simplicity, let's just shuffle all elements and take a slice based on round

    // Randomly select 10 elements for the game
    const randomElements = [...elements].sort(() => Math.random() - 0.5).slice(0, 10);

    // Update counter display
    matchedCountEl.textContent = `0 / 10`;

    // Create cards (10 pairs = 20 cards)
    let cards = [];
    randomElements.forEach(el => {
        cards.push({ type: 'symbol', value: el.symbol, id: el.number });
        cards.push({ type: 'name', value: currentLanguage === 'JP' ? el.nameJP : el.nameCN, id: el.number });
    });

    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);

    // Render cards
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'match-card';
        cardEl.innerHTML = `<span>${card.value}</span>`; // Use innerHTML and span wrapper
        cardEl.dataset.id = card.id;
        cardEl.onclick = () => handleCardClick(cardEl);
        matchingGrid.appendChild(cardEl);
    });
}

function handleCardClick(cardEl) {
    // Ignore if already matched or selected or 2 cards already selected
    if (cardEl.classList.contains('matched') ||
        cardEl.classList.contains('selected') ||
        selectedCards.length >= 2) {
        return;
    }

    cardEl.classList.add('selected');
    selectedCards.push(cardEl);

    if (selectedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = selectedCards;
    const match = card1.dataset.id === card2.dataset.id;

    if (match) {
        // Wait a bit to show the second selection
        setTimeout(() => {
            card1.classList.remove('selected');
            card2.classList.remove('selected');
            card1.classList.add('matched');
            card2.classList.add('matched');
            selectedCards = [];
            matchedPairs++;
            matchedCountEl.textContent = `${matchedPairs} / 10`;

            if (matchedPairs === 10) {
                endGame();
            }
        }, 300);
    } else {
        // Wait a bit to show the second selection, then show wrong state
        setTimeout(() => {
            card1.classList.add('wrong');
            card2.classList.add('wrong');

            // Penalty
            penaltyTime += 10;
            showPenalty(matchPenaltyEl);

            setTimeout(() => {
                card1.classList.remove('selected', 'wrong');
                card2.classList.remove('selected', 'wrong');
                selectedCards = [];
            }, 800);
        }, 300);
    }
}

function nextRound() {
    if (matchingRound < MATCHING_ROUNDS) {
        matchingRound++;
        initMatchingGame();
    } else {
        endGame();
    }
}

function showPenalty(el) {
    el.classList.add('active');
    setTimeout(() => {
        el.classList.remove('active');
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    const finalTime = currentMode === 'choice' ? timerEl.textContent : matchTimerEl.textContent;
    finalTimeEl.textContent = finalTime;

    quizScreen.classList.add('hidden');
    quizScreen.classList.remove('active');
    matchingScreen.classList.add('hidden');
    matchingScreen.classList.remove('active');

    certificateScreen.classList.remove('hidden');
    setTimeout(() => certificateScreen.classList.add('active'), 50);

    // Save Local History
    saveLocalHistory(parseFloat(finalTime), currentMode);

    checkRanking(parseFloat(finalTime));
}

// --- Ranking System ---
// --- Ranking System (Google Sheets) ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyoPJnTzenD0Af8Fg0F7xUA2UW9-gIKepeGiG2ouQ0MGBSq8k7_ZFDXjwKV3TbIAbpEWA/exec';
const SHEET_TYPE = 'chemical'; // '化学式' template

async function getRankings(mode) {
    try {
        const response = await fetch(`${GAS_URL}?type=${SHEET_TYPE}&t=${Date.now()}`);
        const data = await response.json();
        return data.filter(d => d.gameMode === mode).sort((a, b) => a.score - b.score);
    } catch (e) {
        console.error('Ranking Fetch Error:', e);
        return [];
    }
}

async function saveScoreToGas(mode, name, score) {
    try {
        const url = `${GAS_URL}?type=${SHEET_TYPE}&action=save&gameMode=${mode}&name=${encodeURIComponent(name)}&score=${score}`;
        await fetch(url);
    } catch (e) {
        console.error('Ranking Save Error:', e);
    }
}

async function checkRanking(score) {
    const newRecordForm = document.getElementById('new-record-form');
    const rankings = await getRankings(currentMode);

    if (rankings.length < 10 || score < rankings[rankings.length - 1].score) {
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
    const score = parseFloat(finalTimeEl.textContent);

    const btn = document.querySelector('#new-record-form button');
    btn.disabled = true;
    btn.textContent = '送信中...';

    await saveScoreToGas(currentMode, name, score);

    document.getElementById('new-record-form').classList.add('hidden');

    // Optimistic Update
    let rankings = await getRankings(currentMode);
    const alreadyExists = rankings.some(r => r.name === name && Math.abs(r.score - score) < 0.001);

    if (!alreadyExists) {
        rankings.push({ name, score, date: new Date().toISOString() });
    }

    rankings.sort((a, b) => a.score - b.score);
    renderRankingList(rankings);

    btn.disabled = false;
    btn.textContent = '登録';
};

async function renderRankingList(rankingsData = null) {
    const listEl = document.getElementById('ranking-list');
    listEl.innerHTML = '<tr><td colspan="4">読み込み中...</td></tr>';

    const rankings = rankingsData || await getRankings(currentMode);

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    listEl.innerHTML = rankings.slice(0, 10).map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r.name}</td>
            <td>${Number(r.score).toFixed(2)}s</td>
            <td>${formatDate(r.date)}</td>
        </tr>
    `).join('');

    // Also render local history
    renderLocalHistory();

    for (let i = rankings.length; i < 10; i++) {
        listEl.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>-</td>
                <td>--.--</td>
                <td>--/-- --:--</td>
            </tr>
        `;
    }
}
