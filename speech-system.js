// 语音系统 - 实现拼音发音功能
class SpeechSystem {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.chineseVoice = null;
        this.isEnabled = true;
        this.volume = 1.0; // 最大音量确保清晰
        this.rate = 0.6; // 更慢的语速，便于学习拼音
        this.pitch = 1.0; // 标准音调
        this.isPlaying = false; // 添加播放状态管理
        this.currentUtterance = null; // 当前播放的语音

        this.init();
    }

    // 初始化语音系统
    async init() {
        if (!this.speechSynthesis) {
            console.warn('浏览器不支持语音合成功能');
            this.isEnabled = false;
            return;
        }

        // 等待语音列表加载
        await this.loadVoices();
        
        // 选择中文语音
        this.selectChineseVoice();
        
        console.log('🔊 语音系统初始化完成');
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

    // 选择中文语音 - 优化为纯正普通话
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
            // 按优先级选择最纯正的普通话语音
            const preferredVoices = [
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

            // 尝试找到最佳语音
            for (const preferred of preferredVoices) {
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
    speakPinyin(pinyin, character = '') {
        if (!this.isEnabled || !this.speechSynthesis) {
            console.warn('语音功能未启用');
            return Promise.resolve();
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

    // 处理拼音使其能正确发音（解决拼音字母被逐个读出的问题）
    processPinyinForSpeech(pinyin) {
        let processed = pinyin.trim();

        // 完整的拼音到汉字映射表，确保所有拼音都能正确发音
        const pinyinToCharMap = {
            // 基础拼音映射
            'a': '啊', 'ai': '爱', 'an': '安', 'ang': '昂', 'ao': '奥',
            'ba': '八', 'bai': '白', 'ban': '班', 'bang': '帮', 'bao': '包',
            'bei': '北', 'ben': '本', 'beng': '崩', 'bi': '比', 'bian': '边',
            'biao': '标', 'bie': '别', 'bin': '宾', 'bing': '兵', 'bo': '波',
            'bu': '不',

            'ca': '擦', 'cai': '才', 'can': '参', 'cang': '仓', 'cao': '草',
            'ce': '策', 'cen': '岑', 'ceng': '层', 'cha': '茶', 'chai': '柴',
            'chan': '产', 'chang': '长', 'chao': '朝', 'che': '车', 'chen': '陈',
            'cheng': '成', 'chi': '吃', 'chong': '冲', 'chou': '抽', 'chu': '出',
            'chuai': '拽', 'chuan': '传', 'chuang': '窗', 'chui': '吹', 'chun': '春',
            'chuo': '戳', 'ci': '次', 'cong': '从', 'cou': '凑', 'cu': '粗',
            'cuan': '窜', 'cui': '催', 'cun': '村', 'cuo': '错',

            'da': '大', 'dai': '带', 'dan': '单', 'dang': '当', 'dao': '道',
            'de': '的', 'dei': '得', 'den': '等', 'deng': '等', 'di': '地',
            'dian': '点', 'diao': '调', 'die': '跌', 'ding': '定', 'diu': '丢',
            'dong': '东', 'dou': '都', 'du': '度', 'duan': '段', 'dui': '对',
            'dun': '顿', 'duo': '多',

            'e': '额', 'ei': '诶', 'en': '恩', 'eng': '嗯', 'er': '二',

            'fa': '发', 'fan': '反', 'fang': '方', 'fei': '飞', 'fen': '分',
            'feng': '风', 'fo': '佛', 'fou': '否', 'fu': '福',

            'ga': '嘎', 'gai': '该', 'gan': '干', 'gang': '刚', 'gao': '高',
            'ge': '个', 'gei': '给', 'gen': '根', 'geng': '更', 'gong': '工',
            'gou': '够', 'gu': '古', 'gua': '瓜', 'guai': '怪', 'guan': '关',
            'guang': '光', 'gui': '贵', 'gun': '滚', 'guo': '国',

            'ha': '哈', 'hai': '海', 'han': '汉', 'hang': '行', 'hao': '好',
            'he': '和', 'hei': '黑', 'hen': '很', 'heng': '横', 'hong': '红',
            'hou': '后', 'hu': '湖', 'hua': '花', 'huai': '怀', 'huan': '欢',
            'huang': '黄', 'hui': '会', 'hun': '混', 'huo': '火',

            'ji': '机', 'jia': '家', 'jian': '见', 'jiang': '江', 'jiao': '叫',
            'jie': '接', 'jin': '进', 'jing': '经', 'jiong': '炯', 'jiu': '九',
            'ju': '句', 'juan': '卷', 'jue': '觉', 'jun': '军',

            'ka': '卡', 'kai': '开', 'kan': '看', 'kang': '康', 'kao': '考',
            'ke': '可', 'ken': '肯', 'keng': '坑', 'kong': '空', 'kou': '口',
            'ku': '苦', 'kua': '夸', 'kuai': '快', 'kuan': '宽', 'kuang': '狂',
            'kui': '亏', 'kun': '困', 'kuo': '扩',

            'la': '拉', 'lai': '来', 'lan': '蓝', 'lang': '郎', 'lao': '老',
            'le': '了', 'lei': '雷', 'leng': '冷', 'li': '里', 'lia': '俩',
            'lian': '连', 'liang': '两', 'liao': '了', 'lie': '列', 'lin': '林',
            'ling': '零', 'liu': '六', 'long': '龙', 'lou': '楼', 'lu': '路',
            'luan': '乱', 'lue': '略', 'lun': '论', 'luo': '落',

            'ma': '妈', 'mai': '买', 'man': '满', 'mang': '忙', 'mao': '毛',
            'me': '么', 'mei': '美', 'men': '们', 'meng': '梦', 'mi': '米',
            'mian': '面', 'miao': '苗', 'mie': '灭', 'min': '民', 'ming': '明',
            'miu': '谬', 'mo': '么', 'mou': '某', 'mu': '木',

            'na': '那', 'nai': '奶', 'nan': '南', 'nang': '囊', 'nao': '脑',
            'ne': '呢', 'nei': '内', 'nen': '嫩', 'neng': '能', 'ni': '你',
            'nian': '年', 'niang': '娘', 'niao': '鸟', 'nie': '捏', 'nin': '您',
            'ning': '宁', 'niu': '牛', 'nong': '农', 'nou': '耨', 'nu': '女',
            'nuan': '暖', 'nue': '虐', 'nun': '嫩', 'nuo': '诺',

            'o': '哦', 'ou': '欧',

            'pa': '怕', 'pai': '拍', 'pan': '盘', 'pang': '胖', 'pao': '跑',
            'pei': '配', 'pen': '盆', 'peng': '朋', 'pi': '皮', 'pian': '片',
            'piao': '票', 'pie': '撇', 'pin': '品', 'ping': '平', 'po': '破',
            'pou': '剖', 'pu': '普',

            'qi': '七', 'qia': '恰', 'qian': '前', 'qiang': '强', 'qiao': '桥',
            'qie': '切', 'qin': '亲', 'qing': '请', 'qiong': '穷', 'qiu': '求',
            'qu': '去', 'quan': '全', 'que': '却', 'qun': '群',

            'ran': '然', 'rang': '让', 'rao': '绕', 're': '热', 'ren': '人',
            'reng': '仍', 'ri': '日', 'rong': '容', 'rou': '肉', 'ru': '如',
            'ruan': '软', 'rui': '瑞', 'run': '润', 'ruo': '若',

            'sa': '撒', 'sai': '赛', 'san': '三', 'sang': '桑', 'sao': '扫',
            'se': '色', 'sen': '森', 'seng': '僧', 'sha': '沙', 'shai': '晒',
            'shan': '山', 'shang': '上', 'shao': '少', 'she': '社', 'shei': '谁',
            'shen': '身', 'sheng': '生', 'shi': '是', 'shou': '手', 'shu': '书',
            'shua': '刷', 'shuai': '帅', 'shuan': '栓', 'shuang': '双', 'shui': '水',
            'shun': '顺', 'shuo': '说', 'si': '四', 'song': '送', 'sou': '搜',
            'su': '苏', 'suan': '算', 'sui': '岁', 'sun': '孙', 'suo': '所',

            'ta': '他', 'tai': '太', 'tan': '谈', 'tang': '糖', 'tao': '桃',
            'te': '特', 'teng': '疼', 'ti': '提', 'tian': '天', 'tiao': '条',
            'tie': '铁', 'ting': '听', 'tong': '同', 'tou': '头', 'tu': '图',
            'tuan': '团', 'tui': '推', 'tun': '吞', 'tuo': '拖',

            'wa': '挖', 'wai': '外', 'wan': '万', 'wang': '王', 'wei': '为',
            'wen': '文', 'weng': '翁', 'wo': '我', 'wu': '五',

            'xi': '西', 'xia': '下', 'xian': '先', 'xiang': '想', 'xiao': '小',
            'xie': '写', 'xin': '心', 'xing': '行', 'xiong': '雄', 'xiu': '修',
            'xu': '需', 'xuan': '选', 'xue': '学', 'xun': '寻',

            'ya': '呀', 'yan': '言', 'yang': '样', 'yao': '要', 'ye': '也',
            'yi': '一', 'yin': '因', 'ying': '应', 'yo': '哟', 'yong': '用',
            'you': '有', 'yu': '与', 'yuan': '元', 'yue': '月', 'yun': '云',

            'za': '杂', 'zai': '在', 'zan': '赞', 'zang': '脏', 'zao': '早',
            'ze': '则', 'zei': '贼', 'zen': '怎', 'zeng': '增', 'zha': '查',
            'zhai': '宅', 'zhan': '站', 'zhang': '张', 'zhao': '找', 'zhe': '这',
            'zhei': '这', 'zhen': '真', 'zheng': '正', 'zhi': '知', 'zhong': '中',
            'zhou': '周', 'zhu': '主', 'zhua': '抓', 'zhuai': '拽', 'zhuan': '转',
            'zhuang': '装', 'zhui': '追', 'zhun': '准', 'zhuo': '桌', 'zi': '字',
            'zong': '总', 'zou': '走', 'zu': '组', 'zuan': '钻', 'zui': '最',
            'zun': '尊', 'zuo': '做',

            // 带声调的拼音映射
            'ā': '啊', 'á': '啊', 'ǎ': '啊', 'à': '啊',
            'ē': '额', 'é': '额', 'ě': '额', 'è': '额',
            'ī': '一', 'í': '一', 'ǐ': '一', 'ì': '一',
            'ō': '哦', 'ó': '哦', 'ǒ': '哦', 'ò': '哦',
            'ū': '五', 'ú': '五', 'ǔ': '五', 'ù': '五',
            'ǖ': '语', 'ǘ': '语', 'ǚ': '语', 'ǜ': '语',

            // 常见声调拼音 - 扩展版
            'yī': '一', 'yí': '移', 'yǐ': '以', 'yì': '意',
            'wǒ': '我', 'wó': '我', 'wò': '我',
            'nǐ': '你', 'ní': '泥', 'nì': '逆',
            'tā': '他', 'tá': '踏', 'tà': '塌',
            'hǎo': '好', 'háo': '豪', 'hào': '号',
            'shì': '是', 'shí': '十', 'shǐ': '史', 'shì': '事',
            'de': '的', 'dé': '得', 'dě': '得', 'dè': '德',
            'le': '了', 'lé': '乐', 'lě': '了', 'lè': '乐',

            // 更多常用拼音映射
            'mā': '妈', 'má': '麻', 'mǎ': '马', 'mà': '骂',
            'bā': '八', 'bá': '拔', 'bǎ': '把', 'bà': '爸',
            'pā': '趴', 'pá': '爬', 'pǎ': '打', 'pà': '怕',
            'fā': '发', 'fá': '罚', 'fǎ': '法', 'fà': '发',
            'dā': '搭', 'dá': '达', 'dǎ': '打', 'dà': '大',
            'tā': '他', 'tá': '踏', 'tǎ': '塔', 'tà': '塌',
            'nā': '拿', 'ná': '拿', 'nǎ': '哪', 'nà': '那',
            'lā': '拉', 'lá': '拉', 'lǎ': '喇', 'là': '辣',
            'gā': '嘎', 'gá': '嘎', 'gǎ': '嘎', 'gà': '嘎',
            'kā': '卡', 'ká': '卡', 'kǎ': '卡', 'kà': '卡',
            'hā': '哈', 'há': '哈', 'hǎ': '哈', 'hà': '哈',
            'zhā': '扎', 'zhá': '扎', 'zhǎ': '扎', 'zhà': '炸',
            'chā': '叉', 'chá': '茶', 'chǎ': '叉', 'chà': '叉',
            'shā': '沙', 'shá': '沙', 'shǎ': '傻', 'shà': '沙',
            'rā': '拉', 'rá': '拉', 'rǎ': '拉', 'rà': '拉',
            'zā': '扎', 'zá': '扎', 'zǎ': '扎', 'zà': '扎',
            'cā': '擦', 'cá': '擦', 'cǎ': '擦', 'cà': '擦',
            'sā': '撒', 'sá': '撒', 'sǎ': '撒', 'sà': '撒',

            // 双音节拼音
            'lái': '来', 'zài': '在', 'dōu': '都', 'yǒu': '有',
            'rén': '人', 'shàng': '上', 'lái': '来', 'dào': '到',
            'shí': '时', 'wéi': '为', 'zhōng': '中', 'shuō': '说',
            'shēng': '生', 'guó': '国', 'nián': '年', 'zhe': '着',
            'jiù': '就', 'hé': '和', 'yào': '要', 'chū': '出',
            'yě': '也', 'lǐ': '里', 'hòu': '后', 'zì': '自',
            'yǐ': '以', 'huì': '会', 'jiā': '家', 'kě': '可',
            'xià': '下', 'ér': '而', 'guò': '过', 'tiān': '天',
            'qù': '去', 'néng': '能', 'duì': '对', 'xiǎo': '小',
            'duō': '多', 'rán': '然', 'yú': '于', 'xīn': '心'
        };

        // 检查是否有对应的汉字
        const lowerPinyin = processed.toLowerCase();
        if (pinyinToCharMap[processed] || pinyinToCharMap[lowerPinyin]) {
            // 使用对应的汉字来获得正确的拼音发音
            return pinyinToCharMap[processed] || pinyinToCharMap[lowerPinyin];
        }

        // 如果没有找到对应汉字，保持原拼音
        return processed;
    }

    // 播放汉字发音（汉字+拼音）
    speakCharacter(character, pinyin) {
        if (!this.isEnabled) return Promise.resolve();

        // 只说汉字，发音更清晰
        return this.speakPinyin(character, character);
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

// 初始化语音系统
async function initSpeechSystem() {
    if (!speechSystem) {
        speechSystem = new SpeechSystem();
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
