// 数据处理器 - 整合汉字数据并生成学习内容
class DataProcessor {
    constructor() {
        this.chineseWords = [];
        this.gameData = [];
        this.storyTemplates = [];
        this.initialized = false;
    }

    // 初始化数据处理器
    async initialize() {
        try {
            await this.loadChineseWordsData();
            this.generateStoryTemplates();
            this.generateGameData();
            this.initialized = true;
            console.log('📚 数据处理器初始化完成');
        } catch (error) {
            console.error('数据处理器初始化失败:', error);
        }
    }

    // 加载汉字数据
    async loadChineseWordsData() {
        try {
            const response = await fetch('chinaword2500.json');
            this.chineseWords = await response.json();
            console.log(`✅ 成功加载 ${this.chineseWords.length} 个汉字数据`);
        } catch (error) {
            console.error('加载汉字数据失败:', error);
            // 使用备用数据
            this.chineseWords = this.getBackupChineseWords();
        }
    }

    // 获取备用汉字数据（前100个高频字）
    getBackupChineseWords() {
        return [
            { "排名": 1, "汉字": "的", "频数": 100000000, "注音": "de" },
            { "排名": 2, "汉字": "一", "频数": 99999999, "注音": "yī" },
            { "排名": 3, "汉字": "是", "频数": 99999998, "注音": "shì" },
            { "排名": 4, "汉字": "了", "频数": 99999997, "注音": "le" },
            { "排名": 5, "汉字": "我", "频数": 99999996, "注音": "wǒ" },
            { "排名": 6, "汉字": "不", "频数": 99999995, "注音": "bù" },
            { "排名": 7, "汉字": "在", "频数": 99999994, "注音": "zài" },
            { "排名": 8, "汉字": "人", "频数": 99999993, "注音": "rén" },
            { "排名": 9, "汉字": "有", "频数": 99999992, "注音": "yǒu" },
            { "排名": 10, "汉字": "他", "频数": 99999991, "注音": "tā" },
            { "排名": 11, "汉字": "这", "频数": 99999990, "注音": "zhè" },
            { "排名": 12, "汉字": "个", "频数": 99999989, "注音": "gè" },
            { "排名": 13, "汉字": "上", "频数": 99999988, "注音": "shàng" },
            { "排名": 14, "汉字": "们", "频数": 99999987, "注音": "men" },
            { "排名": 15, "汉字": "来", "频数": 99999986, "注音": "lái" },
            { "排名": 16, "汉字": "到", "频数": 99999985, "注音": "dào" },
            { "排名": 17, "汉字": "时", "频数": 99999984, "注音": "shí" },
            { "排名": 18, "汉字": "大", "频数": 99999983, "注音": "dà" },
            { "排名": 19, "汉字": "地", "频数": 99999982, "注音": "dì" },
            { "排名": 20, "汉字": "为", "频数": 99999981, "注音": "wèi" }
        ];
    }

    // 生成西游记故事模板
    generateStoryTemplates() {
        this.storyTemplates = [
            {
                scene: "花果山水帘洞",
                background: "在东胜神洲傲来国花果山上，有一块仙石孕育出了石猴。",
                characters: ["石", "猴", "山", "水", "洞", "仙", "王", "群", "众", "美"],
                story: "石猴带领群猴发现了水帘洞，成为了美猴王。",
                items: ["🍑桃子", "🍌香蕉", "🥥椰子", "🌸花朵"]
            },
            {
                scene: "龙宫借宝",
                background: "美猴王为了寻找趁手的兵器，来到了东海龙宫。",
                characters: ["龙", "王", "宫", "宝", "金", "箍", "棒", "重", "万", "斤"],
                story: "孙悟空在龙宫得到了如意金箍棒，重达一万三千五百斤。",
                items: ["⚡金箍棒", "👑龙冠", "💎宝珠", "🌊海水"]
            },
            {
                scene: "大闹天宫",
                background: "孙悟空因为不满天庭的待遇，大闹天宫。",
                characters: ["天", "宫", "玉", "帝", "神", "仙", "兵", "将", "战", "斗"],
                story: "齐天大圣孙悟空与天兵天将大战，闹得天宫不得安宁。",
                items: ["🔥火眼金睛", "☁️筋斗云", "⚔️兵器", "🏰天宫"]
            },
            {
                scene: "五行山下",
                background: "如来佛祖用五行山压住了孙悟空，一压就是五百年。",
                characters: ["佛", "祖", "五", "行", "山", "压", "年", "等", "待", "师"],
                story: "孙悟空被压在五行山下五百年，等待取经人的到来。",
                items: ["🏔️五行山", "📿佛珠", "🕯️香火", "⏰时间"]
            },
            {
                scene: "观音点化",
                background: "观音菩萨奉如来佛祖之命，寻找取经人。",
                characters: ["观", "音", "菩", "萨", "取", "经", "人", "唐", "僧", "救"],
                story: "观音菩萨告诉唐僧，救出孙悟空作为徒弟保护取经。",
                items: ["🌸莲花", "🎋柳枝", "💧甘露", "📜经书"]
            }
        ];
    }

