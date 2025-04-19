document.addEventListener('DOMContentLoaded', () => {
    let translations = {};

    // Tải file languages.json
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

    // Hàm cập nhật ngôn ngữ
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

    // Sự kiện thay đổi ngôn ngữ
    document.getElementById('languageSwitch').addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        updateLanguage(selectedLang);
        showToast(translations[selectedLang]['language_switch_success'], 'success');
    });

    // Xử lý chế độ tối
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', darkModeToggle.checked ? 'enabled' : 'disabled');
    });

    // Xử lý sự kiện click
    document.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (!action) return;

        const actions = {
            showHome: showHome,
            showTool: () => showTool(e.target.closest('[data-tool]').dataset.tool),
            showHistory: showHistory,
            openContactModal: openContactModal,
            closeModal: closeModal,
            searchTools: searchTools,
            summarizeText: summarizeText,
            convertLength: convertLength,
            calculate: calculate,
            generatePassword: generatePassword,
            countChars: countChars,
            checkURL: checkURL,
            convertTemp: convertTemp,
            convertCurrency: convertCurrency,
            generateQR: generateQR,
            compressImage: compressImage,
            calculateBMI: calculateBMI,
            convertArea: convertArea,
            clearHistory: clearHistory,
            copyPassword: copyPassword
        };

        actions[action]?.();
    });

    // Xử lý phím Enter
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const focusedElement = document.activeElement;
            const action = focusedElement.closest('[data-action]')?.dataset.action || focusedElement.dataset.action;
            if (action) {
                e.preventDefault();
                const actions = {
                    searchTools: searchTools,
                    summarizeText: summarizeText,
                    convertLength: convertLength,
                    calculate: calculate,
                    generatePassword: generatePassword,
                    countChars: countChars,
                    checkURL: checkURL,
                    convertTemp: convertTemp,
                    convertCurrency: convertCurrency,
                    generateQR: generateQR,
                    compressImage: compressImage,
                    calculateBMI: calculateBMI,
                    convertArea: convertArea,
                    clearHistory: clearHistory,
                    copyPassword: copyPassword
                };
                actions[action]?.();
            }
        }
    });

    function showHome() {
        document.getElementById('hero').style.display = 'block';
        document.querySelectorAll('.tools-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        document.querySelectorAll('.tool-nav a').forEach(link => link.classList.remove('active'));
        document.querySelector('html').scrollTop = 0;
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
            restoreToolState(toolId);
            document.querySelectorAll('.tool-nav a').forEach(link => {
                link.classList.toggle('active', link.dataset.tool === toolId);
            });
        } else {
            console.error(`Tool section with ID ${toolId} not found`);
        }
    }

    function showHistory() {
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
        const historySection = document.getElementById('history');
        historySection.classList.add('active', 'animate__animated', 'animate__fadeInUp');
        historySection.style.display = 'block';
        historySection.scrollIntoView({ behavior: 'smooth' });
        loadHistory();
    }

    function openContactModal() {
        document.getElementById('contactModal').classList.add('active', 'animate__animated', 'animate__zoomIn');
    }

    function closeModal() {
        document.getElementById('contactModal').classList.remove('active');
    }

    function searchTools() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const toolLinks = document.querySelectorAll('.tool-nav a');
        toolLinks.forEach(link => {
            const toolName = link.querySelector('.tooltip').textContent.toLowerCase();
            link.style.display = toolName.includes(query) ? 'flex' : 'none';
        });
    }

    function summarizeText() {
        const textInput = document.getElementById('textInput');
        const summaryLength = document.getElementById('summaryLength').value;
        const textError = document.getElementById('textError');
        const textLoading = document.getElementById('textLoading');
        const textResult = document.getElementById('textResult');
        const summaryOutput = document.getElementById('summaryOutput');
        
        const text = textInput.value.trim();
        const lang = localStorage.getItem('language') || 'vi';
        if (!text) {
            textError.textContent = translations[lang]['error_empty_text'];
            textError.classList.add('active');
            return;
        }
        if (text.length < 50) {
            textError.textContent = translations[lang]['error_text_too_short'];
            textError.classList.add('active');
            return;
        }
        textError.classList.remove('active');
        textLoading.classList.add('active');
        textResult.classList.remove('active');

        setTimeout(() => {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim());
            const wordCount = text.split(/\s+/).length;
            const summaryRatio = { short: 0.2, medium: 0.3, long: 0.4 }[summaryLength];
            const summaryWordCount = Math.max(10, Math.floor(wordCount * summaryRatio));
            const summarySentences = sentences.slice(0, Math.max(1, Math.floor(sentences.length * summaryRatio)));
            const summary = summarySentences.join('. ') + (summarySentences.length ? '.' : '');
            
            summaryOutput.textContent = summary;
            textLoading.classList.remove('active');
            textResult.classList.add('active');
            saveToHistory('summarize', text, summary);
        }, 1000);
    }

    function convertLength() {
        const lengthInput = document.getElementById('lengthInput');
        const fromUnit = document.getElementById('lengthFromUnit').value;
        const toUnit = document.getElementById('lengthToUnit').value;
        const lengthError = document.getElementById('lengthError');
        const lengthLoading = document.getElementById('lengthLoading');
        const lengthResult = document.getElementById('lengthResult');
        const lengthOutput = document.getElementById('lengthOutput');
        
        const value = parseFloat(lengthInput.value);
        const lang = localStorage.getItem('language') || 'vi';
        if (isNaN(value) || value < 0) {
            lengthError.textContent = translations[lang]['error_invalid_length'];
            lengthError.classList.add('active');
            return;
        }
        lengthError.classList.remove('active');
        lengthLoading.classList.add('active');
        lengthResult.classList.remove('active');

        setTimeout(() => {
            const conversionRates = {
                m: 1, km: 0.001, cm: 100, in: 39.3701, ft: 3.28084, yd: 1.09361
            };
            const valueInMeters = value / conversionRates[fromUnit];
            const convertedValue = valueInMeters * conversionRates[toUnit];
            const result = `${value} ${translations[lang][`length_unit_${fromUnit}`]} = ${convertedValue.toFixed(2)} ${translations[lang][`length_unit_${toUnit}`]}`;
            
            lengthOutput.textContent = result;
            lengthLoading.classList.remove('active');
            lengthResult.classList.add('active');
            saveToHistory('length-converter', `${value} ${translations[lang][`length_unit_${fromUnit}`]}`, result);
        }, 500);
    }

    function calculate() {
        const input1 = parseFloat(document.getElementById('calcInput1').value);
        const input2 = parseFloat(document.getElementById('calcInput2').value);
        const operation = document.getElementById('calcOperation').value;
        const calcError = document.getElementById('calcError');
        const calcLoading = document.getElementById('calcLoading');
        const calcResult = document.getElementById('calcResult');
        const calcOutput = document.getElementById('calcOutput');
        
        const lang = localStorage.getItem('language') || 'vi';
        if (isNaN(input1) || isNaN(input2)) {
            calcError.textContent = translations[lang]['error_invalid_numbers'];
            calcError.classList.add('active');
            return;
        }
        if (operation === 'divide' && input2 === 0) {
            calcError.textContent = translations[lang]['error_divide_by_zero'];
            calcError.classList.add('active');
            return;
        }
        calcError.classList.remove('active');
        calcLoading.classList.add('active');
        calcResult.classList.remove('active');

        setTimeout(() => {
            const operations = {
                add: (a, b) => a + b,
                subtract: (a, b) => a - b,
                multiply: (a, b) => a * b,
                divide: (a, b) => a / b
            };
            const result = operations[operation](input1, input2);
            const operationSymbol = {
                add: translations[lang]['calc_operation_add'],
                subtract: translations[lang]['calc_operation_subtract'],
                multiply: translations[lang]['calc_operation_multiply'],
                divide: translations[lang]['calc_operation_divide']
            }[operation];
            calcOutput.textContent = `${input1} ${operationSymbol} ${input2} = ${result.toFixed(2)}`;
            calcLoading.classList.remove('active');
            calcResult.classList.add('active');
            saveToHistory('calculator', `${input1} ${operationSymbol} ${input2}`, result.toFixed(2));
        }, 500);
    }

    function generatePassword() {
        const length = parseInt(document.getElementById('passwordLength').value);
        const includeUppercase = document.getElementById('includeUppercase').checked;
        const includeLowercase = document.getElementById('includeLowercase').checked;
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeSymbols = document.getElementById('includeSymbols').checked;
        const passwordError = document.getElementById('passwordError');
        const passwordLoading = document.getElementById('passwordLoading');
        const passwordResult = document.getElementById('passwordResult');
        const passwordOutput = document.getElementById('passwordOutput');
        
        const lang = localStorage.getItem('language') || 'vi';
        if (length < 4 || length > 50) {
            passwordError.textContent = translations[lang]['error_invalid_password_length'];
            passwordError.classList.add('active');
            return;
        }
        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            passwordError.textContent = translations[lang]['error_no_character_types'];
            passwordError.classList.add('active');
            return;
        }
        passwordError.classList.remove('active');
        passwordLoading.classList.add('active');
        passwordResult.classList.remove('active');

        setTimeout(() => {
            const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lowercase = 'abcdefghijklmnopqrstuvwxyz';
            const numbers = '0123456789';
            const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            let chars = '';
            if (includeUppercase) chars += uppercase;
            if (includeLowercase) chars += lowercase;
            if (includeNumbers) chars += numbers;
            if (includeSymbols) chars += symbols;
            
            let password = '';
            for (let i = 0; i < length; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            passwordOutput.textContent = password;
            passwordLoading.classList.remove('active');
            passwordResult.classList.add('active');
            saveToHistory('password-generator', `Length: ${length}`, password);
        }, 500);
    }

    function copyPassword() {
        const passwordOutput = document.getElementById('passwordOutput').textContent;
        const lang = localStorage.getItem('language') || 'vi';
        navigator.clipboard.writeText(passwordOutput).then(() => {
            showToast(translations[lang]['copy_success'], 'success');
        }).catch(() => {
            showToast(translations[lang]['copy_error'], 'error');
        });
    }

    function countChars() {
        const charInput = document.getElementById('charInput');
        const charError = document.getElementById('charError');
        const charLoading = document.getElementById('charLoading');
        const charResult = document.getElementById('charResult');
        const charOutput = document.getElementById('charOutput');
        
        const text = charInput.value.trim();
        const lang = localStorage.getItem('language') || 'vi';
        if (!text) {
            charError.textContent = translations[lang]['error_empty_text'];
            charError.classList.add('active');
            return;
        }
        charError.classList.remove('active');
        charLoading.classList.add('active');
        charResult.classList.remove('active');

        setTimeout(() => {
            const charCount = text.length;
            const wordCount = text.split(/\s+/).filter(word => word).length;
            charOutput.textContent = `${translations[lang]['char_count_label']}: ${charCount}, ${translations[lang]['word_count_label']}: ${wordCount}`;
            charLoading.classList.remove('active');
            charResult.classList.add('active');
            saveToHistory('char-counter', text, `Chars: ${charCount}, Words: ${wordCount}`);
        }, 500);
    }

    function checkURL() {
        const urlInput = document.getElementById('urlInput');
        const urlError = document.getElementById('urlError');
        const urlLoading = document.getElementById('urlLoading');
        const urlResult = document.getElementById('urlResult');
        const urlOutput = document.getElementById('urlOutput');
        
        const url = urlInput.value.trim();
        const lang = localStorage.getItem('language') || 'vi';
        if (!url) {
            urlError.textContent = translations[lang]['error_empty_url'];
            urlError.classList.add('active');
            return;
        }
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i;
        if (!urlPattern.test(url)) {
            urlError.textContent = translations[lang]['error_invalid_url'];
            urlError.classList.add('active');
            return;
        }
        urlError.classList.remove('active');
        urlLoading.classList.add('active');
        urlResult.classList.remove('active');

        setTimeout(() => {
            urlOutput.textContent = translations[lang]['url_valid_message'];
            urlLoading.classList.remove('active');
            urlResult.classList.add('active');
            saveToHistory('url-checker', url, 'Valid');
        }, 1000);
    }

    function convertTemp() {
        const tempInput = document.getElementById('tempInput');
        const fromUnit = document.getElementById('tempFromUnit').value;
        const toUnit = document.getElementById('tempToUnit').value;
        const tempError = document.getElementById('tempError');
        const tempLoading = document.getElementById('tempLoading');
        const tempResult = document.getElementById('tempResult');
        const tempOutput = document.getElementById('tempOutput');
        
        const value = parseFloat(tempInput.value);
        const lang = localStorage.getItem('language') || 'vi';
        if (isNaN(value)) {
            tempError.textContent = translations[lang]['error_invalid_temperature'];
            tempError.classList.add('active');
            return;
        }
        if (fromUnit === 'K' && value < 0) {
            tempError.textContent = translations[lang]['error_invalid_kelvin'];
            tempError.classList.add('active');
            return;
        }
        tempError.classList.remove('active');
        tempLoading.classList.add('active');
        tempResult.classList.remove('active');

        setTimeout(() => {
            let valueInCelsius;
            if (fromUnit === 'C') valueInCelsius = value;
            else if (fromUnit === 'F') valueInCelsius = (value - 32) * 5/9;
            else valueInCelsius = value - 273.15;

            let convertedValue;
            if (toUnit === 'C') convertedValue = valueInCelsius;
            else if (toUnit === 'F') convertedValue = valueInCelsius * 9/5 + 32;
            else convertedValue = valueInCelsius + 273.15;

            const result = `${value} ${translations[lang][`temp_unit_${fromUnit.toLowerCase()}`]} = ${convertedValue.toFixed(2)} ${translations[lang][`temp_unit_${toUnit.toLowerCase()}`]}`;
            tempOutput.textContent = result;
            tempLoading.classList.remove('active');
            tempResult.classList.add('active');
            saveToHistory('temp-converter', `${value} ${translations[lang][`temp_unit_${fromUnit.toLowerCase()}`]}`, result);
        }, 500);
    }

    function convertCurrency() {
        const currencyInput = document.getElementById('currencyInput');
        const fromUnit = document.getElementById('currencyFromUnit').value;
        const toUnit = document.getElementById('currencyToUnit').value;
        const currencyError = document.getElementById('currencyError');
        const currencyLoading = document.getElementById('currencyLoading');
        const currencyResult = document.getElementById('currencyResult');
        const currencyOutput = document.getElementById('currencyOutput');
        
        const value = parseFloat(currencyInput.value);
        const lang = localStorage.getItem('language') || 'vi';
        if (isNaN(value) || value < 0) {
            currencyError.textContent = translations[lang]['error_invalid_amount'];
            currencyError.classList.add('active');
            return;
        }
        currencyError.classList.remove('active');
        currencyLoading.classList.add('active');
        currencyResult.classList.remove('active');

        setTimeout(() => {
            const rates = {
                USD: 1,
                EUR: 0.85,
                JPY: 110,
                VND: 23000
            };
            const valueInUSD = value / rates[fromUnit];
            const convertedValue = valueInUSD * rates[toUnit];
            const result = `${value} ${translations[lang][`currency_unit_${fromUnit.toLowerCase()}`]} = ${convertedValue.toFixed(2)} ${translations[lang][`currency_unit_${toUnit.toLowerCase()}`]}`;
            
            currencyOutput.textContent = result;
            currencyLoading.classList.remove('active');
            currencyResult.classList.add('active');
            saveToHistory('currency-converter', `${value} ${translations[lang][`currency_unit_${fromUnit.toLowerCase()}`]}`, result);
        }, 500);
    }

    function generateQR() {
        const qrInput = document.getElementById('qrInput');
        const qrError = document.getElementById('qrError');
        const qrLoading = document.getElementById('qrLoading');
        const qrResult = document.getElementById('qrResult');
        const qrOutput = document.getElementById('qrOutput');
        
        const text = qrInput.value.trim();
        const lang = localStorage.getItem('language') || 'vi';
        if (!text) {
            qrError.textContent = translations[lang]['error_empty_text'];
            qrError.classList.add('active');
            return;
        }
        qrError.classList.remove('active');
        qrLoading.classList.add('active');
        qrResult.classList.remove('active');

        setTimeout(() => {
            qrOutput.innerHTML = '';
            new QRCode(qrOutput, {
                text: text,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            qrLoading.classList.remove('active');
            qrResult.classList.add('active');
            saveToHistory('qr-generator', text, 'QR Code generated');
        }, 1000);
    }

    function compressImage() {
        const imageInput = document.getElementById('imageInput');
        const imageError = document.getElementById('imageError');
        const imageLoading = document.getElementById('imageLoading');
        const imageResult = document.getElementById('imageResult');
        const imageOutput = document.getElementById('imageOutput');
        
        const file = imageInput.files[0];
        const lang = localStorage.getItem('language') || 'vi';
        if (!file) {
            imageError.textContent = translations[lang]['error_empty_image'];
            imageError.classList.add('active');
            return;
        }
        if (!file.type.startsWith('image/')) {
            imageError.textContent = translations[lang]['error_invalid_image'];
            imageError.classList.add('active');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            imageError.textContent = translations[lang]['error_image_too_large'];
            imageError.classList.add('active');
            return;
        }
        imageError.classList.remove('active');
        imageLoading.classList.add('active');
        imageResult.classList.remove('active');

        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width * 0.7;
                    canvas.height = img.height * 0.7;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    const originalSize = (file.size / 1024).toFixed(2);
                    const compressedSize = (compressedDataUrl.length * 0.75 / 1024).toFixed(2);
                    imageOutput.innerHTML = `Original: ${originalSize} KB<br>Compressed: ${compressedSize} KB<br><a href="${compressedDataUrl}" download="compressed-image.jpg">Download</a>`;
                    imageLoading.classList.remove('active');
                    imageResult.classList.add('active');
                    saveToHistory('image-compressor', `Original: ${originalSize} KB`, `Compressed: ${compressedSize} KB`);
                };
            };
            reader.readAsDataURL(file);
        }, 1000);
    }

    function calculateBMI() {
        const weightInput = document.getElementById('weightInput');
        const heightInput = document.getElementById('heightInput');
        const bmiError = document.getElementById('bmiError');
        const bmiLoading = document.getElementById('bmiLoading');
        const bmiResult = document.getElementById('bmiResult');
        const bmiOutput = document.getElementById('bmiOutput');
        
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value) / 100; // Chuyển cm thành mét
        const lang = localStorage.getItem('language') || 'vi';
        if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
            bmiError.textContent = translations[lang]['error_invalid_weight_height'];
            bmiError.classList.add('active');
            return;
        }
        bmiError.classList.remove('active');
        bmiLoading.classList.add('active');
        bmiResult.classList.remove('active');

        setTimeout(() => {
            const bmi = (weight / (height * height)).toFixed(2);
            let category;
            if (bmi < 18.5) category = translations[lang]['bmi_underweight'] || 'Underweight';
            else if (bmi < 25) category = translations[lang]['bmi_normal'] || 'Normal';
            else if (bmi < 30) category = translations[lang]['bmi_overweight'] || 'Overweight';
            else category = translations[lang]['bmi_obese'] || 'Obese';

            bmiOutput.textContent = `BMI: ${bmi} (${category})`;
            bmiLoading.classList.remove('active');
            bmiResult.classList.add('active');
            saveToHistory('bmi-calculator', `Weight: ${weight} kg, Height: ${height * 100} cm`, `BMI: ${bmi} (${category})`);
        }, 500);
    }

    function convertArea() {
        const areaInput = document.getElementById('areaInput');
        const fromUnit = document.getElementById('areaFromUnit').value;
        const toUnit = document.getElementById('areaToUnit').value;
        const areaError = document.getElementById('areaError');
        const areaLoading = document.getElementById('areaLoading');
        const areaResult = document.getElementById('areaResult');
        const areaOutput = document.getElementById('areaOutput');
        
        const value = parseFloat(areaInput.value);
        const lang = localStorage.getItem('language') || 'vi';
        if (isNaN(value) || value < 0) {
            areaError.textContent = translations[lang]['error_invalid_area'];
            areaError.classList.add('active');
            return;
        }
        areaError.classList.remove('active');
        areaLoading.classList.add('active');
        areaResult.classList.remove('active');

        setTimeout(() => {
            const conversionRates = {
                m2: 1,
                km2: 0.000001,
                ha: 0.0001,
                ft2: 10.7639
            };
            const valueInSquareMeters = value / conversionRates[fromUnit];
            const convertedValue = valueInSquareMeters * conversionRates[toUnit];
            const result = `${value} ${translations[lang][`area_unit_${fromUnit}`]} = ${convertedValue.toFixed(2)} ${translations[lang][`area_unit_${toUnit}`]}`;
            
            areaOutput.textContent = result;
            areaLoading.classList.remove('active');
            areaResult.classList.add('active');
            saveToHistory('area-converter', `${value} ${translations[lang][`area_unit_${fromUnit}`]}`, result);
        }, 500);
    }

    function saveToHistory(toolId, input, output) {
        const lang = localStorage.getItem('language') || 'vi';
        const history = JSON.parse(localStorage.getItem('toolHistory')) || [];
        const toolSection = document.querySelector(`section[data-tool-name="${toolId}"]`);
        const toolName = toolSection.querySelector('h3 span').textContent;
        const timestamp = new Date().toLocaleString(lang);
        history.push({ tool: toolName, input, output, timestamp });
        localStorage.setItem('toolHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const historyTable = document.getElementById('historyTable');
        const history = JSON.parse(localStorage.getItem('toolHistory')) || [];
        const lang = localStorage.getItem('language') || 'vi';
        historyTable.innerHTML = '';
        if (history.length === 0) {
            historyTable.innerHTML = `<tr><td colspan="4">${translations[lang]['history_empty']}</td></tr>`;
            return;
        }
        history.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.tool}</td>
                <td>${entry.input}</td>
                <td>${entry.output}</td>
                <td>${entry.timestamp}</td>
            `;
            historyTable.appendChild(row);
        });
    }

    function clearHistory() {
        localStorage.removeItem('toolHistory');
        loadHistory();
    }

    function showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} active`;
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    function restoreToolState(toolId) {
        // Placeholder để khôi phục trạng thái nếu cần (có thể mở rộng sau)
    }
});
