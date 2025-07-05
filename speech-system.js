// 语音系统 - 实现拼音发音功能
// 优化版：依赖注入 CharacterProvider，动态生成拼音映射

// 常量提取：首选中文语音列表
const PREFERRED_CHINESE_VOICES = [
    // 最高优先级：微软高质量中文语音
    'Microsoft Yaoyao Desktop - Chinese (Simplified, PRC)',
    'Microsoft Kangkang Desktop - Chinese (Simplified, PRC)',
    'Microsoft Huihui Desktop - Chinese (Simplified, PRC)',
    'Microsoft Yaoyao - Chinese (Simplified, PRC)',
    'Microsoft Kangkang - Chinese (Simplified, PRC)',
    'Microsoft Huihui - Chinese (Simplified, PRC)',
    'Microsoft Zhiwei - Chinese (Simplified, PRC)',

    // 次优先级：其他高质量语音
    'Google 中文（中国大陆）',
    'Google Chinese (China)',
    'Ting-Ting',
    'Sin-ji',

    // 备选：标准中文语音
    'Chinese (China)',
    'Chinese (Simplified)',
    'zh-CN',
    'cmn-Hans-CN'
];

class SpeechSystem {
    constructor(characterProvider) {
        this.characterProvider = characterProvider; // 依赖注入
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.chineseVoice = null;
        this.isEnabled = true;
        this.volume = 1.0; // 最大音量确保清晰
        this.rate = 0.6; // 更慢的语速，便于学习拼音
        this.pitch = 1.0; // 标准音调
        this.isPlaying = false; // 添加播放状态管理
        this.currentUtterance = null; // 当前播放的语音
        this.pinyinToCharMap = new Map(); // 使用 Map 替代巨大对象
        this.isMobile = this.detectMobileDevice(); // 检测移动设备
        this.audioActivated = false; // 移动端音频是否已激活

        // 不再在构造函数中调用 init()，改为外部调用
    }

    // 检测移动设备
    detectMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    // 移动端音频激活
    async activateAudioForMobile() {
        if (!this.isMobile || this.audioActivated) return;

        try {
            // 创建一个静音的语音来激活音频上下文
            const utterance = new SpeechSynthesisUtterance('');
            utterance.volume = 0;
            utterance.rate = 1;
            utterance.pitch = 1;

            this.speechSynthesis.speak(utterance);
            this.audioActivated = true;
            console.log('📱 移动端音频上下文已激活');
        } catch (error) {
            console.warn('⚠️ 移动端音频激活失败:', error);
        }
    }

    // 优化后的初始化方法
    async init() {
        if (!this.speechSynthesis) {
            console.warn('浏览器不支持语音合成功能');
            this.isEnabled = false;
            return;
        }

        // 等待 CharacterProvider 加载数据
        if (this.characterProvider && !this.characterProvider.isDataLoaded()) {
            await this.characterProvider.load();
        }

        // 动态生成拼音映射
        this.generatePinyinMap();

        // 等待语音列表加载
        await this.loadVoices();

        // 选择中文语音
        this.selectChineseVoice();

        console.log('🔊 语音系统初始化完成');
    }

    // 新增方法：动态生成拼音映射表
    generatePinyinMap() {
        if (!this.characterProvider) {
            console.warn('⚠️ CharacterProvider 未提供，跳过拼音映射生成');
            return;
        }

        console.log('🔄 正在根据汉字数据生成动态拼音映射...');
        const characters = this.characterProvider.characterList;

        // 清空现有映射
        this.pinyinToCharMap.clear();

        // 我们只需要每个拼音对应一个汉字即可
        for (const item of characters) {
            const char = item.char || item.汉字; // 兼容不同的字段名
            const pinyin = item.pinyin || item.注音; // 兼容不同的字段名

            if (!char || !pinyin) continue;

            // 使用 pinyin-clean（去除声调）作为 key，确保覆盖所有声调
            const pinyinWithoutTone = this.removeTone(pinyin);
            if (pinyinWithoutTone && !this.pinyinToCharMap.has(pinyinWithoutTone)) {
                this.pinyinToCharMap.set(pinyinWithoutTone, char);
            }

            // 同时添加带声调的映射，以备不时之需
            if (pinyin && !this.pinyinToCharMap.has(pinyin)) {
                this.pinyinToCharMap.set(pinyin, char);
            }
        }

        console.log(`✅ 成功生成 ${this.pinyinToCharMap.size} 条拼音映射`);
    }

