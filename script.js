document.addEventListener('DOMContentLoaded', () => {
    // Utility Functions
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
        inputElement.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('active');
        showToast(message, 'error');
        return false;
    }

    function clearError(inputElement, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        inputElement.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('active');
        return true;
    }

    function showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} active animate__animated animate__slideInRight`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    function showLoading(button, loadingId, resultId, callback) {
        const loading = document.getElementById(loadingId);
        const result = document.getElementById(resultId);
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
                return showError(validation.input, validation.errorId, validation.message);
            }
            clearError(validation.input, validation.errorId);
            processFn();
            document.getElementById(resultId).classList.add('active', 'animate__animated', 'animate__fadeIn');
        });
    }

    function saveToHistory(toolId, result) {
        let history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
        history.push({
            toolId,
            result,
            timestamp: new Date().toLocaleString('vi-VN')
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
        document.getElementById('contactModal').classList.add('active', 'animate__animated', 'animate__fadeIn');
    }

    function closeContactModal() {
        document.getElementById('contactModal').classList.remove('active');
    }

    function showHome() {
        const toolsSections = document.querySelectorAll('.tools-section');
        const heroSection = document.getElementById('hero');
        toolsSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        heroSection.style.display = 'block';
        heroSection.classList.add('animate__animated', 'animate__fadeIn');
        document.querySelectorAll('.tool-nav a').forEach(link => link.classList.remove('active'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.title = 'ToolHub - Hộp Công Cụ Đa Năng';
    }

    function showTool(toolId) {
        const heroSection = document.getElementById('hero');
        const toolsSections = document.querySelectorAll('.tools-section');
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
            document.title = `${toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ToolHub`;
            restoreToolState(toolId);
            document.querySelectorAll('.tool-nav a').forEach(link => {
                link.classList.toggle('active', link.dataset.tool === toolId);
            });
        }
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

    function showHistory() {
        showTool('history');
        const historyResult = document.getElementById('historyResult');
        const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
        historyResult.innerHTML = history.length ? `
            <ul style="list-style: none; padding: 0;">
                ${history.map(item => `
                    <li style="margin-bottom: 15px;">
                        <strong>${item.toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> (${item.timestamp}): 
                        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
                            ${escapeHTML(JSON.stringify(item.result, null, 2))}
                        </pre>
                    </li>
                `).join('')}
            </ul>
        ` : '<p>Chưa có lịch sử.</p>';
        if (document.body.classList.contains('dark-mode')) {
            historyResult.querySelectorAll('pre').forEach(pre => pre.style.background = '#3a3a4e');
        }
    }

    function clearHistory() {
        localStorage.removeItem('toolHistory');
        showHistory();
        showToast('Đã xóa lịch sử!', 'success');
    }

    // Search Function
    function searchTools() {
        const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
        const toolsSections = document.querySelectorAll('.tools-section');
        const heroSection = document.getElementById('hero');

        if (!searchInput) {
            showHome();
            return;
        }

        let found = false;
        toolsSections.forEach(section => {
            const toolName = section.dataset.toolName.toLowerCase();
            if (toolName.includes(searchInput)) {
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

        document.querySelectorAll('.tool-nav a').forEach(link => link.classList.remove('active'));
    }

    // Tool Functions
    function summarizeText(button) {
        processTool(button, 'textLoading', 'textResult',
            () => {
                const textInput = document.getElementById('textInput');
                const text = textInput.value.trim();
                return {
                    isValid: text && text.length <= 10000,
                    input: textInput,
                    errorId: 'textError',
                    message: text ? 'Văn bản quá dài (tối đa 10,000 ký tự)!' : 'Vui lòng nhập văn bản!'
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
                showToast('Đã tóm tắt văn bản!', 'success');
            }
        );
    }

    function convertLength(button) {
        processTool(button, 'lengthLoading', 'lengthResult',
            () => {
                const lengthInput = document.getElementById('lengthValue');
                const value = parseFloat(lengthInput.value);
                return {
                    isValid: !isNaN(value) && value >= 0,
                    input: lengthInput,
                    errorId: 'lengthError',
                    message: 'Vui lòng nhập giá trị hợp lệ!'
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
                showToast('Đã chuyển đổi độ dài!', 'success');
            }
        );
    }

    function calculate(button) {
        processTool(button, 'calcLoading', 'calcResult',
            () => {
                const num1Input = document.getElementById('num1');
                const num2Input = document.getElementById('num2');
                const num1 = parseFloat(num1Input.value);
                const num2 = parseFloat(num2Input.value);
                const operator = document.getElementById('operator').value;
                if (isNaN(num1)) return { isValid: false, input: num1Input, errorId: 'calcError', message: 'Số thứ nhất không hợp lệ!' };
                if (isNaN(num2)) return { isValid: false, input: num2Input, errorId: 'calcError', message: 'Số thứ hai không hợp lệ!' };
                if (operator === '/' && num2 === 0) return { isValid: false, input: num2Input, errorId: 'calcError', message: 'Không thể chia cho 0!' };
                return { isValid: true, input: num1Input, errorId: 'calcError' };
            },
            () => {
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
                document.getElementById('calcOutput').textContent = `Kết quả: ${output.result}`;
                saveToHistory('calculator', output);
                saveToolState('calculator', { num1, num2, operator });
                showToast('Đã tính toán!', 'success');
            }
        );
    }

    function generatePassword(button) {
        processTool(button, 'passLoading', 'passResult',
            () => {
                const passLengthInput = document.getElementById('passLength');
                const passLength = parseInt(passLengthInput.value);
                const includeUppercase = document.getElementById('includeUppercase').checked;
                const includeLowercase = document.getElementById('includeLowercase').checked;
                const includeNumbers = document.getElementById('includeNumbers').checked;
                const includeSymbols = document.getElementById('includeSymbols').checked;
                if (isNaN(passLength) || passLength < 8 || passLength > 32) {
                    return { isValid: false, input: passLengthInput, errorId: 'passError', message: 'Độ dài phải từ 8 đến 32!' };
                }
                if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
                    return { isValid: false, input: passLengthInput, errorId: 'passError', message: 'Chọn ít nhất một loại ký tự!' };
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
                showToast('Đã tạo mật khẩu!', 'success');
            }
        );
    }

    function copyPassword() {
        const passOutput = document.getElementById('passOutput').textContent;
        navigator.clipboard.writeText(passOutput).then(() => {
            const copyBtn = document.querySelector('#passResult .copy-btn');
            copyBtn.textContent = 'Đã sao chép!';
            showToast('Đã sao chép mật khẩu!', 'success');
            setTimeout(() => { copyBtn.textContent = 'Sao chép'; }, 2000);
        }).catch(err => {
            showError(document.getElementById('passLength'), 'passError', 'Không thể sao chép mật khẩu!');
        });
    }

    function countChars(button) {
        processTool(button, 'charLoading', 'charResult',
            () => {
                const charInput = document.getElementById('charInput');
                const text = charInput.value.trim();
                return {
                    isValid: !!text,
                    input: charInput,
                    errorId: 'charError',
                    message: 'Vui lòng nhập văn bản!'
                };
            },
            () => {
                const text = document.getElementById('charInput').value;
                const charCount = text.length;
                const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                document.getElementById('charOutput').textContent = `Ký tự: ${charCount}, Từ: ${wordCount}`;
                saveToHistory('char-counter', { text: text.slice(0, 50) + '...', charCount, wordCount });
                saveToolState('char-counter', { charInput: text });
                showToast('Đã đếm ký tự và từ!', 'success');
            }
        );
    }

    function checkURL(button) {
        processTool(button, 'urlLoading', 'urlResult',
            () => {
                const urlInput = document.getElementById('urlInput');
                const url = urlInput.value.trim();
                const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
                return {
                    isValid: url && urlPattern.test(url),
                    input: urlInput,
                    errorId: 'urlError',
                    message: 'URL không hợp lệ!'
                };
            },
            () => {
                const url = document.getElementById('urlInput').value.trim();
                document.getElementById('urlOutput').textContent = `URL hợp lệ: ${url}`;
                saveToHistory('url-checker', { url });
                saveToolState('url-checker', { urlInput: url });
                showToast('URL hợp lệ!', 'success');
            }
        );
    }

    function convertTemp(button) {
        processTool(button, 'tempLoading', 'tempResult',
            () => {
                const tempInput = document.getElementById('tempValue');
                const value = parseFloat(tempInput.value);
                return {
                    isValid: !isNaN(value),
                    input: tempInput,
                    errorId: 'tempError',
                    message: 'Vui lòng nhập giá trị hợp lệ!'
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
                else if (toUnit === 'F') result = (celsius * 9 / 5) + 32;
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
                showToast('Đã chuyển đổi nhiệt độ!', 'success');
            }
        );
    }

    function convertCurrency(button) {
        processTool(button, 'currencyLoading', 'currencyResult',
            () => {
                const currencyInput = document.getElementById('currencyValue');
                const value = parseFloat(currencyInput.value);
                return {
                    isValid: !isNaN(value) && value >= 0,
                    input: currencyInput,
                    errorId: 'currencyError',
                    message: 'Vui lòng nhập giá trị hợp lệ!'
                };
            },
            () => {
                const value = parseFloat(document.getElementById('currencyValue').value);
                const fromCurrency = document.getElementById('currencyFrom').value;
                const toCurrency = document.getElementById('currencyTo').value;

                // Tỷ giá giả lập (cần API thực tế để lấy tỷ giá chính xác)
                const rates = {
                    USD: { USD: 1, VND: 25000, EUR: 0.85, JPY: 110, GBP: 0.75, CNY: 6.5 },
                    VND: { USD: 0.00004, VND: 1, EUR: 0.000035, JPY: 0.0044, GBP: 0.00003, CNY: 0.00026 },
                    EUR: { USD: 1.18, VND: 29400, EUR: 1, JPY: 129, GBP: 0.88, CNY: 7.65 },
                    JPY: { USD: 0.0091, VND: 227, EUR: 0.0078, JPY: 1, GBP: 0.0068, CNY: 0.059 },
                    GBP: { USD: 1.33, VND: 33300, EUR: 1.14, JPY: 147, GBP: 1, CNY: 8.67 },
                    CNY: { USD: 0.15, VND: 3846, EUR: 0.13, JPY: 16.9, GBP: 0.12, CNY: 1 }
                };

                const rate = rates[fromCurrency][toCurrency];
                const result = value * rate;

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
                showToast('Đã chuyển đổi tiền tệ!', 'success');
            }
        );
    }

    function generateQR(button) {
        processTool(button, 'qrLoading', 'qrResult',
            () => {
                const qrInput = document.getElementById('qrInput');
                const text = qrInput.value.trim();
                if (!window.QRCode) {
                    showToast('Thư viện QRCode không tải được!', 'error');
                    return { isValid: false, input: qrInput, errorId: 'qrError', message: 'Không thể tạo mã QR!' };
                }
                return {
                    isValid: !!text,
                    input: qrInput,
                    errorId: 'qrError',
                    message: 'Vui lòng nhập văn bản hoặc URL!'
                };
            },
            () => {
                const text = document.getElementById('qrInput').value.trim();
                const qrOutput = document.getElementById('qrOutput');
                qrOutput.src = '';
                window.QRCode.toDataURL(text, { width: 200, margin: 1 }, (err, url) => {
                    if (err) {
                        showError(document.getElementById('qrInput'), 'qrError', 'Không thể tạo mã QR!');
                        return;
                    }
                    qrOutput.src = url;
                    saveToHistory('qr-generator', { input: text });
                    saveToolState('qr-generator', { qrInput: text });
                    showToast('Đã tạo mã QR!', 'success');
                });
            }
        );
    }

    function compressImage(button) {
        processTool(button, 'imageLoading', 'imageResult',
            () => {
                const imageInput = document.getElementById('imageInput');
                const file = imageInput.files[0];
                if (!window.Compressor) {
                    showToast('Thư viện Compressor không tải được!', 'error');
                    return { isValid: false, input: imageInput, errorId: 'imageError', message: 'Không thể nén ảnh!' };
                }
                return {
                    isValid: file && /\.(jpe?g|png|gif|bmp)$/i.test(file.name),
                    input: imageInput,
                    errorId: 'imageError',
                    message: file ? 'Định dạng ảnh không hỗ trợ!' : 'Vui lòng chọn ảnh!'
                };
            },
            () => {
                const file = document.getElementById('imageInput').files[0];
                const imageResult = document.getElementById('imageResult');
                new window.Compressor(file, {
                    quality: 0.6,
                    maxWidth: 800,
                    maxHeight: 800,
                    success(result) {
                        const url = URL.createObjectURL(result);
                        imageResult.innerHTML = `
                            <p>Ảnh đã nén: ${(result.size / 1024).toFixed(2)} KB</p>
                            <img src="${url}" alt="Ảnh đã nén" style="max-width: 100%;">
                            <a href="${url}" download="compressed_image_${Date.now()}.jpg">Tải xuống</a>
                        `;
                        saveToHistory('image-compressor', { originalSize: (file.size / 1024).toFixed(2), compressedSize: (result.size / 1024).toFixed(2) });
                        showToast('Đã nén ảnh!', 'success');
                    },
                    error(err) {
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
                const weight = parseFloat(weightInput.value);
                const height = parseFloat(heightInput.value);
                if (isNaN(weight) || weight <= 0) return { isValid: false, input: weightInput, errorId: 'bmiError', message: 'Cân nặng không hợp lệ!' };
                if (isNaN(height) || height <= 0) return { isValid: false, input: heightInput, errorId: 'bmiError', message: 'Chiều cao không hợp lệ!' };
                return { isValid: true, input: weightInput, errorId: 'bmiError' };
            },
            () => {
                const weight = parseFloat(document.getElementById('weight').value);
                const height = parseFloat(document.getElementById('height').value);
                const bmi = weight / ((height / 100) ** 2);
                let status;
                if (bmi < 18.5) status = 'Thiếu cân';
                else if (bmi < 25) status = 'Bình thường';
                else if (bmi < 30) status = 'Thừa cân';
                else status = 'Béo phì';
                const output = {
                    weight: weight.toFixed(1),
                    height: height.toFixed(1),
                    bmi: bmi.toFixed(1),
                    status
                };
                document.getElementById('bmiOutput').querySelector('tbody').innerHTML = `
                    <tr>
                        <td>${output.weight}</td>
                        <td>${output.height}</td>
                        <td>${output.bmi}</td>
                        <td>${output.status}</td>
                    </tr>
                `;
                saveToHistory('bmi-calculator', output);
                saveToolState('bmi-calculator', { weight, height });
                showToast('Đã tính BMI!', 'success');
            }
        );
    }

    function convertArea(button) {
        processTool(button, 'areaLoading', 'areaResult',
            () => {
                const areaInput = document.getElementById('areaValue');
                const value = parseFloat(areaInput.value);
                return {
                    isValid: !isNaN(value) && value >= 0,
                    input: areaInput,
                    errorId: 'areaError',
                    message: 'Vui lòng nhập giá trị hợp lệ!'
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
                showToast('Đã chuyển đổi diện tích!', 'success');
            }
        );
    }

    // Event Listeners
    document.querySelectorAll('[data-action]').forEach(element => {
        element.addEventListener('click', () => {
            const action = element.dataset.action;
            const actions = {
                showHome: showHome,
                showHistory: showHistory,
                clearHistory: clearHistory,
                openContactModal: openContactModal,
                closeContactModal: closeContactModal,
                summarizeText: () => summarizeText(element),
                convertLength: () => convertLength(element),
                calculate: () => calculate(element),
                generatePassword: () => generatePassword(element),
                copyPassword: copyPassword,
                countChars: () => countChars(element),
                checkURL: () => checkURL(element),
                convertTemp: () => convertTemp(element),
                convertCurrency: () => convertCurrency(element),
                generateQR: () => generateQR(element),
                compressImage: () => compressImage(element),
                calculateBMI: () => calculateBMI(element),
                convertArea: () => convertArea(element),
                searchTools: searchTools
            };
            if (actions[action]) actions[action]();
            else if (element.dataset.tool) showTool(element.dataset.tool);
        });
    });

    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);

    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchTools();
        }
    });

    // Restore dark mode state
    if (localStorage.getItem('darkMode') === 'true') {
        document.getElementById('darkModeToggle').checked = true;
        toggleDarkMode();
    }
});
