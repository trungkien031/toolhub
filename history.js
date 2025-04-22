const elements = {
    historyResult: document.getElementById('historyResult'),
    historyStats: document.getElementById('historyStats')
};

function showHistory() {
    console.log('Showing history...');
    const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
    if (!elements.historyResult || !elements.historyStats) return;

    if (history.length === 0) {
        elements.historyResult.innerHTML = `<p>${i18next.t('noHistory', 'Không có lịch sử.')}</p>`;
        elements.historyStats.innerHTML = '';
        return;
    }

    // Hiển thị thống kê sử dụng
    const stats = {};
    history.forEach(entry => {
        stats[entry.toolId] = (stats[entry.toolId] || 0) + 1;
    });

    let statsHTML = `<h3>${i18next.t('usageStats', 'Thống kê sử dụng')}</h3><ul>`;
    for (const [toolId, count] of Object.entries(stats)) {
        statsHTML += `<li>${i18next.t(toolId)}: ${count} ${i18next.t('times', 'lần')}</li>`;
    }
    statsHTML += '</ul>';
    elements.historyStats.innerHTML = statsHTML;

    // Hiển thị lịch sử dưới dạng văn bản tiếng Việt
    let historyHTML = '<ul class="history-list">';
    history.forEach(entry => {
        const toolName = i18next.t(entry.toolId);
        let resultText = '';
        switch (entry.toolId) {
            case 'summarize':
                resultText = `Tóm tắt: ${escapeHTML(entry.result.output.substring(0, 50))}...`;
                break;
            case 'length-converter':
                resultText = `${entry.result.value} ${i18next.t(entry.result.fromUnit)} thành ${entry.result.result.toFixed(2)} ${i18next.t(entry.result.toUnit)}`;
                break;
            case 'calculator':
                resultText = `${entry.result.num1} ${entry.result.operator} ${entry.result.num2} = ${entry.result.result.toFixed(2)}`;
                break;
            case 'password-generator':
                resultText = `Mật khẩu: ${escapeHTML(entry.result.password)} (độ dài: ${entry.result.length})`;
                break;
            case 'char-counter':
                resultText = `${entry.result.charCount} ký tự, ${entry.result.wordCount} từ`;
                break;
            case 'url-checker':
                resultText = `URL: ${escapeHTML(entry.result.url)} (${entry.result.isSafe ? 'Hợp lệ' : 'Không an toàn'})`;
                break;
            case 'temp-converter':
                resultText = `${entry.result.value} ${i18next.t(entry.result.fromUnit)} thành ${entry.result.result.toFixed(2)} ${i18next.t(entry.result.toUnit)}`;
                break;
            case 'currency-converter':
                resultText = `${entry.result.value} ${entry.result.fromCurrency} thành ${entry.result.result.toFixed(2)} ${entry.result.toCurrency}`;
                break;
            case 'qr-generator':
                resultText = `Mã QR cho: ${escapeHTML(entry.result.text.substring(0, 50))}...`;
                break;
            case 'image-compressor':
                resultText = `Nén ảnh: ${Math.round(entry.result.originalSize / 1024)}KB → ${Math.round(entry.result.compressedSize / 1024)}KB`;
                break;
            case 'bmi-calculator':
                resultText = `BMI: ${entry.result.bmi.toFixed(1)} (${i18next.t(`bmi.${entry.result.status.toLowerCase()}`, entry.result.status)})`;
                break;
            case 'area-converter':
                resultText = `${entry.result.value} ${i18next.t(entry.result.fromUnit)} thành ${entry.result.result.toFixed(2)} ${i18next.t(entry.result.toUnit)}`;
                break;
        }
        historyHTML += `
            <li>
                <strong>${toolName}</strong>: ${resultText}<br>
                <small>${i18next.t('timestamp', 'Thời gian')}: ${entry.timestamp}</small>
            </li>
        `;
    });
    historyHTML += '</ul>';
    elements.historyResult.innerHTML = historyHTML;
}

function clearHistory() {
    console.log('Clearing history...');
    localStorage.removeItem('toolHistory');
    showHistory();
    showToast(i18next.t('historyCleared', 'Đã xóa lịch sử!'), 'success');
}