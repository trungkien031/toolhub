const elements = {
    toast: document.getElementById('toast')
};

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, match => ({
        '&': '&',
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '''
    }[match]));
}

function showError(inputElement, errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    if (!errorElement) return;
    inputElement.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('active');
    showToast(message, 'error');
}

function clearError(inputElement, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    if (!errorElement) return;
    inputElement.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('active');
}

function showToast(message, type) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} active animate__animated animate__slideInRight`;
    setTimeout(() => {
        elements.toast.className = 'toast';
    }, 3000);
}

function showLoading(button, loadingId, resultId, callback) {
    const loading = document.getElementById(loadingId);
    const result = document.getElementById(resultId);
    if (!loading || !result) return;
    loading.style.display = 'block';
    result.classList.remove('active');
    button.disabled = true;
    setTimeout(() => {
        loading.style.display = 'none';
        button.disabled = false;
        callback();
    }, 300);
}

function processTool(button, loadingId, resultId, validateFn, processFn) {
    showLoading(button, loadingId, resultId, () => {
        const validation = validateFn();
        if (!validation.isValid) {
            return showError(validation.input, validation.errorId, validation.message);
        }
        clearError(validation.input, validation.errorId);
        processFn();
        document.getElementById(resultId).classList.add('active', 'animate__animated', 'animate__fadeIn');
    });
}

function validateInput(value, type, inputElement, errorId) {
    switch (type) {
        case 'text':
            if (/^\s*$/.test(value)) {
                return {
                    isValid: false,
                    input: inputElement,
                    errorId,
                    message: i18next.t('error.emptyText', 'Please enter valid text!')
                };
            }
            break;
        case 'number':
            const num = parseFloat(value);
            if (isNaN(num) || num < 0) {
                return {
                    isValid: false,
                    input: inputElement,
                    errorId,
                    message: i18next.t('error.invalidNumber', 'Please enter a valid positive number!')
                };
            }
            break;
        case 'url':
            const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
            if (!urlPattern.test(value)) {
                return {
                    isValid: false,
                    input: inputElement,
                    errorId,
                    message: i18next.t('error.invalidUrl', 'Please enter a valid URL!')
                };
            }
            break;
    }
    return { isValid: true, input: inputElement, errorId };
}

function saveToHistory(toolId, result) {
    let history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
    history.push({
        toolId,
        result,
        timestamp: new Date().toLocaleString(i18next.language === 'vi' ? 'vi-VN' : i18next.language === 'ja' ? 'ja-JP' : 'en-US')
    });
    if (history.length > 100) history = history.slice(-100);
    localStorage.setItem('toolHistory', JSON.stringify(history));
}

function saveToolState(toolId, inputData) {
    localStorage.setItem(`toolState_${toolId}`, JSON.stringify(inputData));
}

function loadToolState(toolId) {
    return JSON.parse(localStorage.getItem(`toolState_${toolId}`) || '{}');
}

function restoreToolState(toolId) {
    const state = loadToolState(toolId);
    const section = document.getElementById(toolId);
    if (!section) return;
    Object.keys(state).forEach(id => {
        const element = section.querySelector(`#${id}`);
        if (element) {
            if (element.type === 'checkbox') element.checked = state[id];
            else element.value = state[id];
        }
    });
}