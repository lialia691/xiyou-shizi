// AI菩提智能学习系统
// 基于高频汉字和个性化学习的智能助手

class AIPutiSystem {
    constructor() {
        this.learningData = new Map(); // 存储学习数据
        this.userProfile = {
            totalCharactersLearned: 0,
            currentLevel: 1,
            strengths: [], // 擅长的汉字类型
            weaknesses: [], // 需要加强的汉字
            learningSpeed: 'normal', // slow, normal, fast
            preferredLearningTime: 15, // 分钟
            lastActiveDate: null
        };
        this.forgettingCurve = {
            // 艾宾浩斯遗忘曲线时间点（小时）
            reviewPoints: [1, 9, 24, 72, 168, 720], // 1小时、9小时、1天、3天、1周、1月
            retentionRates: [0.58, 0.44, 0.36, 0.28, 0.25, 0.21]
        };
    }

    // 初始化AI菩提系统
    async initialize() {
        await this.loadUserProfile();
        await this.loadLearningData();
        this.startDailyCheck();
        console.log('🧘‍♂️ AI菩提系统已启动，准备为您提供智能学习指导');
    }

    // 智能推荐下一个学习内容
    recommendNextLearning() {
        const recommendation = {
            type: 'character_learning',
            characters: [],
            reason: '',
            estimatedTime: 0,
            difficulty: 'normal'
        };

        // 1. 检查是否有需要复习的内容
        const reviewNeeded = this.getCharactersNeedingReview();
        if (reviewNeeded.length > 0) {
            recommendation.type = 'review';
            recommendation.characters = reviewNeeded.slice(0, 5);
            recommendation.reason = '菩提提醒：有些汉字需要及时复习，温故而知新！';
            recommendation.estimatedTime = reviewNeeded.length * 2;
            return recommendation;
        }

        // 2. 推荐新的高频汉字学习
        const nextHighFreqChars = this.getNextHighFrequencyCharacters();
        recommendation.characters = nextHighFreqChars;
        recommendation.reason = '菩提建议：学习这些高频汉字，事半功倍！';
        recommendation.estimatedTime = nextHighFreqChars.length * 3;

        return recommendation;
    }

    // 获取需要复习的汉字
    getCharactersNeedingReview() {
        const now = Date.now();
        const needReview = [];

        for (let [charId, data] of this.learningData) {
            if (!data.lastReviewTime) continue;

            const timeSinceReview = (now - data.lastReviewTime) / (1000 * 60 * 60); // 小时
            const shouldReview = this.shouldReviewCharacter(data, timeSinceReview);

            if (shouldReview) {
                needReview.push({
                    charId,
                    priority: this.calculateReviewPriority(data, timeSinceReview),
                    ...data
                });
            }
        }

        // 按优先级排序
        return needReview.sort((a, b) => b.priority - a.priority);
    }

    // 判断是否需要复习某个汉字
    shouldReviewCharacter(charData, hoursSinceReview) {
        const { reviewCount = 0, correctRate = 0 } = charData;
        
        // 根据掌握程度确定复习间隔
        let reviewInterval;
        if (correctRate >= 0.9) {
            reviewInterval = this.forgettingCurve.reviewPoints[Math.min(reviewCount, 5)];
        } else if (correctRate >= 0.7) {
            reviewInterval = this.forgettingCurve.reviewPoints[Math.min(reviewCount, 3)];
        } else {
            reviewInterval = this.forgettingCurve.reviewPoints[0]; // 1小时后就复习
        }

        return hoursSinceReview >= reviewInterval;
    }

    // 计算复习优先级
    calculateReviewPriority(charData, hoursSinceReview) {
        const { correctRate = 0, frequency = 0, reviewCount = 0 } = charData;
        
        // 优先级 = 频率权重 + 错误率权重 + 时间权重
        const frequencyWeight = frequency / 100000000; // 标准化频率
        const errorWeight = (1 - correctRate) * 2; // 错误率越高优先级越高
        const timeWeight = Math.min(hoursSinceReview / 24, 2); // 时间越长优先级越高，最大2

        return frequencyWeight + errorWeight + timeWeight;
    }

    // 获取下一批高频汉字
    getNextHighFrequencyCharacters(count = 10) {
        // 这里需要从 chinaword2500.json 中获取数据
        // 暂时返回模拟数据，后续会连接真实数据
        return [
            { char: "的", pinyin: "de", frequency: 99999999, rank: 1 },
            { char: "是", pinyin: "shì", frequency: 99999998, rank: 2 },
            { char: "了", pinyin: "le", frequency: 99999997, rank: 3 },
            { char: "我", pinyin: "wǒ", frequency: 99999996, rank: 4 },
            { char: "不", pinyin: "bù", frequency: 99999995, rank: 5 }
        ].slice(0, count);
    }

