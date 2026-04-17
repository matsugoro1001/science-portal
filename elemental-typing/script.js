let level = 1;
let hp = 3;
let score = 0;
let isPlaying = false;

// 進行管理
let projectiles = [];
let currentTarget = null; // 現在プレイヤーがタイピング対象としている弾
let typedString = ""; 

// モンスターごとのHP (この回数攻撃を相殺すれば一撃必殺フェーズへ)
const WAVES_PER_LEVEL = 10; 
let waveCount = 0; 
let spawnTimer = null;
let gameLoopId = null;

// 定数・DOM
const GAME_WIDTH = 800;
const START_X = 600; // 弾がスポーンするX座標（敵の少し左）
const END_X = 150;   // プレイヤ位置付近（これより低ければ被弾）

// レベルパラメータ
let speedBase = 1.0;
let spawnRateMs = 3000;
let maxComplexity = 1; // 1弾あたりの最大元素数

const hpDisplay = document.getElementById('hp-display');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const battleArea = document.getElementById('battle-area');
const projectilesContainer = document.getElementById('projectiles-container');
const targetWordEl = document.getElementById('target-word');
const inputWordEl = document.getElementById('input-word');
const enemyImg = document.getElementById('enemy-img');
const playerEl = document.getElementById('player');
const slashEffect = document.getElementById('slash-effect');

