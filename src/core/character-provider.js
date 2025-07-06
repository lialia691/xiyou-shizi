// 汉字数据提供者
// 负责从 chinaword2500.json 加载和过滤汉字数据

class CharacterProvider {
    constructor(filePath = './data/chinaword2500.json') {
        this.filePath = filePath;
        this.characterList = [];
        this.characterMap = new Map(); // 性能优化：汉字索引 Map
        this.pinyinMap = new Map(); // 性能优化：拼音索引 Map
        this.isLoaded = false;
        this.loadPromise = null;
    }

    // 异步加载汉字数据
    async load() {
        if (this.isLoaded) {
            return this.characterList;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadData();
        return this.loadPromise;
    }

    // 内部加载数据方法
    async _loadData() {
        try {
            console.log('🔄 正在加载汉字数据...');

            // 检测是否为本地文件协议
            const isLocalFile = window.location.protocol === 'file:';
            let rawData;

            if (isLocalFile) {
                console.log('🔍 检测到本地文件访问，使用内置汉字数据');
                rawData = this.getBuiltinCharacterData();
            } else {
                // HTTP协议，正常加载外部文件
                const response = await fetch(this.filePath);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                rawData = await response.json();
            }
            
            // 转换数据格式，统一字段名
            this.characterList = rawData.map(item => ({
                char: item.汉字,
                pinyin: item.注音,
                frequency: item.频数,
                rank: item.排名
            }));

            // 按频率排序（确保高频字在前）
            this.characterList.sort((a, b) => {
                // 先按排名排序，再按频率排序
                if (a.rank !== b.rank) {
                    return a.rank - b.rank;
                }
                return b.frequency - a.frequency;
            });

            // 性能优化：创建索引
            console.log('🔍 正在创建汉字索引...');
            this._createIndexes();

            this.isLoaded = true;
            console.log(`✅ 成功加载 ${this.characterList.length} 个汉字数据并创建索引`);
            return this.characterList;
            
        } catch (error) {
            console.error('❌ 加载汉字数据失败，使用内置数据:', error);
            // 使用内置数据作为回退
            const rawData = this.getBuiltinCharacterData();

            // 转换数据格式，统一字段名
            this.characterList = rawData.map(item => ({
                char: item.汉字,
                pinyin: item.注音,
                frequency: item.频数,
                rank: item.排名
            }));

            // 按频率排序（确保高频字在前）
            this.characterList.sort((a, b) => {
                // 先按排名排序，再按频率排序
                if (a.rank !== b.rank) {
                    return a.rank - b.rank;
                }
                return b.frequency - a.frequency;
            });

            // 性能优化：创建索引
            console.log('🔍 正在创建汉字索引...');
            this._createIndexes();

            this.isLoaded = true;
            console.log(`✅ 使用内置数据加载 ${this.characterList.length} 个汉字并创建索引`);
            return this.characterList;
        }
    }

    // 内置汉字数据（用于本地文件访问时的回退）
    getBuiltinCharacterData() {
        return [
            {"排名": 1, "汉字": "一", "频数": 100000000, "注音": "yī"},
            {"排名": 2, "汉字": "二", "频数": 95000000, "注音": "èr"},
            {"排名": 3, "汉字": "三", "频数": 90000000, "注音": "sān"},
            {"排名": 4, "汉字": "四", "频数": 85000000, "注音": "sì"},
            {"排名": 5, "汉字": "五", "频数": 80000000, "注音": "wǔ"},
            {"排名": 6, "汉字": "六", "频数": 75000000, "注音": "liù"},
            {"排名": 7, "汉字": "七", "频数": 70000000, "注音": "qī"},
            {"排名": 8, "汉字": "八", "频数": 65000000, "注音": "bā"},
            {"排名": 9, "汉字": "九", "频数": 60000000, "注音": "jiǔ"},
            {"排名": 10, "汉字": "十", "频数": 55000000, "注音": "shí"},
            {"排名": 11, "汉字": "人", "频数": 50000000, "注音": "rén"},
            {"排名": 12, "汉字": "大", "频数": 48000000, "注音": "dà"},
            {"排名": 13, "汉字": "小", "频数": 46000000, "注音": "xiǎo"},
            {"排名": 14, "汉字": "上", "频数": 44000000, "注音": "shàng"},
            {"排名": 15, "汉字": "下", "频数": 42000000, "注音": "xià"},
            {"排名": 16, "汉字": "中", "频数": 40000000, "注音": "zhōng"},
            {"排名": 17, "汉字": "天", "频数": 38000000, "注音": "tiān"},
            {"排名": 18, "汉字": "地", "频数": 36000000, "注音": "dì"},
            {"排名": 19, "汉字": "山", "频数": 34000000, "注音": "shān"},
            {"排名": 20, "汉字": "水", "频数": 32000000, "注音": "shuǐ"},
            {"排名": 21, "汉字": "火", "频数": 30000000, "注音": "huǒ"},
            {"排名": 22, "汉字": "木", "频数": 28000000, "注音": "mù"},
            {"排名": 23, "汉字": "金", "频数": 26000000, "注音": "jīn"},
            {"排名": 24, "汉字": "土", "频数": 24000000, "注音": "tǔ"},
            {"排名": 25, "汉字": "日", "频数": 22000000, "注音": "rì"},
            {"排名": 26, "汉字": "月", "频数": 20000000, "注音": "yuè"},
            {"排名": 27, "汉字": "年", "频数": 19000000, "注音": "nián"},
            {"排名": 28, "汉字": "手", "频数": 18000000, "注音": "shǒu"},
            {"排名": 29, "汉字": "足", "频数": 17000000, "注音": "zú"},
            {"排名": 30, "汉字": "口", "频数": 16000000, "注音": "kǒu"},
            {"排名": 31, "汉字": "目", "频数": 15000000, "注音": "mù"},
            {"排名": 32, "汉字": "心", "频数": 14000000, "注音": "xīn"},
            {"排名": 33, "汉字": "头", "频数": 13000000, "注音": "tóu"},
            {"排名": 34, "汉字": "面", "频数": 12000000, "注音": "miàn"},
            {"排名": 35, "汉字": "身", "频数": 11000000, "注音": "shēn"},
            {"排名": 36, "汉字": "来", "频数": 10000000, "注音": "lái"},
            {"排名": 37, "汉字": "去", "频数": 9500000, "注音": "qù"},
            {"排名": 38, "汉字": "好", "频数": 9000000, "注音": "hǎo"},
            {"排名": 39, "汉字": "看", "频数": 8500000, "注音": "kàn"},
            {"排名": 40, "汉字": "听", "频数": 8000000, "注音": "tīng"},
            {"排名": 41, "汉字": "说", "频数": 7500000, "注音": "shuō"},
            {"排名": 42, "汉字": "走", "频数": 7000000, "注音": "zǒu"},
            {"排名": 43, "汉字": "跑", "频数": 6500000, "注音": "pǎo"},
            {"排名": 44, "汉字": "飞", "频数": 6000000, "注音": "fēi"},
            {"排名": 45, "汉字": "鸟", "频数": 5500000, "注音": "niǎo"},
            {"排名": 46, "汉字": "鱼", "频数": 5000000, "注音": "yú"},
            {"排名": 47, "汉字": "马", "频数": 4800000, "注音": "mǎ"},
            {"排名": 48, "汉字": "牛", "频数": 4600000, "注音": "niú"},
            {"排名": 49, "汉字": "羊", "频数": 4400000, "注音": "yáng"},
            {"排名": 50, "汉字": "猪", "频数": 4200000, "注音": "zhū"}
        ];
    }

    // 性能优化：创建索引
    _createIndexes() {
        // 清空现有索引
        this.characterMap.clear();
        this.pinyinMap.clear();

        for (const charData of this.characterList) {
            // 汉字索引：汉字 -> 汉字数据
            this.characterMap.set(charData.char, charData);

            // 拼音索引：拼音 -> 汉字数据数组（支持多音字）
            const pinyin = charData.pinyin.toLowerCase();
            if (!this.pinyinMap.has(pinyin)) {
                this.pinyinMap.set(pinyin, []);
            }
            this.pinyinMap.get(pinyin).push(charData);
        }
    }

    // 代码简化：提取重复逻辑 - 获取未学习汉字
    _getUnlearnedCharacters(learnedCharIds) {
        return this.characterList.filter(char => !learnedCharIds.has(char.char));
    }

    // 代码简化：提取重复逻辑 - 过滤未学习汉字（用于已过滤的数组）
    _filterUnlearnedCharacters(characters, learnedCharIds) {
        return characters.filter(char => !learnedCharIds.has(char.char));
    }

    // 获取下一批未学习的高频汉字
    async getNextHighFrequencyCharacters(learnedCharIds = new Set(), count = 10) {
        await this.load();

        const unlearnedChars = this._getUnlearnedCharacters(learnedCharIds);
        return unlearnedChars.slice(0, count);
    }

    // 根据汉字获取详细信息（性能优化：使用索引）
    async getCharacterInfo(char) {
        await this.load();

        // 从 O(n) 的遍历查询变成 O(1) 的 Map 查询
        return this.characterMap.get(char) || null;
    }

    // 获取指定排名范围的汉字
    async getCharactersByRankRange(startRank, endRank, learnedCharIds = new Set()) {
        await this.load();

        const rangeChars = this.characterList.filter(char =>
            char.rank >= startRank &&
            char.rank <= endRank
        );

        return this._filterUnlearnedCharacters(rangeChars, learnedCharIds);
    }

    // 获取指定频率范围的汉字
    async getCharactersByFrequencyRange(minFreq, maxFreq, learnedCharIds = new Set()) {
        await this.load();

        const freqChars = this.characterList.filter(char =>
            char.frequency >= minFreq &&
            char.frequency <= maxFreq
        );

        return this._filterUnlearnedCharacters(freqChars, learnedCharIds);
    }

    // 随机获取汉字（用于测试）
    async getRandomCharacters(count = 5, learnedCharIds = new Set()) {
        await this.load();

        const unlearnedChars = this._getUnlearnedCharacters(learnedCharIds);
        const shuffled = [...unlearnedChars].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    // 搜索汉字（支持拼音和汉字搜索）
    // 注意：如果在UI中绑定到输入框，建议使用防抖(debounce)或节流(throttle)
    async searchCharacters(query, learnedCharIds = new Set()) {
        await this.load();

        if (!query || query.trim() === '') {
            return [];
        }

        const trimmedQuery = query.trim();
        const lowerQuery = trimmedQuery.toLowerCase();

        // 性能优化：优先使用精确匹配的索引查询
        const results = [];

        // 1. 精确汉字匹配（O(1)查询）
        const exactCharMatch = this.characterMap.get(trimmedQuery);
        if (exactCharMatch && !learnedCharIds.has(exactCharMatch.char)) {
            results.push(exactCharMatch);
        }

        // 2. 精确拼音匹配（O(1)查询）
        const exactPinyinMatches = this.pinyinMap.get(lowerQuery) || [];
        for (const char of exactPinyinMatches) {
            if (!learnedCharIds.has(char.char) && !results.includes(char)) {
                results.push(char);
            }
        }

        // 3. 模糊匹配（O(n)查询，但只在精确匹配结果不足时进行）
        if (results.length < 10) { // 限制模糊搜索，避免返回过多结果
            const fuzzyMatches = this.characterList.filter(char => {
                if (learnedCharIds.has(char.char) || results.includes(char)) {
                    return false;
                }

                return char.char.includes(trimmedQuery) ||
                       char.pinyin.toLowerCase().includes(lowerQuery);
            });

            results.push(...fuzzyMatches.slice(0, 10 - results.length));
        }

        return results;
    }

    // 获取统计信息
    async getStatistics() {
        await this.load();
        
        const totalChars = this.characterList.length;
        const frequencies = this.characterList.map(char => char.frequency);
        const maxFreq = Math.max(...frequencies);
        const minFreq = Math.min(...frequencies);
        const avgFreq = frequencies.reduce((sum, freq) => sum + freq, 0) / totalChars;
        
        return {
            totalCharacters: totalChars,
            maxFrequency: maxFreq,
            minFrequency: minFreq,
            averageFrequency: avgFreq,
            topRank: 1,
            bottomRank: Math.max(...this.characterList.map(char => char.rank))
        };
    }

    // 检查是否已加载
    isDataLoaded() {
        return this.isLoaded;
    }

    // 重新加载数据
    async reload() {
        this.isLoaded = false;
        this.loadPromise = null;
        this.characterList = [];
        this.characterMap.clear();
        this.pinyinMap.clear();
        return this.load();
    }

    // 新增：批量获取汉字信息（性能优化）
    async getCharactersInfo(chars) {
        await this.load();

        const results = [];
        for (const char of chars) {
            const info = this.characterMap.get(char);
            if (info) {
                results.push(info);
            }
        }
        return results;
    }

    // 新增：根据拼音获取汉字（支持多音字）
    async getCharactersByPinyin(pinyin, learnedCharIds = new Set()) {
        await this.load();

        const lowerPinyin = pinyin.toLowerCase();
        const characters = this.pinyinMap.get(lowerPinyin) || [];

        return this._filterUnlearnedCharacters(characters, learnedCharIds);
    }

    // 新增：获取索引统计信息
    getIndexStatistics() {
        return {
            characterMapSize: this.characterMap.size,
            pinyinMapSize: this.pinyinMap.size,
            isIndexed: this.characterMap.size > 0,
            memoryUsage: {
                characterList: this.characterList.length,
                characterMap: this.characterMap.size,
                pinyinMap: this.pinyinMap.size
            }
        };
    }

    // 获取所有汉字（谨慎使用，数据量大）
    async getAllCharacters() {
        await this.load();
        return [...this.characterList];
    }
}

// 工具函数：搜索防抖装饰器
// 用于在UI层包装搜索方法，避免高频调用
class SearchUtils {
    // 防抖函数：在停止输入后延迟执行
    static debounce(func, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // 节流函数：限制执行频率
    static throttle(func, limit = 200) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 创建防抖搜索函数
    static createDebouncedSearch(characterProvider, delay = 300) {
        return this.debounce(async (query, learnedCharIds) => {
            return await characterProvider.searchCharacters(query, learnedCharIds);
        }, delay);
    }

    // 创建节流搜索函数
    static createThrottledSearch(characterProvider, limit = 200) {
        return this.throttle(async (query, learnedCharIds) => {
            return await characterProvider.searchCharacters(query, learnedCharIds);
        }, limit);
    }
}

// 导出汉字数据提供者和工具类
window.CharacterProvider = CharacterProvider;
window.SearchUtils = SearchUtils;
