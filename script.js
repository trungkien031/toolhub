document.addEventListener('DOMContentLoaded', () => {
    // API Keys (Replace with your own)
    const EXCHANGE_RATE_API_KEY = 'YOUR_EXCHANGERATE_API_KEY'; // Get from exchangerate-api.com
    const GOOGLE_SAFE_BROWSING_KEY = 'YOUR_GOOGLE_SAFE_BROWSING_KEY'; // Get from Google Cloud

    // Cache DOM elements for performance
    const elements = {
        textInput: document.getElementById('textInput'),
        summaryLength: document.getElementById('summaryLength'),
        lengthValue: document.getElementById('lengthValue'),
        lengthFrom: document.getElementById('lengthFrom'),
        lengthTo: document.getElementById('lengthTo'),
        num1: document.getElementById('num1'),
        operator: document.getElementById('operator'),
        num2: document.getElementById('num2'),
        passLength: document.getElementById('passLength'),
        includeUppercase: document.getElementById('includeUppercase'),
        includeLowercase: document.getElementById('includeLowercase'),
        includeNumbers: document.getElementById('includeNumbers'),
        includeSymbols: document.getElementById('includeSymbols'),
        charInput: document.getElementById('charInput'),
        urlInput: document.getElementById('urlInput'),
        tempValue: document.getElementById('tempValue'),
        tempFrom: document.getElementById('tempFrom'),
        tempTo: document.getElementById('tempTo'),
        currencyValue: document.getElementById('currencyValue'),
        currencyFrom: document.getElementById('currencyFrom'),
        currencyTo: document.getElementById('currencyTo'),
        qrInput: document.getElementById('qrInput'),
        imageInput: document.getElementById('imageInput'),
        weight: document.getElementById('weight'),
        height: document.getElementById('height'),
        areaValue: document.getElementById('areaValue'),
        areaFrom: document.getElementById('areaFrom'),
        areaTo: document.getElementById('areaTo'),
        searchInput: document.getElementById('searchInput'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        languageSelector: document.getElementById('languageSelector'),
        hero: document.getElementById('hero'),
        contactModal: document.getElementById('contactModal'),
        toast: document.getElementById('toast'),
        historyResult: document.getElementById('historyResult')
    };

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
            timestamp: new Date().toLocaleString(i18next.language === 'vi' ? 'vi-VN' : 'en-US')
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

    // Input Validation
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

    // UI Functions
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        elements.darkModeToggle.textContent = isDarkMode ? i18next.t('lightMode', 'Light Mode') : i18next.t('darkMode', 'Dark Mode');
        document.querySelectorAll('pre').forEach(pre => {
            pre.style.background = isDarkMode ? '#3a3a4e' : '#f5f5f5';
        });
    }

    function initDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            elements.darkModeToggle.textContent = i18next.t('lightMode', 'Light Mode');
        }
    }

    function openContactModal() {
        if (!elements.contactModal) return;
        elements.contactModal.classList.add('active', 'animate__animated', 'animate__fadeIn');
    }

    function closeContactModal() {
        if (!elements.contactModal) return;
        elements.contactModal.classList.remove('active');
    }

    function showHome() {
        const toolsSections = document.querySelectorAll('.tools-section');
        if (!elements.hero) return;
        toolsSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        elements.hero.style.display = 'block';
        elements.hero.classList.add('animate__animated', 'animate__fadeIn');
        document.querySelectorAll('.tool-nav a').forEach(link => link.classList.remove('active'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.title = i18next.t('title', 'ToolHub - Multi-Tool Hub');
    }

    function showTool(toolId) {
        if (!elements.hero) return;
        elements.hero.style.display = 'none';
        document.querySelectorAll('.tools-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(toolId);
        if (targetSection) {
            targetSection.classList.add('active', 'animate__animated', 'animate__fadeInUp');
            targetSection.style.display = 'block';
            targetSection.scrollIntoView({ behavior: 'smooth' });
            document.title = `${i18next.t(toolId, toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))} - ToolHub`;
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
        if (!elements.historyResult) return;
        const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
        elements.historyResult.innerHTML = history.length ? `
            <ul style="list-style: none; padding: 0;">
                ${history.map(item => `
                    <li style="margin-bottom: 15px;">
                        <strong>${i18next.t(item.toolId, item.toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))}</strong> (${item.timestamp}): 
                        <pre style="background: ${document.body.classList.contains('dark-mode') ? '#3a3a4e' : '#f5f5f5'}; padding: 10px; border-radius: 5px; overflow-x: auto;">
                            ${escapeHTML(JSON.stringify(item.result, null, 2))}
                        </pre>
                    </li>
                `).join('')}
            </ul>
        ` : `<p>${i18next.t('noHistory', 'No history available.')}</p>`;
    }

    function clearHistory() {
        localStorage.removeItem('toolHistory');
        showHistory();
        showToast(i18next.t('historyCleared', 'History cleared!'), 'success');
    }

    function searchTools() {
        if (!elements.searchInput || !elements.hero) return;
        const searchValue = elements.searchInput.value.trim().toLowerCase();
        const toolsSections = document.querySelectorAll('.tools-section');

        if (!searchValue) {
            showHome();
            return;
        }

        let found = false;
        toolsSections.forEach(section => {
            const toolName = section.dataset.toolName.toLowerCase();
            if (toolName.includes(searchValue)) {
                elements.hero.style.display = 'none';
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
            showToast(i18next.t('noToolsFound', 'No tools found!'), 'error');
        }

        document.querySelectorAll('.tool-nav a').forEach(link => link.classList.remove('active'));
    }

    // Language Initialization with i18next
    function initLanguage() {
        i18next.init({
            lng: localStorage.getItem('language') || 'vi',
            resources: {
                en: {
                    translation: {
                        title: 'ToolHub - Multi-Tool Hub',
                        home: 'Home',
                        history: 'History',
                        contact: 'Contact',
                        summarize: 'Text Summary',
                        'length-converter': 'Length Converter',
                        calculator: 'Calculator',
                        'password-generator': 'Password Generator',
                        'char-counter': 'Character Counter',
                        'url-checker': 'URL Checker',
                        'temp-converter': 'Temperature Converter',
                        'currency-converter': 'Currency Converter',
                        'qr-generator': 'QR Code Generator',
                        'image-compressor': 'Image Compressor',
                        'bmi-calculator': 'BMI Calculator',
                        'area-converter': 'Area Converter',
                        darkMode: 'Dark Mode',
                        lightMode: 'Light Mode',
                        welcome: 'Welcome to ToolHub',
                        description: 'Summarize text, convert units, generate QR codes, and more - all free and easy to use.',
                        summarizeDesc: 'Condense long content into a concise summary.',
                        lengthConverterDesc: 'Convert length between meters, kilometers, centimeters, inches, feet, and yards.',
                        calculatorDesc: 'Perform basic calculations: addition, subtraction, multiplication, division.',
                        passwordGeneratorDesc: 'Generate secure random passwords with customizable length and character types.',
                        charCounterDesc: 'Count characters and words in your text.',
                        urlCheckerDesc: 'Check if a URL is valid and safe.',
                        tempConverterDesc: 'Convert between Celsius, Fahrenheit, and Kelvin.',
                        currencyConverterDesc: 'Convert between different currencies using real-time rates.',
                        qrGeneratorDesc: 'Generate QR codes for URLs or text.',
                        imageCompressorDesc: 'Compress images to reduce file size.',
                        bmiCalculatorDesc: 'Calculate your Body Mass Index (BMI).',
                        areaConverterDesc: 'Convert between square meters, kilometers, hectares, and square feet.',
                        short: 'Short (~20%)',
                        medium: 'Medium (~30%)',
                        long: 'Long (~40%)',
                        meter: 'Meter (m)',
                        kilometer: 'Kilometer (km)',
                        centimeter: 'Centimeter (cm)',
                        inch: 'Inch (in)',
                        foot: 'Foot (ft)',
                        yard: 'Yard (yd)',
                        add: 'Add (+)',
                        subtract: 'Subtract (-)',
                        multiply: 'Multiply (*)',
                        divide: 'Divide (/)',
                        uppercase: 'Uppercase (A-Z)',
                        lowercase: 'Lowercase (a-z)',
                        numbers: 'Numbers (0-9)',
                        symbols: 'Symbols (!@#$%)',
                        celsius: 'Celsius (C)',
                        fahrenheit: 'Fahrenheit (F)',
                        kelvin: 'Kelvin (K)',
                        m2: 'Square Meter (m²)',
                        km2: 'Square Kilometer (km²)',
                        ha: 'Hectare (ha)',
                        ft2: 'Square Foot (ft²)',
                        creator: 'Creator',
                        dob: 'Date of Birth',
                        email: 'Email',
                        phone: 'Phone',
                        close: 'Close',
                        error: {
                            emptyText: 'Please enter valid text!',
                            invalidNumber: 'Please enter a valid positive number!',
                            invalidUrl: 'Please enter a valid URL!',
                            textTooLong: 'Text is too long (max 10,000 characters)!',
                            invalidLength: 'Length must be between 8 and 32!',
                            selectCharacterType: 'Please select at least one character type!',
                            divideByZero: 'Cannot divide by zero!',
                            noImage: 'Please select an image!',
                            invalidImage: 'Invalid image format!',
                            apiFailed: 'Failed to fetch exchange rate.',
                            apiError: 'Error connecting to API.',
                            unsafeUrl: 'Unsafe URL detected!',
                            qrFailed: 'Failed to generate QR code!',
                            compressFailed: 'Failed to compress image!'
                        },
                        summarizeText: 'Summarize',
                        convertLength: 'Convert',
                        calculate: 'Calculate',
                        generatePassword: 'Generate',
                        copyPassword: 'Copy',
                        countChars: 'Count',
                        checkURL: 'Check',
                        convertTemp: 'Convert',
                        convertCurrency: 'Convert',
                        generateQR: 'Generate QR',
                        compressImage: 'Compress',
                        calculateBMI: 'Calculate BMI',
                        convertArea: 'Convert',
                        searchTools: 'Search',
                        noHistory: 'No history available.',
                        historyCleared: 'History cleared!',
                        noToolsFound: 'No tools found!',
                        originalValue: 'Original Value',
                        originalUnit: 'Original Unit',
                        convertedValue: 'Converted Value',
                        targetUnit: 'Target Unit',
                        result: 'Result',
                        characters: 'Characters',
                        words: 'Words',
                        validUrl: 'Valid URL',
                        compressedImage: 'Compressed image',
                        download: 'Download',
                        bmi: {
                            underweight: 'Underweight',
                            normal: 'Normal',
                            overweight: 'Overweight',
                            obese: 'Obese'
                        },
                        textInputPlaceholder: 'Enter text to summarize...',
                        valuePlaceholder: 'Enter value',
                        firstNumberPlaceholder: 'First number',
                        secondNumberPlaceholder: 'Second number',
                        passLengthPlaceholder: 'Password length (8-32)',
                        charInputPlaceholder: 'Enter text...',
                        urlInputPlaceholder: 'Enter URL...',
                        searchPlaceholder: 'Search tools...'
                    }
                },
                vi: {
                    translation: {
                        title: 'ToolHub - Hộp Công Cụ Đa Năng',
                        home: 'Trang chủ',
                        history: 'Lịch sử',
                        contact: 'Liên hệ',
                        summarize: 'Tóm tắt văn bản',
                        'length-converter': 'Chuyển đổi độ dài',
                        calculator: 'Máy tính',
                        'password-generator': 'Tạo mật khẩu',
                        'char-counter': 'Đếm ký tự',
                        'url-checker': 'Kiểm tra URL',
                        'temp-converter': 'Chuyển đổi nhiệt độ',
                        'currency-converter': 'Chuyển đổi tiền tệ',
                        'qr-generator': 'Tạo mã QR',
                        'image-compressor': 'Nén ảnh',
                        'bmi-calculator': 'Tính BMI',
                        'area-converter': 'Chuyển đổi diện tích',
                        darkMode: 'Chế độ tối',
                        lightMode: 'Chế độ sáng',
                        welcome: 'Chào mừng đến với ToolHub',
                        description: 'Tóm tắt văn bản, chuyển đổi đơn vị, tạo mã QR và nhiều tính năng khác - miễn phí và dễ sử dụng.',
                        summarizeDesc: 'Tóm tắt nội dung dài thành một bản ngắn gọn.',
                        lengthConverterDesc: 'Chuyển đổi độ dài giữa mét, kilômét, centimet, inch, feet và yard.',
                        calculatorDesc: 'Thực hiện các phép tính cơ bản: cộng, trừ, nhân, chia.',
                        passwordGeneratorDesc: 'Tạo mật khẩu ngẫu nhiên an toàn với độ dài và loại ký tự tùy chỉnh.',
                        charCounterDesc: 'Đếm số ký tự và từ trong văn bản của bạn.',
                        urlCheckerDesc: 'Kiểm tra xem URL có hợp lệ và an toàn hay không.',
                        tempConverterDesc: 'Chuyển đổi giữa độ C, độ F và Kelvin.',
                        currencyConverterDesc: 'Chuyển đổi giữa các loại tiền tệ với tỷ giá thời gian thực.',
                        qrGeneratorDesc: 'Tạo mã QR cho URL hoặc văn bản.',
                        imageCompressorDesc: 'Nén ảnh để giảm kích thước tệp.',
                        bmiCalculatorDesc: 'Tính chỉ số khối cơ thể (BMI) của bạn.',
                        areaConverterDesc: 'Chuyển đổi giữa mét vuông, kilômét vuông, hecta và feet vuông.',
                        short: 'Ngắn (~20%)',
                        medium: 'Trung bình (~30%)',
                        long: 'Dài (~40%)',
                        meter: 'Mét (m)',
                        kilometer: 'Kilômét (km)',
                        centimeter: 'Centimet (cm)',
                        inch: 'Inch (in)',
                        foot: 'Feet (ft)',
                        yard: 'Yard (yd)',
                        add: 'Cộng (+)',
                        subtract: 'Trừ (-)',
                        multiply: 'Nhân (*)',
                        divide: 'Chia (/)',
                        uppercase: 'Chữ hoa (A-Z)',
                        lowercase: 'Chữ thường (a-z)',
                        numbers: 'Số (0-9)',
                        symbols: 'Ký hiệu (!@#$%)',
                        celsius: 'Độ C (C)',
                        fahrenheit: 'Độ F (F)',
                        kelvin: 'Kelvin (K)',
                        m2: 'Mét vuông (m²)',
                        km2: 'Kilômét vuông (km²)',
                        ha: 'Hecta (ha)',
                        ft2: 'Feet vuông (ft²)',
                        creator: 'Người tạo',
                        dob: 'Ngày sinh',
                        email: 'Email',
                        phone: 'Số điện thoại',
                        close: 'Đóng',
                        error: {
                            emptyText: 'Vui lòng nhập văn bản hợp lệ!',
                            invalidNumber: 'Vui lòng nhập số dương hợp lệ!',
                            invalidUrl: 'Vui lòng nhập URL hợp lệ!',
                            textTooLong: 'Văn bản quá dài (tối đa 10,000 ký tự)!',
                            invalidLength: 'Độ dài phải từ 8 đến 32 ký tự!',
                            selectCharacterType: 'Vui lòng chọn ít nhất một loại ký tự!',
                            divideByZero: 'Không thể chia cho 0!',
                            noImage: 'Vui lòng chọn một ảnh!',
                            invalidImage: 'Định dạng ảnh không hợp lệ!',
                            apiFailed: 'Không thể lấy tỷ giá.',
                            apiError: 'Lỗi kết nối API.',
                            unsafeUrl: 'Phát hiện URL không an toàn!',
                            qrFailed: 'Không thể tạo mã QR!',
                            compressFailed: 'Không thể nén ảnh!'
                        },
                        summarizeText: 'Tóm tắt',
                        convertLength: 'Chuyển đổi',
                        calculate: 'Tính',
                        generatePassword: 'Tạo',
                        copyPassword: 'Sao chép',
                        countChars: 'Đếm',
                        checkURL: 'Kiểm tra',
                        convertTemp: 'Chuyển đổi',
                        convertCurrency: 'Chuyển đổi',
                        generateQR: 'Tạo QR',
                        compressImage: 'Nén',
                        calculateBMI: 'Tính BMI',
                        convertArea: 'Chuyển đổi',
                        searchTools: 'Tìm kiếm',
                        noHistory: 'Chưa có lịch sử.',
                        historyCleared: 'Đã xóa lịch sử!',
                        noToolsFound: 'Không tìm thấy công cụ nào!',
                        originalValue: 'Giá trị gốc',
                        originalUnit: 'Đơn vị gốc',
                        convertedValue: 'Giá trị chuyển đổi',
                        targetUnit: 'Đơn vị đích',
                        result: 'Kết quả',
                        characters: 'Ký tự',
                        words: 'Từ',
                        validUrl: 'URL hợp lệ',
                        compressedImage: 'Ảnh đã nén',
                        download: 'Tải xuống',
                        bmi: {
                            underweight: 'Thiếu cân',
                            normal: 'Bình thường',
                            overweight: 'Thừa cân',
                            obese: 'Béo phì'
                        },
                        textInputPlaceholder: 'Nhập văn bản để tóm tắt...',
                        valuePlaceholder: 'Nhập giá trị',
                        firstNumberPlaceholder: 'Số thứ nhất',
                        secondNumberPlaceholder: 'Số thứ hai',
                        passLengthPlaceholder: 'Độ dài mật khẩu (8-32)',
                        charInputPlaceholder: 'Nhập văn bản...',
                        urlInputPlaceholder: 'Nhập URL...',
                        searchPlaceholder: 'Tìm kiếm công cụ...'
                    }
                }
            }
        }, () => {
            updateContent();
        });

        elements.languageSelector.addEventListener('change', (e) => {
            const lang = e.target.value;
            i18next.changeLanguage(lang, () => {
                updateContent();
                localStorage.setItem('language', lang);
            });
        });
    }

    function updateContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = i18next.t(element.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            element.placeholder = i18next.t(element.dataset.i18nPlaceholder);
        });
        document.title = i18next.t('title', 'ToolHub - Multi-Tool Hub');
    }

    // Tool Functions
    function summarizeText(button) {
        processTool(button, 'textLoading', 'textResult',
            () => {
                const text = elements.textInput.value.trim();
                const validation = validateInput(text, 'text', elements.textInput, 'textError');
                if (!validation.isValid) return validation;
                if (text.length > 10000) {
                    return {
                        isValid: false,
                        input: elements.textInput,
                        errorId: 'textError',
                        message: i18next.t('error.textTooLong')
                    };
                }
                return { isValid: true, input: elements.textInput, errorId: 'textError' };
            },
            () => {
                const text = elements.textInput.value.trim();
                const summaryLength = elements.summaryLength.value;
                const sentences = text.split(/[.!?]+/).filter(s => s.trim());
                const ratio = { short: 0.2, medium: 0.3, long: 0.4 }[summaryLength];
                const count = Math.max(1, Math.ceil(sentences.length * ratio));
                const summary = sentences.slice(0, count).join('. ') + (count ? '.' : '');
                document.getElementById('summaryOutput').textContent = summary;
                saveToHistory('summarize', { input: text.slice(0, 50) + '...', summary });
                saveToolState('summarize', { textInput: text, summaryLength });
                showToast(i18next.t('summarizeText', 'Summarized!'), 'success');
            }
        );
    }

    function convertLength(button) {
        processTool(button, 'lengthLoading', 'lengthResult',
            () => {
                const value = elements.lengthValue.value;
                return validateInput(value, 'number', elements.lengthValue, 'lengthError');
            },
            () => {
                const value = parseFloat(elements.lengthValue.value);
                const fromUnit = elements.lengthFrom.value;
                const toUnit = elements.lengthTo.value;
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
                showToast(i18next.t('convertLength', 'Converted!'), 'success');
            }
        );
    }

    function calculate(button) {
        processTool(button, 'calcLoading', 'calcResult',
            () => {
                const num1 = parseFloat(elements.num1.value);
                const num2 = parseFloat(elements.num2.value);
                const operator = elements.operator.value;
                if (isNaN(num1)) return validateInput(elements.num1.value, 'number', elements.num1, 'calcError');
                if (isNaN(num2)) return validateInput(elements.num2.value, 'number', elements.num2, 'calcError');
                if (operator === '/' && num2 === 0) {
                    return {
                        isValid: false,
                        input: elements.num2,
                        errorId: 'calcError',
                        message: i18next.t('error.divideByZero')
                    };
                }
                return { isValid: true, input: elements.num1, errorId: 'calcError' };
            },
            () => {
                const num1 = parseFloat(elements.num1.value);
                const num2 = parseFloat(elements.num2.value);
                const operator = elements.operator.value;
                let result;
                switch (operator) {
                    case '+': result = num1 + num2; break;
                    case '-': result = num1 - num2; break;
                    case '*': result = num1 * num2; break;
                    case '/': result = num1 / num2; break;
                }
                const output = { num1, operator, num2, result: result.toFixed(2) };
                document.getElementById('calcOutput').textContent = `${i18next.t('result', 'Result')}: ${output.result}`;
                saveToHistory('calculator', output);
                saveToolState('calculator', { num1, num2, operator });
                showToast(i18next.t('calculate', 'Calculated!'), 'success');
            }
        );
    }

    function generatePassword(button) {
        processTool(button, 'passLoading', 'passResult',
            () => {
                const passLength = parseInt(elements.passLength.value);
                const includeUppercase = elements.includeUppercase.checked;
                const includeLowercase = elements.includeLowercase.checked;
                const includeNumbers = elements.includeNumbers.checked;
                const includeSymbols = elements.includeSymbols.checked;
                if (isNaN(passLength) || passLength < 8 || passLength > 32) {
                    return {
                        isValid: false,
                        input: elements.passLength,
                        errorId: 'passError',
                        message: i18next.t('error.invalidLength')
                    };
                }
                if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
                    return {
                        isValid: false,
                        input: elements.passLength,
                        errorId: 'passError',
                        message: i18next.t('error.selectCharacterType')
                    };
                }
                return { isValid: true, input: elements.passLength, errorId: 'passError' };
            },
            () => {
                const passLength = parseInt(elements.passLength.value);
                const includeUppercase = elements.includeUppercase.checked;
                const includeLowercase = elements.includeLowercase.checked;
                const includeNumbers = elements.includeNumbers.checked;
                const includeSymbols = elements.includeSymbols.checked;
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
                showToast(i18next.t('generatePassword', 'Password generated!'), 'success');
            }
        );
    }

    function copyPassword() {
        const passOutput = document.getElementById('passOutput');
        if (!passOutput) return;
        const text = passOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const copyBtn = document.querySelector('#passResult .copy-btn');
            if (copyBtn) {
                copyBtn.textContent = i18next.t('copyPassword', 'Copied!');
                showToast(i18next.t('copyPassword', 'Password copied!'), 'success');
                setTimeout(() => { copyBtn.textContent = i18next.t('copyPassword', 'Copy'); }, 2000);
            }
        }).catch(() => {
            showError(elements.passLength, 'passError', i18next.t('error.copyFailed', 'Failed to copy password!'));
        });
    }

    function countChars(button) {
        processTool(button, 'charLoading', 'charResult',
            () => validateInput(elements.charInput.value, 'text', elements.charInput, 'charError'),
            () => {
                const text = elements.charInput.value;
                const charCount = text.length;
                const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                document.getElementById('charOutput').textContent = `${i18next.t('characters', 'Characters')}: ${charCount}, ${i18next.t('words', 'Words')}: ${wordCount}`;
                saveToHistory('char-counter', { text: text.slice(0, 50) + '...', charCount, wordCount });
                saveToolState('char-counter', { charInput: text });
                showToast(i18next.t('countChars', 'Counted!'), 'success');
            }
        );
    }

    function checkURL(button) {
        processTool(button, 'urlLoading', 'urlResult',
            () => validateInput(elements.urlInput.value, 'url', elements.urlInput, 'urlError'),
            () => {
                const url = elements.urlInput.value.trim();
                document.getElementById('urlOutput').textContent = `${i18next.t('validUrl', 'Valid URL')}: ${url}`;
                saveToHistory('url-checker', { url });
                saveToolState('url-checker', { urlInput: url });
                showToast(i18next.t('checkURL', 'URL checked!'), 'success');
            }
        );
    }

    function convertTemp(button) {
        processTool(button, 'tempLoading', 'tempResult',
            () => validateInput(elements.tempValue.value, 'number', elements.tempValue, 'tempError'),
            () => {
                const value = parseFloat(elements.tempValue.value);
                const fromUnit = elements.tempFrom.value;
                const toUnit = elements.tempTo.value;
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
                showToast(i18next.t('convertTemp', 'Converted!'), 'success');
            }
        );
    }

    async function convertCurrency(button) {
        processTool(button, 'currencyLoading', 'currencyResult',
            () => validateInput(elements.currencyValue.value, 'number', elements.currencyValue, 'currencyError'),
            async () => {
                const value = parseFloat(elements.currencyValue.value);
                const fromCurrency = elements.currencyFrom.value;
                const toCurrency = elements.currencyTo.value;
                try {
                    const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${fromCurrency}`);
                    const data = await response.json();
                    if (data.result === 'success') {
                        const rate = data.conversion_rates[toCurrency];
                        const result = (value * rate).toFixed(2);
                        const output = {
                            original: value.toFixed(2),
                            fromCurrency,
                            converted: result,
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
                        showToast(i18next.t('convertCurrency', 'Converted!'), 'success');
                    } else {
                        showError(elements.currencyValue, 'currencyError', i18next.t('error.apiFailed', 'Failed to fetch exchange rate.'));
                    }
                } catch (error) {
                    showError(elements.currencyValue, 'currencyError', i18next.t('error.apiError', 'Error connecting to exchange rate API.'));
                }
            }
        );
    }

    async function generateQR(button) {
        processTool(button, 'qrLoading', 'qrResult',
            () => validateInput(elements.qrInput.value, 'url', elements.qrInput, 'qrError'),
            async () => {
                const text = elements.qrInput.value.trim();
                const qrOutput = document.getElementById('qrOutput');
                if (!qrOutput || !window.QRCode) return;
                qrOutput.src = '';
                try {
                    const safeBrowsingResponse = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            client: { clientId: 'toolhub', clientVersion: '1.0' },
                            threatInfo: {
                                threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
                                platformTypes: ['ANY_PLATFORM'],
                                threatEntryTypes: ['URL'],
                                threatEntries: [{ url: text }]
                            }
                        })
                    });
                    const safeBrowsingData = await safeBrowsingResponse.json();
                    if (safeBrowsingData.matches) {
                        showError(elements.qrInput, 'qrError', i18next.t('error.unsafeUrl', 'Unsafe URL detected!'));
                        return;
                    }

                    window.QRCode.toDataURL(text, { width: 200, margin: 1 }, (err, url) => {
                        if (err) {
                            showError(elements.qrInput, 'qrError', i18next.t('error.qrFailed', 'Failed to generate QR code!'));
                            return;
                        }
                        qrOutput.src = url;
                        saveToHistory('qr-generator', { input: text });
                        saveToolState('qr-generator', { qrInput: text });
                        showToast(i18next.t('generateQR', 'QR code generated!'), 'success');
                    });
                } catch (error) {
                    showError(elements.qrInput, 'qrError', i18next.t('error.apiError', 'Error connecting to Safe Browsing API.'));
                }
            }
        );
    }

    function compressImage(button) {
        processTool(button, 'imageLoading', 'imageResult',
            () => {
                const file = elements.imageInput.files[0];
                if (!file) {
                    return {
                        isValid: false,
                        input: elements.imageInput,
                        errorId: 'imageError',
                        message: i18next.t('error.noImage', 'Please select an image!')
                    };
                }
                if (!/\.(jpe?g|png|gif|bmp)$/i.test(file.name)) {
                    return {
                        isValid: false,
                        input: elements.imageInput,
                        errorId: 'imageError',
                        message: i18next.t('error.invalidImage', 'Invalid image format!')
                    };
                }
                return { isValid: true, input: elements.imageInput, errorId: 'imageError' };
            },
            () => {
                const file = elements.imageInput.files[0];
                new window.Compressor(file, {
                    quality: 0.6,
                    maxWidth: 800,
                    maxHeight: 800,
                    success(result) {
                        const url = URL.createObjectURL(result);
                        document.getElementById('imageResult').innerHTML = `
                            <p>${i18next.t('compressedImage', 'Compressed image')}: ${(result.size / 1024).toFixed(2)} KB</p>
                            <img src="${url}" alt="${i18next.t('compressedImage', 'Compressed image')}" style="max-width: 100%;">
                            <a href="${url}" download="compressed_image_${Date.now()}.jpg">${i18next.t('download', 'Download')}</a>
                        `;
                        saveToHistory('image-compressor', { originalSize: (file.size / 1024).toFixed(2), compressedSize: (result.size / 1024).toFixed(2) });
                        showToast(i18next.t('compressImage', 'Image compressed!'), 'success');
                    },
                    error(err) {
                        showError(elements.imageInput, 'imageError', i18next.t('error.compressFailed', 'Failed to compress image!'));
                    }
                });
            }
        );
    }

    function calculateBMI(button) {
        processTool(button, 'bmiLoading', 'bmiResult',
            () => {
                const weight = parseFloat(elements.weight.value);
                const height = parseFloat(elements.height.value);
                if (isNaN(weight) || weight <= 0) return validateInput(elements.weight.value, 'number', elements.weight, 'bmiError');
                if (isNaN(height) || height <= 0) return validateInput(elements.height.value, 'number', elements.height, 'bmiError');
                return { isValid: true, input: elements.weight, errorId: 'bmiError' };
            },
            () => {
                const weight = parseFloat(elements.weight.value);
                const height = parseFloat(elements.height.value);
                const bmi = weight / ((height / 100) ** 2);
                let status = i18next.t('bmi.underweight', 'Underweight');
                if (bmi >= 18.5 && bmi < 25) status = i18next.t('bmi.normal', 'Normal');
                else if (bmi < 30) status = i18next.t('bmi.overweight', 'Overweight');
                else status = i18next.t('bmi.obese', 'Obese');
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
                showToast(i18next.t('calculateBMI', 'BMI calculated!'), 'success');
            }
        );
    }

    function convertArea(button) {
        processTool(button, 'areaLoading', 'areaResult',
            () => validateInput(elements.areaValue.value, 'number', elements.areaValue, 'areaError'),
            () => {
                const value = parseFloat(elements.areaValue.value);
                const fromUnit = elements.areaFrom.value;
                const toUnit = elements.areaTo.value;
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
                showToast(i18next.t('convertArea', 'Converted!'), 'success');
            }
        );
    }

    // Event Listeners
    function setupEventListeners() {
        const actions = {
            showHome,
            showHistory,
            clearHistory,
            openContactModal,
            closeContactModal,
            summarizeText: (e) => summarizeText(e.target),
            convertLength: (e) => convertLength(e.target),
            calculate: (e) => calculate(e.target),
            generatePassword: (e) => generatePassword(e.target),
            copyPassword,
            countChars: (e) => countChars(e.target),
            checkURL: (e) => checkURL(e.target),
            convertTemp: (e) => convertTemp(e.target),
            convertCurrency: (e) => convertCurrency(e.target),
            generateQR: (e) => generateQR(e.target),
            compressImage: (e) => compressImage(e.target),
            calculateBMI: (e) => calculateBMI(e.target),
            convertArea: (e) => convertArea(e.target),
            searchTools
        };

        document.querySelectorAll('[data-action], [data-tool]').forEach(element => {
            element.addEventListener('click', () => {
                const action = element.dataset.action;
                const tool = element.dataset.tool;
                if (action && actions[action]) {
                    actions[action]();
                } else if (tool) {
                    showTool(tool);
                }
            });
        });

        elements.darkModeToggle.addEventListener('click', toggleDarkMode);
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchTools();
        });
    }

    // Initialize
    initDarkMode();
    initLanguage();
    setupEventListeners();
});
