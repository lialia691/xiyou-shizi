// app.js - 【模块化重构版】西游识字游戏应用

// ===== 工具函数 =====
const Utils = {
    // 辅助函数：同时绑定 click 和 touchstart，并添加日志
    addSafeEventListener(element, handler) {
        let hasFired = false;
        let timer;

        const eventHandler = (event) => {
            if (hasFired) return;

            event.preventDefault();
            event.stopPropagation();

            console.log(`事件触发成功! 元素:`, element);

            hasFired = true;
            handler(event);

            clearTimeout(timer);
            timer = setTimeout(() => { hasFired = false; }, 500);
        };

        element.addEventListener('touchstart', eventHandler, { passive: false });
        element.addEventListener('click', eventHandler);
    },

    // 异步延迟函数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ===== 游戏状态管理 =====
const GameState = {
    // 基础状态
    lives: 0,
    score: 0,
    currentLevelIndex: 0,
    currentCharacterIndex: 0,
    highestLevelUnlocked: 0,
    correctPinyin: '',

    // 游戏数据
    collectedItems: {},
    hasMadeMistakeOnCurrentQuestion: false,

    // 常量
    BASE_LIVES: 3,

    // 状态更新方法
    reset() {
        this.lives = 0;
        this.score = 0;
        this.currentLevelIndex = 0;
        this.currentCharacterIndex = 0;
        this.correctPinyin = '';
        this.collectedItems = {};
        this.hasMadeMistakeOnCurrentQuestion = false;
    },

    initializeLevel(levelIndex) {
        this.currentLevelIndex = levelIndex;
        this.currentCharacterIndex = 0;
        this.lives = this.BASE_LIVES + levelIndex;
        this.hasMadeMistakeOnCurrentQuestion = false;
    },

    decreaseLife() {
        this.lives--;
        return this.lives;
    },

    increaseScore() {
        this.score += 1;
        return this.score;
    },

    decreaseScore() {
        this.score = Math.max(0, this.score - 1);
        return this.score;
    },

    nextCharacter() {
        this.currentCharacterIndex++;
        this.hasMadeMistakeOnCurrentQuestion = false;
    },

    isLevelComplete() {
        const currentLevelData = gameData[this.currentLevelIndex];
        return this.currentCharacterIndex >= currentLevelData.characters.length;
    },

    saveProgress() {
        this.highestLevelUnlocked = Math.max(this.highestLevelUnlocked, this.currentLevelIndex + 1);
        localStorage.setItem('xiyou-shizi-progress', this.highestLevelUnlocked);
    },

    loadProgress() {
        const savedProgress = localStorage.getItem('xiyou-shizi-progress');
        if (savedProgress) {
            this.highestLevelUnlocked = parseInt(savedProgress, 10);
        }
    }
};

// ===== UI管理模块 =====
const UI = {
    // DOM元素引用
    routeMapView: document.getElementById('route-map-view'),
    gameView: document.getElementById('game-view'),
    levelNodesContainer: document.getElementById('level-nodes-container'),
    failModal: document.getElementById('fail-modal'),
    levelCompleteModal: document.getElementById('level-complete-modal'),
    continueBtn: document.getElementById('continue-btn'),
    retryBtn: document.getElementById('retry-btn'),
    livesTrackerEl: document.getElementById('lives-tracker'),
    scoreTrackerEl: document.getElementById('score-tracker'),
    progressTrackerEl: document.getElementById('progress-tracker'),
    sceneTitleEl: document.getElementById('scene-title'),
    sceneImageEl: document.getElementById('scene-image'),
    characterDisplayEl: document.getElementById('character-display'),
    characterTextEl: document.getElementById('character-text'),
    optionButtons: document.querySelectorAll('.option-btn'),
    feedbackMessageEl: document.getElementById('feedback-message'),
    modalTitleEl: document.getElementById('modal-title'),
    modalMessageEl: document.getElementById('modal-message'),
    optionsContainer: document.querySelector('.options-container'),
    putiAdviceEl: document.getElementById('puti-advice'),
    putiRecommendationEl: document.getElementById('puti-recommendation'),

    // 音效
    levelCompleteSound: new Audio('sounds/level-complete.mp3'),
    failSound: new Audio('sounds/fail-sound.mp3'),

    // UI更新方法
    updateLivesDisplay() {
        this.livesTrackerEl.textContent = '❤️'.repeat(GameState.lives);
    },

    updateScoreDisplay() {
        this.scoreTrackerEl.textContent = `分数: ${GameState.score}`;
    },

    updateProgressDisplay() {
        const currentLevelData = gameData[GameState.currentLevelIndex];
        this.progressTrackerEl.textContent = `${GameState.currentCharacterIndex + 1} / ${currentLevelData.characters.length}`;
    },

    showMapView() {
        this.renderRouteMap();
        this.gameView.classList.add('hidden');
        this.routeMapView.classList.remove('hidden');
    },

    showGameView() {
        this.routeMapView.classList.add('hidden');
        this.gameView.classList.remove('hidden');
    },

    showModal(modalElement) {
        modalElement.classList.remove('hidden');
    },

    hideModal(modalElement) {
        modalElement.classList.add('hidden');
    },

    renderRouteMap() {
        console.log('🗺️ 正在渲染路线图...');
        this.levelNodesContainer.innerHTML = '';

        if (!gameData || gameData.length === 0) {
            console.error('❌ 无法渲染路线图：游戏数据为空');
            this.levelNodesContainer.innerHTML = '<div style="text-align: center; color: red;">游戏数据加载失败，请刷新页面重试</div>';
            return;
        }

        console.log(`🗺️ 渲染 ${gameData.length} 个关卡节点`);
        gameData.forEach((level, index) => {
            const node = document.createElement('div');
            node.classList.add('level-node');
            node.textContent = level.scene;
            node.dataset.levelIndex = index;

            let icon = '';
            if (index < GameState.highestLevelUnlocked) {
                node.classList.add('completed');
                icon = '✅';
            } else if (index === GameState.highestLevelUnlocked) {
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

            this.levelNodesContainer.appendChild(node);
        });
    },

    updateFeedbackMessage(message, color = '#333') {
        this.feedbackMessageEl.textContent = message;
        this.feedbackMessageEl.style.color = color;
    },

    resetOptionButtons() {
        this.optionButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct-option', 'wrong-option', 'playing');
        });
    },

    disableOptionButtons() {
        this.optionButtons.forEach(btn => btn.disabled = true);
    },

    updateSceneDisplay(levelData) {
        this.sceneTitleEl.textContent = levelData.scene;

        if (levelData.image) {
            this.sceneImageEl.src = levelData.image;
            this.sceneImageEl.style.display = 'block';
        } else {
            this.sceneImageEl.style.display = 'none';
        }
    },

    updateCharacterDisplay(characterData) {
        this.characterTextEl.textContent = characterData.char;
    },

    generateQuizOptions(characterData) {
        GameState.correctPinyin = characterData.pinyin;

        // 生成干扰项
        const allPinyins = gameData.flatMap(level =>
            level.characters.map(char => char.pinyin)
        );

        // 去重并过滤掉正确答案
        const wrongOptions = [...new Set(allPinyins)]
            .filter(pinyin => pinyin !== GameState.correctPinyin)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        // 组合所有选项
        const allOptions = [GameState.correctPinyin, ...wrongOptions]
            .sort(() => Math.random() - 0.5);

        // 更新按钮显示
        this.optionButtons.forEach((btn, index) => {
            const pinyin = allOptions[index];
            btn.dataset.pinyin = pinyin;
            btn.innerHTML = `<span class="option-pinyin-only">${pinyin}</span>`;
            btn.classList.add('pinyin-option');
        });
    }
};

