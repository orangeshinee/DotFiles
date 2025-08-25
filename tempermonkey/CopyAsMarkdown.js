// ==UserScript==
// @name         CopyAsMarkdown
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  快速复制当前网页地址为markdown格式 [title](url)，支持自定义快捷键，自动去除网站名称后缀
// @author       MrHeTony
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // 配置项
    const CONFIG = {
        shortcut: GM_getValue('shortcut', 'Alt+Shift+M'), // 默认快捷键
        position: GM_getValue('position', { top: '25%', right: '0' }), // 默认位置
    };

    // 防重复创建标志
    let buttonCreated = false;

    // 获取清理后的标题
    function getCleanTitle() {
        let title = document.title.trim();
        if (!title) {
            const h1 = document.querySelector('h1');
            if (h1) title = h1.textContent.trim();
        }
        
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
        
        return title.trim() || '无标题';
    }

    // 获取清理后的标题（去重版本）
    function getCleanTitleDedup() {
        let title = document.title.trim();
        if (!title) {
            const h1 = document.querySelector('h1');
            if (h1) title = h1.textContent.trim();
        }
        
        // 移除markdown中的特殊字符
        title = title
            .replace(/[\[\]\(\)]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
            
        // 移除常见的重复后缀，如" - 知乎"、" - 简书"等
        title = title.replace(/\s*[-–—]\s*(.*)\1$/, '');
        
        // 移除网站名称后缀（常见模式）
        const sitePatterns = [
            /[\s-–—|]\s*[^-–—|]*$/i,  // 匹配最后的分隔符和网站名
            /\s*\|\s*.*$/i,            // 匹配 | 分隔的网站名
            /\s*-\s*.*官网$/i,         // 匹配 - 官网
            /\s*-\s*.*官方.*$/i        // 匹配 - 官方xx
        ];
        
        for (const pattern of sitePatterns) {
            const newTitle = title.replace(pattern, '');
            if (newTitle.trim()) {
                title = newTitle;
                break;
            }
        }
        
        return title.trim() || '无标题';
    }

    // 创建悬浮图标按钮
    function createFloatingButton() {
        if (buttonCreated || document.getElementById('markdown-copy-floating-btn')) {
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

        buttonCreated = true;
        return button;
    }

    // 复制到剪贴板的函数
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
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
                return success;
            }
        } catch (error) {
            console.error('复制失败:', error);
            return false;
        }
    }

    // 获取页面标题，去除特殊字符
    function getCleanTitle() {
        let title = document.title.trim();
        if (!title) {
            // 如果没有标题，尝试从其他地方获取
            const h1 = document.querySelector('h1');
            if (h1) title = h1.textContent.trim();
        }
        
        // 移除markdown中的特殊字符
        title = title
            .replace(/[\[\]\(\)]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
            
        // 移除常见的重复后缀，如" - 知乎"、" - 简书"等
        title = title.replace(/\s*[-–—]\s*(.*)\1$/, '');
        
        // 移除网站名称后缀（常见模式）
        const sitePatterns = [
            /[\s-–—|]\s*[^-–—|]*$/i,  // 匹配最后的分隔符和网站名
            /\s*\|\s*.*$/i,            // 匹配 | 分隔的网站名
            /\s*-\s*.*官网$/i,         // 匹配 - 官网
            /\s*-\s*.*官方.*$/i        // 匹配 - 官方xx
        ];
        
        for (const pattern of sitePatterns) {
            const newTitle = title.replace(pattern, '');
            if (newTitle.trim()) {
                title = newTitle;
                break;
            }
        }
        
        return title.trim() || '无标题';
    }

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
        const title = getCleanTitle();
        const url = window.location.href;
        const markdownLink = `[${title}](${url})`;

        const success = await copyToClipboard(markdownLink);

        if (success) {
            showNotification('✅ 已复制到剪贴板!', true);
            console.log('复制成功:', markdownLink);
        } else {
            showNotification('❌ 复制失败，请重试', false);
            console.error('复制失败');
        }
    }

    // 初始化按钮
    function initializeButton() {
        // 确保不重复创建
        if (buttonCreated || document.getElementById('markdown-copy-floating-btn')) {
            return;
        }

        const button = createFloatingButton();
        if (button) {
            button.addEventListener('click', copyMarkdownLink);

            // 使用多种方法确保按钮被正确添加
            const addButton = () => {
                if (document.body) {
                    document.body.appendChild(button);
                    console.log('Markdown复制按钮已添加');
                } else {
                    setTimeout(addButton, 100);
                }
            };

            addButton();
        }
    }

    // 添加快捷键支持 (Ctrl+Shift+C 或 Cmd+Shift+C)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyMarkdownLink();
        }
    });

    // 页面加载监听
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeButton);
    } else {
        initializeButton();
    }

    // 对于YouTube等SPA，添加额外的重试机制
    if (window.location.hostname.includes('youtube.com')) {
        // 多次重试确保按钮显示
        setTimeout(initializeButton, 2000);
        setTimeout(initializeButton, 5000);

        // 监听页面变化
        let retryCount = 0;
        const maxRetries = 5;

        const observer = new MutationObserver(() => {
            if (!document.getElementById('markdown-copy-floating-btn') && retryCount < maxRetries) {
                retryCount++;
                buttonCreated = false; // 重置状态
                setTimeout(initializeButton, 1000);
            }
        });

        setTimeout(() => {
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }, 3000);
    }

    console.log('Markdown链接复制脚本已加载');

})();