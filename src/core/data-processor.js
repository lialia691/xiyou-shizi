// 数据处理器 - 整合数据管理和游戏内容生成
// 合并了原 data.js 的功能，提供统一的数据管理接口
class DataProcessor {
    constructor(characterProvider, storiesFilePath = './data/stories.json') {
        // 依赖注入：接收 CharacterProvider 实例
        this.characterProvider = characterProvider;
        this.storiesFilePath = storiesFilePath;

        // 内部状态
        this.gameData = [];
        this.storyTemplates = [];
        this.initialized = false;

        // 配置参数
        this.config = {
            charactersPerLevel: 10,
            maxLevels: 50,
            timePerCharacter: 2 // 分钟
        };
    }

    // 初始化数据处理器
    async initialize() {
        try {
            console.log('📚 正在初始化数据处理器...');

            // 确保 CharacterProvider 已加载
            if (!this.characterProvider.isDataLoaded()) {
                await this.characterProvider.load();
            }

            // 加载故事模板（外部化内容）
            await this.loadStoryTemplates();

            // 生成游戏数据
            await this.generateGameData();

            this.initialized = true;
            console.log('✅ 数据处理器初始化完成');

        } catch (error) {
            console.error('❌ 数据处理器初始化失败:', error);
            throw error;
        }
    }

    // 内容管理优化：从外部JSON文件加载故事模板
    async loadStoryTemplates() {
        try {
            console.log('📖 正在加载故事模板...');

            // 检测是否为本地文件协议
            const isLocalFile = window.location.protocol === 'file:';

            if (isLocalFile) {
                console.log('🔍 检测到本地文件访问，使用内置故事模板');
                this.storyTemplates = this.getBuiltinStoryTemplates();
            } else {
                // HTTP协议，正常加载外部文件
                const response = await fetch(this.storiesFilePath);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.storyTemplates = await response.json();
            }

            console.log(`✅ 成功加载 ${this.storyTemplates.length} 个故事模板`);

            // 验证故事模板格式
            this.validateStoryTemplates();

        } catch (error) {
            console.error('❌ 加载故事模板失败，使用内置模板:', error);
            this.storyTemplates = this.getBuiltinStoryTemplates();
        }
    }

    // 内置故事模板（用于本地文件访问时的回退）
    getBuiltinStoryTemplates() {
        return [
            {
                "scene": "花果山水帘洞",
                "image": "assets/images/huaguoshan.jpg",
                "background": "在东胜神洲傲来国花果山上，有一块仙石孕育出了石猴。",
                "characters": ["石", "猴", "山", "水", "洞", "仙", "王", "群", "众", "美"],
                "story": "石猴带领群猴发现了水帘洞，成为了美猴王。",
                "items": ["🍑桃子", "🍌香蕉", "🥥椰子", "🌸花朵"],
                "theme": "origin",
                "difficulty": "easy",
                "estimatedReadingTime": 2
            },
            {
                "scene": "龙宫借宝",
                "image": "assets/images/longgong.jpg",
                "background": "美猴王为了寻找趁手的兵器，来到了东海龙宫。",
                "characters": ["龙", "王", "宫", "宝", "金", "箍", "棒", "重", "万", "斤"],
                "story": "孙悟空在龙宫得到了如意金箍棒，重达一万三千五百斤。",
                "items": ["⚡金箍棒", "👑龙冠", "💎宝珠", "🌊海水"],
                "theme": "adventure",
                "difficulty": "normal",
                "estimatedReadingTime": 3
            },
            {
                "scene": "大闹天宫",
                "image": "assets/images/tiangong.jpg",
                "background": "孙悟空因为不满天庭的待遇，大闹天宫。",
                "characters": ["天", "宫", "玉", "帝", "神", "仙", "兵", "将", "战", "斗"],
                "story": "齐天大圣孙悟空与天兵天将大战，闹得天宫不得安宁。",
                "items": ["🔥火眼金睛", "☁️筋斗云", "⚔️兵器", "🏰天宫"],
                "theme": "battle",
                "difficulty": "normal",
                "estimatedReadingTime": 3
            },
            {
                "scene": "五行山下",
                "image": "assets/images/wuxingshan.jpg",
                "background": "如来佛祖用五行山压住了孙悟空，一压就是五百年。",
                "characters": ["五", "行", "山", "佛", "祖", "压", "年", "等", "待", "人"],
                "story": "孙悟空被压在五行山下五百年，等待取经人的到来。",
                "items": ["🏔️五行山", "📿佛珠", "🕯️香火", "⏰时间"],
                "theme": "patience",
                "difficulty": "normal",
                "estimatedReadingTime": 3
            },
            {
                "scene": "观音点化",
                "image": "assets/images/guanyin.jpg",
                "background": "观音菩萨奉如来佛祖之命，寻找取经人。",
                "characters": ["观", "音", "菩", "萨", "唐", "僧", "取", "经", "西", "天"],
                "story": "观音菩萨告诉唐僧，救出孙悟空作为徒弟保护取经。",
                "items": ["🌸莲花", "🎋柳枝", "💧甘露", "📜经书"],
                "theme": "guidance",
                "difficulty": "normal",
                "estimatedReadingTime": 3
            }
        ];
    }

