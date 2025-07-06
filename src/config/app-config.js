// 应用配置管理 - 统一管理所有配置项
// 🎯 设计理念：将所有配置集中管理，避免分散在各个文件中造成维护困难
const AppConfig = {
    // 应用基础配置
    app: {
        name: '西游识字2500',        // 应用名称，用于显示和标识
        version: '0.2',             // 版本号，用于版本管理和缓存控制
        debug: false                // 调试模式开关，控制是否输出调试信息
    },

    // 游戏配置 - 控制核心玩法参数
    game: {
        charactersPerLevel: 10,     // 每关学习的汉字数量，影响学习强度
        maxLevels: 50,              // 最大关卡数，决定游戏内容总量
        timePerCharacter: 2,        // 每个汉字的预期学习时间(分钟)，用于进度估算
        maxLives: 3,                // 最大生命值，影响游戏难度和容错性
        scorePerCorrect: 1          // 答对一题的得分，保持简单的1分制
    },

    // AI菩提系统配置 - 智能学习算法的核心参数
    ai: {
        // 时间相关配置
        responseTimeThreshold: 5000,        // 响应时间阈值(毫秒)，超过此时间认为学习者有困难
        reviewCheckInterval: 60 * 60 * 1000, // 复习检查间隔(1小时)，定期检查是否需要复习

        // 算法参数 - 用于评估学习者的掌握程度
        frequencyNormalizationFactor: 100000000,  // 词频归一化因子，用于平衡高频词和低频词的权重
        highCorrectRateThreshold: 0.8,           // 高正确率阈值，达到此值认为掌握良好
        excellentCorrectRateThreshold: 0.9,      // 优秀正确率阈值，达到此值认为完全掌握
        poorCorrectRateThreshold: 0.6,           // 较差正确率阈值，低于此值需要重点复习
        goodCorrectRateThreshold: 0.7,           // 良好正确率阈值，介于良好和优秀之间

        // 权重配置 - 影响学习优先级的计算
        errorWeightMultiplier: 2,               // 错误权重倍数，错误的汉字会获得更高的复习优先级
        maxTimeWeight: 2,                       // 最大时间权重，响应时间过长的汉字权重增加

        // 学习相关配置
        defaultLearningCount: 10,               // 默认学习数量，每次学习的汉字个数
        maxReviewCharacters: 5,                 // 最大复习汉字数，避免复习负担过重
        timePerReviewChar: 2,                   // 每个复习汉字的预期时间(分钟)
        timePerNewChar: 3,                      // 每个新汉字的预期学习时间(分钟)

        // 艾宾浩斯遗忘曲线配置 - 基于科学的记忆规律
        forgettingCurve: {
            // 复习时间点(小时)：1小时、9小时、1天、3天、1周、1月
            // 🧠 科学依据：根据艾宾浩斯遗忘曲线理论，这些是记忆巩固的关键时间点
            reviewPoints: [1, 9, 24, 72, 168, 720],
            // 对应时间点的记忆保持率，用于计算复习优先级
            // 📊 数据来源：艾宾浩斯实验数据，随时间递减的记忆保持率
            retentionRates: [0.58, 0.44, 0.36, 0.28, 0.25, 0.21]
        }
    },

    // 语音系统配置 - 控制汉字发音的参数
    speech: {
        volume: 1.0,                // 音量(0-1)，1.0为最大音量确保清晰度
        rate: 0.6,                  // 语速(0.1-10)，0.6为较慢语速，适合儿童学习拼音
        pitch: 1.0,                 // 音调(0-2)，1.0为标准音调
        // 首选语音引擎列表 - 按优先级排序，确保在不同设备上都能找到合适的中文语音
        preferredVoices: [
            'Microsoft Yaoyao Desktop - Chinese (Simplified, PRC)',    // 微软雅雅（桌面版）
            'Microsoft Kangkang Desktop - Chinese (Simplified, PRC)',  // 微软康康（桌面版）
            'Microsoft Huihui Desktop - Chinese (Simplified, PRC)',    // 微软慧慧（桌面版）
            'Chinese (China)'                                          // 通用中文语音（兜底选项）
        ]
    },

    // 数据文件路径配置 - 统一管理数据文件位置
    data: {
        charactersFile: './data/chinaword2500.json',    // 汉字数据库文件，包含2500个常用汉字
        storiesFile: './data/stories.json'              // 西游记故事模板文件，用于生成关卡
    },

    // 存储键名配置 - 统一管理localStorage的键名，避免键名冲突
    storage: {
        userProfile: 'aiPutiUserProfile',       // 用户档案数据，包含学习偏好和基本信息
        learningData: 'aiPutiLearningData',     // 学习数据，包含每个汉字的学习记录
        gameProgress: 'gameProgress',           // 游戏进度，包含关卡完成情况和得分
        settings: 'userSettings'                // 用户设置，包含音量、语速等个性化配置
    },

    // UI配置 - 控制用户界面的交互体验
    ui: {
        animationDuration: 300,                 // 动画持续时间(毫秒)，影响界面切换的流畅度
        toastDuration: 3000,                    // 提示消息显示时间(毫秒)，影响用户反馈的可见性
        mobileBreakpoint: 768                   // 移动端断点(像素)，用于响应式设计的屏幕尺寸判断
    },

    // 开发配置 - 仅在开发阶段使用的配置
    dev: {
        enableConsoleLog: true,                 // 是否启用控制台日志，便于调试
        enablePerformanceMonitoring: false,    // 是否启用性能监控，用于性能分析
        mockDataEnabled: false                  // 是否启用模拟数据，用于离线开发测试
    }
};

// 🔧 环境配置覆盖 - 根据运行环境自动调整配置
// 检测开发环境：本地主机或文件协议
if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
    AppConfig.dev.enableConsoleLog = true;     // 开发环境自动启用日志
    AppConfig.app.debug = true;                // 开发环境自动启用调试模式
}

// 🛡️ 配置验证函数 - 确保应用启动时所有必要配置都存在
const validateConfig = () => {
    // 定义必须存在的配置模块
    const required = ['app', 'game', 'ai', 'speech', 'data', 'storage'];

    // 逐一检查每个必要配置模块
    for (const key of required) {
        if (!AppConfig[key]) {
            // 如果缺少配置，抛出错误阻止应用启动
            throw new Error(`缺少必要配置: ${key}`);
        }
    }
    console.log('✅ 配置验证通过');
};

// 🔍 获取配置的辅助函数 - 支持点号路径访问嵌套配置
// 使用示例：getConfig('ai.forgettingCurve.reviewPoints')
const getConfig = (path) => {
    const keys = path.split('.');           // 将路径按点号分割成数组
    let value = AppConfig;                  // 从根配置对象开始

    // 逐层深入访问嵌套属性
    for (const key of keys) {
        value = value[key];
        if (value === undefined) {
            // 如果路径不存在，记录警告并返回null
            console.warn(`配置路径不存在: ${path}`);
            return null;
        }
    }
    return value;                           // 返回找到的配置值
};

// 🌐 导出配置到全局作用域 - 使整个应用都能访问配置
window.AppConfig = AppConfig;               // 导出完整配置对象
window.getConfig = getConfig;               // 导出配置访问函数

// 🚀 初始化时验证配置 - 确保应用启动前配置完整
validateConfig();