// ===== 游戏逻辑模块 =====
const GameLogic = {
    // 开始指定关卡
    startLevel(levelIndex) {
        GameState.initializeLevel(levelIndex);
        this.loadQuestion();
        UI.showGameView();
    },

    // 加载题目
    loadQuestion() {
        if (GameState.currentCharacterIndex !== this.lastLoadedCharacterIndex) {
            GameState.hasMadeMistakeOnCurrentQuestion = false;
            this.lastLoadedCharacterIndex = GameState.currentCharacterIndex;
        }

        const levelData = gameData[GameState.currentLevelIndex];
        const characterData = levelData.characters[GameState.currentCharacterIndex];

        // 更新UI显示
        UI.updateSceneDisplay(levelData);
        UI.updateCharacterDisplay(characterData);
        UI.updateFeedbackMessage('请选择正确的拼音');
        UI.updateLivesDisplay();
        UI.updateScoreDisplay();
        UI.updateProgressDisplay();
        UI.resetOptionButtons();
        UI.generateQuizOptions(characterData);
    },

    // 检查答案
    async checkAnswer(selectedPinyin, clickedButton) {
        // 播放拼音发音
        if (selectedPinyin && speechSystem && !speechSystem.isPlaying) {
            clickedButton.classList.add('playing');
            await this.playPinyinOnly(selectedPinyin);

            // 移除播放动画
            await Utils.sleep(300);
            clickedButton.classList.remove('playing');
        }

        // 短暂延迟后处理答题逻辑
        await Utils.sleep(300);

        UI.disableOptionButtons();

        if (selectedPinyin === GameState.correctPinyin) {
            await this.handleCorrectAnswer(clickedButton);
        } else {
            await this.handleWrongAnswer(clickedButton);
        }
    },

    // 处理正确答案
    async handleCorrectAnswer(clickedButton) {
        clickedButton.classList.add('correct-option');
        UI.characterDisplayEl.classList.add('correct');

        if (!GameState.hasMadeMistakeOnCurrentQuestion) {
            GameState.increaseScore();
            const currentItem = gameData[GameState.currentLevelIndex].item;
            GameState.collectedItems[currentItem.name]++;
            UI.updateScoreDisplay();
            UI.updateFeedbackMessage(`答对了！得1分和一个${currentItem.icon}`, 'green');
        } else {
            UI.updateFeedbackMessage('答对了，继续上路！（本题不计分）', 'blue');
        }

        await Utils.sleep(1200);

        UI.characterDisplayEl.classList.remove('correct');
        GameState.nextCharacter();

        if (GameState.isLevelComplete()) {
            this.showLevelCompleteModal();
        } else {
            this.loadQuestion();
        }
    },

    // 处理错误答案
    async handleWrongAnswer(clickedButton) {
        GameState.hasMadeMistakeOnCurrentQuestion = true;
        GameState.decreaseLife();
        GameState.decreaseScore();

        const currentItem = gameData[GameState.currentLevelIndex].item;
        GameState.collectedItems[currentItem.name] = Math.max(0, GameState.collectedItems[currentItem.name] - 1);

        UI.updateLivesDisplay();
        UI.updateScoreDisplay();
        clickedButton.classList.add('wrong-option');

        // 显示正确答案
        const correctButton = [...UI.optionButtons].find(btn => btn.dataset.pinyin === GameState.correctPinyin);
        if (correctButton) correctButton.classList.add('correct-option');

        UI.updateFeedbackMessage(`答错了！扣1分和1个${currentItem.icon}`, 'red');

        await Utils.sleep(2000);

        if (GameState.lives <= 0) {
            UI.failSound.play();
            UI.showModal(UI.failModal);
        } else {
            this.loadQuestion();
        }
    },

    // 播放拼音发音
    async playPinyinOnly(pinyin) {
        try {
            if (!speechSystem || speechSystem.isPlaying) {
                console.log('⏸️ 语音系统忙碌中，跳过播放');
                return;
            }
            await speechSystem.speakPinyin(pinyin);
        } catch (error) {
            console.error('播放拼音失败:', error);
        }
    },

    // 显示关卡完成弹窗
    showLevelCompleteModal() {
        UI.levelCompleteSound.play();

        let itemsSummary = Object.keys(GameState.collectedItems)
            .filter(key => GameState.collectedItems[key] > 0)
            .map(key => {
                const icon = gameData.find(level => level.item.name === key).item.icon;
                return `${GameState.collectedItems[key]}个${icon}`;
            }).join('，');

        UI.modalTitleEl.textContent = `恭喜过此关!徒儿，取经路上等你`;
        UI.modalMessageEl.innerHTML = `<h3>当前总分: ${GameState.score}</h3><p>已获得: ${itemsSummary}</p>`;
        UI.showModal(UI.levelCompleteModal);
    },

    // 记录学习结果
    recordAnswer(charId, isCorrect, responseTime) {
        if (typeof recordLearningResult === 'function') {
            recordLearningResult(charId, isCorrect, responseTime);
        }

        // 延迟更新AI菩提面板
        setTimeout(async () => {
            await PutiSystem.updatePanel();
        }, 1000);
    }
};

