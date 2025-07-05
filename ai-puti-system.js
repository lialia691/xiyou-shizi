// AI菩提智能学习系统
// 基于高频汉字和个性化学习的智能助手

// 配置常量
const AI_PUTI_CONFIG = {
    // 时间相关配置
    RESPONSE_TIME_THRESHOLD_MS: 5000,
    REVIEW_CHECK_INTERVAL_MS: 60 * 60 * 1000, // 1小时

    // 算法参数
    FREQUENCY_NORMALIZATION_FACTOR: 100000000,
    HIGH_CORRECT_RATE_THRESHOLD: 0.8,
    EXCELLENT_CORRECT_RATE_THRESHOLD: 0.9,
    POOR_CORRECT_RATE_THRESHOLD: 0.6,
    GOOD_CORRECT_RATE_THRESHOLD: 0.7,

    // 权重配置
    ERROR_WEIGHT_MULTIPLIER: 2,
    MAX_TIME_WEIGHT: 2,

    // 学习相关配置
    DEFAULT_LEARNING_COUNT: 10,
    MAX_REVIEW_CHARACTERS: 5,
    TIME_PER_REVIEW_CHAR: 2, // 分钟
    TIME_PER_NEW_CHAR: 3, // 分钟

    // 艾宾浩斯遗忘曲线配置
    FORGETTING_CURVE: {
        reviewPoints: [1, 9, 24, 72, 168, 720], // 1小时、9小时、1天、3天、1周、1月
        retentionRates: [0.58, 0.44, 0.36, 0.28, 0.25, 0.21]
    },

    // 存储键名
    STORAGE_KEYS: {
        USER_PROFILE: 'aiPutiUserProfile',
        LEARNING_DATA: 'aiPutiLearningData'
    }
};

class AIPutiSystem {
    constructor() {
        this.config = AI_PUTI_CONFIG;

        // 初始化各个模块
        this.userDataManager = new UserDataManager(this.config);
        this.characterProvider = new CharacterProvider();
        this.reviewScheduler = new ReviewScheduler(this.config);

        // 数据存储
        this.learningData = new Map();
        this.userProfile = null;

        // 状态标记
        this.isInitialized = false;
        this.dailyCheckTimer = null;
    }

    // 初始化AI菩提系统
    async initialize() {
        try {
            console.log('🧘‍♂️ 正在初始化AI菩提系统...');

            // 加载用户数据
            this.userProfile = await this.userDataManager.loadUserProfile();
            this.learningData = await this.userDataManager.loadLearningData();

            // 加载汉字数据
            await this.characterProvider.load();

            // 启动定时检查
            this.startDailyCheck();

            this.isInitialized = true;
            console.log('✅ AI菩提系统已启动，准备为您提供智能学习指导');

            return true;
        } catch (error) {
            console.error('❌ AI菩提系统初始化失败:', error);
            return false;
        }
    }

    // 智能推荐下一个学习内容
    async recommendNextLearning() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const recommendation = {
            type: 'character_learning',
            characters: [],
            reason: '',
            estimatedTime: 0,
            difficulty: 'normal'
        };

        // 1. 检查是否有需要复习的内容
        const reviewNeeded = this.reviewScheduler.getCharactersNeedingReview(this.learningData);
        if (reviewNeeded.length > 0) {
            recommendation.type = 'review';
            recommendation.characters = reviewNeeded.slice(0, this.config.MAX_REVIEW_CHARACTERS);
            recommendation.reason = '菩提提醒：有些汉字需要及时复习，温故而知新！';
            recommendation.estimatedTime = reviewNeeded.length * this.config.TIME_PER_REVIEW_CHAR;
            return recommendation;
        }

        // 2. 推荐新的高频汉字学习
        const learnedCharIds = new Set(this.learningData.keys());
        const nextHighFreqChars = await this.characterProvider.getNextHighFrequencyCharacters(
            learnedCharIds,
            this.config.DEFAULT_LEARNING_COUNT
        );

        recommendation.characters = nextHighFreqChars;
        recommendation.reason = '菩提建议：学习这些高频汉字，事半功倍！';
        recommendation.estimatedTime = nextHighFreqChars.length * this.config.TIME_PER_NEW_CHAR;

