// 用户数据管理器
// 专门负责用户数据的存储和加载

class UserDataManager {
    constructor(config = AI_PUTI_CONFIG) {
        this.config = config;
        this.storageType = 'localStorage'; // 未来可扩展为 'indexedDB'
    }

    // 初始化默认用户档案
    getDefaultUserProfile() {
        return {
            totalCharactersLearned: 0,
            currentLevel: 1,
            strengths: [], // 擅长的汉字类型
            weaknesses: [], // 需要加强的汉字
            learningSpeed: 'normal', // slow, normal, fast
            preferredLearningTime: 15, // 分钟
            lastActiveDate: null,
            consecutiveDays: 0,
            dailyLearningRecord: {} // 记录每日学习情况
        };
    }

    // 加载用户档案
    async loadUserProfile() {
        try {
            const saved = localStorage.getItem(this.config.STORAGE_KEYS.USER_PROFILE);
            if (saved) {
                const savedProfile = JSON.parse(saved);
                return { ...this.getDefaultUserProfile(), ...savedProfile };
            }
            return this.getDefaultUserProfile();
        } catch (error) {
            console.error('加载用户档案失败:', error);
            return this.getDefaultUserProfile();
        }
    }

    // 保存用户档案
    async saveUserProfile(userProfile) {
        try {
            localStorage.setItem(
                this.config.STORAGE_KEYS.USER_PROFILE, 
                JSON.stringify(userProfile)
            );
            return true;
        } catch (error) {
            console.error('保存用户档案失败:', error);
            return false;
        }
    }

    // 加载学习数据
    async loadLearningData() {
        try {
            const saved = localStorage.getItem(this.config.STORAGE_KEYS.LEARNING_DATA);
            if (saved) {
                return new Map(JSON.parse(saved));
            }
            return new Map();
        } catch (error) {
            console.error('加载学习数据失败:', error);
            return new Map();
        }
    }

    // 保存学习数据
    async saveLearningData(learningData) {
        try {
            localStorage.setItem(
                this.config.STORAGE_KEYS.LEARNING_DATA, 
                JSON.stringify([...learningData])
            );
            return true;
        } catch (error) {
            console.error('保存学习数据失败:', error);
            return false;
        }
    }

    // 批量保存用户数据
    async saveUserData(userProfile, learningData) {
        const profileSaved = await this.saveUserProfile(userProfile);
        const dataSaved = await this.saveLearningData(learningData);
        return profileSaved && dataSaved;
    }

    // 清除所有用户数据
    async clearAllData() {
        try {
            localStorage.removeItem(this.config.STORAGE_KEYS.USER_PROFILE);
            localStorage.removeItem(this.config.STORAGE_KEYS.LEARNING_DATA);
            return true;
        } catch (error) {
            console.error('清除用户数据失败:', error);
            return false;
        }
    }

    // 导出用户数据（用于备份）
    async exportUserData() {
        try {
            const userProfile = await this.loadUserProfile();
            const learningData = await this.loadLearningData();
            
            return {
                userProfile,
                learningData: [...learningData],
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('导出用户数据失败:', error);
            return null;
        }
    }

    // 导入用户数据（用于恢复）
    async importUserData(data) {
        try {
            if (!data || !data.userProfile || !data.learningData) {
                throw new Error('无效的数据格式');
            }

            const profileSaved = await this.saveUserProfile(data.userProfile);
            const dataSaved = await this.saveLearningData(new Map(data.learningData));
            
            return profileSaved && dataSaved;
        } catch (error) {
            console.error('导入用户数据失败:', error);
            return false;
        }
    }

    // 获取存储使用情况
    getStorageUsage() {
        try {
            const profileData = localStorage.getItem(this.config.STORAGE_KEYS.USER_PROFILE) || '';
            const learningData = localStorage.getItem(this.config.STORAGE_KEYS.LEARNING_DATA) || '';
            
            return {
                profileSize: new Blob([profileData]).size,
                learningDataSize: new Blob([learningData]).size,
                totalSize: new Blob([profileData + learningData]).size
            };
        } catch (error) {
            console.error('获取存储使用情况失败:', error);
            return { profileSize: 0, learningDataSize: 0, totalSize: 0 };
        }
    }
}

// 导出用户数据管理器
window.UserDataManager = UserDataManager;
