// CharacterProvider 优化后的使用示例
// 展示如何在实际项目中使用优化后的功能

class CharacterLearningApp {
    constructor() {
        this.characterProvider = new CharacterProvider();
        this.learnedCharacters = new Set();
        this.setupSearchWithDebounce();
    }

    // 初始化应用
    async init() {
        console.log('🚀 初始化汉字学习应用...');
        
        try {
            // 加载汉字数据（会自动创建索引）
            await this.characterProvider.load();
            
            // 显示索引统计
            const stats = this.characterProvider.getIndexStatistics();
            console.log('📊 索引统计:', stats);
            
            console.log('✅ 应用初始化完成');
            return true;
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            return false;
        }
    }

    // 设置带防抖的搜索功能
    setupSearchWithDebounce() {
        // 使用工具类创建防抖搜索函数
        this.debouncedSearch = SearchUtils.createDebouncedSearch(
            this.characterProvider, 
            300 // 300ms 防抖延迟
        );
        
        // 也可以创建节流搜索函数
        this.throttledSearch = SearchUtils.createThrottledSearch(
            this.characterProvider, 
            200 // 200ms 节流间隔
        );
    }

    // 快速获取汉字信息（O(1)查询）
    async getCharacterInfo(char) {
        return await this.characterProvider.getCharacterInfo(char);
    }

    // 批量获取汉字信息（优化的批量查询）
    async getMultipleCharacterInfo(chars) {
        return await this.characterProvider.getCharactersInfo(chars);
    }

    // 智能搜索（支持精确匹配和模糊匹配）
    async searchCharacters(query) {
        return await this.characterProvider.searchCharacters(query, this.learnedCharacters);
    }

    // 防抖搜索（适用于实时搜索输入框）
    async debouncedSearchCharacters(query) {
        return await this.debouncedSearch(query, this.learnedCharacters);
    }

    // 获取学习推荐
    async getLearningRecommendations(count = 10) {
        // 获取高频未学习汉字
        const highFreqChars = await this.characterProvider.getNextHighFrequencyCharacters(
            this.learnedCharacters, 
            count
        );
        
        return {
            type: 'high_frequency',
            characters: highFreqChars,
            reason: '推荐学习这些高频汉字，提高学习效率'
        };
    }

    // 根据拼音学习
    async getCharactersByPinyin(pinyin) {
        return await this.characterProvider.getCharactersByPinyin(pinyin, this.learnedCharacters);
    }

    // 获取指定难度的汉字
    async getCharactersByDifficulty(difficulty = 'easy', count = 10) {
        let rankRange;
        
        switch (difficulty) {
            case 'easy':
                rankRange = [1, 500];
                break;
            case 'medium':
                rankRange = [501, 1500];
                break;
            case 'hard':
                rankRange = [1501, 2500];
                break;
            default:
                rankRange = [1, 100];
        }
        
        return await this.characterProvider.getCharactersByRankRange(
            rankRange[0], 
            rankRange[1], 
            this.learnedCharacters
        );
    }

    // 标记汉字为已学习
    markAsLearned(char) {
        this.learnedCharacters.add(char);
        console.log(`✅ 汉字 "${char}" 已标记为已学习`);
    }

    // 获取学习进度统计
    async getLearningProgress() {
        const stats = await this.characterProvider.getStatistics();
        const learnedCount = this.learnedCharacters.size;
        const totalCount = stats.totalCharacters;
        const progress = (learnedCount / totalCount * 100).toFixed(1);
        
        return {
            learnedCount,
            totalCount,
            progress: `${progress}%`,
            remainingCount: totalCount - learnedCount
        };
    }

    // 性能监控
    async performanceTest() {
        console.log('🔍 开始性能测试...');
        
        const testChars = ['一', '二', '三', '四', '五'];
        
        // 测试单次查询性能
        const singleStart = performance.now();
        for (const char of testChars) {
            await this.characterProvider.getCharacterInfo(char);
        }
        const singleEnd = performance.now();
        
        // 测试批量查询性能
        const batchStart = performance.now();
        await this.characterProvider.getCharactersInfo(testChars);
        const batchEnd = performance.now();
        
        console.log(`📊 单次查询 ${testChars.length} 个汉字: ${(singleEnd - singleStart).toFixed(2)}ms`);
        console.log(`📊 批量查询 ${testChars.length} 个汉字: ${(batchEnd - batchStart).toFixed(2)}ms`);
        
        return {
            singleQueryTime: singleEnd - singleStart,
            batchQueryTime: batchEnd - batchStart,
            improvement: ((singleEnd - singleStart) / (batchEnd - batchStart)).toFixed(2)
        };
    }
}

// 使用示例
async function demonstrateUsage() {
    const app = new CharacterLearningApp();
    
    // 初始化应用
    const initialized = await app.init();
    if (!initialized) return;
    
    console.log('\n=== 基础查询演示 ===');
    
    // 1. 快速获取单个汉字信息
    const charInfo = await app.getCharacterInfo('一');
    console.log('汉字信息:', charInfo);
    
    // 2. 批量获取汉字信息
    const multipleInfo = await app.getMultipleCharacterInfo(['一', '二', '三']);
    console.log('批量查询结果:', multipleInfo.length, '个汉字');
    
    console.log('\n=== 搜索功能演示 ===');
    
    // 3. 智能搜索
    const searchResults = await app.searchCharacters('zh');
    console.log('搜索 "zh" 结果:', searchResults.length, '个汉字');
    
    // 4. 根据拼音查找
    const pinyinResults = await app.getCharactersByPinyin('yī');
    console.log('拼音 "yī" 对应汉字:', pinyinResults.map(c => c.char));
    
    console.log('\n=== 学习功能演示 ===');
    
    // 5. 获取学习推荐
    const recommendations = await app.getLearningRecommendations(5);
    console.log('学习推荐:', recommendations.characters.map(c => c.char));
    
    // 6. 按难度获取汉字
    const easyChars = await app.getCharactersByDifficulty('easy', 5);
    console.log('简单汉字:', easyChars.map(c => c.char));
    
    // 7. 标记学习进度
    app.markAsLearned('一');
    app.markAsLearned('二');
    
    const progress = await app.getLearningProgress();
    console.log('学习进度:', progress);
    
    console.log('\n=== 性能测试演示 ===');
    
    // 8. 性能测试
    const perfResults = await app.performanceTest();
    console.log('性能提升倍数:', perfResults.improvement + 'x');
}

// 搜索输入框集成示例
function setupSearchInput(inputElement, app) {
    if (!inputElement || !app) return;
    
    inputElement.addEventListener('input', async (event) => {
        const query = event.target.value.trim();
        
        if (query === '') {
            // 清空搜索结果
            displaySearchResults([]);
            return;
        }
        
        try {
            // 使用防抖搜索
            const results = await app.debouncedSearchCharacters(query);
            displaySearchResults(results);
        } catch (error) {
            console.error('搜索错误:', error);
        }
    });
}

function displaySearchResults(results) {
    // 这里实现搜索结果的显示逻辑
    console.log('搜索结果:', results.map(r => `${r.char}(${r.pinyin})`));
}

// 导出使用示例
if (typeof window !== 'undefined') {
    window.CharacterLearningApp = CharacterLearningApp;
    window.demonstrateUsage = demonstrateUsage;
    window.setupSearchInput = setupSearchInput;
}

// 如果在 Node.js 环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CharacterLearningApp,
        demonstrateUsage,
        setupSearchInput
    };
}