    // 记录学习结果
    recordLearningResult(charId, isCorrect, timeSpent) {
        if (!this.learningData.has(charId)) {
            this.learningData.set(charId, {
                charId,
                totalAttempts: 0,
                correctAttempts: 0,
                totalTimeSpent: 0,
                lastReviewTime: null,
                reviewCount: 0,
                correctRate: 0,
                averageResponseTime: 0
            });
        }

        const data = this.learningData.get(charId);
        data.totalAttempts++;
        data.totalTimeSpent += timeSpent;
        data.lastReviewTime = Date.now();

        if (isCorrect) {
            data.correctAttempts++;
        }

        data.correctRate = data.correctAttempts / data.totalAttempts;
        data.averageResponseTime = data.totalTimeSpent / data.totalAttempts;

        // 如果正确率提高，增加复习计数
        if (isCorrect && data.correctRate > 0.8) {
            data.reviewCount++;
        }

        this.learningData.set(charId, data);
        this.updateUserProfile();
        this.saveUserData();
    }

    // 生成AI菩提的智能建议
    generatePutiAdvice() {
        const advice = [];
        const stats = this.getUserLearningStats();

        // 基于学习统计生成建议
        if (stats.averageCorrectRate < 0.7) {
            advice.push({
                type: 'learning_strategy',
                message: '菩提建议：放慢学习节奏，重复练习能帮助更好地记忆汉字。',
                icon: '🧘‍♂️'
            });
        }

        if (stats.averageResponseTime > 5000) { // 5秒
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

    // 获取用户学习统计
    getUserLearningStats() {
        let totalAttempts = 0;
        let totalCorrect = 0;
        let totalTime = 0;
        let uniqueCharsLearned = 0;

        for (let [charId, data] of this.learningData) {
            totalAttempts += data.totalAttempts;
            totalCorrect += data.correctAttempts;
            totalTime += data.totalTimeSpent;
            if (data.correctRate > 0.6) uniqueCharsLearned++;
        }

        return {
            totalCharacters: this.learningData.size,
            uniqueCharsLearned,
            averageCorrectRate: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
            averageResponseTime: totalAttempts > 0 ? totalTime / totalAttempts : 0,
            totalStudyTime: totalTime,
            consecutiveDays: this.calculateConsecutiveDays()
        };
    }

    // 计算连续学习天数
    calculateConsecutiveDays() {
        // 简化实现，实际应该检查每日学习记录
        const lastActive = this.userProfile.lastActiveDate;
        if (!lastActive) return 0;

        const today = new Date().toDateString();
        const lastActiveDate = new Date(lastActive).toDateString();
        
        if (today === lastActiveDate) {
            return this.userProfile.consecutiveDays || 1;
        }
        
        return 0;
    }

    // 更新用户档案
    updateUserProfile() {
        const stats = this.getUserLearningStats();
        this.userProfile.totalCharactersLearned = stats.uniqueCharsLearned;
        this.userProfile.lastActiveDate = Date.now();
        
        // 根据学习表现调整学习速度
        if (stats.averageCorrectRate > 0.9) {
            this.userProfile.learningSpeed = 'fast';
        } else if (stats.averageCorrectRate < 0.6) {
            this.userProfile.learningSpeed = 'slow';
        } else {
            this.userProfile.learningSpeed = 'normal';
        }
    }

    // 保存用户数据
    saveUserData() {
        try {
            localStorage.setItem('aiPutiUserProfile', JSON.stringify(this.userProfile));
            localStorage.setItem('aiPutiLearningData', JSON.stringify([...this.learningData]));
        } catch (error) {
            console.error('保存用户数据失败:', error);
        }
    }

    // 加载用户档案
    async loadUserProfile() {
        try {
            const saved = localStorage.getItem('aiPutiUserProfile');
            if (saved) {
                this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('加载用户档案失败:', error);
        }
    }

    // 加载学习数据
    async loadLearningData() {
        try {
            const saved = localStorage.getItem('aiPutiLearningData');
            if (saved) {
                this.learningData = new Map(JSON.parse(saved));
            }
        } catch (error) {
            console.error('加载学习数据失败:', error);
        }
    }

    // 开始每日检查
    startDailyCheck() {
        // 每小时检查一次是否需要提醒复习
        setInterval(() => {
            this.checkForReviewReminders();
        }, 60 * 60 * 1000); // 1小时
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
    }
}

// 导出AI菩提系统
window.AIPutiSystem = AIPutiSystem;
