// 关卡生成器 - 基于高频汉字和西游记故事生成关卡
class LevelGenerator {
    constructor() {
        this.storyScenes = [
            {
                name: "花果山水帘洞",
                background: "在东胜神洲傲来国花果山上，有一块仙石孕育出了石猴。",
                description: "石猴带领群猴发现了水帘洞，成为了美猴王。",
                image: "images/huaguoshan.jpg",
                items: ["🍑桃子", "🍌香蕉", "🥥椰子", "🌸花朵", "🍇葡萄"],
                difficulty: "easy"
            },
            {
                name: "龙宫借宝",
                background: "美猴王为了寻找趁手的兵器，来到了东海龙宫。",
                description: "孙悟空在龙宫得到了如意金箍棒，重达一万三千五百斤。",
                image: "images/longgong.jpg",
                items: ["⚡金箍棒", "👑龙冠", "💎宝珠", "🌊海水", "🐉龙鳞"],
                difficulty: "easy"
            },
            {
                name: "大闹天宫",
                background: "孙悟空因为不满天庭的待遇，大闹天宫。",
                description: "齐天大圣孙悟空与天兵天将大战，闹得天宫不得安宁。",
                image: "images/tiangong.jpg",
                items: ["🔥火眼金睛", "☁️筋斗云", "⚔️兵器", "🏰天宫", "⚡雷电"],
                difficulty: "normal"
            },
            {
                name: "五行山下",
                background: "如来佛祖用五行山压住了孙悟空，一压就是五百年。",
                description: "孙悟空被压在五行山下五百年，等待取经人的到来。",
                image: "images/wuxingshan.jpg",
                items: ["🏔️五行山", "📿佛珠", "🕯️香火", "⏰时间", "🍃落叶"],
                difficulty: "normal"
            },
            {
                name: "观音点化",
                background: "观音菩萨奉如来佛祖之命，寻找取经人。",
                description: "观音菩萨告诉唐僧，救出孙悟空作为徒弟保护取经。",
                image: "images/guanyin.jpg",
                items: ["🌸莲花", "🎋柳枝", "💧甘露", "📜经书", "🕊️白鸽"],
                difficulty: "normal"
            },
            {
                name: "收服猪八戒",
                background: "师徒二人来到高老庄，遇到了猪精作怪。",
                description: "孙悟空降服猪八戒，猪八戒成为唐僧的二徒弟。",
                image: "images/zhubajie.jpg",
                items: ["🐷猪八戒", "🔨九齿钉耙", "🏠高老庄", "👰新娘", "🌙月亮"],
                difficulty: "normal"
            },
            {
                name: "流沙河收沙僧",
                background: "师徒三人来到流沙河，遇到沙和尚阻拦。",
                description: "观音菩萨点化沙和尚，沙和尚成为唐僧的三徒弟。",
                image: "images/shaseng.jpg",
                items: ["🏜️流沙河", "📿念珠", "🥢禅杖", "🐟鱼怪", "⛵小船"],
                difficulty: "normal"
            },
            {
                name: "白骨精三戏唐僧",
                background: "师徒四人路过白虎岭，遇到白骨精变化。",
                description: "白骨精三次变化欺骗唐僧，孙悟空火眼金睛识破妖怪。",
                image: "images/baigujing.jpg",
                items: ["💀白骨精", "👵老婆婆", "👧少女", "🍎毒苹果", "🔮魔镜"],
                difficulty: "hard"
            },
            {
                name: "火焰山借芭蕉扇",
                background: "师徒四人来到火焰山，被烈火阻挡去路。",
                description: "孙悟空向铁扇公主借芭蕉扇，经历三借芭蕉扇的故事。",
                image: "images/huoyanshanshan.jpg",
                items: ["🔥火焰山", "🌿芭蕉扇", "👸铁扇公主", "🐂牛魔王", "💨大风"],
                difficulty: "hard"
            },
            {
                name: "西天取经成功",
                background: "师徒四人历经八十一难，终于到达西天雷音寺。",
                description: "如来佛祖传授真经，师徒四人修成正果，功德圆满。",
                image: "images/xitian.jpg",
                items: ["📚真经", "🏛️雷音寺", "🌅佛光", "🎊庆祝", "👑佛冠"],
                difficulty: "hard"
            }
        ];
    }