    // 根据高频汉字生成游戏关卡数据
    generateGameData() {
        const charactersPerLevel = 10;
        const totalLevels = Math.min(50, Math.ceil(this.chineseWords.length / charactersPerLevel));
        
        this.gameData = [];
        
        for (let level = 1; level <= totalLevels; level++) {
            const startIndex = (level - 1) * charactersPerLevel;
            const endIndex = Math.min(startIndex + charactersPerLevel, this.chineseWords.length);
            
            const levelCharacters = this.chineseWords.slice(startIndex, endIndex).map((word, index) => ({
                id: startIndex + index + 1,
                char: word.汉字,
                pinyin: word.注音,
                frequency: word.频数,
                rank: word.排名
            }));

            // 选择对应的故事场景
            const storyIndex = Math.floor((level - 1) / 10) % this.storyTemplates.length;
            const story = this.storyTemplates[storyIndex];
            
            const levelData = {
                level: level,
                scene: `${story.scene} 第${level}关`,
                image: this.getSceneImage(storyIndex),
                background: story.background,
                story: story.story,
                item: this.getRandomItem(story.items),
                characters: levelCharacters,
                difficulty: this.calculateDifficulty(level),
                estimatedTime: charactersPerLevel * 2, // 每个字2分钟
                unlocked: level === 1 // 只有第一关默认解锁
            };

            this.gameData.push(levelData);
        }

        console.log(`🎮 生成了 ${this.gameData.length} 个游戏关卡`);
    }

    // 获取场景图片
    getSceneImage(storyIndex) {
        const images = [
            "images/huaguoshan.jpg",
            "images/longgong.jpg", 
            "images/tiangong.jpg",
            "images/wuxingshan.jpg",
            "images/guanyin.jpg"
        ];
        return images[storyIndex] || "images/huaguoshan.jpg";
    }

    // 获取随机道具
    getRandomItem(items) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        return {
            name: randomItem.substring(1), // 去掉emoji
            icon: randomItem.charAt(0)     // 只保留emoji
        };
    }

    // 计算关卡难度
    calculateDifficulty(level) {
        if (level <= 10) return 'easy';
        if (level <= 30) return 'normal';
        return 'hard';
    }

    // 获取指定范围的高频汉字
    getHighFrequencyCharacters(startRank, count = 10) {
        if (!this.initialized) {
            console.warn('数据处理器未初始化');
            return [];
        }

        return this.chineseWords
            .filter(word => word.排名 >= startRank && word.排名 < startRank + count)
            .map(word => ({
                char: word.汉字,
                pinyin: word.注音,
                frequency: word.频数,
                rank: word.排名
            }));
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

    // 根据汉字特征生成相似字符（用于选择题干扰项）
    generateSimilarCharacters(targetChar, count = 3) {
        // 简化实现：随机选择其他汉字作为干扰项
        const otherChars = this.chineseWords
            .filter(word => word.汉字 !== targetChar)
            .slice(0, count * 3) // 取更多字符以便随机选择
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map(word => word.汉字);

        return otherChars;
    }

    // 生成学习建议
    generateLearningAdvice(userStats) {
        const advice = [];
        
        if (userStats.averageCorrectRate < 0.7) {
            advice.push({
                type: 'strategy',
                message: '建议放慢学习节奏，重点练习高频汉字',
                priority: 'high'
            });
        }

        if (userStats.currentLevel > 10 && userStats.reviewRate < 0.5) {
            advice.push({
                type: 'review',
                message: '建议增加复习时间，巩固已学汉字',
                priority: 'medium'
            });
        }

        return advice;
    }

    // 获取学习统计
    getLearningStatistics() {
        return {
            totalCharacters: this.chineseWords.length,
            totalLevels: this.gameData.length,
            averageCharactersPerLevel: Math.round(this.chineseWords.length / this.gameData.length),
            difficultyDistribution: {
                easy: this.gameData.filter(l => l.difficulty === 'easy').length,
                normal: this.gameData.filter(l => l.difficulty === 'normal').length,
                hard: this.gameData.filter(l => l.difficulty === 'hard').length
            }
        };
    }
}

// 导出数据处理器
window.DataProcessor = DataProcessor;