// 设置静态属性
GameLogic.lastLoadedCharacterIndex = -1;

// ===== AI菩提系统模块 =====
const PutiSystem = {
    async updatePanel() {
        if (!UI.putiAdviceEl || !UI.putiRecommendationEl) return;

        // 获取AI菩提的建议
        const advice = this.getAdvice();
        const recommendation = await this.getRecommendation();

        // 更新建议内容
        if (advice && advice.length > 0) {
            UI.putiAdviceEl.innerHTML = advice.map(item =>
                `<div class="advice-item">
                    <span class="advice-icon">${item.icon}</span>
                    <span class="advice-text">${item.message}</span>
                </div>`
            ).join('');
        } else {
            UI.putiAdviceEl.innerHTML = '🧘‍♂️ 菩提正在为您分析学习情况...';
        }

        // 更新推荐内容
        if (recommendation) {
            const btnText = recommendation.type === 'review' ? '开始复习' : '继续学习';
            UI.putiRecommendationEl.innerHTML = `
                <div class="recommendation-info">
                    <p>${recommendation.reason}</p>
                    <div class="learning-progress">
                        <span class="progress-text">预计时间: ${recommendation.estimatedTime}分钟</span>
                    </div>
                </div>
                <button id="start-learning-btn" class="puti-btn">${btnText}</button>
            `;
        }
    },

    getAdvice() {
        return typeof getPutiAdvice === 'function' ? getPutiAdvice() : [];
    },

    async getRecommendation() {
        return typeof getPutiRecommendation === 'function' ? await getPutiRecommendation() : null;
    },

    async handleStartLearning() {
        console.log('🎯 开始AI推荐的学习内容');
        const recommendation = await this.getRecommendation();

        if (recommendation && recommendation.type === 'review') {
            console.log('📚 进入复习模式');
            GameLogic.startLevel(0); // 暂时跳转到第一关
        } else {
            const nextLevel = this.findNextUnlockedLevel();
            if (nextLevel !== null) {
                GameLogic.startLevel(nextLevel);
            } else {
                console.log('🎉 恭喜！您已完成所有关卡');
            }
        }
    },

    findNextUnlockedLevel() {
        for (let i = 0; i < gameData.length; i++) {
            if (i <= GameState.highestLevelUnlocked) {
                return i;
            }
        }
        return null;
    }
};