    // 生成指定数量的关卡
    generateLevels(totalLevels = 50, charactersPerLevel = 10) {
        const levels = [];
        
        for (let level = 1; level <= totalLevels; level++) {
            const sceneIndex = Math.floor((level - 1) / 5) % this.storyScenes.length;
            const scene = this.storyScenes[sceneIndex];
            const subLevel = ((level - 1) % 5) + 1;
            
            const levelData = {
                level: level,
                scene: `${scene.name} 第${subLevel}关`,
                image: scene.image,
                background: scene.background,
                story: scene.description,
                item: this.getRandomItem(scene.items),
                difficulty: scene.difficulty,
                estimatedTime: charactersPerLevel * 2,
                unlocked: level === 1,
                characters: this.generateCharactersForLevel(level, charactersPerLevel)
            };
            
            levels.push(levelData);
        }
        
        return levels;
    }

    // 为指定关卡生成汉字
    generateCharactersForLevel(level, count) {
        const startIndex = (level - 1) * count;
        const characters = [];
        
        // 使用高频汉字列表
        const highFreqChars = this.getHighFrequencyCharacters();
        
        for (let i = 0; i < count; i++) {
            const charIndex = startIndex + i;
            if (charIndex < highFreqChars.length) {
                const char = highFreqChars[charIndex];
                characters.push({
                    id: charIndex + 1,
                    char: char.char,
                    pinyin: char.pinyin,
                    frequency: char.frequency,
                    rank: char.rank
                });
            }
        }
        
        return characters;
    }

