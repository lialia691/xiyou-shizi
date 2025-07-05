// DataProcessor 架构优化后的使用指南
// 展示如何正确使用重构后的 DataProcessor

// ===== 基础使用示例 =====

class GameApplication {
    constructor() {
        this.characterProvider = null;
        this.dataProcessor = null;
        this.initialized = false;
    }

    // 标准初始化流程
    async initialize() {
        try {
            console.log('🚀 初始化游戏应用...');
            
            // 1. 创建并初始化 CharacterProvider
            this.characterProvider = new CharacterProvider();
            await this.characterProvider.load();
            console.log('✅ CharacterProvider 初始化完成');
            
            // 2. 使用工厂方法创建 DataProcessor
            this.dataProcessor = await DataProcessorFactory.createStandard(this.characterProvider);
            console.log('✅ DataProcessor 初始化完成');
            
            this.initialized = true;
            console.log('🎉 游戏应用初始化完成');
            
        } catch (error) {
            console.error('❌ 初始化失败:', error);
            throw error;
        }
    }

    // 获取游戏关卡数据
    getGameLevels() {
        if (!this.initialized) {
            throw new Error('应用未初始化');
        }
        
        return this.dataProcessor.getAllLevelsOverview();
    }

    // 获取指定关卡详情
    getLevelDetails(levelNumber) {
        if (!this.initialized) {
            throw new Error('应用未初始化');
        }
        
        return this.dataProcessor.getGameLevelData(levelNumber);
    }

    // 生成选择题选项
    async generateQuizOptions(targetChar, optionCount = 4) {
        if (!this.initialized) {
            throw new Error('应用未初始化');
        }
        
        const distractors = await this.dataProcessor.generateSimilarCharacters(
            targetChar, 
            optionCount - 1
        );
        
        // 将正确答案和干扰项混合并随机排序
        const allOptions = [targetChar, ...distractors];
        return allOptions.sort(() => Math.random() - 0.5);
    }
}

// ===== 自定义配置示例 =====

class CustomGameApplication {
    constructor() {
        this.characterProvider = null;
        this.dataProcessor = null;
    }

    // 使用自定义配置初始化
    async initializeWithCustomConfig() {
        try {
            // 1. 创建 CharacterProvider
            this.characterProvider = new CharacterProvider();
            await this.characterProvider.load();
            
            // 2. 使用自定义配置创建 DataProcessor
            this.dataProcessor = await DataProcessorFactory.createCustom(this.characterProvider, {
                storiesFilePath: './custom-stories.json', // 自定义故事文件
                gameConfig: {
                    charactersPerLevel: 15,  // 每关15个汉字
                    maxLevels: 30,          // 最多30关
                    timePerCharacter: 3     // 每个汉字3分钟
                }
            });
            
            console.log('✅ 自定义配置初始化完成');
            
        } catch (error) {
            console.error('❌ 自定义配置初始化失败:', error);
            // 如果自定义故事文件加载失败，回退到标准配置
            this.dataProcessor = await DataProcessorFactory.createStandard(this.characterProvider);
            console.log('⚠️ 已回退到标准配置');
        }
    }

    // 动态调整配置
    updateGameConfig(newConfig) {
        if (this.dataProcessor) {
            this.dataProcessor.updateConfig(newConfig);
            console.log('📝 游戏配置已更新');
        }
    }
}

// ===== 内容管理示例 =====

class ContentManager {
    constructor(characterProvider) {
        this.characterProvider = characterProvider;
        this.dataProcessor = null;
    }

    // 加载不同的故事集
    async loadStorySet(storySetName) {
        const storyFiles = {
            'classic': './stories.json',
            'modern': './modern-stories.json',
            'fantasy': './fantasy-stories.json'
        };
        
        const filePath = storyFiles[storySetName] || './stories.json';
        
        this.dataProcessor = new DataProcessor(this.characterProvider, filePath);
        await this.dataProcessor.initialize();
        
        return this.dataProcessor.getStoryTemplates();
    }

    // 获取故事统计
    getStoryStatistics() {
        if (!this.dataProcessor) return null;
        
        const stories = this.dataProcessor.getStoryTemplates();
        const stats = {
            totalStories: stories.length,
            themes: {},
            difficulties: {},
            averageCharacters: 0
        };
        
        stories.forEach(story => {
            stats.themes[story.theme] = (stats.themes[story.theme] || 0) + 1;
            stats.difficulties[story.difficulty] = (stats.difficulties[story.difficulty] || 0) + 1;
            stats.averageCharacters += story.characters.length;
        });
        
        stats.averageCharacters = Math.round(stats.averageCharacters / stories.length);
        
        return stats;
    }

    // 按主题筛选关卡
    getLevelsByTheme(theme) {
        if (!this.dataProcessor) return [];
        
        return this.dataProcessor.getLevelsByTheme(theme);
    }
}

// ===== 测试和开发示例 =====

