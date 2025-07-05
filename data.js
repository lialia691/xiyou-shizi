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
    if (dataProcessor && dataProcessor.initialized) {
        return dataProcessor.gameData;
    }
    // 返回备用数据
    return getBackupGameData();
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

// 备用游戏数据（兼容原有系统）
function getBackupGameData() {
    // 使用关卡生成器创建更多关卡
    if (typeof LevelGenerator !== 'undefined') {
        const generator = new LevelGenerator();
        const gameData = generator.generateLevels(20, 10); // 生成20关，每关10个字

        // 确保第一关是解锁的
        if (gameData.length > 0) {
            gameData[0].unlocked = true;
        }

        console.log(`🎮 使用关卡生成器创建了 ${gameData.length} 个关卡`);
        return gameData;
    }

    // 如果关卡生成器不可用，返回基础数据
    return [
        {
            level: 1,
            scene: "花果山水帘洞 第1关",
            image: "images/huaguoshan.jpg",
            background: "在东胜神洲傲来国花果山上，有一块仙石孕育出了石猴。",
            story: "石猴带领群猴发现了水帘洞，成为了美猴王。",
            item: { name: '香蕉', icon: '🍌' },
            difficulty: 'easy',
            estimatedTime: 20,
            unlocked: true,
            characters: [
                { id: 1, char: "的", pinyin: "de", frequency: 100000000, rank: 1 },
                { id: 2, char: "一", pinyin: "yī", frequency: 99999999, rank: 2 },
                { id: 3, char: "是", pinyin: "shì", frequency: 99999998, rank: 3 },
                { id: 4, char: "了", pinyin: "le", frequency: 99999997, rank: 4 },
                { id: 5, char: "我", pinyin: "wǒ", frequency: 99999996, rank: 5 },
                { id: 6, char: "不", pinyin: "bù", frequency: 99999995, rank: 6 },
                { id: 7, char: "在", pinyin: "zài", frequency: 99999994, rank: 7 },
                { id: 8, char: "人", pinyin: "rén", frequency: 99999993, rank: 8 },
                { id: 9, char: "有", pinyin: "yǒu", frequency: 99999992, rank: 9 },
                { id: 10, char: "他", pinyin: "tā", frequency: 99999991, rank: 10 }
            ]
        },
        {
            level: 2,
            scene: "花果山水帘洞 第2关",
            image: "images/huaguoshan.jpg",
            background: "美猴王在花果山继续修炼，学习更多的汉字。",
            story: "孙悟空带领猴子猴孙们在水帘洞中快乐生活。",
            item: { name: '桃子', icon: '🍑' },
            difficulty: 'easy',
            estimatedTime: 20,
            unlocked: false,
            characters: [
                { id: 11, char: "这", pinyin: "zhè", frequency: 99999990, rank: 11 },
                { id: 12, char: "个", pinyin: "gè", frequency: 99999989, rank: 12 },
                { id: 13, char: "上", pinyin: "shàng", frequency: 99999988, rank: 13 },
                { id: 14, char: "们", pinyin: "men", frequency: 99999987, rank: 14 },
                { id: 15, char: "来", pinyin: "lái", frequency: 99999986, rank: 15 },
                { id: 16, char: "到", pinyin: "dào", frequency: 99999985, rank: 16 },
                { id: 17, char: "时", pinyin: "shí", frequency: 99999984, rank: 17 },
                { id: 18, char: "大", pinyin: "dà", frequency: 99999983, rank: 18 },
                { id: 19, char: "地", pinyin: "dì", frequency: 99999982, rank: 19 },
                { id: 20, char: "为", pinyin: "wèi", frequency: 99999981, rank: 20 }
            ]
        },
        {
            level: 3,
            scene: "花果山水帘洞 第3关",
            image: "images/huaguoshan.jpg",
            background: "美猴王继续在花果山修炼，准备学习更多汉字。",
            story: "孙悟空开始思考如何让自己变得更强大。",
            item: { name: '椰子', icon: '🥥' },
            difficulty: 'easy',
            estimatedTime: 20,
            unlocked: false,
            characters: [
                { id: 21, char: "子", pinyin: "zi", frequency: 99999980, rank: 21 },
                { id: 22, char: "中", pinyin: "zhōng", frequency: 99999979, rank: 22 },
                { id: 23, char: "你", pinyin: "nǐ", frequency: 99999978, rank: 23 },
                { id: 24, char: "说", pinyin: "shuō", frequency: 99999977, rank: 24 },
                { id: 25, char: "生", pinyin: "shēng", frequency: 99999976, rank: 25 },
                { id: 26, char: "国", pinyin: "guó", frequency: 99999975, rank: 26 },
                { id: 27, char: "年", pinyin: "nián", frequency: 99999974, rank: 27 },
                { id: 28, char: "着", pinyin: "zhe", frequency: 99999973, rank: 28 },
                { id: 29, char: "就", pinyin: "jiù", frequency: 99999972, rank: 29 },
                { id: 30, char: "那", pinyin: "nà", frequency: 99999971, rank: 30 }
            ]
        }
    ];
}

// 兼容性：保持原有的 gameData 变量
let gameData = getBackupGameData();