    // 验证故事模板格式
    validateStoryTemplates() {
        const requiredFields = ['scene', 'background', 'characters', 'story', 'items', 'image'];

        for (let i = 0; i < this.storyTemplates.length; i++) {
            const template = this.storyTemplates[i];

            for (const field of requiredFields) {
                if (!template[field]) {
                    console.warn(`⚠️ 故事模板 ${i} 缺少必需字段: ${field}`);
                }
            }

            // 验证数组字段
            if (!Array.isArray(template.characters) || template.characters.length === 0) {
                console.warn(`⚠️ 故事模板 ${i} 的 characters 字段应为非空数组`);
            }

            if (!Array.isArray(template.items) || template.items.length === 0) {
                console.warn(`⚠️ 故事模板 ${i} 的 items 字段应为非空数组`);
            }
        }
    }

    // 架构优化：使用 CharacterProvider 生成游戏关卡数据
    async generateGameData() {
        try {
            console.log('🎮 正在生成游戏关卡数据...');

            // 从 CharacterProvider 获取所有汉字数据
            const allCharacters = await this.characterProvider.getAllCharacters();

            if (!allCharacters || allCharacters.length === 0) {
                throw new Error('未能从 CharacterProvider 获取汉字数据');
            }

            const totalLevels = Math.min(
                this.config.maxLevels,
                Math.ceil(allCharacters.length / this.config.charactersPerLevel)
            );

            this.gameData = [];

            for (let level = 1; level <= totalLevels; level++) {
                const levelData = await this.generateLevelData(level, allCharacters);
                this.gameData.push(levelData);
            }

            console.log(`✅ 成功生成 ${this.gameData.length} 个游戏关卡`);

        } catch (error) {
            console.error('❌ 生成游戏数据失败:', error);
            throw error;
        }
    }

    // 生成单个关卡数据
    async generateLevelData(level, allCharacters) {
        const startIndex = (level - 1) * this.config.charactersPerLevel;
        const endIndex = Math.min(startIndex + this.config.charactersPerLevel, allCharacters.length);

        // 获取该关卡的汉字
        const levelCharacters = allCharacters.slice(startIndex, endIndex).map((char, index) => ({
            id: startIndex + index + 1,
            char: char.char,
            pinyin: char.pinyin,
            frequency: char.frequency,
            rank: char.rank
        }));

        // 选择对应的故事场景（循环使用故事模板）
        const storyIndex = Math.floor((level - 1) / 10) % this.storyTemplates.length;
        const story = this.storyTemplates[storyIndex];

        // 生成关卡数据
        const levelData = {
            level: level,
            scene: `${story.scene} 第${level}关`,
            image: story.image, // 直接使用故事模板中的图片路径
            background: story.background,
            story: story.story,
            item: this.getRandomItem(story.items),
            characters: levelCharacters,
            difficulty: this.calculateLevelDifficulty(level, story),
            estimatedTime: levelCharacters.length * this.config.timePerCharacter,
            unlocked: level === 1, // 只有第一关默认解锁
            theme: story.theme || 'adventure', // 使用故事主题
            storyIndex: storyIndex // 记录使用的故事索引
        };

        return levelData;
    }

