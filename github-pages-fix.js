// GitHub Pages 移动端兼容性修复脚本
// 专门解决 GitHub Pages 环境下的移动端问题

class GitHubPagesFix {
    constructor() {
        this.isGitHubPages = this.detectGitHubPages();
        this.isMobile = this.detectMobile();
        this.audioContext = null;
        this.audioUnlocked = false;
        
        console.log('🔧 GitHub Pages 修复脚本启动');
        console.log('- GitHub Pages 环境:', this.isGitHubPages);
        console.log('- 移动设备:', this.isMobile);
        console.log('- 当前协议:', window.location.protocol);
        console.log('- User Agent:', navigator.userAgent);
    }

    // 检测是否为 GitHub Pages 环境
    detectGitHubPages() {
        const hostname = window.location.hostname;
        return hostname.includes('github.io') || 
               hostname.includes('githubusercontent.com') ||
               window.location.href.includes('github.io');
    }

    // 检测移动设备
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    // 初始化修复
    async init() {
        if (this.isGitHubPages) {
            console.log('🔧 应用 GitHub Pages 特定修复...');
            
            // 1. 修复文件路径问题
            this.fixFilePaths();
            
            // 2. 移动端音频修复
            if (this.isMobile) {
                await this.fixMobileAudio();
            }
            
            // 3. 添加用户交互监听
            this.addInteractionListeners();
            
            // 4. 修复语音合成问题
            this.fixSpeechSynthesis();
            
            console.log('✅ GitHub Pages 修复完成');
        }
    }

    // 修复文件路径问题
    fixFilePaths() {
        // GitHub Pages 有时会有路径问题，确保使用相对路径
        const baseUrl = window.location.pathname.endsWith('/') ? 
                       window.location.pathname : 
                       window.location.pathname + '/';
        
        // 存储基础路径供其他脚本使用
        window.GITHUB_PAGES_BASE_URL = baseUrl;
        console.log('📁 设置基础路径:', baseUrl);
    }

    // 修复移动端音频问题
    async fixMobileAudio() {
        console.log('📱 应用移动端音频修复...');
        
        // 创建音频上下文（如果支持）
        try {
            if (window.AudioContext || window.webkitAudioContext) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContextClass();
                console.log('🔊 音频上下文创建成功');
            }
        } catch (error) {
            console.warn('⚠️ 音频上下文创建失败:', error);
        }

        // 预加载语音合成
        if (window.speechSynthesis) {
            // 强制加载语音列表
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                console.log(`🎵 加载了 ${voices.length} 个语音`);
                
                // 查找中文语音
                const chineseVoices = voices.filter(voice => 
                    voice.lang.includes('zh') || voice.lang.includes('CN')
                );
                console.log(`🇨🇳 找到 ${chineseVoices.length} 个中文语音`);
            };

            // 立即尝试加载
            loadVoices();
            
            // 监听语音变化
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    // 添加用户交互监听器
    addInteractionListeners() {
        const unlockAudio = async () => {
            if (this.audioUnlocked) return;

            console.log('🔓 尝试解锁音频...');

            try {
                // 解锁 Web Audio API
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                    console.log('🔊 Web Audio API 已解锁');
                }

                // 解锁 Speech Synthesis
                if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance('');
                    utterance.volume = 0;
                    utterance.rate = 1;
                    utterance.pitch = 1;
                    window.speechSynthesis.speak(utterance);
                    console.log('🎵 Speech Synthesis 已解锁');
                }

                this.audioUnlocked = true;
                console.log('✅ 音频解锁成功');

            } catch (error) {
                console.warn('⚠️ 音频解锁失败:', error);
            }
        };

        // 监听各种用户交互事件
        const events = ['touchstart', 'touchend', 'click', 'keydown'];
        events.forEach(eventType => {
            document.addEventListener(eventType, unlockAudio, { 
                once: true, 
                passive: true 
            });
        });

        console.log('👆 用户交互监听器已添加');
    }

    // 修复语音合成问题
    fixSpeechSynthesis() {
        if (!window.speechSynthesis) {
            console.warn('⚠️ 浏览器不支持 Speech Synthesis');
            return;
        }

        // 包装原始的 speak 方法
        const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
        
        window.speechSynthesis.speak = (utterance) => {
            console.log('🎵 Speech Synthesis 调用:', utterance.text);
            
            // GitHub Pages 特殊处理
            if (this.isGitHubPages && this.isMobile) {
                // 确保音频已解锁
                if (!this.audioUnlocked) {
                    console.warn('⚠️ 音频尚未解锁，尝试解锁...');
                    this.addInteractionListeners();
                }
                
                // 添加延迟以确保在 HTTPS 环境下正常工作
                setTimeout(() => {
                    originalSpeak(utterance);
                }, 100);
            } else {
                originalSpeak(utterance);
            }
        };

        console.log('🔧 Speech Synthesis 已修复');
    }

    // 获取修复状态
    getStatus() {
        return {
            isGitHubPages: this.isGitHubPages,
            isMobile: this.isMobile,
            audioUnlocked: this.audioUnlocked,
            speechSynthesisSupported: !!window.speechSynthesis,
            audioContextSupported: !!(window.AudioContext || window.webkitAudioContext),
            protocol: window.location.protocol,
            hostname: window.location.hostname
        };
    }

    // 显示调试信息
    showDebugInfo() {
        const status = this.getStatus();
        console.table(status);
        
        // 在页面上显示调试信息（如果需要）
        if (window.location.search.includes('debug=true')) {
            const debugDiv = document.createElement('div');
            debugDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 9999;
                max-width: 300px;
            `;
            debugDiv.innerHTML = `
                <strong>GitHub Pages 调试信息</strong><br>
                ${Object.entries(status).map(([key, value]) => 
                    `${key}: ${value}`
                ).join('<br>')}
            `;
            document.body.appendChild(debugDiv);
        }
    }
}

// 创建全局实例
window.gitHubPagesFix = new GitHubPagesFix();

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gitHubPagesFix.init();
        window.gitHubPagesFix.showDebugInfo();
    });
} else {
    window.gitHubPagesFix.init();
    window.gitHubPagesFix.showDebugInfo();
}

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubPagesFix;
}
