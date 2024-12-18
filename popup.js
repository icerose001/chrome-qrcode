document.addEventListener('DOMContentLoaded', async () => {
    // 显示加载动画
    const loading = document.getElementById('loading');
    const qrcodeContainer = document.getElementById('qrcode');
    const siteNameElement = document.getElementById('site-name');
    const faviconElement = document.getElementById('favicon');

    try {
        // 获取当前标签页信息
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab.url;
        const title = tab.title;
        const favicon = tab.favIconUrl || 'default-favicon.png';

        // 设置网站信息
        siteNameElement.textContent = title;
        faviconElement.src = favicon;

        // 生成二维码
        const qrcode = new QRCode(qrcodeContainer, {
            text: url,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // 在二维码中间添加favicon
        setTimeout(() => {
            const canvas = qrcodeContainer.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = favicon;
            
            img.onload = () => {
                // 在二维码中心绘制favicon
                const size = 40;
                const x = (canvas.width - size) / 2;
                const y = (canvas.height - size) / 2;
                
                // 绘制白色背景
                ctx.fillStyle = 'white';
                ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
                
                // 绘制favicon
                ctx.drawImage(img, x, y, size, size);
                
                // 隐藏加载动画
                loading.classList.add('hidden');
            };
            
            img.onerror = () => {
                // 如果favicon加载失败，仍然隐藏加载动画
                loading.classList.add('hidden');
            };
        }, 100);

    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('hidden');
    }
}); 