    // 获取随机道具
    getRandomItem(items) {
        if (!items || items.length === 0) {
            return { name: "宝物", icon: "💎" }; // 默认道具
        }

        const randomItem = items[Math.floor(Math.random() * items.length)];

        // 使用Array.from来正确处理Unicode字符，包括emoji
        const chars = Array.from(randomItem);

        if (chars.length > 1) {
            // 第一个字符作为图标，其余作为名称
            return {
                name: chars.slice(1).join(''),
                icon: chars[0]
            };
        } else {
            // 如果只有一个字符，使用默认图标
            return {
                name: randomItem,
                icon: "💎"
            };
        }
    }

    // 改进的关卡难度计算（考虑故事难度和关卡进度）
    calculateLevelDifficulty(level, story) {
        // 基础难度（基于关卡进度）
        let baseDifficulty;
        if (level <= 10) baseDifficulty = 'easy';
        else if (level <= 30) baseDifficulty = 'normal';
        else baseDifficulty = 'hard';

        // 如果故事模板有难度设置，则优先使用
        if (story && story.difficulty) {
            return story.difficulty;
        }

        return baseDifficulty;
    }

    // 新增：获取关卡统计信息
    getLevelStatistics() {
        if (!this.initialized) {
            return null;
        }

        const stats = {
            totalLevels: this.gameData.length,
            difficultyDistribution: {
                easy: 0,
                normal: 0,
                hard: 0
            },
            themeDistribution: {},
            averageCharactersPerLevel: 0,
            totalCharacters: 0
        };

        this.gameData.forEach(level => {
            stats.difficultyDistribution[level.difficulty]++;
            stats.themeDistribution[level.theme] = (stats.themeDistribution[level.theme] || 0) + 1;
            stats.totalCharacters += level.characters.length;
        });

        stats.averageCharactersPerLevel = Math.round(stats.totalCharacters / stats.totalLevels);

        return stats;
    }

    // 架构优化：委托给 CharacterProvider 获取高频汉字
    async getHighFrequencyCharacters(startRank, count = 10) {
        if (!this.initialized) {
            console.warn('数据处理器未初始化');
            return [];
        }

        try {
            const endRank = startRank + count - 1;
            return await this.characterProvider.getCharactersByRankRange(startRank, endRank);
        } catch (error) {
            console.error('获取高频汉字失败:', error);
            return [];
        }
    }

    // 获取游戏关卡数据
    getGameLevelData(level) {
        if (!this.initialized) {
            console.warn('数据处理器未初始化');
            return null;
        }

        return this.gameData.find(data => data.level === level);
    }

    // 获取所有游戏关卡概览
    getAllLevelsOverview() {
        return this.gameData.map(level => ({
            level: level.level,
            scene: level.scene,
            difficulty: level.difficulty,
            characterCount: level.characters.length,
            unlocked: level.unlocked,
            estimatedTime: level.estimatedTime
        }));
    }

    // 架构优化：使用 CharacterProvider 生成干扰项
    async generateSimilarCharacters(targetChar, count = 3) {
        if (!this.initialized) {
            console.warn('数据处理器未初始化');
            return [];
        }

        try {
            // 获取随机汉字作为干扰项
            const randomChars = await this.characterProvider.getRandomCharacters(count * 2);

            // 过滤掉目标汉字，确保不重复
            const distractors = randomChars
                .filter(char => char.char !== targetChar)
                .slice(0, count)
                .map(char => char.char);

            // 如果不够，用高频汉字补充
            if (distractors.length < count) {
                const highFreqChars = await this.characterProvider.getNextHighFrequencyCharacters(
                    new Set([targetChar, ...distractors]),
                    count - distractors.length
                );
                distractors.push(...highFreqChars.map(char => char.char));
            }

            return distractors;

        } catch (error) {
            console.error('生成干扰项失败:', error);
            return [];
        }
    }

    // 新增：获取故事模板信息
    getStoryTemplates() {
        return this.storyTemplates;
    }

    // 新增：根据主题获取关卡
    getLevelsByTheme(theme) {
        if (!this.initialized) {
            return [];
        }

        return this.gameData.filter(level => level.theme === theme);
    }

    // 新增：获取配置信息
    getConfig() {
        return { ...this.config };
    }