// ===== 事件处理模块 =====
const EventHandler = {
    // 初始化事件监听器
    init() {
        // 使用事件委托处理选项按钮点击
        if (UI.optionsContainer) {
            Utils.addSafeEventListener(UI.optionsContainer, this.handleOptionClick.bind(this));
        } else {
            // 如果没有容器，回退到单独绑定
            UI.optionButtons.forEach(btn => {
                Utils.addSafeEventListener(btn, this.handleOptionClick.bind(this));
            });
        }

        // 路线图节点点击事件委托
        Utils.addSafeEventListener(UI.levelNodesContainer, this.handleLevelNodeClick.bind(this));

        // 模态框按钮事件
        Utils.addSafeEventListener(UI.continueBtn, this.handleContinue.bind(this));
        Utils.addSafeEventListener(UI.retryBtn, this.handleRetry.bind(this));

        // AI菩提面板事件委托
        if (UI.putiRecommendationEl) {
            Utils.addSafeEventListener(UI.putiRecommendationEl, this.handlePutiClick.bind(this));
        }
    },

    // 处理选项按钮点击
    async handleOptionClick(event) {
        const clickedButton = event.target.closest('.option-btn');
        if (!clickedButton) return;

        const clickedPinyin = clickedButton.dataset.pinyin;
        if (!clickedPinyin) return;

        // 检查是否正在播放
        if (speechSystem && speechSystem.isPlaying) {
            console.log('⏸️ 语音正在播放中，跳过新的播放请求');
            return;
        }

        await GameLogic.checkAnswer(clickedPinyin, clickedButton);
    },

    // 处理关卡节点点击
    handleLevelNodeClick(event) {
        const levelNode = event.target.closest('.level-node');
        if (!levelNode || levelNode.classList.contains('locked')) return;

        const levelIndex = parseInt(levelNode.dataset.levelIndex, 10);
        if (!isNaN(levelIndex)) {
            GameLogic.startLevel(levelIndex);
        }
    },

    // 处理继续按钮
    handleContinue() {
        UI.hideModal(UI.levelCompleteModal);
        GameState.saveProgress();
        UI.showMapView();
    },

    // 处理重试按钮
    handleRetry() {
        UI.hideModal(UI.failModal);
        UI.showMapView();
    },

    // 处理AI菩提面板点击
    handlePutiClick(event) {
        const startLearningBtn = event.target.closest('#start-learning-btn');
        if (startLearningBtn) {
            PutiSystem.handleStartLearning();
        }
    }
};
// ===== 主应用模块 =====
const App = {
    // 初始化应用
    async init() {
        try {
            console.log('🚀 正在初始化西游识字游戏...');

            // 重置游戏状态
            GameState.reset();

            // 初始化AI菩提系统和数据处理器（包含CharacterProvider）
            console.log('🚀 正在初始化西游识字智能系统...');
            await initializeDataSystem();

            // 初始化语音系统（注入CharacterProvider）
            console.log('🔊 正在初始化语音系统...');
            const characterProvider = globalDataProcessor ? globalDataProcessor.characterProvider : null;
            await initSpeechSystem(characterProvider);

            // 更新游戏数据
            console.log('📊 正在获取游戏数据...');
            gameData = getGameData();
            console.log(`📊 获取到 ${gameData.length} 个关卡数据`);

            if (gameData.length === 0) {
                console.error('❌ 游戏数据为空！');
                throw new Error('游戏数据加载失败');
            }

            gameData.forEach(level => {
                if (level.item && level.item.name) {
                    GameState.collectedItems[level.item.name] = 0;
                } else {
                    console.warn(`⚠️ 关卡 ${level.scene} 缺少道具信息`);
                }
            });

            // 加载进度
            GameState.loadProgress();

            // 初始化事件处理器
            EventHandler.init();

            // 显示主界面
            UI.showMapView();
            await PutiSystem.updatePanel();

            console.log('✅ 西游识字游戏初始化完成！');

        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
        }
    }
};


// ===== 导出模块到全局作用域（用于测试和调试） =====
window.Utils = Utils;
window.GameState = GameState;
window.UI = UI;
window.GameLogic = GameLogic;
window.EventHandler = EventHandler;
window.PutiSystem = PutiSystem;
window.App = App;

// ===== 应用启动 =====
window.addEventListener('DOMContentLoaded', App.init);