    // 新增辅助方法：移除拼音中的声调
    removeTone(pinyin) {
        if (!pinyin) return '';

        const toneMap = {
            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
            'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', // ü 用 v 代替
        };

        return pinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, char => toneMap[char] || char);
    }

    // 加载可用的语音
    loadVoices() {
        return new Promise((resolve) => {
            const loadVoicesHandler = () => {
                this.voices = this.speechSynthesis.getVoices();
                if (this.voices.length > 0) {
                    this.speechSynthesis.removeEventListener('voiceschanged', loadVoicesHandler);
                    resolve();
                }
            };

            // 如果语音已经加载
            if (this.speechSynthesis.getVoices().length > 0) {
                this.voices = this.speechSynthesis.getVoices();
                resolve();
            } else {
                // 等待语音加载
                this.speechSynthesis.addEventListener('voiceschanged', loadVoicesHandler);
            }
        });
    }

    // 选择中文语音 - 优化版，使用提取的常量
    selectChineseVoice() {
        // 获取所有中文语音
        const chineseVoices = this.voices.filter(voice =>
            voice.lang.includes('zh') ||
            voice.lang.includes('cmn') ||
            voice.name.includes('Chinese') ||
            voice.name.includes('中文') ||
            voice.name.includes('Mandarin')
        );

        if (chineseVoices.length > 0) {
            // 尝试找到最佳语音（使用提取的常量）
            for (const preferred of PREFERRED_CHINESE_VOICES) {
                const voice = chineseVoices.find(v =>
                    v.name.includes(preferred) ||
                    v.name === preferred ||
                    v.lang.includes(preferred)
                );
                if (voice) {
                    this.chineseVoice = voice;
                    console.log(`🎤 选择纯正普通话语音: ${voice.name} (${voice.lang})`);
                    return;
                }
            }

            // 如果没找到首选语音，选择第一个中文语音
            this.chineseVoice = chineseVoices[0];
            console.log(`🎤 选择语音: ${this.chineseVoice.name} (${this.chineseVoice.lang})`);
        } else {
            // 如果没有中文语音，使用默认语音
            this.chineseVoice = this.voices[0];
            console.warn('⚠️ 未找到中文语音，使用默认语音');
        }

        // 输出所有可用的中文语音供调试
        console.log('📋 可用的中文语音列表:');
        chineseVoices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${voice.localService ? '本地' : '在线'}`);
        });
    }

    // 播放拼音发音
    async speakPinyin(pinyin, character = '') {
        if (!this.isEnabled || !this.speechSynthesis) {
            console.warn('语音功能未启用');
            return Promise.resolve();
        }

        // 移动端音频激活
        if (this.isMobile && !this.audioActivated) {
            await this.activateAudioForMobile();
        }

        // 如果正在播放，先停止
        if (this.isPlaying) {
            this.stop();
        }

        return new Promise((resolve, reject) => {
            // 设置播放状态
            this.isPlaying = true;

            // 强制停止所有当前播放
            this.speechSynthesis.cancel();

            // 短暂延迟确保停止完成
            setTimeout(() => {
                // 处理拼音，使其更适合语音合成
                const processedPinyin = this.processPinyinForSpeech(pinyin);
                const utterance = new SpeechSynthesisUtterance(processedPinyin);

                // 保存当前语音实例
                this.currentUtterance = utterance;

                // 设置语音参数
                if (this.chineseVoice) {
                    utterance.voice = this.chineseVoice;
                }
                utterance.volume = this.volume;
                utterance.rate = this.rate;
                utterance.pitch = this.pitch;

                // 设置语言
                utterance.lang = 'zh-CN';

                // 事件监听
                utterance.onend = () => {
                    console.log(`🔊 播放完成: ${pinyin} ${character}`);
                    this.isPlaying = false;
                    this.currentUtterance = null;
                    resolve();
                };

                utterance.onerror = (event) => {
                    console.error('语音播放错误:', event.error);
                    this.isPlaying = false;
                    this.currentUtterance = null;

                    // 移动端特殊处理
                    if (this.isMobile && event.error === 'not-allowed') {
                        console.warn('📱 移动端音频权限被拒绝，尝试重新激活');
                        this.audioActivated = false;
                    }

                    reject(event.error);
                };

                utterance.onstart = () => {
                    console.log(`🎵 开始播放: ${pinyin} ${character}`);
                };

                // 开始播放
                try {
                    this.speechSynthesis.speak(utterance);
                } catch (error) {
                    console.error('播放启动失败:', error);
                    this.isPlaying = false;
                    this.currentUtterance = null;
                    reject(error);
                }
            }, 50); // 50ms延迟确保之前的播放已停止
        });
    }

    // 优化后的拼音处理方法 - 使用动态映射表
    processPinyinForSpeech(pinyin) {
        if (!pinyin) return '';

        let processed = pinyin.trim().toLowerCase();

        // 优先使用完全匹配（可能带声调）
        if (this.pinyinToCharMap.has(processed)) {
            return this.pinyinToCharMap.get(processed);
        }

        // 其次使用去声调匹配
        const pinyinWithoutTone = this.removeTone(processed);
        if (this.pinyinToCharMap.has(pinyinWithoutTone)) {
            return this.pinyinToCharMap.get(pinyinWithoutTone);
        }

        // 如果映射表里没有，说明可能是词语或句子，直接返回
        // 语音引擎通常能很好地处理词语和句子
        return pinyin;
    }

    // 播放汉字发音（汉字+拼音）
    speakCharacter(character, pinyin = '') {
        if (!this.isEnabled) return Promise.resolve();

        // 只说汉字，发音更清晰
        // pinyin 参数保留用于日志记录
        return this.speakPinyin(character, `${character}${pinyin ? ` (${pinyin})` : ''}`);
    }

    // 备用语音方案：使用在线TTS（如果本地语音质量不好）
    async speakWithOnlineTTS(text) {
        try {
            // 这里可以集成在线TTS服务，比如百度、腾讯等
            // 目前先使用本地语音合成
            return this.speakPinyin(text);
        } catch (error) {
            console.error('在线TTS失败，回退到本地语音:', error);
            return this.speakPinyin(text);
        }
    }

    // 播放词语发音
    speakWord(word, pinyin = '') {
        if (!this.isEnabled) return Promise.resolve();
        
        const text = pinyin ? `${word}，${pinyin}` : word;
        return this.speakPinyin(text, word);
    }

    // 设置语音参数
    setVoiceSettings(settings) {
        if (settings.volume !== undefined) {
            this.volume = Math.max(0, Math.min(1, settings.volume));
        }
        if (settings.rate !== undefined) {
            this.rate = Math.max(0.1, Math.min(2, settings.rate));
        }
        if (settings.pitch !== undefined) {
            this.pitch = Math.max(0, Math.min(2, settings.pitch));
        }
        
        console.log('🎛️ 语音设置已更新:', { 
            volume: this.volume, 
            rate: this.rate, 
            pitch: this.pitch 
        });
    }

    // 获取可用的中文语音列表
    getChineseVoices() {
        return this.voices.filter(voice => 
            voice.lang.includes('zh') || 
            voice.lang.includes('cmn') ||
            voice.name.includes('Chinese') ||
            voice.name.includes('中文')
        );
    }

    // 切换语音
    switchVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.chineseVoice = voice;
            console.log(`🔄 切换到语音: ${voice.name}`);
            return true;
        }
        return false;
    }

    // 停止播放
    stop() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }

        // 重置播放状态
        this.isPlaying = false;
        this.currentUtterance = null;

        console.log('🛑 语音播放已停止');
    }

    // 启用/禁用语音
    toggle(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stop();
        }
        console.log(`🔊 语音功能${enabled ? '启用' : '禁用'}`);
    }

    // 测试语音功能
    test() {
        if (!this.isEnabled) {
            console.warn('语音功能未启用');
            return;
        }

        console.log('🧪 测试语音功能...');
        this.speakPinyin('nǐ hǎo', '你好')
            .then(() => {
                console.log('✅ 语音测试成功');
            })
            .catch(error => {
                console.error('❌ 语音测试失败:', error);
            });
    }

    // 获取系统状态
    getStatus() {
        return {
            isSupported: !!this.speechSynthesis,
            isEnabled: this.isEnabled,
            isPlaying: this.isPlaying,
            voiceCount: this.voices.length,
            chineseVoiceCount: this.getChineseVoices().length,
            currentVoice: this.chineseVoice ? this.chineseVoice.name : 'None',
            settings: {
                volume: this.volume,
                rate: this.rate,
                pitch: this.pitch
            }
        };
    }
}

// 创建全局语音系统实例
let speechSystem = null;

// 优化后的初始化语音系统 - 支持依赖注入
async function initSpeechSystem(characterProvider = null) {
    if (!speechSystem) {
        speechSystem = new SpeechSystem(characterProvider);
        await speechSystem.init();
    }
    return speechSystem;
}

// 便捷函数：播放拼音
function playPinyin(pinyin, character = '') {
    if (speechSystem) {
        return speechSystem.speakPinyin(pinyin, character);
    } else {
        console.warn('语音系统未初始化');
        return Promise.resolve();
    }
}

// 便捷函数：播放汉字
function playCharacter(character, pinyin) {
    if (speechSystem) {
        return speechSystem.speakCharacter(character, pinyin);
    } else {
        console.warn('语音系统未初始化');
        return Promise.resolve();
    }
}

// 导出语音系统
if (typeof window !== 'undefined') {
    window.SpeechSystem = SpeechSystem;
    window.initSpeechSystem = initSpeechSystem;
    window.playPinyin = playPinyin;
    window.playCharacter = playCharacter;
}
