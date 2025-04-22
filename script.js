document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    let translations = {};
    var gk_isXlsx = false;
    var gk_xlsxFileLookup = {};
    var gk_fileData = {};

    // Load language file
    fetch('/toolhub/languages.json')
        .then(response => response.json())
        .then(data => {
            translations = data;
            const savedLang = localStorage.getItem('language') || 'vi';
            document.getElementById('languageSwitch').value = savedLang;
            updateLanguage(savedLang);
        })
        .catch(error => {
            console.error('Error loading translations:', error);
            showToast('Không thể tải ngôn ngữ, sử dụng mặc định (Tiếng Việt)!', 'error');
        });

    // Update language function
    function updateLanguage(lang) {
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            element.textContent = translations[lang][key] || element.textContent;
        });
        document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
            const key = element.getAttribute('data-lang-placeholder');
            element.placeholder = translations[lang][key] || element.placeholder;
        });
        document.title = translations[lang]['hero_title'] || document.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', translations[lang]['hero_description'] || metaDescription.getAttribute('content'));
        }
        localStorage.setItem('language', lang);
    }

    // Language switch event
    document.getElementById('languageSwitch').addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        updateLanguage(selectedLang);
        showToast(translations[selectedLang]['language_switch_success'], 'success');
    });

    // Utility Functions
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match]));
    }

    function showError(inputElement, errorElementId, messageKey) {
        const lang = localStorage.getItem('language') || 'vi';
        const errorElement = document.getElementById(errorElementId);
        if (!errorElement) {
            console.error(`Error element with ID ${errorElementId} not found`);
            return false;
        }
        inputElement.classList.add('error');
        errorElement.textContent = translations[lang][messageKey] || messageKey;
        errorElement.classList.add('active');
        showToast(translations[lang][messageKey] || messageKey, 'error');
        return false;
    }

    function clearError(inputElement, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        if (!errorElement) {
            console.error(`Error element with ID ${errorElementId} not found`);
            return false;
        }
        inputElement.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('active');
        return true;
    }

    function showToast(messageKey, type) {
        const lang = localStorage.getItem('language') || 'vi';
        const toast = document.getElementById('toast');
        if (!toast) {
            console.error("Toast element not found");
            return;
        }
        toast.textContent = translations[lang][messageKey] || messageKey;
        toast.className = `toast ${type} active animate__animated animate__slideInRight`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    function showLoading(button, loadingId, resultId, callback) {
        const loading = document.getElementById(loadingId);
        const result = document.getElementById(resultId);
        if (!loading || !result) {
            console.error(`Loading or result element not found: ${loadingId}, ${resultId}`);
            return;
        }
        loading.classList.add('active');
        result.classList.remove('active');
        button.disabled = true;
        setTimeout(() => {
            loading.classList.remove('active');
            button.disabled = false;
            callback();
        }, 300);
    }

    function processTool(button, loadingId, resultId, validateFn, processFn) {
        showLoading(button, loadingId, resultId, () => {
            const validation = validateFn();
            if (!validation.isValid) {
                return showError(validation.input, validation.errorId, validation.messageKey);
            }
            clearError(validation.input, validation.errorId);
            processFn();
            document.getElementById(resultId).classList.add('active', 'animate__animated', 'animate__fadeIn');
        });
    }

    function saveToHistory(toolId, result) {
        let history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
        const lang = localStorage.getItem('language') || 'vi';
        history.push({
            toolId,
            toolName: translations[lang][`${toolId}_title`] || toolId,
            result,
            timestamp: new Date().toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')
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

    // UI Functions
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode', 'animate__animated', 'animate__fadeIn');
        localStorage.setItem('darkMode', document.getElementById('darkModeToggle').checked);
        if (document.body.classList.contains('dark-mode')) {
            document.querySelectorAll('pre').forEach(pre => pre.style.background = '#3a3a4e');
        } else {
            document.querySelectorAll('pre').forEach(pre => pre.style.background = '#f5f5f5');
        }
    }

    function openContactModal() {
        const modal = document.getElementById('contactModal');
        if (!modal) {
            console.error("Contact modal not found");
            return;
        }
        modal.classList.add('active', 'animate__animated', 'animate__fadeIn');
    }

    function closeContactModal() {
        const modal = document.getElementById('contactModal');
        if (!modal) {
            console.error("Contact modal not found");
            return;
        }
        modal.classList.remove('active');
    }

    function showHome() {
        const toolsSections = document.querySelectorAll('.tools-section');
        const heroSection = document.getElementById('hero');
        if (!heroSection) {
            console.error("Hero section not found");
            return;
        }
        toolsSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        heroSection.style.display = 'block';
        heroSection.classList.add('animate__animated', 'animate__fadeIn');
        document.querySelectorAll('.tool-nav a').forEach(link => link.classList.remove('active'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const lang = localStorage.getItem('language') || 'vi';
        document.title = translations[lang]['hero_title'] || 'ToolHub - Hộp Công Cụ Đa Năng';
    }

    function showTool(toolId) {
        const heroSection = document.getElementById('hero');
        const toolsSections = document.querySelectorAll('.tools-section');
        if (!heroSection) {
            console.error("Hero section not found");
            return;
        }
        heroSection.style.display = 'none';
        toolsSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(toolId);
        if (targetSection) {
            targetSection.classList.add('active', 'animate__animated', 'animate__fadeInUp');
            targetSection.style.display = 'block';
            targetSection.scrollIntoView({ behavior: 'smooth' });
            const lang = localStorage.getItem('language') || 'vi';
            document.title = `${translations[lang][`${toolId}_title`]} - ToolHub`;
            restoreToolState(toolId);
            document.querySelectorAll('.tool-nav a, .magic-menu-content a').forEach(link => {
                link.classList.toggle('active', link.dataset.tool === toolId);
            });
        } else {
            console.error(`Tool section with ID ${toolId} not found`);
        }
    }

    function restoreToolState(toolId) {
        const state = loadToolState(toolId);
        const section = document.getElementById(toolId);
        if (!section) {
            console.error(`Tool section with ID ${toolId} not found for state restoration`);
            return;
        }
        Object.keys(state).forEach(id => {
            const element = section.querySelector(`#${id}`);
            if (element) {
                if (element.type === 'checkbox') element.checked = state[id];
                else element.value = state[id];
            } else {
                console.warn(`Element with ID ${id} not found in section ${toolId}`);
            }
        });
    }

    function showHistory() {
        showTool('history');
        const lang = localStorage.getItem('language') || 'vi';
        const historyResult = document.getElementById('historyResult');
        if (!historyResult) {
            console.error("History result element not found");
            return;
        }
        const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
        historyResult.innerHTML = history.length ? `
            <ul style="list-style: none; padding: 0;">
                ${history.map(item => `
                    <li style="margin-bottom: 15px;">
                        <strong>${item.toolName}</strong> (${item.timestamp}): 
                        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
                            ${escapeHTML(JSON.stringify(item.result, null, 2))}
                        </pre>
                    </li>
                `).join('')}
            </ul>
        ` : `<p>${translations[lang]['history_empty']}</p>`;
        if (document.body.classList.contains('dark-mode')) {
            historyResult.querySelectorAll('pre').forEach(pre => pre.style.background = '#3a3a4e');
        }
    }

    function clearHistory() {
        localStorage.removeItem('toolHistory');
        showHistory();
        showToast('history_clear_success', 'success');
    }

    function searchTools() {
        const lang = localStorage.getItem('language') || 'vi';
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) {
            console.error("Search input not found");
            return;
        }
        const searchValue = searchInput.value.trim().toLowerCase();
        const toolsSections = document.querySelectorAll('.tools-section');
        const heroSection = document.getElementById('hero');
        if (!heroSection) {
            console.error("Hero section not found");
            return;
        }

        if (!searchValue) {
            showHome();
            return;
        }

        let found = false;
        toolsSections.forEach(section => {
            const toolName = translations[lang][`${section.dataset.toolName}_title`].toLowerCase();
            if (toolName.includes(searchValue)) {
                heroSection.style.display = 'none';
                section.style.display = 'block';
                section.classList.add('active', 'animate__animated', 'animate__fadeInUp');
                section.scrollIntoView({ behavior: 'smooth' });
                found = true;
            } else {
                section.style.display = 'none';
                section.classList.remove('active');
            }
        });

        if (!found) {
            showToast('Không tìm thấy công cụ nào!', 'error');
        }

        document.querySelectorAll('.tool-nav a, .magic-menu-content a').forEach(link => link.classList.remove('active'));
    }

    // Magic Menu Toggle
    function toggleMagicMenu() {
        const magicMenuContent = document.querySelector('.magic-menu-content');
        if (!magicMenuContent) {
            console.error("Magic Menu content not found");
            return;
        }
        magicMenuContent.classList.toggle('active');
    }

    // Tool Functions
    function summarizeText(button) {
        processTool(button, 'textLoading', 'textResult',
            () => {
                const textInput = document.getElementById('textInput');
                if (!textInput) {
                    console.error("Text input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập văn bản!", 'error');
                    return { isValid: false };
                }
                const text = textInput.value.trim();
                return {
                    isValid: text && text.length <= 10000,
                    input: textInput,
                    errorId: 'textError',
                    messageKey: text ? 'summarize_error_length' : 'summarize_error_empty'
                };
            },
            () => {
                const text = document.getElementById('textInput').value.trim();
                const summaryLength = document.getElementById('summaryLength').value;
                const sentences = text.split(/[.!?]+/).filter(s => s.trim());
                const ratio = { short: 0.2, medium: 0.3, long: 0.4 }[summaryLength];
                const count = Math.max(1, Math.ceil(sentences.length * ratio));
                const summary = sentences.slice(0, count).join('. ') + (count ? '.' : '');
                document.getElementById('summaryOutput').textContent = summary;
                saveToHistory('summarize', { input: text.slice(0, 50) + '...', summary });
                saveToolState('summarize', { textInput: text, summaryLength });
                showToast('summarize_success', 'success');
            }
        );
    }

    function convertLength(button) {
        processTool(button, 'lengthLoading', 'lengthResult',
            () => {
                const lengthInput = document.getElementById('lengthValue');
                if (!lengthInput) {
                    console.error("Length input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập giá trị độ dài!", 'error');
                    return { isValid: false };
                }
                const value = parseFloat(lengthInput.value);
                return {
                    isValid: !isNaN(value) && value >= 0,
                    input: lengthInput,
                    errorId: 'lengthError',
                    messageKey: 'length_converter_error'
                };
            },
            () => {
                const value = parseFloat(document.getElementById('lengthValue').value);
                const fromUnit = document.getElementById('lengthFrom').value;
                const toUnit = document.getElementById('lengthTo').value;
                const conversions = { m: 1, km: 1000, cm: 0.01, inch: 0.0254, foot: 0.3048, yard: 0.9144 };
                const result = (value * conversions[fromUnit]) / conversions[toUnit];
                const output = {
                    original: value.toFixed(2),
                    fromUnit,
                    converted: result.toFixed(2),
                    toUnit
                };
                document.getElementById('lengthOutput').querySelector('tbody').innerHTML = `
                    <tr>
                        <td>${output.original}</td>
                        <td>${output.fromUnit.toUpperCase()}</td>
                        <td>${output.converted}</td>
                        <td>${output.toUnit.toUpperCase()}</td>
                    </tr>
                `;
                saveToHistory('length-converter', output);
                saveToolState('length-converter', { lengthValue: value, lengthFrom: fromUnit, lengthTo: toUnit });
                showToast('length_converter_success', 'success');
            }
        );
    }

    function calculate(button) {
        processTool(button, 'calcLoading', 'calcResult',
            () => {
                const num1Input = document.getElementById('num1');
                const num2Input = document.getElementById('num2');
                if (!num1Input || !num2Input) {
                    console.error("Calculator inputs not found");
                    showToast("Lỗi: Không tìm thấy trường nhập số!", 'error');
                    return { isValid: false };
                }
                const num1 = parseFloat(num1Input.value);
                const num2 = parseFloat(num2Input.value);
                const operator = document.getElementById('operator').value;
                if (isNaN(num1)) return { isValid: false, input: num1Input, errorId: 'calcError', messageKey: 'calculator_error_num1' };
                if (isNaN(num2)) return { isValid: false, input: num2Input, errorId: 'calcError', messageKey: 'calculator_error_num2' };
                if (operator === '/' && num2 === 0) return { isValid: false, input: num2Input, errorId: 'calcError', messageKey: 'calculator_error_divide_by_zero' };
                return { isValid: true, input: num1Input, errorId: 'calcError' };
            },
            () => {
                const lang = localStorage.getItem('language') || 'vi';
                const num1 = parseFloat(document.getElementById('num1').value);
                const num2 = parseFloat(document.getElementById('num2').value);
                const operator = document.getElementById('operator').value;
                let result;
                switch (operator) {
                    case '+': result = num1 + num2; break;
                    case '-': result = num1 - num2; break;
                    case '*': result = num1 * num2; break;
                    case '/': result = num1 / num2; break;
                }
                const output = { num1, operator, num2, result: result.toFixed(2) };
                document.getElementById('calcOutput').textContent = `${translations[lang]['calculator_result'] || 'Kết quả'}: ${output.result}`;
                saveToHistory('calculator', output);
                saveToolState('calculator', { num1, num2, operator });
                showToast('calculator_success', 'success');
            }
        );
    }

    function generatePassword(button) {
        processTool(button, 'passLoading', 'passResult',
            () => {
                const passLengthInput = document.getElementById('passLength');
                if (!passLengthInput) {
                    console.error("Password length input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập độ dài mật khẩu!", 'error');
                    return { isValid: false };
                }
                const passLength = parseInt(passLengthInput.value);
                const includeUppercase = document.getElementById('includeUppercase').checked;
                const includeLowercase = document.getElementById('includeLowercase').checked;
                const includeNumbers = document.getElementById('includeNumbers').checked;
                const includeSymbols = document.getElementById('includeSymbols').checked;
                if (isNaN(passLength) || passLength < 8 || passLength > 32) {
                    return { isValid: false, input: passLengthInput, errorId: 'passError', messageKey: 'password_generator_error_length' };
                }
                if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
                    return { isValid: false, input: passLengthInput, errorId: 'passError', messageKey: 'password_generator_error_chars' };
                }
                return { isValid: true, input: passLengthInput, errorId: 'passError' };
            },
            () => {
                const passLength = parseInt(document.getElementById('passLength').value);
                const includeUppercase = document.getElementById('includeUppercase').checked;
                const includeLowercase = document.getElementById('includeLowercase').checked;
                const includeNumbers = document.getElementById('includeNumbers').checked;
                const includeSymbols = document.getElementById('includeSymbols').checked;
                let chars = '';
                if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
                if (includeNumbers) chars += '0123456789';
                if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
                let password = '';
                for (let i = 0; i < passLength; i++) {
                    password += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                document.getElementById('passOutput').textContent = password;
                saveToHistory('password-generator', { length: passLength, password });
                saveToolState('password-generator', {
                    passLength,
                    includeUppercase,
                    includeLowercase,
                    includeNumbers,
                    includeSymbols
                });
                showToast('password_generator_success', 'success');
            }
        );
    }

    function copyPassword() {
        const passOutput = document.getElementById('passOutput');
        if (!passOutput) {
            console.error("Password output not found");
            showToast("Lỗi: Không tìm thấy mật khẩu để sao chép!", 'error');
            return;
        }
        const text = passOutput.textContent;
        if (!navigator.clipboard) {
            console.error("Clipboard API not supported");
            showToast("Lỗi: Trình duyệt không hỗ trợ sao chép!", 'error');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            const copyBtn = document.querySelector('#passResult .copy-btn');
            if (copyBtn) {
                const lang = localStorage.getItem('language') || 'vi';
                copyBtn.textContent = translations[lang]['password_generator_copy_success'];
                showToast('password_generator_copy_success', 'success');
                setTimeout(() => {
                    copyBtn.textContent = translations[lang]['password_generator_copy'];
                }, 2000);
            }
        }).catch(err => {
            console.error("Failed to copy password:", err);
            showError(document.getElementById('passLength'), 'passError', 'Không thể sao chép mật khẩu!');
        });
    }

    function countChars(button) {
        processTool(button, 'charLoading', 'charResult',
            () => {
                const charInput = document.getElementById('charInput');
                if (!charInput) {
                    console.error("Char input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập văn bản để đếm!", 'error');
                    return { isValid: false };
                }
                const text = charInput.value.trim();
                return {
                    isValid: !!text,
                    input: charInput,
                    errorId: 'charError',
                    messageKey: 'char_counter_error'
                };
            },
            () => {
                const lang = localStorage.getItem('language') || 'vi';
                const text = document.getElementById('charInput').value;
                const charCount = text.length;
                const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                document.getElementById('charOutput').textContent = `${translations[lang]['char_counter_chars'] || 'Ký tự'}: ${charCount}, ${translations[lang]['char_counter_words'] || 'Từ'}: ${wordCount}`;
                saveToHistory('char-counter', { text: text.slice(0, 50) + '...', charCount, wordCount });
                saveToolState('char-counter', { charInput: text });
                showToast('char_counter_success', 'success');
            }
        );
    }

    function checkURL(button) {
        processTool(button, 'urlLoading', 'urlResult',
            () => {
                const urlInput = document.getElementById('urlInput');
                if (!urlInput) {
                    console.error("URL input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập URL!", 'error');
                    return { isValid: false };
                }
                const url = urlInput.value.trim();
                const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
                return {
                    isValid: url && urlPattern.test(url),
                    input: urlInput,
                    errorId: 'urlError',
                    messageKey: 'url_checker_error'
                };
            },
            () => {
                const lang = localStorage.getItem('language') || 'vi';
                const url = document.getElementById('urlInput').value.trim();
                document.getElementById('urlOutput').textContent = `${translations[lang]['url_checker_valid'] || 'URL hợp lệ'}: ${url}`;
                saveToHistory('url-checker', { url });
                saveToolState('url-checker', { urlInput: url });
                showToast('url_checker_success', 'success');
            }
        );
    }

    function convertTemp(button) {
        processTool(button, 'tempLoading', 'tempResult',
            () => {
                const tempInput = document.getElementById('tempValue');
                if (!tempInput) {
                    console.error("Temperature input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập giá trị nhiệt độ!", 'error');
                    return { isValid: false };
                }
                const value = parseFloat(tempInput.value);
                return {
                    isValid: !isNaN(value),
                    input: tempInput,
                    errorId: 'tempError',
                    messageKey: 'temp_converter_error'
                };
            },
            () => {
                const value = parseFloat(document.getElementById('tempValue').value);
                const fromUnit = document.getElementById('tempFrom').value;
                const toUnit = document.getElementById('tempTo').value;
                let celsius;
                if (fromUnit === 'C') celsius = value;
                else if (fromUnit === 'F') celsius = (value - 32) * 5 / 9;
                else celsius = value - 273.15;
                let result;
                if (toUnit === 'C') result = celsius;
                else if (toUnit === 'F') result = celsius * 9 / 5 + 32;
                else result = celsius + 273.15;
                const output = {
                    original: value.toFixed(2),
                    fromUnit,
                    converted: result.toFixed(2),
                    toUnit
                };
                document.getElementById('tempOutput').querySelector('tbody').innerHTML = `
                    <tr>
                        <td>${output.original}</td>
                        <td>${output.fromUnit}</td>
                        <td>${output.converted}</td>
                        <td>${output.toUnit}</td>
                    </tr>
                `;
                saveToHistory('temp-converter', output);
                saveToolState('temp-converter', { tempValue: value, tempFrom: fromUnit, tempTo: toUnit });
                showToast('temp_converter_success', 'success');
            }
        );
    }

    function convertCurrency(button) {
        processTool(button, 'currencyLoading', 'currencyResult',
            () => {
                const currencyInput = document.getElementById('currencyValue');
                if (!currencyInput) {
                    console.error("Currency input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập giá trị tiền tệ!", 'error');
                    return { isValid: false };
                }
                const value = parseFloat(currencyInput.value);
                return {
                    isValid: !isNaN(value) && value >= 0,
                    input: currencyInput,
                    errorId: 'currencyError',
                    messageKey: 'currency_converter_error'
                };
            },
            () => {
                const value = parseFloat(document.getElementById('currencyValue').value);
                const fromCurrency = document.getElementById('currencyFrom').value;
                const toCurrency = document.getElementById('currencyTo').value;

                // Simulated rates (replace with real API for accurate rates)
                const rates = {
                    USD: { USD: 1, VND: 25000, EUR: 0.85, JPY: 110, GBP: 0.75, CNY: 6.5 },
                    VND: { USD: 0.00004, VND: 1, EUR: 0.000035, JPY: 0.0044, GBP: 0.00003, CNY: 0.00026 },
                    EUR: { USD: 1.18, VND: 29400, EUR: 1, JPY: 129, GBP: 0.88, CNY: 7.65 },
                    JPY: { USD: 0.0091, VND: 227, EUR: 0.0078, JPY: 1, GBP: 0.0068, CNY: 0.059 },
                    GBP: { USD: 1.33, VND: 33300, EUR: 1.14, JPY: 147, GBP: 1, CNY: 8.67 },
                    CNY: { USD: 0.15, VND: 3850, EUR: 0.13, JPY: 16.9, GBP: 0.12, CNY: 1 }
                };

                const result = value * rates[fromCurrency][toCurrency];
                const output = {
                    original: value.toFixed(2),
                    fromCurrency,
                    converted: result.toFixed(2),
                    toCurrency
                };

                document.getElementById('currencyOutput').querySelector('tbody').innerHTML = `
                    <tr>
                        <td>${output.original}</td>
                        <td>${output.fromCurrency}</td>
                        <td>${output.converted}</td>
                        <td>${output.toCurrency}</td>
                    </tr>
                `;
                saveToHistory('currency-converter', output);
                saveToolState('currency-converter', { currencyValue: value, currencyFrom: fromCurrency, currencyTo: toCurrency });
                showToast('currency_converter_success', 'success');
            }
        );
    }

    function generateQR(button) {
        processTool(button, 'qrLoading', 'qrResult',
            () => {
                const qrInput = document.getElementById('qrInput');
                if (!qrInput) {
                    console.error("QR input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập văn bản hoặc URL!", 'error');
                    return { isValid: false };
                }
                const text = qrInput.value.trim();
                return {
                    isValid: !!text,
                    input: qrInput,
                    errorId: 'qrError',
                    messageKey: 'qr_generator_error'
                };
            },
            () => {
                const text = document.getElementById('qrInput').value.trim();
                const qrOutput = document.getElementById('qrOutput');
                if (!qrOutput) {
                    console.error("QR output not found");
                    showToast("Lỗi: Không tìm thấy phần tử để hiển thị mã QR!", 'error');
                    return;
                }
                QRCode.toDataURL(text, { width: 200, margin: 1 }, (err, url) => {
                    if (err) {
                        console.error("QR Code generation failed:", err);
                        showError(document.getElementById('qrInput'), 'qrError', 'Không thể tạo mã QR!');
                        return;
                    }
                    qrOutput.src = url;
                    saveToHistory('qr-generator', { input: text });
                    saveToolState('qr-generator', { qrInput: text });
                    showToast('qr_generator_success', 'success');
                });
            }
        );
    }

    function compressImage(button) {
        processTool(button, 'imageLoading', 'imageResult',
            () => {
                const imageInput = document.getElementById('imageInput');
                if (!imageInput) {
                    console.error("Image input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập ảnh!", 'error');
                    return { isValid: false };
                }
                const file = imageInput.files[0];
                const validFormats = ['image/jpeg', 'image/png', 'image/gif'];
                if (!file) return { isValid: false, input: imageInput, errorId: 'imageError', messageKey: 'image_compressor_error_empty' };
                if (!validFormats.includes(file.type)) return { isValid: false, input: imageInput, errorId: 'imageError', messageKey: 'image_compressor_error_format' };
                return { isValid: true, input: imageInput, errorId: 'imageError' };
            },
            () => {
                const file = document.getElementById('imageInput').files[0];
                const imageResult = document.getElementById('imageResult');
                if (!imageResult) {
                    console.error("Image result not found");
                    showToast("Lỗi: Không tìm thấy phần tử để hiển thị kết quả nén ảnh!", 'error');
                    return;
                }
                new Compressor(file, {
                    quality: 0.6,
                    maxWidth: 800,
                    maxHeight: 800,
                    success(compressed) {
                        const url = URL.createObjectURL(compressed);
                        imageResult.innerHTML = `
                            <p>Kích thước gốc: ${(file.size / 1024).toFixed(2)} KB</p>
                            <p>Kích thước sau nén: ${(compressed.size / 1024).toFixed(2)} KB</p>
                            <img src="${url}" alt="Compressed image" style="max-width: 200px; margin-top: 10px;">
                            <a href="${url}" download="compressed-image.jpg" style="display: block; margin-top: 10px; color: #007bff;">Tải ảnh đã nén</a>
                        `;
                        saveToHistory('image-compressor', {
                            originalSize: (file.size / 1024).toFixed(2),
                            compressedSize: (compressed.size / 1024).toFixed(2)
                        });
                        showToast('image_compressor_success', 'success');
                    },
                    error(err) {
                        console.error("Image compression failed:", err);
                        showError(document.getElementById('imageInput'), 'imageError', 'Không thể nén ảnh!');
                    }
                });
            }
        );
    }

    function calculateBMI(button) {
        processTool(button, 'bmiLoading', 'bmiResult',
            () => {
                const weightInput = document.getElementById('weight');
                const heightInput = document.getElementById('height');
                if (!weightInput || !heightInput) {
                    console.error("BMI inputs not found");
                    showToast("Lỗi: Không tìm thấy trường nhập cân nặng hoặc chiều cao!", 'error');
                    return { isValid: false };
                }
                const weight = parseFloat(weightInput.value);
                const height = parseFloat(heightInput.value);
                if (isNaN(weight) || weight <= 0) return { isValid: false, input: weightInput, errorId: 'bmiError', messageKey: 'bmi_calculator_error_weight' };
                if (isNaN(height) || height <= 0) return { isValid: false, input: heightInput, errorId: 'bmiError', messageKey: 'bmi_calculator_error_height' };
                return { isValid: true, input: weightInput, errorId: 'bmiError' };
            },
            () => {
                const lang = localStorage.getItem('language') || 'vi';
                const weight = parseFloat(document.getElementById('weight').value);
                const height = parseFloat(document.getElementById('height').value);
                const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
                let statusKey;
                if (bmi < 18.5) statusKey = 'bmi_underweight';
                else if (bmi < 25) statusKey = 'bmi_normal';
                else if (bmi < 30) statusKey = 'bmi_overweight';
                else statusKey = 'bmi_obese';
                const output = { weight, height, bmi, status: translations[lang][statusKey] };
                document.getElementById('bmiOutput').querySelector('tbody').innerHTML = `
                    <tr>
                        <td>${weight}</td>
                        <td>${height}</td>
                        <td>${bmi}</td>
                        <td>${translations[lang][statusKey]}</td>
                    </tr>
                `;
                saveToHistory('bmi-calculator', output);
                saveToolState('bmi-calculator', { weight, height });
                showToast('bmi_calculator_success', 'success');
            }
        );
    }

    function convertArea(button) {
        processTool(button, 'areaLoading', 'areaResult',
            () => {
                const areaInput = document.getElementById('areaValue');
                if (!areaInput) {
                    console.error("Area input not found");
                    showToast("Lỗi: Không tìm thấy trường nhập giá trị diện tích!", 'error');
                    return { isValid: false };
                }
                const value = parseFloat(areaInput.value);
                return {
                    isValid: !isNaN(value) && value >= 0,
                    input: areaInput,
                    errorId: 'areaError',
                    messageKey: 'area_converter_error'
                };
            },
            () => {
                const value = parseFloat(document.getElementById('areaValue').value);
                const fromUnit = document.getElementById('areaFrom').value;
                const toUnit = document.getElementById('areaTo').value;
                const conversions = { m2: 1, km2: 1000000, ha: 10000, ft2: 0.092903 };
                const result = (value * conversions[fromUnit]) / conversions[toUnit];
                const output = {
                    original: value.toFixed(2),
                    fromUnit,
                    converted: result.toFixed(2),
                    toUnit
                };
                document.getElementById('areaOutput').querySelector('tbody').innerHTML = `
                    <tr>
                        <td>${output.original}</td>
                        <td>${output.fromUnit.toUpperCase()}</td>
                        <td>${output.converted}</td>
                        <td>${output.toUnit.toUpperCase()}</td>
                    </tr>
                `;
                saveToHistory('area-converter', output);
                saveToolState('area-converter', { areaValue: value, areaFrom: fromUnit, areaTo: toUnit });
                showToast('area_converter_success', 'success');
            }
        );
    }

    // Event Listeners
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        const actions = {
            showHome,
            showHistory,
            openContactModal,
            closeContactModal,
            clearHistory,
            searchTools,
            summarizeText: () => summarizeText(target),
            convertLength: () => convertLength(target),
            calculate: () => calculate(target),
            generatePassword: () => generatePassword(target),
            copyPassword,
            countChars: () => countChars(target),
            checkURL: () => checkURL(target),
            convertTemp: () => convertTemp(target),
            convertCurrency: () => convertCurrency(target),
            generateQR: () => generateQR(target),
            compressImage: () => compressImage(target),
            calculateBMI: () => calculateBMI(target),
            convertArea: () => convertArea(target),
            toggleMagicMenu
        };
        if (actions[action]) actions[action]();
    });

    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-tool]');
        if (target) {
            const toolId = target.dataset.tool;
            showTool(toolId);
        }
    });

    document.getElementById('darkModeToggle')?.addEventListener('change', toggleDarkMode);

    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchTools();
    });

    // Initialize
    if (localStorage.getItem('darkMode') === 'true') {
        document.getElementById('darkModeToggle').checked = true;
        toggleDarkMode();
    }

    showHome();
});
