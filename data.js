// data.js - 整合AI菩提系统的智能数据管理
// 基于高频汉字的动态关卡生成

// 全局数据管理器
let dataProcessor = null;
let aiPutiSystem = null;

// 初始化数据系统
async function initializeDataSystem() {
    try {
        // 初始化数据处理器
        dataProcessor = new DataProcessor();
        await dataProcessor.initialize();

        // 初始化AI菩提系统
        aiPutiSystem = new AIPutiSystem();
        await aiPutiSystem.initialize();

        console.log('🎯 智能数据系统初始化完成');
        return true;
    } catch (error) {
        console.error('数据系统初始化失败:', error);
        // 使用备用数据
        gameData = getBackupGameData();
        return false;
    }
}

// 动态获取游戏关卡数据
function getGameData() {
    // 如果已经有缓存的数据且数量足够，直接返回
    if (gameData && gameData.length >= 15) {
        console.log(`🎮 使用缓存的关卡数据: ${gameData.length} 个关卡`);
        return gameData;
    }

    if (dataProcessor && dataProcessor.initialized) {
        const data = dataProcessor.gameData;
        if (data && data.length > 0) {
            gameData = data; // 缓存数据
            console.log(`🎯 使用AI菩提系统数据: ${data.length} 个关卡`);
            return data;
        }
    }

    // 返回备用数据
    const backupData = getBackupGameData();
    gameData = backupData; // 缓存数据
    console.log(`🔄 使用备用关卡数据: ${backupData.length} 个关卡`);
    return backupData;
}

// 获取指定关卡数据
function getLevelData(level) {
    if (dataProcessor && dataProcessor.initialized) {
        return dataProcessor.getGameLevelData(level);
    }
    // 返回备用数据
    const backupData = getBackupGameData();
    return backupData.find(data => data.level === level);
}

// 获取AI菩提的学习建议
function getPutiRecommendation() {
    if (aiPutiSystem) {
        return aiPutiSystem.recommendNextLearning();
    }
    return {
        type: 'character_learning',
        characters: [],
        reason: '开始您的西游识字之旅吧！',
        estimatedTime: 10
    };
}

// 记录学习结果到AI系统
function recordLearningResult(charId, isCorrect, timeSpent) {
    if (aiPutiSystem) {
        aiPutiSystem.recordLearningResult(charId, isCorrect, timeSpent);
    }
}

// 获取AI菩提的智能建议
function getPutiAdvice() {
    if (aiPutiSystem) {
        return aiPutiSystem.generatePutiAdvice();
    }
    return [{
        type: 'welcome',
        message: '欢迎来到西游识字世界！让我们一起学习汉字吧。',
        icon: '🎓'
    }];
}

// 备用游戏数据（强制使用关卡生成器）
function getBackupGameData() {
    // 确保关卡生成器可用
    if (typeof LevelGenerator === 'undefined') {
        console.error('❌ 关卡生成器未加载！请检查 generate-levels.js 是否正确引入');
        // 强制等待并重试
        return waitForLevelGenerator();
    }

    const generator = new LevelGenerator();
    const gameData = generator.generateLevels(20, 10); // 生成20关，每关10个字

    // 确保第一关是解锁的
    if (gameData.length > 0) {
        gameData[0].unlocked = true;
    }

    console.log(`🎮 使用关卡生成器创建了 ${gameData.length} 个关卡`);
    return gameData;
}

// 等待关卡生成器加载的函数
function waitForLevelGenerator() {
    console.log('⏳ 等待关卡生成器加载...');

    // 如果关卡生成器仍然不可用，创建最小可用数据
    if (typeof LevelGenerator === 'undefined') {
        console.warn('⚠️ 关卡生成器加载失败，使用紧急备用数据');
        // 紧急情况下的最小数据，但仍然尝试创建20关
        console.error('🚨 紧急模式：手动创建关卡数据');
        const emergencyLevels = [];
        const basicChars = [
            { char: "的", pinyin: "de" }, { char: "一", pinyin: "yī" }, { char: "是", pinyin: "shì" },
            { char: "了", pinyin: "le" }, { char: "我", pinyin: "wǒ" }, { char: "不", pinyin: "bù" },
            { char: "在", pinyin: "zài" }, { char: "人", pinyin: "rén" }, { char: "有", pinyin: "yǒu" },
            { char: "他", pinyin: "tā" }, { char: "这", pinyin: "zhè" }, { char: "个", pinyin: "gè" },
            { char: "上", pinyin: "shàng" }, { char: "们", pinyin: "men" }, { char: "来", pinyin: "lái" },
            { char: "到", pinyin: "dào" }, { char: "时", pinyin: "shí" }, { char: "大", pinyin: "dà" },
            { char: "地", pinyin: "dì" }, { char: "为", pinyin: "wèi" }
        ];

        // 创建20关，每关10个字
        for (let i = 0; i < 20; i++) {
            const levelChars = [];
            for (let j = 0; j < 10; j++) {
                const charIndex = (i * 10 + j) % basicChars.length;
                const char = basicChars[charIndex];
                levelChars.push({
                    id: i * 10 + j + 1,
                    char: char.char,
                    pinyin: char.pinyin,
                    frequency: 100000000 - (i * 10 + j),
                    rank: i * 10 + j + 1
                });
            }

            emergencyLevels.push({
                level: i + 1,
                scene: `花果山水帘洞 第${i + 1}关`,
                image: "images/huaguoshan.jpg",
                background: "在东胜神洲傲来国花果山上，有一块仙石孕育出了石猴。",
                story: "石猴带领群猴发现了水帘洞，成为了美猴王。",
                item: { name: '香蕉', icon: '🍌' },
                difficulty: 'easy',
                estimatedTime: 20,
                unlocked: i === 0,
                characters: levelChars
            });
        }

        return emergencyLevels;
    }
}

// 兼容性：保持原有的 gameData 变量
let gameData = [];