    // 新增：更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📝 数据处理器配置已更新:', this.config);
    }
}

// 工厂函数：创建配置好的 DataProcessor 实例
class DataProcessorFactory {
    // 创建标准的 DataProcessor 实例
    static async createStandard(characterProvider, storiesFilePath = './stories.json') {
        const processor = new DataProcessor(characterProvider, storiesFilePath);
        await processor.initialize();
        return processor;
    }

    // 创建自定义配置的 DataProcessor 实例
    static async createCustom(characterProvider, config = {}) {
        const processor = new DataProcessor(characterProvider, config.storiesFilePath);

        // 应用自定义配置
        if (config.gameConfig) {
            processor.updateConfig(config.gameConfig);
        }

        await processor.initialize();
        return processor;
    }

    // 创建测试用的 DataProcessor 实例
    static async createForTesting(characterProvider) {
        const testConfig = {
            charactersPerLevel: 5,
            maxLevels: 10,
            timePerCharacter: 1
        };

        const processor = new DataProcessor(characterProvider);
        processor.updateConfig(testConfig);
        await processor.initialize();
        return processor;
    }
}

// 使用示例和最佳实践
const DataProcessorUsage = {
    // 标准使用方式
    async standardUsage() {
        const characterProvider = new CharacterProvider();
        const dataProcessor = await DataProcessorFactory.createStandard(characterProvider);
        return dataProcessor;
    },

    // 自定义配置使用方式
    async customUsage() {
        const characterProvider = new CharacterProvider();
        const dataProcessor = await DataProcessorFactory.createCustom(characterProvider, {
            storiesFilePath: './custom-stories.json',
            gameConfig: {
                charactersPerLevel: 15,
                maxLevels: 30,
                timePerCharacter: 3
            }
        });
        return dataProcessor;
    }
};

// ===== 全局数据管理接口 =====
// 合并原 data.js 的功能，提供统一的数据访问接口

// 全局数据管理器实例
let globalDataProcessor = null;
let globalAiPutiSystem = null;
let gameData = []; // 兼容性：保持原有的 gameData 变量

// 初始化数据系统（合并自 data.js）
async function initializeDataSystem() {
    try {
        console.log('🚀 正在初始化智能数据系统...');

        // 初始化汉字数据提供者
        const characterProvider = new CharacterProvider();
        await characterProvider.load();

        // 初始化数据处理器
        globalDataProcessor = new DataProcessor(characterProvider);
        await globalDataProcessor.initialize();

        // 初始化AI菩提系统
        globalAiPutiSystem = new AIPutiSystem();
        await globalAiPutiSystem.initialize();

        // 设置为全局变量
        window.aiPutiSystem = globalAiPutiSystem;

        console.log('🎯 智能数据系统初始化完成');
        return true;
    } catch (error) {
        console.error('数据系统初始化失败:', error);
        // 使用备用数据
        gameData = getBackupGameData();
        return false;
    }
}

// 动态获取游戏关卡数据（合并自 data.js）
function getGameData() {
    // 如果已经有缓存的数据且数量足够，直接返回
    if (gameData && gameData.length >= 15) {
        console.log(`🎮 使用缓存的关卡数据: ${gameData.length} 个关卡`);
        return gameData;
    }

    if (globalDataProcessor && globalDataProcessor.initialized) {
        const data = globalDataProcessor.gameData;
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

// 获取指定关卡数据（合并自 data.js）
function getLevelData(level) {
    if (globalDataProcessor && globalDataProcessor.initialized) {
        return globalDataProcessor.getGameLevelData(level);
    }
    // 返回备用数据
    const backupData = getBackupGameData();
    return backupData.find(data => data.level === level);
}

// 备用数据生成（合并自 data.js，使用 LevelGenerator）
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

// 导出类和工厂
window.DataProcessor = DataProcessor;
window.DataProcessorFactory = DataProcessorFactory;
window.DataProcessorUsage = DataProcessorUsage;

// 导出全局数据管理函数（保持与原 data.js 的兼容性）
window.initializeDataSystem = initializeDataSystem;
window.getGameData = getGameData;
window.getLevelData = getLevelData;
window.getBackupGameData = getBackupGameData;
