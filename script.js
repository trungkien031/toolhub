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
    return false;
}

function clearError(inputElement, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    inputElement.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('active');
    return true;
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
    }, 500);
}

function processTool(button, loadingId, resultId, validateFn, processFn) {
    showLoading(button, loadingId, resultId, () => {
        const validation = validateFn();
        if (!validation.isValid) {
            return showError(validation.input, validation.errorId, validation.message);
        }
        clearError(validation.input, validation.errorId);
        processFn();
        document.getElementById(resultId).classList.add('active');
    });
}

function saveToHistory(toolId, result) {
    const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
    history.push({
        toolId,
        result,
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('toolHistory', JSON.stringify(history));
}

// UI Functions
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.getElementById('darkModeToggle').checked);
}

function openContactModal() {
    document.getElementById('contactModal').classList.add('active');
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
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        targetSection.scrollIntoView({ behavior: 'smooth' });
        document.title = `${toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ToolHub`;
    }
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
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${escapeHTML(JSON.stringify(item.result, null, 2))}</pre>
                </li>
            `).join('')}
        </ul>
    ` : '<p>Chưa có lịch sử.</p>';
}

// Tool Functions
function summarizeText(button) {
    processTool(button, 'textLoading', 'textResult',
        () => {
            const textInput = document.getElementById('textInput');
            const text = escapeHTML(textInput.value.trim());
            return {
                isValid: text && text.length <= 10000,
                input: textInput,
                errorId: 'textError',
                message: text ? 'Văn bản quá dài (tối đa 10,000 ký tự)!' : 'Vui lòng nhập văn bản!'
            };
        },
        () => {
            const text = escapeHTML(document.getElementById('textInput').value.trim());
            const summaryLength = document.getElementById('summaryLength').value;
            const sentences = text.split(/[.!?]+/).filter(s => s.trim());
            const wordFreq = {};
            text.toLowerCase().split(/\s+/).forEach(word => {
                if (word.length > 3) wordFreq[word] = (wordFreq[word] || 0) + 1;
            });
            const sentenceScores = sentences.map(s => {
                let score = 0;
                s.toLowerCase().split(/\s+/).forEach(word => {
                    if (wordFreq[word]) score += wordFreq[word];
                });
                return { sentence: s, score };
            });
            sentenceScores.sort((a, b) => b.score - a.score);
            const ratio = { short: 0.2, medium: 0.3, long: 0.4 }[summaryLength];
            const summarySentences = sentenceScores.slice(0, Math.ceil(sentences.length * ratio)).map(s => s.sentence);
            const summary = summarySentences.join('. ') + (summarySentences.length ? '.' : '');
            document.getElementById('summaryOutput').textContent = summary;
            saveToHistory('summarize', { input: text.slice(0, 50) + '...', summary });
        }
    );
}

