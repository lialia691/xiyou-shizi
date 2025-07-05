// 移动端紧急修复脚本
// 专门解决手机端卡在菩提界面和音频无声问题

(function() {
    'use strict';
    
    console.log('📱 移动端紧急修复脚本启动');
    
    // 检测移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);

    // 强制在所有设备上运行修复（调试用）
    console.log(`📱 设备检测: ${isMobile ? '移动设备' : '桌面设备'}`);
    console.log('🔧 强制应用紧急修复（所有设备）...');
    
    console.log('📱 检测到移动设备，应用紧急修复...');
    
    let audioActivated = false;
    let emergencyDataLoaded = false;
    
    // 紧急游戏数据
    const EMERGENCY_GAME_DATA = [
        {
            scene: "花果山",
            image: "images/huaguoshan.jpg",
            characters: [
                { char: "山", pinyin: "shān" },
                { char: "水", pinyin: "shuǐ" },
                { char: "花", pinyin: "huā" },
                { char: "果", pinyin: "guǒ" }
            ],
            item: { name: "金箍棒", description: "孙悟空的神兵利器" }
        },
        {
            scene: "东海龙宫",
            image: "images/huaguoshan.jpg",
            characters: [
                { char: "龙", pinyin: "lóng" },
                { char: "海", pinyin: "hǎi" },
                { char: "宫", pinyin: "gōng" },
                { char: "王", pinyin: "wáng" }
            ],
            item: { name: "龙鳞", description: "东海龙王的鳞片" }
        },
        {
            scene: "天庭",
            image: "images/huaguoshan.jpg",
            characters: [
                { char: "天", pinyin: "tiān" },
                { char: "云", pinyin: "yún" },
                { char: "仙", pinyin: "xiān" },
                { char: "宫", pinyin: "gōng" }
            ],
            item: { name: "仙桃", description: "王母娘娘的蟠桃" }
        }
    ];
    
    // 强制音频激活
    function forceAudioActivation() {
        if (audioActivated) return;
        
        console.log('🔊 强制激活移动端音频...');
        
        try {
            // 创建音频上下文
            if (window.AudioContext || window.webkitAudioContext) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioContextClass();
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
            }
            
            // 激活语音合成
            if (window.speechSynthesis) {
                // 多种方法尝试激活
                const methods = [
                    () => {
                        const utterance = new SpeechSynthesisUtterance('');
                        utterance.volume = 0;
                        window.speechSynthesis.speak(utterance);
                    },
                    () => {
                        const utterance = new SpeechSynthesisUtterance('测试');
                        utterance.volume = 0.01;
                        utterance.rate = 3;
                        utterance.lang = 'zh-CN';
                        window.speechSynthesis.speak(utterance);
                    },
                    () => {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(' ');
                        utterance.volume = 0;
                        window.speechSynthesis.speak(utterance);
                    }
                ];
                
                methods.forEach((method, index) => {
                    setTimeout(method, index * 200);
                });
            }
            
            audioActivated = true;
            console.log('✅ 移动端音频激活成功');
            
            // 显示提示
            showNotification('🔊 音频已激活', '#4CAF50');
            
        } catch (error) {
            console.warn('⚠️ 音频激活失败:', error);
        }
    }
    
    // 显示通知
    function showNotification(message, color = '#2196F3') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            z-index: 10000;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    // 强制加载紧急数据
    function loadEmergencyData() {
        if (emergencyDataLoaded) return;
        
        console.log('🚨 加载紧急游戏数据...');
        
        // 设置全局游戏数据
        window.gameData = EMERGENCY_GAME_DATA;
        emergencyDataLoaded = true;
        
        console.log('✅ 紧急数据加载完成');
        showNotification('📊 数据已加载', '#FF9800');
        
        // 尝试重新渲染界面
        setTimeout(() => {
            if (window.UI && window.UI.renderRouteMap) {
                window.UI.renderRouteMap();
            }
        }, 500);
    }
    
    // 监听用户交互
    function addInteractionListeners() {
        const events = ['touchstart', 'touchend', 'click', 'pointerdown'];
        
        const handleInteraction = () => {
            forceAudioActivation();
            loadEmergencyData();
        };
        
        events.forEach(eventType => {
            document.addEventListener(eventType, handleInteraction, { 
                passive: true 
            });
        });
        
        console.log('👆 移动端交互监听器已添加');
    }
    
    // 检查并修复卡住的界面
    function checkAndFixStuckInterface() {
        // 立即检查一次
        performInterfaceFix();

        // 然后定期检查
        setTimeout(performInterfaceFix, 1000);
        setTimeout(performInterfaceFix, 3000);
        setTimeout(performInterfaceFix, 5000);
    }

    function performInterfaceFix() {
        console.log('🔍 检查界面状态...');

        const levelNodesContainer = document.getElementById('level-nodes-container');
        const errorMessage = document.querySelector('.error-message');

        // 检查是否有错误消息或空的关卡容器
        if ((levelNodesContainer && levelNodesContainer.children.length === 0) || errorMessage) {
            console.log('🚨 检测到界面问题，应用紧急修复...');
            loadEmergencyData();

            if (levelNodesContainer) {
                // 强制显示关卡节点
                levelNodesContainer.innerHTML = `
                    <div class="level-node unlocked" data-level-index="0" style="
                        padding: 15px 30px;
                        border: 3px solid #d9534f;
                        border-radius: 12px;
                        background: white;
                        margin: 10px 0;
                        cursor: pointer;
                        position: relative;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    ">
                        🏔️ 花果山
                        <span class="status-icon" style="
                            position: absolute;
                            right: 15px;
                            top: 50%;
                            transform: translateY(-50%);
                            font-size: 18px;
                        ">▶️</span>
                    </div>
                    <div class="level-node locked" data-level-index="1" style="
                        padding: 15px 30px;
                        border: 3px solid #ccc;
                        border-radius: 12px;
                        background: #f5f5f5;
                        margin: 10px 0;
                        cursor: not-allowed;
                        position: relative;
                        opacity: 0.6;
                    ">
                        🌊 东海龙宫
                        <span class="status-icon" style="
                            position: absolute;
                            right: 15px;
                            top: 50%;
                            transform: translateY(-50%);
                        ">🔒</span>
                    </div>
                `;

                // 添加点击事件
                const node = levelNodesContainer.querySelector('.level-node[data-level-index="0"]');
                if (node) {
                    node.addEventListener('click', () => {
                        console.log('🎮 点击花果山关卡');
                        forceAudioActivation();
                        showNotification('🎮 进入花果山', '#4CAF50');

                        // 尝试启动游戏
                        if (window.GameLogic && window.GameLogic.startLevel) {
                            window.GameLogic.startLevel(0);
                        } else if (window.startLevel) {
                            window.startLevel(0);
                        } else {
                            // 手动触发游戏开始
                            const startButton = document.querySelector('#start-learning-btn');
                            if (startButton) {
                                startButton.click();
                            }
                        }
                    });
                }

                showNotification('🔧 界面已修复', '#9C27B0');
            }

            // 隐藏错误消息
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        }
    }
    
    // 初始化
    function init() {
        console.log('🚀 开始初始化紧急修复...');

        // 立即显示修复状态
        showNotification('🔧 紧急修复启动', '#2196F3');

        addInteractionListeners();
        checkAndFixStuckInterface();

        // 立即尝试加载紧急数据
        loadEmergencyData();

        console.log('✅ 移动端紧急修复初始化完成');

        // 5秒后再次强制检查
        setTimeout(() => {
            console.log('🔄 5秒后强制检查...');
            performInterfaceFix();
        }, 5000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 导出到全局作用域
    window.mobileEmergencyFix = {
        forceAudioActivation,
        loadEmergencyData,
        showNotification,
        EMERGENCY_GAME_DATA
    };
    
})();
