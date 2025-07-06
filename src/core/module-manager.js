// 模块管理器 - 统一管理所有模块的初始化和依赖注入
class ModuleManager {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
    }

    // 注册模块
    register(name, moduleClass, dependencies = []) {
        this.modules.set(name, {
            class: moduleClass,
            dependencies,
            instance: null,
            initialized: false
        });
    }

    // 初始化所有模块
    async initialize() {
        if (this.initialized) return;

        console.log('🚀 开始初始化模块管理器...');
        
        // 按依赖顺序初始化模块
        const initOrder = this._resolveDependencies();
        
        for (const moduleName of initOrder) {
            await this._initializeModule(moduleName);
        }

        this.initialized = true;
        console.log('✅ 所有模块初始化完成');
    }

    // 获取模块实例
    get(name) {
        const module = this.modules.get(name);
        if (!module || !module.instance) {
            throw new Error(`模块 ${name} 未找到或未初始化`);
        }
        return module.instance;
    }

    // 解析依赖顺序
    _resolveDependencies() {
        const resolved = [];
        const resolving = new Set();

        const resolve = (name) => {
            if (resolved.includes(name)) return;
            if (resolving.has(name)) {
                throw new Error(`检测到循环依赖: ${name}`);
            }

            resolving.add(name);
            const module = this.modules.get(name);
            
            if (module) {
                for (const dep of module.dependencies) {
                    resolve(dep);
                }
            }

            resolving.delete(name);
            resolved.push(name);
        };

        for (const name of this.modules.keys()) {
            resolve(name);
        }

        return resolved;
    }

    // 初始化单个模块
    async _initializeModule(name) {
        const module = this.modules.get(name);
        if (!module || module.initialized) return;

        console.log(`📦 正在初始化模块: ${name}`);

        // 获取依赖实例
        const dependencies = module.dependencies.map(dep => this.get(dep));
        
        // 创建模块实例
        module.instance = new module.class(...dependencies);
        
        // 如果模块有初始化方法，调用它
        if (typeof module.instance.initialize === 'function') {
            await module.instance.initialize();
        }

        module.initialized = true;
        console.log(`✅ 模块 ${name} 初始化完成`);
    }
}

// 全局模块管理器实例
const moduleManager = new ModuleManager();

// 注册所有模块（使用配置文件中的路径）
moduleManager.register('characterProvider', () => new CharacterProvider(getConfig('data.charactersFile')));
moduleManager.register('dataProcessor', DataProcessor, ['characterProvider']);
moduleManager.register('userDataManager', () => new UserDataManager(getConfig('ai')));
moduleManager.register('reviewScheduler', () => new ReviewScheduler(getConfig('ai')));
moduleManager.register('aiPutiSystem', AIPutiSystem, ['characterProvider', 'userDataManager', 'reviewScheduler']);
moduleManager.register('speechSystem', SpeechSystem, ['characterProvider']);

// 导出模块管理器
window.ModuleManager = moduleManager;
