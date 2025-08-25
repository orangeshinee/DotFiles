// ==UserScript==
// @name         CopyAsMarkdown
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  快速复制当前网页地址为markdown格式 [title](url)，支持自定义快捷键，自动去除网站名称后缀
// @author       MrHeTony
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik04IDRINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJoLTIiIHN0cm9rZT0iIzY2N2VlYSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgIDxyZWN0IHg9IjgiIHk9IjIiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiIHJ4PSIxIiByeT0iMSIgc3Ryb2tlPSIjNjY3ZWVhIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgPHBhdGggZD0iTTE2IDExSDgiIHN0cm9rZT0iIzY2N2VlYSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgIDxwYXRoIGQ9Ik0xNiAxNUgxMCIgc3Ryb2tlPSIjNjY3ZWVhIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K
// ==/UserScript==

(function() {
    'use strict';

    // 配置管理器
    const ConfigManager = {
        defaults: {
            shortcut: 'Alt+Shift+M',
            position: { top: '25%', right: '0' },
            version: '2.1'
        },
        
        get(key) {
            return GM_getValue(key, this.defaults[key]);
        },
        
        set(key, value) {
            GM_setValue(key, value);
        },
        
        export() {
            const config = {};
            Object.keys(this.defaults).forEach(key => {
                config[key] = this.get(key);
            });
            return JSON.stringify(config, null, 2);
        },
        
        import(configStr) {
            try {
                const config = JSON.parse(configStr);
                Object.keys(config).forEach(key => {
                    if (key in this.defaults) {
                        this.set(key, config[key]);
                    }
                });
                return true;
            } catch (e) {
                console.error('配置导入失败:', e);
                return false;
            }
        },
        
        reset() {
            Object.keys(this.defaults).forEach(key => {
                this.set(key, this.defaults[key]);
            });
        }
    };

    // 配置项
    const CONFIG = {
        shortcut: ConfigManager.get('shortcut'),
        position: ConfigManager.get('position'),
    };

    // 缓存常用DOM元素
    const DOMCache = {
        _cache: new Map(),
        
        get(selector) {
            if (!this._cache.has(selector)) {
                this._cache.set(selector, document.querySelector(selector));
            }
            return this._cache.get(selector);
        },
        
        clear() {
            this._cache.clear();
        },
        
        invalidate(selector) {
            this._cache.delete(selector);
        }
    };

    // 防重复创建管理器
    const ElementManager = {
        buttons: new WeakMap(),
        observers: new WeakMap(),
        
        hasButton(document) {
            const cachedButton = DOMCache.get('#markdown-copy-floating-btn');
            return !!cachedButton || this.buttons.has(document);
        },
        
        registerButton(document, button) {
            this.buttons.set(document, button);
            DOMCache.invalidate('#markdown-copy-floating-btn');
        },
        
        cleanup(document) {
            const observer = this.observers.get(document);
            if (observer) {
                observer.disconnect();
                this.observers.delete(document);
            }
            this.buttons.delete(document);
            DOMCache.clear();
        }
    };

    // HTML转义工具函数
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 获取清理后的标题（去重版本）
    function getCleanTitleDedup() {
        let title = document.title.trim();
        if (!title) {
            const h1 = document.querySelector('h1');
            if (h1) title = h1.textContent.trim();
        }
        
        // HTML转义防止XSS
        title = escapeHtml(title);
        
        // 移除markdown中的特殊字符
        title = title
            .replace(/[\[\]\(\)]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
            
        // 移除网站名称后缀（常见模式）
        const sitePatterns = [
            /\s*[-–—|]\s*[^-–—|]*$/i,  // 匹配最后的分隔符和网站名
            /\s*\|\s*.*$/i,            // 匹配 | 分隔的网站名
            /\s*-\s*.*官网$/i,         // 匹配 - 官网
            /\s*-\s*.*官方.*$/i,       // 匹配 - 官方xx
            /\s*-\s*.*(网|站|页)$/i,   // 匹配 - xx网/站/页
            /\s*—\s*.*$/i              // 匹配 — 分隔的网站名
        ];
        
        for (const pattern of sitePatterns) {
            const newTitle = title.replace(pattern, '');
            if (newTitle.trim()) {
                title = newTitle;
                break;
            }
        }
        
        // 处理标题中的重复内容
        const parts = title.split(/\s*[-–—|]\s*/);
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1].trim();
            const mainTitle = parts[0].trim();
            
            // 检查最后一部分是否是前面内容的重复或相似
            const similarity = calculateSimilarity(mainTitle, lastPart);
            if (similarity > 0.7 || mainTitle.includes(lastPart) || lastPart.includes(mainTitle)) {
                title = mainTitle;
            }
        }
        
        return title.trim() || '无标题';
    }

    // 计算两个字符串的相似度
    function calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    // 计算编辑距离
    function levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // 创建悬浮图标按钮
    function createFloatingButton() {
        if (ElementManager.hasButton(document)) {
            return null;
        }

        const button = document.createElement('div');
        button.id = 'markdown-copy-floating-btn';
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 11H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 15H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        button.title = `复制为Markdown格式 [title](url)\n快捷键: ${CONFIG.shortcut}`;
        button.style.cssText = `
            position: fixed !important;
            top: 25% !important;
            right: 0 !important;
            transform: translateY(-50%) !important;
            z-index: 2147483647 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px 0 0 8px !important;
            padding: 12px 8px !important;
            cursor: pointer !important;
            box-shadow: -2px 0 15px rgba(0,0,0,0.3) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 44px !important;
            height: 44px !important;
            opacity: 0.8 !important;
            user-select: none !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        `;

        // 鼠标悬停效果
        button.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.transform = 'translateY(-50%) translateX(-5px)';
            this.style.boxShadow = '-5px 0 25px rgba(0,0,0,0.4)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'translateY(-50%) translateX(0)';
            this.style.boxShadow = '-2px 0 15px rgba(0,0,0,0.3)';
        });

        ElementManager.registerButton(document, button);
        return button;
    }

    // 创建设置按钮
    function createSettingsButton() {
        const settingsButton = document.createElement('div');
        settingsButton.id = 'markdown-copy-settings-btn';
        settingsButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V3M12 21V18M18.79 15.21L21 16.5M3 7.5L5.21 8.79M21 7.5L18.79 8.79M3 16.5L5.21 15.21M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12ZM12 18C13.6569 18 15 19.3431 15 21C15 22.6569 13.6569 24 12 24C10.3431 24 9 22.6569 9 21C9 19.3431 10.3431 18 12 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        settingsButton.title = '设置快捷键';
        settingsButton.style.cssText = `
            position: fixed !important;
            top: calc(25% + 50px) !important; /* 位于复制按钮下方 */
            right: 0 !important;
            transform: translateY(-50%) !important;
            z-index: 2147483647 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px 0 0 8px !important;
            padding: 12px 8px !important;
            cursor: pointer !important;
            box-shadow: -2px 0 15px rgba(0,0,0,0.3) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 44px !important;
            height: 44px !important;
            opacity: 0.8 !important;
            user-select: none !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        `;

        settingsButton.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.transform = 'translateY(-50%) translateX(-5px)';
            this.style.boxShadow = '-5px 0 25px rgba(0,0,0,0.4)';
        });

        settingsButton.addEventListener('mouseleave', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'translateY(-50%) translateX(0)';
            this.style.boxShadow = '-2px 0 15px rgba(0,0,0,0.3)';
        });

        settingsButton.addEventListener('click', showSettingsModal);
        return settingsButton;
    }

    // 创建设置模态框
    function createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'markdown-copy-settings-modal';
        modal.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 2147483647 !important;
            background: white !important;
            border-radius: 8px !important;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important;
            padding: 20px !important;
            width: 300px !important;
            max-width: 90% !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            color: #333 !important;
            display: none; /* 默认隐藏 */
        `;
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: #667eea;">设置</h3>
            <p style="font-size: 14px; margin-bottom: 15px;">快捷键设置</p>
            <input type="text" id="shortcut-input" value="${CONFIG.shortcut}" style="
                width: calc(100% - 20px);
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            ">
            <p style="font-size: 12px; color: #666; margin-top: -10px; margin-bottom: 15px;">
                支持格式: Ctrl+Alt+S, Alt+Shift+M, Ctrl+Shift+Alt+Q 等
            </p>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="reset-config-btn" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 15px;
                    cursor: pointer;
                    font-size: 14px;
                ">重置</button>
                <button id="save-shortcut-btn" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 15px;
                    cursor: pointer;
                    font-size: 14px;
                ">保存</button>
                <button id="cancel-shortcut-btn" style="
                    background: #f0f0f0;
                    color: #333;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 8px 15px;
                    cursor: pointer;
                    font-size: 14px;
                ">取消</button>
            </div>
        `;
        document.body.appendChild(modal);

        // 使模态框可拖拽
        let isDragging = false;
        let offsetX, offsetY;

        modal.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - modal.getBoundingClientRect().left;
            offsetY = e.clientY - modal.getBoundingClientRect().top;
            modal.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            modal.style.left = `${e.clientX - offsetX}px`;
            modal.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            modal.style.cursor = 'grab';
        });

        document.getElementById('save-shortcut-btn').addEventListener('click', saveShortcut);
        document.getElementById('cancel-shortcut-btn').addEventListener('click', hideSettingsModal);
        document.getElementById('reset-config-btn').addEventListener('click', function() {
            ConfigManager.reset();
            CONFIG.shortcut = ConfigManager.get('shortcut');
            document.getElementById('shortcut-input').value = CONFIG.shortcut;
            updateButtonTitle();
            showNotification('配置已重置', true);
        });
        return modal;
    }

    // 显示设置模态框
    function showSettingsModal() {
        const modal = document.getElementById('markdown-copy-settings-modal');
        if (modal) {
            document.getElementById('shortcut-input').value = CONFIG.shortcut; // 确保显示当前快捷键
            modal.style.display = 'block';
        }
    }

    // 隐藏设置模态框
    function hideSettingsModal() {
        const modal = document.getElementById('markdown-copy-settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 保存快捷键
    function saveShortcut() {
        const newShortcut = document.getElementById('shortcut-input').value.trim();
        if (newShortcut) {
            ConfigManager.set('shortcut', newShortcut);
            CONFIG.shortcut = newShortcut; // 更新内存中的配置
            updateButtonTitle(); // 更新按钮提示
            showNotification('快捷键已保存!', true);
            hideSettingsModal();
        } else {
            showNotification('快捷键不能为空!', false);
        }
    }

    // 更新按钮的title属性
    function updateButtonTitle() {
        const button = document.getElementById('markdown-copy-floating-btn');
        if (button) {
            button.title = `复制为Markdown格式 [title](url)\n快捷键: ${CONFIG.shortcut}`;
        }
    }

    // 复制到剪贴板的函数
    async function copyToClipboard(text) {
        const errors = {
            permission: '复制权限被拒绝，请检查浏览器权限设置',
            secure: '当前页面不支持复制功能，请使用HTTPS或在安全上下文中访问',
            fallback: '复制失败，请手动复制',
            unknown: '复制时发生未知错误'
        };

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return { success: true };
            } else if (navigator.clipboard) {
                // 非安全上下文，使用回退方法
                return { success: false, error: errors.secure };
            } else {
                // 使用回退方法
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                textArea.style.left = '-9999px';
                textArea.style.top = '0';
                textArea.style.zIndex = '-1';
                document.body.appendChild(textArea);
                textArea.select();
                textArea.setSelectionRange(0, 99999);
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (success) {
                    return { success: true };
                } else {
                    return { success: false, error: errors.fallback };
                }
            }
        } catch (error) {
            console.error('复制失败:', error);
            let message = errors.unknown;
            
            if (error.name === 'NotAllowedError') {
                message = errors.permission;
            } else if (error.name === 'SecurityError') {
                message = errors.secure;
            }
            
            return { success: false, error: message };
        }
    }

    // 删除重复的 getCleanTitle 函数，使用上面的 getCleanTitleDedup

    // 显示提示消息
    function showNotification(message, isSuccess = true) {
        // 移除旧的通知
        const oldNotification = document.getElementById('markdown-copy-notification');
        if (oldNotification) {
            oldNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'markdown-copy-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed !important;
            top: calc(25% + 60px) !important;
            right: 20px !important;
            z-index: 2147483646 !important;
            background: ${isSuccess ? '#28a745' : '#dc3545'} !important;
            color: white !important;
            padding: 12px 16px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
            animation: slideIn 0.3s ease !important;
            user-select: none !important;
        `;

        // 添加动画样式
        if (!document.getElementById('md-copy-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'md-copy-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 1秒后自动消失
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (notification && notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 1000);
    }

    // 主要功能：复制markdown格式链接
    async function copyMarkdownLink() {
        try {
            const title = getCleanTitleDedup();
            const url = window.location.href;
            
            if (!title || !url) {
                showNotification('❌ 无法获取页面信息', false);
                return;
            }
            
            const markdownLink = `[${title}](${url})`;
            const result = await copyToClipboard(markdownLink);

            if (result.success) {
                showNotification('✅ 已复制到剪贴板!', true);
                console.log('复制成功:', markdownLink);
            } else {
                showNotification(`❌ ${result.error}`, false);
                console.error('复制失败:', result.error);
            }
        } catch (error) {
            console.error('复制过程中发生错误:', error);
            showNotification('❌ 复制过程中发生错误', false);
        }
    }

    // 初始化按钮和设置
    function initializeUI() {
        // 确保不重复创建
        if (ElementManager.hasButton(document)) {
            return;
        }

        const copyButton = createFloatingButton();
        const settingsButton = createSettingsButton();
        const settingsModal = createSettingsModal();

        if (copyButton) {
            copyButton.addEventListener('click', copyMarkdownLink);
            document.body.appendChild(copyButton);
            console.log('Markdown复制按钮已添加');
        }
        if (settingsButton) {
            document.body.appendChild(settingsButton);
            console.log('Markdown设置按钮已添加');
        }
        if (settingsModal) {
            // 模态框默认隐藏，不需要立即显示
            console.log('Markdown设置模态框已创建');
        }
    }

    // 解析快捷键字符串
    function parseShortcut(shortcut) {
        const parts = shortcut.toUpperCase().split('+');
        return {
            ctrl: parts.includes('CTRL'),
            alt: parts.includes('ALT'),
            shift: parts.includes('SHIFT'),
            key: parts.find(part => !['CTRL', 'ALT', 'SHIFT'].includes(part)) || 'M'
        };
    }

    // 检查快捷键是否匹配
    function isShortcutMatch(event, shortcut) {
        const parsed = parseShortcut(shortcut);
        return (
            event.ctrlKey === parsed.ctrl &&
            event.altKey === parsed.alt &&
            event.shiftKey === parsed.shift &&
            event.key.toUpperCase() === parsed.key
        );
    }

    // 添加快捷键支持
    document.addEventListener('keydown', function(e) {
        if (isShortcutMatch(e, CONFIG.shortcut)) {
            e.preventDefault();
            copyMarkdownLink();
        }
    });

    // 页面加载监听
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeUI);
    } else {
        initializeUI();
    }

    // 对于YouTube等SPA，添加额外的重试机制
    if (window.location.hostname.includes('youtube.com') || window.location.hostname.includes('google.com')) {
        // 多次重试确保按钮显示
        setTimeout(initializeUI, 2000);
        setTimeout(initializeUI, 5000);

        // 监听页面变化
        let retryCount = 0;
        const maxRetries = 5;

        const observer = new MutationObserver(() => {
            if (!ElementManager.hasButton(document) && retryCount < maxRetries) {
                retryCount++;
                setTimeout(initializeUI, 1000);
            }
        });

        ElementManager.observers.set(document, observer);
        
        setTimeout(() => {
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }, 3000);
    }

console.log('Markdown链接复制脚本已加载');

})();;