(() => {
    console.log('QR Code Extension: Script started');

    // 创建二维码模态框
    const createQRModal = (shadow) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 80px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
            padding: 16px;
            display: none;
            flex-direction: column;
            align-items: center;
            pointer-events: auto;
        `;

        // 关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.style.cssText = `
            position: absolute;
            right: 8px;
            top: 8px;
            width: 24px;
            height: 24px;
            cursor: pointer;
            opacity: 0.6;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
        `;

        // 二维码容器
        const qrcodeContainer = document.createElement('div');
        qrcodeContainer.id = 'qrcode-container';

        // 网站信息
        const siteInfo = document.createElement('div');
        siteInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const favicon = document.createElement('img');
        favicon.style.cssText = `
            width: 16px;
            height: 16px;
            border-radius: 2px;
        `;
        favicon.src = document.querySelector("link[rel*='icon']")?.href || '/favicon.ico';

        const siteName = document.createElement('div');
        siteName.style.cssText = `
            font-size: 14px;
            color: #333;
        `;
        siteName.textContent = document.title;

        siteInfo.appendChild(favicon);
        siteInfo.appendChild(siteName);

        modal.appendChild(closeBtn);
        modal.appendChild(qrcodeContainer);
        modal.appendChild(siteInfo);

        return modal;
    };

    // 创建悬浮按钮
    const createFloatingButton = () => {
        console.log('QR Code Extension: Creating floating button');
        
        // 创建一个 shadow DOM 容器
        const host = document.createElement('div');
        host.id = 'qr-code-extension-host';
        
        // 设置容器样式
        host.style.cssText = `
            position: fixed !important;
            right: 20px !important;
            bottom: 20px !important;
            width: 48px !important;
            height: 48px !important;
            z-index: 2147483647 !important;
            background: transparent !important;
            pointer-events: none !important;
        `;

        // 创建 shadow root
        const shadow = host.attachShadow({ mode: 'closed' });

        // 创建按钮
        const button = document.createElement('div');
        button.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            pointer-events: auto;
        `;

        // 创建二维码模态框
        const modal = createQRModal(shadow);
        shadow.appendChild(modal);

        // 添加hover效果
        button.onmouseenter = () => {
            button.style.transform = 'scale(1.1)';
        };
        button.onmouseleave = () => {
            button.style.transform = 'scale(1)';
        };

        // 创建图标
        const icon = document.createElement('img');
        icon.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 4px;
            object-fit: contain;
        `;

        // 设置默认图标
        const defaultIcon = `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#666" d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2z"/>
            </svg>
        `)}`;

        // 尝试获取favicon
        try {
            const links = document.querySelectorAll('link[rel*="icon"]');
            let faviconUrl = '';
            for (const link of links) {
                if (link.href) {
                    faviconUrl = link.href;
                    break;
                }
            }
            
            icon.src = faviconUrl || new URL('/favicon.ico', window.location.origin).href;
        } catch (error) {
            icon.src = defaultIcon;
        }

        icon.onerror = () => {
            console.log('QR Code Extension: Favicon load failed, using default icon');
            icon.src = defaultIcon;
        };

        // 组装按钮
        button.appendChild(icon);
        shadow.appendChild(button);

        // 添加点击事件
        button.addEventListener('click', () => {
            console.log('QR Code Extension: Button clicked');
            modal.style.display = 'flex';

            // 如果二维码还没有生成，则生成二维码
            if (!modal.querySelector('canvas')) {
                new QRCode(modal.querySelector('#qrcode-container'), {
                    text: window.location.href,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // 在二维码中间添加favicon
                setTimeout(() => {
                    const canvas = modal.querySelector('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = icon.src;
                    
                    img.onload = () => {
                        const size = 40;
                        const x = (canvas.width - size) / 2;
                        const y = (canvas.height - size) / 2;
                        
                        ctx.fillStyle = 'white';
                        ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
                        ctx.drawImage(img, x, y, size, size);
                    };
                }, 100);
            }
        });

        // 点击关闭按钮隐藏二维码
        modal.querySelector('div').addEventListener('click', (e) => {
            e.stopPropagation();
            modal.style.display = 'none';
        });

        return host;
    };

    // 初始化函数
    const init = () => {
        try {
            console.log('QR Code Extension: Initializing');
            
            // 移除可能存在的旧按钮
            const oldButton = document.getElementById('qr-code-extension-host');
            if (oldButton) {
                oldButton.remove();
            }

            // 创建并添加新按钮
            const button = createFloatingButton();
            document.body.appendChild(button);
            console.log('QR Code Extension: Button added to page');
            
        } catch (error) {
            console.error('QR Code Extension initialization error:', error);
        }
    };

    // 确保在页面加载完成后初始化
    const tryInit = () => {
        if (document.body) {
            init();
        } else {
            setTimeout(tryInit, 100);
        }
    };

    tryInit();
})();