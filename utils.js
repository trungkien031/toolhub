function validateInput(value, type, inputElement, errorId) {
    console.log(`Validating input: ${value}, type: ${type}`);
    let isValid = true;
    let message = '';

    if (!value) {
        isValid = false;
        message = i18next.t('error.emptyText', 'Please enter valid text!');
    } else {
        switch (type) {
            case 'text':
                if (value.trim().length === 0) {
                    isValid = false;
                    message = i18next.t('error.emptyText', 'Please enter valid text!');
                }
                break;
            case 'number':
                const num = parseFloat(value);
                if (isNaN(num) || num < 0) {
                    isValid = false;
                    message = i18next.t('error.invalidNumber', 'Please enter a valid positive number!');
                }
                break;
            case 'url':
                const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
                if (!urlPattern.test(value)) {
                    isValid = false;
                    message = i18next.t('error.invalidUrl', 'Please enter a valid URL!');
                }
                break;
        }
    }

    if (!isValid) {
        showError(inputElement, errorId, message);
    } else {
        clearError(errorId);
    }

    return { isValid, input: inputElement, errorId, message };
}

function showError(inputElement, errorId, message) {
    console.log(`Showing error: ${message}`);
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('active');
    }
    if (inputElement) {
        inputElement.classList.add('error');
        inputElement.focus();
    }
}

function clearError(errorId) {
    console.log(`Clearing error for: ${errorId}`);
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('active');
    }
    const inputs = document.querySelectorAll(`#${errorId.replace('Error', '')} input`);
    inputs.forEach(input => input.classList.remove('error'));
}

function showToast(message, type) {
    console.log(`Showing toast: ${message}, type: ${type}`);
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} active animate__animated animate__fadeIn`;
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function saveToHistory(toolId, result) {
    console.log(`Saving to history: ${toolId}`);
    const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
    history.push({
        toolId,
        result,
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('toolHistory', JSON.stringify(history));
}

function saveToolState(toolId, state) {
    console.log(`Saving tool state: ${toolId}`);
    localStorage.setItem(`toolState_${toolId}`, JSON.stringify(state));
}

function restoreToolState(toolId) {
    console.log(`Restoring tool state: ${toolId}`);
    const state = JSON.parse(localStorage.getItem(`toolState_${toolId}`) || '{}');
    const section = document.getElementById(toolId);
    if (!section) return;

    Object.keys(state).forEach(key => {
        const element = section.querySelector(`#${key}`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = state[key];
            } else {
                element.value = state[key];
            }
        }
    });
}

function processTool(button, loadingId, resultId, validateFn, executeFn) {
    console.log(`Processing tool for button: ${button.dataset.action}`);
    const loadingElement = document.getElementById(loadingId);
    const resultElement = document.getElementById(resultId);

    const validation = validateFn();
    if (!validation.isValid) {
        showError(validation.input, validation.errorId, validation.message);
        return;
    }

    clearError(validation.errorId);
    if (loadingElement) loadingElement.style.display = 'block';
    if (resultElement) resultElement.style.display = 'none';

    setTimeout(async () => {
        try {
            await executeFn();
            if (resultElement) resultElement.style.display = 'block';
        } catch (error) {
            console.error('Tool execution error:', error);
            showError(validation.input, validation.errorId, i18next.t('error.apiError', 'Error executing tool.'));
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }, 500);
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[match]));
}