        return recommendation;
    }

    // 获取需要复习的汉字（委托给 ReviewScheduler）
    getCharactersNeedingReview() {
        return this.reviewScheduler.getCharactersNeedingReview(this.learningData);
    }

    // 获取下一批高频汉字（委托给 CharacterProvider）
    async getNextHighFrequencyCharacters(count = this.config.DEFAULT_LEARNING_COUNT) {
        const learnedCharIds = new Set(this.learningData.keys());
        return await this.characterProvider.getNextHighFrequencyCharacters(learnedCharIds, count);
    }

    // 记录学习结果（委托给 ReviewScheduler）
    async recordLearningResult(charId, isCorrect, timeSpent) {
        // 获取汉字信息
        const characterInfo = await this.characterProvider.getCharacterInfo(charId);

        // 更新学习数据
        const updatedData = this.reviewScheduler.updateLearningData(
            charId,
            isCorrect,
            timeSpent,
            this.learningData,
            characterInfo
        );

        // 更新用户档案
        this.updateUserProfile();

        // 保存数据
        await this.saveUserData();

        return updatedData;
    }

    // 生成AI菩提的智能建议
    generatePutiAdvice() {
        const advice = [];
        const stats = this.getUserLearningStats();

        // 获取学习策略建议
        const strategies = this.reviewScheduler.recommendLearningStrategy(stats);
        strategies.forEach(strategy => {
            advice.push({
                type: strategy.type,
                message: `菩提建议：${strategy.message}`,
                icon: this.getAdviceIcon(strategy.type),
                priority: strategy.priority
            });
        });

        // 基于学习统计生成建议
        if (stats.averageCorrectRate < this.config.GOOD_CORRECT_RATE_THRESHOLD) {
            advice.push({
                type: 'learning_strategy',
                message: '菩提建议：放慢学习节奏，重复练习能帮助更好地记忆汉字。',
                icon: '🧘‍♂️'
            });
        }

        if (stats.averageResponseTime > this.config.RESPONSE_TIME_THRESHOLD_MS) {
            advice.push({
                type: 'speed_improvement',
                message: '菩提提醒：可以尝试先熟悉汉字的形状和读音，提高反应速度。',
                icon: '⚡'
            });
        }

        if (stats.consecutiveDays >= 7) {
            advice.push({
                type: 'encouragement',
                message: '菩提赞叹：坚持学习七天，功德无量！继续保持这个好习惯。',
                icon: '🌟'
            });
        }

        // 根据时间给出建议
        const hour = new Date().getHours();
        if (hour >= 6 && hour <= 8) {
            advice.push({
                type: 'time_advice',
                message: '菩提晨语：一日之计在于晨，现在是学习的好时光！',
                icon: '🌅'
            });
        }

        return advice;
    }

    // 获取建议图标
    getAdviceIcon(type) {
        const iconMap = {
            'slow_down': '🐌',
            'speed_training': '⚡',
            'review_focus': '📚',
            'learning_strategy': '🧘‍♂️',
            'speed_improvement': '⚡',
            'encouragement': '🌟',
            'time_advice': '🌅'
        };
        return iconMap[type] || '💡';
    }

    // 获取用户学习统计（委托给 ReviewScheduler）
    getUserLearningStats() {
        const baseStats = this.reviewScheduler.getLearningStatistics(this.learningData);

        return {
            ...baseStats,
            consecutiveDays: this.calculateConsecutiveDays()
        };
    }

    // 改进的连续学习天数计算
    calculateConsecutiveDays() {
        const lastActive = this.userProfile.lastActiveDate;
        if (!lastActive) return 0;

        const today = new Date();
        const lastDate = new Date(lastActive);

        // 重置时间为午夜，以便只比较日期
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);

        const diffTime = today - lastDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 0) {
            // 今天已经学习过
            return this.userProfile.consecutiveDays || 1;
        } else if (diffDays === 1) {
            // 昨天学习过，今天第一次，天数+1
            // 注意：这个逻辑应该在用户完成一次学习后触发更新
            return (this.userProfile.consecutiveDays || 0) + 1;
        } else {
            // 中断了，重新开始
            return diffDays > 1 ? 1 : 0; // 如果今天学习了，就从1开始
        }
    }

    // 更新用户档案
    updateUserProfile() {
        const stats = this.getUserLearningStats();
        const today = new Date().toDateString();
        const lastActiveDay = this.userProfile.lastActiveDate ?
            new Date(this.userProfile.lastActiveDate).toDateString() : null;

        this.userProfile.totalCharactersLearned = stats.uniqueCharsLearned;

        // 更新连续天数逻辑
        if (lastActiveDay !== today) {
            // 今天第一次学习
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastActiveDay === yesterdayStr) {
                // 昨天也学习了，连续天数+1
                this.userProfile.consecutiveDays = (this.userProfile.consecutiveDays || 0) + 1;
            } else {
                // 中断了，重新开始
                this.userProfile.consecutiveDays = 1;
            }
        }

        this.userProfile.lastActiveDate = Date.now();

        // 根据学习表现调整学习速度
        if (stats.averageCorrectRate > this.config.EXCELLENT_CORRECT_RATE_THRESHOLD) {
            this.userProfile.learningSpeed = 'fast';
        } else if (stats.averageCorrectRate < this.config.POOR_CORRECT_RATE_THRESHOLD) {
            this.userProfile.learningSpeed = 'slow';
        } else {
            this.userProfile.learningSpeed = 'normal';
        }

        // 更新优势和弱点
        this.userProfile.strengths = this.reviewScheduler.analyzeStrengths(this.learningData, 5)
            .map(item => item.charId);
        this.userProfile.weaknesses = this.reviewScheduler.analyzeWeaknesses(this.learningData, 5)
            .map(item => item.charId);
    }

    // 保存用户数据（委托给 UserDataManager）
    async saveUserData() {
        return await this.userDataManager.saveUserData(this.userProfile, this.learningData);
    }

    // 导出用户数据
    async exportUserData() {
        return await this.userDataManager.exportUserData();
    }

    // 导入用户数据
    async importUserData(data) {
        const success = await this.userDataManager.importUserData(data);
        if (success) {
            // 重新加载数据
            this.userProfile = await this.userDataManager.loadUserProfile();
            this.learningData = await this.userDataManager.loadLearningData();
        }
        return success;
    }

    // 清除所有数据
    async clearAllData() {
        const success = await this.userDataManager.clearAllData();
        if (success) {
            this.userProfile = this.userDataManager.getDefaultUserProfile();
            this.learningData = new Map();
        }
        return success;
    }

    // 开始每日检查
    startDailyCheck() {
        // 清除之前的定时器
        if (this.dailyCheckTimer) {
            clearInterval(this.dailyCheckTimer);
        }

        // 每小时检查一次是否需要提醒复习
        this.dailyCheckTimer = setInterval(() => {
            this.checkForReviewReminders();
        }, this.config.REVIEW_CHECK_INTERVAL_MS);
    }

    // 停止每日检查
    stopDailyCheck() {
        if (this.dailyCheckTimer) {
            clearInterval(this.dailyCheckTimer);
            this.dailyCheckTimer = null;
        }
    }

    // 检查复习提醒
    checkForReviewReminders() {
        const reviewNeeded = this.getCharactersNeedingReview();
        if (reviewNeeded.length > 0) {
            this.showReviewReminder(reviewNeeded.length);
        }
    }

    // 显示复习提醒
    showReviewReminder(count) {
        // 这里可以显示通知或在界面上显示提醒
        console.log(`🔔 菩提提醒：有 ${count} 个汉字需要复习了！`);

        // 可以触发自定义事件，让UI层处理
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('aiPutiReviewReminder', {
                detail: { count, characters: this.getCharactersNeedingReview().slice(0, 5) }
            }));
        }
    }

    // 获取系统状态
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            characterDataLoaded: this.characterProvider.isDataLoaded(),
            totalCharacters: this.learningData.size,
            userLevel: this.userProfile?.currentLevel || 1,
            consecutiveDays: this.userProfile?.consecutiveDays || 0
        };
    }

    // 销毁系统（清理资源）
    destroy() {
        this.stopDailyCheck();
        this.isInitialized = false;
        console.log('🧘‍♂️ AI菩提系统已关闭');
    }
}

// 全局函数接口，供app.js调用
function getPutiAdvice() {
    if (window.aiPutiSystem && window.aiPutiSystem.isInitialized) {
        return window.aiPutiSystem.generatePutiAdvice();
    }
    return [];
}

async function getPutiRecommendation() {
    if (window.aiPutiSystem && window.aiPutiSystem.isInitialized) {
        const recommendation = await window.aiPutiSystem.recommendNextLearning();
        return recommendation;
    }
    return null;
}

function recordLearningResult(charId, isCorrect, responseTime) {
    if (window.aiPutiSystem && window.aiPutiSystem.isInitialized) {
        window.aiPutiSystem.recordLearningResult(charId, isCorrect, responseTime);
    }
}

// 导出AI菩提系统
window.AIPutiSystem = AIPutiSystem;