class DevelopmentTools {
    // 创建测试环境
    static async createTestEnvironment() {
        const characterProvider = new CharacterProvider();
        await characterProvider.load();
        
        // 使用测试配置（更少的关卡和汉字，便于快速测试）
        const testProcessor = await DataProcessorFactory.createForTesting(characterProvider);
        
        return {
            characterProvider,
            dataProcessor: testProcessor,
            
            // 测试辅助方法
            async testGameFlow() {
                const levels = testProcessor.getAllLevelsOverview();
                console.log(`🧪 测试环境: ${levels.length} 个关卡`);
                
                // 测试第一关
                const level1 = testProcessor.getGameLevelData(1);
                console.log(`🎯 第一关: ${level1.scene}, ${level1.characters.length} 个汉字`);
                
                // 测试干扰项生成
                const char = level1.characters[0].char;
                const options = await testProcessor.generateSimilarCharacters(char, 3);
                console.log(`🎲 "${char}" 的干扰项: ${options.join(', ')}`);
                
                return true;
            }
        };
    }

    // 性能基准测试
    static async runPerformanceBenchmark(dataProcessor) {
        console.log('📊 开始性能基准测试...');
        
        const tests = [
            {
                name: '关卡数据获取',
                test: () => dataProcessor.getAllLevelsOverview()
            },
            {
                name: '单关卡详情',
                test: () => dataProcessor.getGameLevelData(1)
            },
            {
                name: '干扰项生成',
                test: () => dataProcessor.generateSimilarCharacters('一', 3)
            },
            {
                name: '高频汉字获取',
                test: () => dataProcessor.getHighFrequencyCharacters(1, 10)
            }
        ];
        
        const results = {};
        
        for (const test of tests) {
            const startTime = performance.now();
            
            // 运行测试100次
            for (let i = 0; i < 100; i++) {
                await test.test();
            }
            
            const endTime = performance.now();
            results[test.name] = (endTime - startTime).toFixed(2);
        }
        
        console.log('📈 性能测试结果 (100次操作总耗时):');
        Object.entries(results).forEach(([name, time]) => {
            console.log(`  ${name}: ${time}ms`);
        });
        
        return results;
    }
}

// ===== 最佳实践示例 =====

class BestPracticesDemo {
    // 错误处理最佳实践
    static async robustInitialization() {
        try {
            const characterProvider = new CharacterProvider();
            await characterProvider.load();
            
            // 尝试加载自定义配置
            let dataProcessor;
            try {
                dataProcessor = await DataProcessorFactory.createCustom(characterProvider, {
                    storiesFilePath: './custom-stories.json'
                });
            } catch (customError) {
                console.warn('⚠️ 自定义配置加载失败，使用标准配置:', customError.message);
                dataProcessor = await DataProcessorFactory.createStandard(characterProvider);
            }
            
            return dataProcessor;
            
        } catch (error) {
            console.error('❌ 初始化完全失败:', error);
            throw new Error('无法初始化游戏数据，请检查网络连接和文件完整性');
        }
    }

    // 资源管理最佳实践
    static async managedResourceUsage() {
        let characterProvider = null;
        let dataProcessor = null;
        
        try {
            // 创建资源
            characterProvider = new CharacterProvider();
            await characterProvider.load();
            
            dataProcessor = await DataProcessorFactory.createStandard(characterProvider);
            
            // 使用资源
            const gameData = dataProcessor.getAllLevelsOverview();
            console.log(`✅ 成功加载 ${gameData.length} 个关卡`);
            
            return gameData;
            
        } finally {
            // 清理资源（如果需要）
            if (dataProcessor) {
                console.log('🧹 清理 DataProcessor 资源');
            }
            if (characterProvider) {
                console.log('🧹 清理 CharacterProvider 资源');
            }
        }
    }
}

// ===== 使用示例导出 =====

// 标准使用方式
async function standardUsage() {
    const app = new GameApplication();
    await app.initialize();
    
    const levels = app.getGameLevels();
    console.log(`游戏包含 ${levels.length} 个关卡`);
    
    const level1 = app.getLevelDetails(1);
    console.log(`第一关: ${level1.scene}`);
    
    const options = await app.generateQuizOptions('一');
    console.log(`选择题选项: ${options.join(', ')}`);
}

// 自定义配置使用方式
async function customUsage() {
    const app = new CustomGameApplication();
    await app.initializeWithCustomConfig();
    
    // 动态调整配置
    app.updateGameConfig({
        charactersPerLevel: 20,
        timePerCharacter: 2
    });
}

// 内容管理使用方式
async function contentManagementUsage() {
    const characterProvider = new CharacterProvider();
    await characterProvider.load();
    
    const contentManager = new ContentManager(characterProvider);
    
    // 加载不同故事集
    const classicStories = await contentManager.loadStorySet('classic');
    console.log(`经典故事集: ${classicStories.length} 个故事`);
    
    // 获取统计信息
    const stats = contentManager.getStoryStatistics();
    console.log('故事统计:', stats);
}

// 开发测试使用方式
async function developmentUsage() {
    const testEnv = await DevelopmentTools.createTestEnvironment();
    await testEnv.testGameFlow();
    
    const perfResults = await DevelopmentTools.runPerformanceBenchmark(testEnv.dataProcessor);
    console.log('性能测试完成:', perfResults);
}

// 导出所有示例
if (typeof window !== 'undefined') {
    window.GameApplication = GameApplication;
    window.CustomGameApplication = CustomGameApplication;
    window.ContentManager = ContentManager;
    window.DevelopmentTools = DevelopmentTools;
    window.BestPracticesDemo = BestPracticesDemo;
    
    // 导出使用函数
    window.standardUsage = standardUsage;
    window.customUsage = customUsage;
    window.contentManagementUsage = contentManagementUsage;
    window.developmentUsage = developmentUsage;
}