function getMonsterImageForLevel(lvl) {
    if (lvl === 1) return 'assets/monster_lv1_1776431573619.png';
    if (lvl === 2) return 'assets/monster_lv2_1776431589959.png';
    return 'assets/monster_lv3_1776431620893.png';
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    
    level = 1;
    hp = 3;
    score = 0;
    
    resetLevelParams();
    updateStats();
    
    isPlaying = true;
    projectiles = [];
    projectilesContainer.innerHTML = '';
    currentTarget = null;
    typedString = '';
    updateTypingDisplay();
    
    enemyImg.src = getMonsterImageForLevel(level);
    enemyImg.classList.remove('enemy-die');
    
    if (spawnTimer) clearTimeout(spawnTimer);
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    scheduleNextSpawn();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function resetLevelParams() {
    waveCount = 0;
    speedBase = 1.0 + (level * 0.4);
    spawnRateMs = Math.max(1000, 3500 - (level * 400));
    
    if (level === 1) maxComplexity = 1;
    else if (level <= 3) maxComplexity = 2;
    else maxComplexity = 3;
    
    enemyImg.src = getMonsterImageForLevel(level);
}

function generateTarget() {
    // レベルに応じて連結させる数を決める
    let count = 1;
    if (maxComplexity > 1) {
        // 確率で複数の元素を組み合わせた攻撃に
        count = Math.floor(Math.random() * maxComplexity) + 1;
    }
    
    let parts = [];
    for(let i = 0; i < count; i++) {
        // 現在のレベルに適した複雑さの要素をピックアップ
        let pool = elements.filter(e => e.complexity <= level);
        if (pool.length === 0) pool = elements;
        const el = pool[Math.floor(Math.random() * pool.length)];
        parts.push(el);
    }
    
    // 表示名(日本語)と正解文字列(記号連結)
    const displayName = parts.map(p => p.nameJP).join('・');
    const answerSymbol = parts.map(p => p.symbol).join('');
    
    return {
        id: Date.now() + Math.random(),
        displayName: displayName,
        answerSymbol: answerSymbol,
        x: START_X,
        elementRef: null
    };
}

function scheduleNextSpawn() {
    if (!isPlaying) return;
    
    // Wave上限までスポーン
    if (waveCount < WAVES_PER_LEVEL) {
        spawnProjectile();
        waveCount++;
        spawnTimer = setTimeout(scheduleNextSpawn, spawnRateMs + Math.random() * 1000);
    } else {
        // 全Waveスポーン後、弾がなくなるのを待つ
        checkLevelClear();
    }
}

function spawnProjectile() {
    const projData = generateTarget();
    
    const el = document.createElement('div');
    el.className = 'projectile';
    el.textContent = projData.displayName;
    // Y位置を少し散らす
    const randomYChange = (Math.random() - 0.5) * 50; 
    el.style.bottom = `calc(35% + ${randomYChange}px)`;
    el.style.left = projData.x + 'px';
    
    projData.elementRef = el;
    projectiles.push(projData);
    projectilesContainer.appendChild(el);
    
    updateTargetLock();
}

function checkLevelClear() {
    if (!isPlaying) return;
    if (waveCount >= WAVES_PER_LEVEL && projectiles.length === 0) {
        // レベルクリア演出
        isPlaying = false;
        
        // 剣士のダッシュ＆一閃
        playerEl.classList.add('player-dash');
        setTimeout(() => {
            slashEffect.classList.remove('hidden');
            slashEffect.classList.add('slash-anim');
            enemyImg.classList.add('shake');
        }, 200);
        
        setTimeout(() => {
            enemyImg.classList.add('enemy-die');
        }, 500);
        
        setTimeout(() => {
            playerEl.classList.remove('player-dash');
            slashEffect.classList.remove('slash-anim');
            slashEffect.classList.add('hidden');
            
            // レベルアップ画面
            const lvUpScreen = document.getElementById('level-up-screen');
            lvUpScreen.classList.remove('hidden');
            
            setTimeout(() => {
                lvUpScreen.classList.add('hidden');
                level++;
                levelDisplay.textContent = level;
                resetLevelParams();
                isPlaying = true;
                scheduleNextSpawn();
                gameLoopId = requestAnimationFrame(gameLoop);
            }, 2000);
            
        }, 1500);
    } else {
        // まだ弾が残っていれば少し待って再チェック
        setTimeout(checkLevelClear, 500);
    }
}

function gameLoop(timestamp) {
    if (!isPlaying) return;
    
    for (let i = 0; i < projectiles.length; i++) {
        const p = projectiles[i];
        p.x -= speedBase;
        p.elementRef.style.left = p.x + 'px';
        
        // 当たり判定 (画面左端、剣士の位置に到達)
        if (p.x < END_X) {
            takeDamage();
            p.elementRef.remove();
            projectiles.splice(i, 1);
            i--;
            
            // ダーゲットだった場合はリセット
            if (currentTarget && currentTarget.id === p.id) {
                clearTarget();
            }
        }
    }
    
    if (isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

function takeDamage() {
    hp--;
    updateStats();
    playerEl.classList.add('shake');
    setTimeout(() => playerEl.classList.remove('shake'), 400);
    
    if (hp <= 0) {
        gameOver();
    }
}

function updateStats() {
    hpDisplay.textContent = hp;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-screen').classList.remove('hidden');
    clearTimeout(spawnTimer);
}

// Typing Logic
window.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    
    // 文字キーのみ監視（Modifierや修飾キーを除外）
    if (e.key.length !== 1) return;
    
    const inputChar = e.key; // 大文字小文字そのまま
    
    if (!currentTarget) {
        // まだターゲットが決まっていない場合、入力された文字から始まる弾を探す
        // 一番左（Xが最小、つまり最も迫っている）のものから優先
        const sorted = [...projectiles].sort((a,b) => a.x - b.x);
        for (let p of sorted) {
            if (p.answerSymbol.startsWith(inputChar)) {
                currentTarget = p;
                typedString = inputChar;
                updateTargetLock();
                checkHit();
                break;
            }
        }
    } else {
        // すでにターゲットをロックしている場合、続きを入力
        const expectedChar = currentTarget.answerSymbol[typedString.length];
        if (inputChar === expectedChar) {
            // 正解
            typedString += inputChar;
            checkHit();
        } else {
            // 不正解 (ミス) -> 特にペナルティなしだが、入力は進まない
            // ターゲットロック解除して打ち直させる仕様もありだが、今回はロック維持
        }
    }
    
    updateTypingDisplay();
});

function checkHit() {
    if (!currentTarget) return;
    
    if (typedString === currentTarget.answerSymbol) {
        // 相殺成功
        score += currentTarget.answerSymbol.length * 10 * level;
        updateStats();
        
        // 撃墜エフェクト
        currentTarget.elementRef.classList.add('destroyed');
        
        // プレイヤー攻撃アニメ
        playerEl.style.transform = 'translateX(20px)';
        setTimeout(() => playerEl.style.transform = 'translateX(0)', 150);
        
        // 配列から削除
        const tObj = currentTarget;
        setTimeout(() => tObj.elementRef.remove(), 300); // アニメーション後にDOM削除
        
        projectiles = projectiles.filter(p => p.id !== currentTarget.id);
        clearTarget();
    }
}

function clearTarget() {
    currentTarget = null;
    typedString = '';
    updateTargetLock();
    updateTypingDisplay();
}

function updateTargetLock() {
    projectiles.forEach(p => {
        p.elementRef.classList.remove('active-target');
        if (currentTarget && p.id === currentTarget.id) {
            p.elementRef.classList.add('active-target');
        }
    });
}

function updateTypingDisplay() {
    if (currentTarget) {
        // ターゲットが存在する場合
        const fullWord = currentTarget.answerSymbol;
        // 未入力部分を取得
        const remaining = fullWord.substring(typedString.length);
        
        // 入力済みの部分と未入力部分を色分けして表示
        targetWordEl.innerHTML = `<span style="color:#00ffcc;">${typedString}</span>${remaining}`;
        inputWordEl.textContent = typedString;
    } else {
        targetWordEl.innerHTML = '---';
        inputWordEl.textContent = '';
    }
}
