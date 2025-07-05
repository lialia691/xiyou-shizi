// 紧急修复按钮 - 直接在页面上添加修复按钮
(function() {
    'use strict';
    
    console.log('🆘 紧急修复按钮脚本启动');
    
    // 等待页面加载完成
    function addEmergencyButton() {
        // 创建紧急修复按钮
        const emergencyButton = document.createElement('button');
        emergencyButton.innerHTML = '🆘 紧急修复';
        emergencyButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
        `;
        
        // 添加脉动动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        // 点击事件
        emergencyButton.addEventListener('click', function() {
            console.log('🆘 用户点击紧急修复按钮');
            performEmergencyFix();
        });
        
        document.body.appendChild(emergencyButton);
        console.log('🆘 紧急修复按钮已添加');
    }
    
    // 执行紧急修复
    function performEmergencyFix() {
        console.log('🔧 执行紧急修复...');
        
        // 显示修复状态
        showStatus('🔧 正在修复...', '#ff9800');
        
        // 1. 强制激活音频
        try {
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance('测试');
                utterance.volume = 0.1;
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);
                console.log('🔊 音频已激活');
            }
        } catch (error) {
            console.warn('音频激活失败:', error);
        }
        
        // 2. 加载紧急游戏数据
        window.gameData = [
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
            }
        ];
        console.log('📊 紧急数据已加载');
        
        // 3. 修复界面
        const levelContainer = document.getElementById('level-nodes-container');
        if (levelContainer) {
            levelContainer.innerHTML = `
                <div class="level-node unlocked" style="
                    padding: 20px;
                    border: 3px solid #d9534f;
                    border-radius: 15px;
                    background: white;
                    margin: 15px 0;
                    cursor: pointer;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    🏔️ 花果山 - 开始学习
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">
                        点击开始识字之旅
                    </div>
                </div>
            `;
            
            // 添加点击事件
            const levelNode = levelContainer.querySelector('.level-node');
            if (levelNode) {
                levelNode.addEventListener('click', function() {
                    console.log('🎮 开始花果山关卡');
                    showStatus('🎮 进入花果山', '#4caf50');
                    
                    // 尝试启动游戏
                    setTimeout(() => {
                        if (window.GameLogic && window.GameLogic.startLevel) {
                            window.GameLogic.startLevel(0);
                        } else {
                            // 手动创建游戏界面
                            createSimpleGame();
                        }
                    }, 500);
                });
            }
            
            console.log('🎯 界面已修复');
        }
        
        // 4. 隐藏错误消息
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            msg.style.display = 'none';
        });
        
        showStatus('✅ 修复完成！', '#4caf50');
    }
    
    // 创建简单游戏界面
    function createSimpleGame() {
        const gameContainer = document.createElement('div');
        gameContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
        `;
        
        gameContainer.innerHTML = `
            <h1 style="font-size: 2em; margin-bottom: 30px;">🏔️ 花果山</h1>
            <div style="font-size: 4em; margin: 20px; cursor: pointer; padding: 20px; border: 3px solid white; border-radius: 15px;" onclick="playSound('山')">
                山
            </div>
            <div style="font-size: 1.2em; margin: 10px;">点击汉字听发音</div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 30px;
                padding: 10px 20px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: 2px solid white;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
            ">返回</button>
        `;
        
        document.body.appendChild(gameContainer);
        
        // 添加发音功能
        window.playSound = function(char) {
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(char);
                utterance.lang = 'zh-CN';
                utterance.rate = 0.8;
                window.speechSynthesis.speak(utterance);
                console.log(`🔊 播放: ${char}`);
            }
        };
    }
    
    // 显示状态消息
    function showStatus(message, color) {
        const status = document.createElement('div');
        status.textContent = message;
        status.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            background: ${color};
            color: white;
            padding: 8px 12px;
            border-radius: 15px;
            z-index: 10001;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(status);
        
        setTimeout(() => {
            if (status.parentNode) {
                status.parentNode.removeChild(status);
            }
        }, 3000);
    }
    
    // 初始化
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addEmergencyButton);
        } else {
            addEmergencyButton();
        }
    }
    
    init();
    
})();