function convertLength(button) {
    processTool(button, 'lengthLoading', 'lengthResult',
        () => {
            const lengthInput = document.getElementById('lengthValue');
            const value = parseFloat(lengthInput.value);
            return {
                isValid: !isNaN(value) && value > 0,
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
                    <td>${output.fromUnit}</td>
                    <td>${output.converted}</td>
                    <td>${output.toUnit}</td>
                </tr>
            `;
            saveToHistory('length-converter', output);
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
            document.getElementById('passOutput').textContent = `Mật khẩu: ${password}`;
            saveToHistory('password-generator', { length: passLength, password });
        }
    );
}

function copyPassword() {
    const passOutput = document.getElementById('passOutput').textContent.replace('Mật khẩu: ', '');
    navigator.clipboard.writeText(passOutput).then(() => {
        const copyBtn = document.querySelector('#passResult .copy-btn');
        copyBtn.textContent = 'Đã sao chép!';
        setTimeout(() => { copyBtn.textContent = 'Sao chép'; }, 2000);
    }).catch(err => {
        showError(document.getElementById('passLength'), 'passError', 'Không thể sao chép: ' + err);
    });
}

function countChars(button) {
    processTool(button, 'charLoading', 'charResult',
        () => {
            const charInput = document.getElementById('charInput');
            const text = escapeHTML(charInput.value.trim());
            return {
                isValid: !!text,
                input: charInput,
                errorId: 'charError',
                message: 'Vui lòng nhập văn bản!'
            };
        },
        () => {
            const text = escapeHTML(document.getElementById('charInput').value.trim());
            const charCount = text.length;
            const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            const output = { charCount, wordCount };
            document.getElementById('charOutput').textContent = `Số ký tự: ${charCount}, Số từ: ${wordCount}`;
            saveToHistory('char-counter', output);
        }
    );
}

function checkURL(button) {
    processTool(button, 'urlLoading', 'urlResult',
        () => {
            const urlInput = document.getElementById('urlInput');
            const url = escapeHTML(urlInput.value.trim());
            const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*(\?\S*)?(#.*)?$/;
            return {
                isValid: url && urlPattern.test(url),
                input: urlInput,
                errorId: 'urlError',
                message: url ? 'URL không hợp lệ!' : 'Vui lòng nhập URL!'
            };
        },
        () => {
            const url = escapeHTML(document.getElementById('urlInput').value.trim());
            document.getElementById('urlOutput').textContent = 'URL hợp lệ!';
            saveToHistory('url-checker', { url, status: 'Valid' });
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
            const output = { original: value, fromUnit, converted: result.toFixed(2), toUnit };
            document.getElementById('tempOutput').textContent = `${value} °${fromUnit} = ${result.toFixed(2)} °${toUnit}`;
            saveToHistory('temp-converter', output);
        }
    );
}

async function convertCurrency(button) {
    processTool(button, 'currencyLoading', 'currencyResult',
        () => {
            const currencyInput = document.getElementById('currencyValue');
            const value = parseFloat(currencyInput.value);
            return {
                isValid: !isNaN(value) && value > 0,
                input: currencyInput,
                errorId: 'currencyError',
                message: 'Vui lòng nhập giá trị hợp lệ!'
            };
        },
        async () => {
            const currencyInput = document.getElementById('currencyValue');
            showError(currencyInput, 'currencyError', 'Tính năng chuyển đổi tiền tệ chưa được kích hoạt. Vui lòng liên hệ tác giả để biết thêm chi tiết.');
            return;
            // Để kích hoạt, thay đoạn dưới bằng API Key thực và bỏ comment
            /*
            const value = parseFloat(currencyInput.value);
            const fromCurrency = document.getElementById('currencyFrom').value;
            const toCurrency = document.getElementById('currencyTo').value;
            try {
                const response = await fetch(`https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/${fromCurrency}`);
                const data = await response.json();
                if (data.result !== 'success') {
                    throw new Error('Không thể lấy tỷ giá!');
                }
                const rate = data.conversion_rates[toCurrency];
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
            } catch (err) {
                showError(currencyInput, 'currencyError', 'Lỗi khi chuyển đổi: ' + err.message);
            }
            */
        }
    );
}

function generateQR(button) {
    if (!window.QRCode) {
        showError(document.getElementById('qrInput'), 'qrError', 'Thư viện QRCode chưa tải. Vui lòng kiểm tra kết nối!');
        return;
    }
    processTool(button, 'qrLoading', 'qrResult',
        () => {
            const qrInput = document.getElementById('qrInput');
            const text = escapeHTML(qrInput.value.trim());
            return {
                isValid: !!text,
                input: qrInput,
                errorId: 'qrError',
                message: 'Vui lòng nhập văn bản hoặc URL!'
            };
        },
        () => {
            const text = escapeHTML(document.getElementById('qrInput').value.trim());
            const qrOutput = document.getElementById('qrOutput');
            qrOutput.src = ''; // Xóa QR cũ
            QRCode.toDataURL(text, { width: 200, margin: 1 }, (err, url) => {
                if (err) {
                    return showError(document.getElementById('qrInput'), 'qrError', 'Không thể tạo mã QR!');
                }
                qrOutput.src = url;
                saveToHistory('qr-generator', { input: text });
            });
        }
    );
}

function compressImage(button) {
    if (!window.Compressor) {
        showError(document.getElementById('imageInput'), 'imageError', 'Thư viện Compressor chưa tải. Vui lòng kiểm tra kết nối!');
        return;
    }
    processTool(button, 'imageLoading', 'imageResult',
        () => {
            const imageInput = document.getElementById('imageInput');
            const file = imageInput.files[0];
            return {
                isValid: file && file.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
                input: imageInput,
                errorId: 'imageError',
                message: file ? 'Ảnh không hợp lệ hoặc quá lớn (tối đa 5MB)!' : 'Vui lòng chọn một ảnh!'
            };
        },
        () => {
            const imageInput = document.getElementById('imageInput');
            const file = imageInput.files[0];
            new Compressor(file, {
                quality: 0.6,
                maxWidth: 1920,
                maxHeight: 1920,
                mimeType: file.type,
                success(result) {
                    const compressedFileName = `compressed_${file.name}`;
                    const fileSizeBefore = (file.size / 1024).toFixed(2);
                    const fileSizeAfter = (result.size / 1024).toFixed(2);
                    const imageResult = document.getElementById('imageResult');
                    imageResult.innerHTML = `
                        <p>Kích thước trước: ${fileSizeBefore} KB</p>
                        <p>Kích thước sau: ${fileSizeAfter} KB</p>
                        <a href="${URL.createObjectURL(result)}" download="${compressedFileName}">Tải xuống</a>
                    `;
                    saveToHistory('image-compressor', {
                        fileName: file.name,
                        sizeBefore: fileSizeBefore,
                        sizeAfter: fileSizeAfter
                    });
                },
                error(err) {
                    showError(imageInput, 'imageError', 'Lỗi khi nén ảnh: ' + err.message);
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
            if (isNaN(weight) || weight <= 0) {
                return { isValid: false, input: weightInput, errorId: 'bmiError', message: 'Cân nặng không hợp lệ!' };
            }
            if (isNaN(height) || height <= 0) {
                return { isValid: false, input: heightInput, errorId: 'bmiError', message: 'Chiều cao không hợp lệ!' };
            }
            return { isValid: true, input: weightInput, errorId: 'bmiError' };
        },
        () => {
            const weight = parseFloat(document.getElementById('weight').value);
            const height = parseFloat(document.getElementById('height').value);
            const bmi = weight / (height * height);
            let status = '';
            if (bmi < 18.5) status = 'Gầy';
            else if (bmi < 25) status = 'Bình thường';
            else if (bmi < 30) status = 'Thừa cân';
            else status = 'Béo phì';
            const output = { weight, height, bmi: bmi.toFixed(2), status };
            document.getElementById('bmiOutput').textContent = `BMI: ${output.bmi} - Trạng thái: ${status}`;
            saveToHistory('bmi-calculator', output);
        }
    );
}

function convertArea(button) {
    processTool(button, 'areaLoading', 'areaResult',
        () => {
            const areaInput = document.getElementById('areaValue');
            const value = parseFloat(areaInput.value);
            return {
                isValid: !isNaN(value) && value > 0,
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
                    <td>${output.fromUnit}</td>
                    <td>${output.converted}</td>
                    <td>${output.toUnit}</td>
                </tr>
            `;
            saveToHistory('area-converter', output);
        }
    );
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Dark Mode
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            document.getElementById('darkModeToggle').checked = true;
        }
        document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);

        // Tool Navigation
        const toolLinks = Array.from(document.querySelectorAll('.tool-nav a'));
        toolLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolId = link.getAttribute('data-tool');
                showTool(toolId);
                toolLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Search Functionality
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = escapeHTML(searchInput.value.toLowerCase().trim());
                toolLinks.forEach(link => {
                    const toolTitle = link.getAttribute('title').toLowerCase();
                    link.style.display = searchTerm === '' || toolTitle.includes(searchTerm) ? 'inline-block' : 'none';
                });
            }, 300);
        });

        // Initialize Home
        showHome();
    } catch (err) {
        console.error('Lỗi khi khởi tạo trang:', err);
    }
});