    // // 获取高频汉字列表
    // getHighFrequencyCharacters() {
    //     return [
    //         { char: "的", pinyin: "de", frequency: 100000000, rank: 1 },
    //         { char: "一", pinyin: "yī", frequency: 99999999, rank: 2 },
    //         { char: "是", pinyin: "shì", frequency: 99999998, rank: 3 },
    //         { char: "了", pinyin: "le", frequency: 99999997, rank: 4 },
    //         { char: "我", pinyin: "wǒ", frequency: 99999996, rank: 5 },
    //         { char: "不", pinyin: "bù", frequency: 99999995, rank: 6 },
    //         { char: "在", pinyin: "zài", frequency: 99999994, rank: 7 },
    //         { char: "人", pinyin: "rén", frequency: 99999993, rank: 8 },
    //         { char: "有", pinyin: "yǒu", frequency: 99999992, rank: 9 },
    //         { char: "他", pinyin: "tā", frequency: 99999991, rank: 10 },
    //         { char: "这", pinyin: "zhè", frequency: 99999990, rank: 11 },
    //         { char: "个", pinyin: "gè", frequency: 99999989, rank: 12 },
    //         { char: "上", pinyin: "shàng", frequency: 99999988, rank: 13 },
    //         { char: "们", pinyin: "men", frequency: 99999987, rank: 14 },
    //         { char: "来", pinyin: "lái", frequency: 99999986, rank: 15 },
    //         { char: "到", pinyin: "dào", frequency: 99999985, rank: 16 },
    //         { char: "时", pinyin: "shí", frequency: 99999984, rank: 17 },
    //         { char: "大", pinyin: "dà", frequency: 99999983, rank: 18 },
    //         { char: "地", pinyin: "dì", frequency: 99999982, rank: 19 },
    //         { char: "为", pinyin: "wèi", frequency: 99999981, rank: 20 },
    //         { char: "子", pinyin: "zi", frequency: 99999980, rank: 21 },
    //         { char: "中", pinyin: "zhōng", frequency: 99999979, rank: 22 },
    //         { char: "你", pinyin: "nǐ", frequency: 99999978, rank: 23 },
    //         { char: "说", pinyin: "shuō", frequency: 99999977, rank: 24 },
    //         { char: "生", pinyin: "shēng", frequency: 99999976, rank: 25 },
    //         { char: "国", pinyin: "guó", frequency: 99999975, rank: 26 },
    //         { char: "年", pinyin: "nián", frequency: 99999974, rank: 27 },
    //         { char: "着", pinyin: "zhe", frequency: 99999973, rank: 28 },
    //         { char: "就", pinyin: "jiù", frequency: 99999972, rank: 29 },
    //         { char: "那", pinyin: "nà", frequency: 99999971, rank: 30 },
    //         { char: "和", pinyin: "hé", frequency: 99999970, rank: 31 },
    //         { char: "要", pinyin: "yào", frequency: 99999969, rank: 32 },
    //         { char: "她", pinyin: "tā", frequency: 99999968, rank: 33 },
    //         { char: "出", pinyin: "chū", frequency: 99999967, rank: 34 },
    //         { char: "也", pinyin: "yě", frequency: 99999966, rank: 35 },
    //         { char: "得", pinyin: "de", frequency: 99999965, rank: 36 },
    //         { char: "里", pinyin: "lǐ", frequency: 99999964, rank: 37 },
    //         { char: "后", pinyin: "hòu", frequency: 99999963, rank: 38 },
    //         { char: "自", pinyin: "zì", frequency: 99999962, rank: 39 },
    //         { char: "以", pinyin: "yǐ", frequency: 99999961, rank: 40 },
    //         { char: "会", pinyin: "huì", frequency: 99999960, rank: 41 },
    //         { char: "家", pinyin: "jiā", frequency: 99999959, rank: 42 },
    //         { char: "可", pinyin: "kě", frequency: 99999958, rank: 43 },
    //         { char: "下", pinyin: "xià", frequency: 99999957, rank: 44 },
    //         { char: "而", pinyin: "ér", frequency: 99999956, rank: 45 },
    //         { char: "过", pinyin: "guò", frequency: 99999955, rank: 46 },
    //         { char: "天", pinyin: "tiān", frequency: 99999954, rank: 47 },
    //         { char: "去", pinyin: "qù", frequency: 99999953, rank: 48 },
    //         { char: "能", pinyin: "néng", frequency: 99999952, rank: 49 },
    //         { char: "对", pinyin: "duì", frequency: 99999951, rank: 50 }
    //     ];
    // }

    // 获取随机道具
    getRandomItem(items) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        return {
            name: randomItem.substring(1), // 去掉emoji
            icon: randomItem.charAt(0)     // 只保留emoji
        };
    }

    // 生成关卡概览数据
    generateLevelOverview(levels) {
        return levels.map(level => ({
            level: level.level,
            scene: level.scene,
            difficulty: level.difficulty,
            characterCount: level.characters.length,
            unlocked: level.unlocked,
            estimatedTime: level.estimatedTime,
            progress: 0 // 初始进度为0
        }));
    }

    // 导出关卡数据为JSON
    exportLevelsToJSON(levels) {
        return JSON.stringify(levels, null, 2);
    }

    // 生成完整的游戏数据
    generateCompleteGameData(totalLevels = 20) {
        const levels = this.generateLevels(totalLevels);
        const overview = this.generateLevelOverview(levels);
        
        return {
            levels: levels,
            overview: overview,
            totalLevels: totalLevels,
            totalCharacters: totalLevels * 10,
            generatedAt: new Date().toISOString()
        };
    }
}

// 导出关卡生成器
if (typeof window !== 'undefined') {
    window.LevelGenerator = LevelGenerator;
} else if (typeof module !== 'undefined') {
    module.exports = LevelGenerator;
}
