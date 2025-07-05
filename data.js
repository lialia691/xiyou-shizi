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

// 游戏数据生成（只使用关卡生成器）
function getBackupGameData() {
    console.log('🎮 开始生成关卡数据...');

    // 直接使用关卡生成器，不要任何备用逻辑
    const generator = new LevelGenerator();
    const gameData = generator.generateLevels(20, 10); // 生成20关，每关10个字

    // 确保第一关是解锁的
    if (gameData.length > 0) {
        gameData[0].unlocked = true;
    }

    console.log(`✅ 成功生成 ${gameData.length} 个关卡`);
    return gameData;
}



// 兼容性：保持原有的 gameData 变量
let gameData = [];