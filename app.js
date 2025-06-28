// app.js - 【带日志的终极触摸优化版】

window.addEventListener('DOMContentLoaded', () => {

    // --- 【升级版】辅助函数：同时绑定 click 和 touchstart，并添加日志 ---
    function addSafeEventListener(element, handler) {
        let hasFired = false;
        let timer;

        const eventHandler = (event) => {
            if (hasFired) return;

            event.preventDefault();
            event.stopPropagation();

            // 【调试核心】在控制台打印日志，确认事件是否触发
            console.log(`事件触发成功! 元素:`, element);

            hasFired = true;
            handler(event);

            clearTimeout(timer);
            timer = setTimeout(() => { hasFired = false; }, 500);
        };

        // { passive: false } 确保 preventDefault 在移动端能生效
        element.addEventListener('touchstart', eventHandler, { passive: false });
        element.addEventListener('click', eventHandler);
    }

    // --- 视图和通用元素 (这部分不变) ---
    const routeMapView = document.getElementById('route-map-view');
    const gameView = document.getElementById('game-view');
    const levelNodesContainer = document.getElementById('level-nodes-container');
    const failModal = document.getElementById('fail-modal');
    const levelCompleteModal = document.getElementById('level-complete-modal');
    const continueBtn = document.getElementById('continue-btn');
    const retryBtn = document.getElementById('retry-btn');
    const livesTrackerEl = document.getElementById('lives-tracker');
    const scoreTrackerEl = document.getElementById('score-tracker');
    const progressTrackerEl = document.getElementById('progress-tracker');
    const sceneTitleEl = document.getElementById('scene-title');
    const sceneImageEl = document.getElementById('scene-image');
    const characterDisplayEl = document.getElementById('character-display');
    const optionButtons = document.querySelectorAll('.option-btn');
    const feedbackMessageEl = document.getElementById('feedback-message');
    const modalTitleEl = document.getElementById('modal-title');
    const modalMessageEl = document.getElementById('modal-message');
    const correctSound = new Audio('sounds/correct.mp3');
    const wrongSound = new Audio('sounds/wrong.mp3');
    const levelCompleteSound = new Audio('sounds/level-complete.mp3');
    const failSound = new Audio('sounds-fail-sound.mp3');
    const BASE_LIVES = 3;
    let lives, score, currentLevelIndex, currentCharacterIndex, correctPinyin;
    let collectedItems = {};
    let hasMadeMistakeOnCurrentQuestion;
    let highestLevelUnlocked = 0;

    // --- 路线图和视图管理 (这部分逻辑不变, 但事件绑定方式会变) ---
    function renderRouteMap() {
        levelNodesContainer.innerHTML = '';
        gameData.forEach((level, index) => {
            const node = document.createElement('div');
            node.classList.add('level-node');
            node.textContent = level.scene;
            node.dataset.levelIndex = index;
            let icon = '';
            if (index < highestLevelUnlocked) {
                node.classList.add('completed');
                icon = '✅';
            } else if (index === highestLevelUnlocked) {
                node.classList.add('unlocked');
                icon = '▶️';
            } else {
                node.classList.add('locked');
                icon = '🔒';
            }
            const statusIcon = document.createElement('span');
            statusIcon.className = 'status-icon';
            statusIcon.textContent = icon;
            node.appendChild(statusIcon);
            if (!node.classList.contains('locked')) {
                // 【应用新方法】
                addSafeEventListener(node, () => startGameForLevel(index));
            }
            levelNodesContainer.appendChild(node);
        });
    }
    function showMapView() { renderRouteMap(); gameView.classList.add('hidden'); routeMapView.classList.remove('hidden'); }
    function startGameForLevel(levelIndex) { currentLevelIndex = levelIndex; currentCharacterIndex = 0; lives = BASE_LIVES + currentLevelIndex; loadQuestion(); routeMapView.classList.add('hidden'); gameView.classList.remove('hidden'); }
    
    // --- 游戏内部逻辑 (这部分完全不变) ---
    function loadQuestion() { if (currentCharacterIndex !== this.lastLoadedCharacterIndex) { hasMadeMistakeOnCurrentQuestion = false; this.lastLoadedCharacterIndex = currentCharacterIndex; } const levelData = gameData[currentLevelIndex]; const characterData = levelData.characters[currentCharacterIndex]; sceneTitleEl.textContent = levelData.scene; characterDisplayEl.textContent = characterData.char; feedbackMessageEl.textContent = '请选择正确的拼音'; feedbackMessageEl.style.color = '#333'; updateLivesDisplay(); updateScoreDisplay(); progressTrackerEl.textContent = `${currentCharacterIndex + 1} / ${levelData.characters.length}`; if (levelData.image) { sceneImageEl.src = levelData.image; sceneImageEl.style.display = 'block'; } else { sceneImageEl.style.display = 'none'; } optionButtons.forEach(btn => { btn.disabled = false; btn.classList.remove('correct-option', 'wrong-option'); }); generateQuizOptions(characterData); }
    loadQuestion.lastLoadedCharacterIndex = -1;
    function handleOptionClick(event) { const clickedButton = event.target; const clickedPinyin = clickedButton.dataset.pinyin; optionButtons.forEach(btn => btn.disabled = true); if (clickedPinyin === correctPinyin) { correctSound.play(); clickedButton.classList.add('correct-option'); characterDisplayEl.classList.add('correct'); if (!hasMadeMistakeOnCurrentQuestion) { score += 1; const currentItem = gameData[currentLevelIndex].item; collectedItems[currentItem.name]++; updateScoreDisplay(); feedbackMessageEl.textContent = `答对了！得1分和一个${currentItem.icon}`; feedbackMessageEl.style.color = 'green'; } else { feedbackMessageEl.textContent = '答对了，继续上路！（本题不计分）'; feedbackMessageEl.style.color = 'blue'; } setTimeout(() => { characterDisplayEl.classList.remove('correct'); currentCharacterIndex++; const currentLevelData = gameData[currentLevelIndex]; if (currentCharacterIndex >= currentLevelData.characters.length) { showLevelCompleteModal(); } else { loadQuestion(); } }, 1200); } else { wrongSound.play(); hasMadeMistakeOnCurrentQuestion = true; lives--; score = score - 1; const currentItem = gameData[currentLevelIndex].item; collectedItems[currentItem.name] = collectedItems[currentItem.name] - 1; updateLivesDisplay(); updateScoreDisplay(); clickedButton.classList.add('wrong-option'); const correctButton = [...optionButtons].find(btn => btn.dataset.pinyin === correctPinyin); if (correctButton) correctButton.classList.add('correct-option'); feedbackMessageEl.textContent = `答错了！扣1分和1个${currentItem.icon}`; feedbackMessageEl.style.color = 'red'; setTimeout(() => { if (lives <= 0) { failSound.play(); failModal.classList.remove('hidden'); } else { loadQuestion(); } }, 2000); } }
    function showLevelCompleteModal() { levelCompleteSound.play(); let itemsSummary = Object.keys(collectedItems).filter(key => collectedItems[key] > 0).map(key => { const icon = gameData.find(level => level.item.name === key).item.icon; return `${collectedItems[key]}个${icon}`; }).join('，'); modalTitleEl.textContent = `恭喜过此关!徒儿，取经路上等你`; modalMessageEl.innerHTML = `<h3>当前总分: ${score}</h3><p>已获得: ${itemsSummary}</p>`; levelCompleteModal.classList.remove('hidden'); }
    function updateLivesDisplay() { livesTrackerEl.textContent = '❤️'.repeat(lives); }
    function updateScoreDisplay() { scoreTrackerEl.textContent = `分数: ${score}`; }
    function generateQuizOptions(correctCharacter) { correctPinyin = correctCharacter.pinyin; let options = [correctPinyin]; const allCharacters = gameData.flatMap(level => level.characters); while (options.length < 4) { const randomIndex = Math.floor(Math.random() * allCharacters.length); const randomPinyin = allCharacters[randomIndex].pinyin; if (!options.includes(randomPinyin)) { options.push(randomPinyin) } } options.sort(() => Math.random() - 0.5); optionButtons.forEach((btn, index) => { btn.textContent = options[index]; btn.dataset.pinyin = options[index] }); }

    // --- 【应用新方法】启动与事件绑定 ---
    function initializeApp() {
        score = 0;
        gameData.forEach(level => { collectedItems[level.item.name] = 0; });
        const savedProgress = localStorage.getItem('xiyou-shizi-progress');
        if (savedProgress) { highestLevelUnlocked = parseInt(savedProgress, 10); }

        // 为所有按钮绑定事件
        addSafeEventListener(continueBtn, () => {
            levelCompleteModal.classList.add('hidden');
            highestLevelUnlocked = Math.max(highestLevelUnlocked, currentLevelIndex + 1);
            localStorage.setItem('xiyou-shizi-progress', highestLevelUnlocked);
            showMapView();
        });
        addSafeEventListener(retryBtn, () => {
            failModal.classList.add('hidden');
            showMapView();
        });
        optionButtons.forEach(btn => {
            addSafeEventListener(btn, handleOptionClick);
        });

        showMapView();
    }

    initializeApp(); // 启动应用！
});