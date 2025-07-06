// 复习调度器
// 包含核心的复习算法和优先级计算逻辑

class ReviewScheduler {
    constructor(config = AI_PUTI_CONFIG) {
        this.config = config;
        this.forgettingCurve = config.FORGETTING_CURVE;
    }

    // 获取需要复习的汉字
    getCharactersNeedingReview(learningData) {
        const now = Date.now();
        const needReview = [];

        for (let [charId, data] of learningData) {
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
        if (correctRate >= this.config.EXCELLENT_CORRECT_RATE_THRESHOLD) {
            // 掌握很好，使用完整的遗忘曲线
            reviewInterval = this.forgettingCurve.reviewPoints[Math.min(reviewCount, 5)];
        } else if (correctRate >= this.config.GOOD_CORRECT_RATE_THRESHOLD) {
            // 掌握一般，缩短复习间隔
            reviewInterval = this.forgettingCurve.reviewPoints[Math.min(reviewCount, 3)];
        } else {
            // 掌握较差，频繁复习
            reviewInterval = this.forgettingCurve.reviewPoints[0]; // 1小时后就复习
        }

        return hoursSinceReview >= reviewInterval;
    }

    // 计算复习优先级
    calculateReviewPriority(charData, hoursSinceReview) {
        const { correctRate = 0, frequency = 0 } = charData;
        
        // 优先级 = 频率权重 + 错误率权重 + 时间权重
        const frequencyWeight = frequency / this.config.FREQUENCY_NORMALIZATION_FACTOR;
        const errorWeight = (1 - correctRate) * this.config.ERROR_WEIGHT_MULTIPLIER;
        const timeWeight = Math.min(hoursSinceReview / 24, this.config.MAX_TIME_WEIGHT);

        return frequencyWeight + errorWeight + timeWeight;
    }

    // 改进的学习结果记录逻辑
    updateLearningData(charId, isCorrect, timeSpent, learningData, characterInfo = null) {
        if (!learningData.has(charId)) {
            learningData.set(charId, {
                charId,
                totalAttempts: 0,
                correctAttempts: 0,
                totalTimeSpent: 0,
                lastReviewTime: null,
                reviewCount: 0,
                correctRate: 0,
                averageResponseTime: 0,
                frequency: characterInfo?.frequency || 0,
                firstLearnTime: Date.now()
            });
        }

        const data = learningData.get(charId);
        data.totalAttempts++;
        data.totalTimeSpent += timeSpent;
        data.lastReviewTime = Date.now();

        if (isCorrect) {
            data.correctAttempts++;
            // 简化逻辑：只要答对就增加复习计数
            data.reviewCount++;
        }

        data.correctRate = data.correctAttempts / data.totalAttempts;
        data.averageResponseTime = data.totalTimeSpent / data.totalAttempts;

        learningData.set(charId, data);
        return data;
    }

    // 计算下次复习时间
    calculateNextReviewTime(charData) {
        const { reviewCount = 0, correctRate = 0 } = charData;
        
        let intervalHours;
        if (correctRate >= this.config.EXCELLENT_CORRECT_RATE_THRESHOLD) {
            intervalHours = this.forgettingCurve.reviewPoints[Math.min(reviewCount, 5)];
        } else if (correctRate >= this.config.GOOD_CORRECT_RATE_THRESHOLD) {
            intervalHours = this.forgettingCurve.reviewPoints[Math.min(reviewCount, 3)];
        } else {
            intervalHours = this.forgettingCurve.reviewPoints[0];
        }

        return Date.now() + (intervalHours * 60 * 60 * 1000);
    }

    // 获取学习统计信息
    getLearningStatistics(learningData) {
        let totalAttempts = 0;
        let totalCorrect = 0;
        let totalTime = 0;
        let uniqueCharsLearned = 0;

        for (let [, data] of learningData) {
            totalAttempts += data.totalAttempts;
            totalCorrect += data.correctAttempts;
            totalTime += data.totalTimeSpent;
            if (data.correctRate > this.config.POOR_CORRECT_RATE_THRESHOLD) {
                uniqueCharsLearned++;
            }
        }

        return {
            totalCharacters: learningData.size,
            uniqueCharsLearned,
            averageCorrectRate: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
            averageResponseTime: totalAttempts > 0 ? totalTime / totalAttempts : 0,
            totalStudyTime: totalTime,
            totalAttempts,
            totalCorrect
        };
    }

    // 分析学习弱点
    analyzeWeaknesses(learningData, limit = 10) {
        const weakCharacters = [];

        for (let [charId, data] of learningData) {
            if (data.correctRate < this.config.GOOD_CORRECT_RATE_THRESHOLD && data.totalAttempts >= 3) {
                weakCharacters.push({
                    charId,
                    correctRate: data.correctRate,
                    totalAttempts: data.totalAttempts,
                    averageResponseTime: data.averageResponseTime,
                    priority: this.calculateWeaknessPriority(data)
                });
            }
        }

        return weakCharacters
            .sort((a, b) => b.priority - a.priority)
            .slice(0, limit);
    }

    // 计算弱点优先级
    calculateWeaknessPriority(charData) {
        const { correctRate, totalAttempts, frequency = 0, averageResponseTime } = charData;
        
        const errorRate = 1 - correctRate;
        const attemptWeight = Math.min(totalAttempts / 10, 1); // 尝试次数权重
        const frequencyWeight = frequency / this.config.FREQUENCY_NORMALIZATION_FACTOR;
        const timeWeight = averageResponseTime > this.config.RESPONSE_TIME_THRESHOLD_MS ? 1 : 0;
        
        return errorRate * 2 + attemptWeight + frequencyWeight + timeWeight;
    }

    // 分析学习优势
    analyzeStrengths(learningData, limit = 10) {
        const strongCharacters = [];

        for (let [charId, data] of learningData) {
            if (data.correctRate >= this.config.EXCELLENT_CORRECT_RATE_THRESHOLD && data.totalAttempts >= 3) {
                strongCharacters.push({
                    charId,
                    correctRate: data.correctRate,
                    totalAttempts: data.totalAttempts,
                    averageResponseTime: data.averageResponseTime,
                    reviewCount: data.reviewCount
                });
            }
        }

        return strongCharacters
            .sort((a, b) => b.correctRate - a.correctRate)
            .slice(0, limit);
    }

    // 推荐学习策略
    recommendLearningStrategy(learningStats) {
        const strategies = [];

        if (learningStats.averageCorrectRate < this.config.GOOD_CORRECT_RATE_THRESHOLD) {
            strategies.push({
                type: 'slow_down',
                message: '建议放慢学习节奏，重复练习能帮助更好地记忆汉字。',
                priority: 'high'
            });
        }

        if (learningStats.averageResponseTime > this.config.RESPONSE_TIME_THRESHOLD_MS) {
            strategies.push({
                type: 'speed_training',
                message: '可以尝试先熟悉汉字的形状和读音，提高反应速度。',
                priority: 'medium'
            });
        }

        if (learningStats.uniqueCharsLearned >= 50) {
            strategies.push({
                type: 'review_focus',
                message: '已学习较多汉字，建议重点进行复习巩固。',
                priority: 'medium'
            });
        }

        return strategies;
    }
}

// 导出复习调度器
window.ReviewScheduler = ReviewScheduler;
