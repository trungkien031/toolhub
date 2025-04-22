document.addEventListener('DOMContentLoaded', () => {
    // API Keys (Replace with your own)
    const EXCHANGE_RATE_API_KEY = 'YOUR_EXCHANGERATE_API_KEY'; // Get from exchangerate-api.com
    const GOOGLE_SAFE_BROWSING_KEY = 'YOUR_GOOGLE_SAFE_BROWSING_KEY'; // Get from Google Cloud

    // Cache DOM elements for performance
    const elements = {
        textInput: document.getElementById('textInput'),
        summaryLength: document.getElementById('summaryLength'),
        textError: document.getElementById('textError'),
        textResult: document.getElementById('textResult'),
        textLoading: document.getElementById('textLoading'),
        summaryOutput: document.getElementById('summaryOutput'),
        lengthValue: document.getElementById('lengthValue'),
        lengthFrom: document.getElementById('lengthFrom'),
        lengthTo: document.getElementById('lengthTo'),
        lengthError: document.getElementById('lengthError'),
        lengthResult: document.getElementById('lengthResult'),
        lengthLoading: document.getElementById('lengthLoading'),
        lengthOutput: document.getElementById('lengthOutput'),
        num1: document.getElementById('num1'),
        operator: document.getElementById('operator'),
        num2: document.getElementById('num2'),
        calcError: document.getElementById('calcError'),
        calcResult: document.getElementById('calcResult'),
        calcLoading: document.getElementById('calcLoading'),
        calcOutput: document.getElementById('calcOutput'),
        passLength: document.getElementById('passLength'),
        includeUppercase: document.getElementById('includeUppercase'),
        includeLowercase: document.getElementById('includeLowercase'),
        includeNumbers: document.getElementById('includeNumbers'),
        includeSymbols: document.getElementById('includeSymbols'),
        passError: document.getElementById('passError'),
        passResult: document.getElementById('passResult'),
        passLoading: document.getElementById('passLoading'),
        passOutput: document.getElementById('passOutput'),
        charInput: document.getElementById('charInput'),
        charError: document.getElementById('charError'),
        charResult: document.getElementById('charResult'),
        charLoading: document.getElementById('charLoading'),
        charOutput: document.getElementById('charOutput'),
        urlInput: document.getElementById('urlInput'),
        urlError: document.getElementById('urlError'),
        urlResult: document.getElementById('urlResult'),
        urlLoading: document.getElementById('urlLoading'),
        urlOutput: document.getElementById('urlOutput'),
        tempValue: document.getElementById('tempValue'),
        tempFrom: document.getElementById('tempFrom'),
        tempTo: document.getElementById('tempTo'),
        tempError: document.getElementById('tempError'),
        tempResult: document.getElementById('tempResult'),
        tempLoading: document.getElementById('tempLoading'),
        tempOutput: document.getElementById('tempOutput'),
        currencyValue: document.getElementById('currencyValue'),
        currencyFrom: document.getElementById('currencyFrom'),
        currencyTo: document.getElementById('currencyTo'),
        currencyError: document.getElementById('currencyError'),
        currencyResult: document.getElementById('currencyResult'),
        currencyLoading: document.getElementById('currencyLoading'),
        currencyOutput: document.getElementById('currencyOutput'),
        qrInput: document.getElementById('qrInput'),
        qrError: document.getElementById('qrError'),
        qrResult: document.getElementById('qrResult'),
        qrLoading: document.getElementById('qrLoading'),
        qrOutput: document.getElementById('qrOutput'),
        imageInput: document.getElementById('imageInput'),
        imageError: document.getElementById('imageError'),
        imageResult: document.getElementById('imageResult'),
        imageLoading: document.getElementById('imageLoading'),
        weight: document.getElementById('weight'),
        height: document.getElementById('height'),
        bmiError: document.getElementById('bmiError'),
        bmiResult: document.getElementById('bmiResult'),
        bmiLoading: document.getElementById('bmiLoading'),
        bmiOutput: document.getElementById('bmiOutput'),
        areaValue: document.getElementById('areaValue'),
        areaFrom: document.getElementById('areaFrom'),
        areaTo: document.getElementById('areaTo'),
        areaError: document.getElementById('areaError'),
        areaResult: document.getElementById('areaResult'),
        areaLoading: document.getElementById('areaLoading'),
        areaOutput: document.getElementById('areaOutput'),
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
        const icon = elements.darkModeToggle.querySelector('i');
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        document.querySelectorAll('pre').forEach(pre => {
            pre.style.background = isDarkMode ? '#3a3a4e' : '#f5f5f5';
        });
    }

    function initDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            const icon = elements.darkModeToggle.querySelector('i');
            icon.className = 'fas fa-sun';
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
    function summarizeText() {
        const validate = () => {
            const text = elements.textInput.value;
            if (text.length > 10000) {
                return {
                    isValid: false,
                    input: elements.textInput,
                    errorId: 'textError',
                    message: i18next.t('error.textTooLong', 'Text is too long (max 10,000 characters)!')
                };
            }
            return validateInput(text, 'text', elements.textInput, 'textError');
        };

        const process = () => {
            const text = elements.textInput.value;
            const length = elements.summaryLength.value;
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const wordCount = words.length;
            let targetLength;
            switch (length) {
                case 'short': targetLength = Math.round(wordCount * 0.2); break;
                case 'medium': targetLength = Math.round(wordCount * 0.3); break;
                case 'long': targetLength = Math.round(wordCount * 0.4); break;
            }
            const summary = words.slice(0, targetLength).join(' ') + (targetLength < wordCount ? '...' : '');
            elements.summaryOutput.textContent = summary;
            saveToHistory('summarize', { input: text, summary, length });
            saveToolState('summarize', { textInput: text, summaryLength: length });
            showToast(i18next.t('summarizeText', 'Summarize') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="summarizeText"]');
        processTool(button, 'textLoading', 'textResult', validate, process);
    }

    function convertLength() {
        const validate = () => validateInput(elements.lengthValue.value, 'number', elements.lengthValue, 'lengthError');

        const process = () => {
            const value = parseFloat(elements.lengthValue.value);
            const fromUnit = elements.lengthFrom.value;
            const toUnit = elements.lengthTo.value;
            const conversionRates = {
                m: 1,
                km: 0.001,
                cm: 100,
                inch: 39.3701,
                foot: 3.28084,
                yard: 1.09361
            };
            const result = (value * conversionRates[fromUnit]) / conversionRates[toUnit];
            elements.lengthOutput.querySelector('tbody').innerHTML = `
                <tr>
                    <td>${value.toFixed(2)}</td>
                    <td>${i18next.t(fromUnit)}</td>
                    <td>${result.toFixed(2)}</td>
                    <td>${i18next.t(toUnit)}</td>
                </tr>
            `;
            saveToHistory('length-converter', { value, fromUnit, toUnit, result });
            saveToolState('length-converter', { lengthValue: value, lengthFrom: fromUnit, lengthTo: toUnit });
            showToast(i18next.t('convertLength', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="convertLength"]');
        processTool(button, 'lengthLoading', 'lengthResult', validate, process);
    }

    function calculate() {
        const validate = () => {
            const num1 = validateInput(elements.num1.value, 'number', elements.num1, 'calcError');
            if (!num1.isValid) return num1;
            const num2 = validateInput(elements.num2.value, 'number', elements.num2, 'calcError');
            if (!num2.isValid) return num2;
            if (elements.operator.value === '/' && parseFloat(elements.num2.value) === 0) {
                return {
                    isValid: false,
                    input: elements.num2,
                    errorId: 'calcError',
                    message: i18next.t('error.divideByZero', 'Cannot divide by zero!')
                };
            }
            return { isValid: true, input: elements.num1, errorId: 'calcError' };
        };

        const process = () => {
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
            elements.calcOutput.textContent = `${num1} ${operator} ${num2} = ${result.toFixed(2)}`;
            saveToHistory('calculator', { num1, operator, num2, result });
            saveToolState('calculator', { num1: num1, operator, num2: num2 });
            showToast(i18next.t('calculate', 'Calculate') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="calculate"]');
        processTool(button, 'calcLoading', 'calcResult', validate, process);
    }

    function generatePassword() {
        const validate = () => {
            const length = parseInt(elements.passLength.value);
            if (isNaN(length) || length < 8 || length > 32) {
                return {
                    isValid: false,
                    input: elements.passLength,
                    errorId: 'passError',
                    message: i18next.t('error.invalidLength', 'Length must be between 8 and 32!')
                };
            }
            if (!elements.includeUppercase.checked && !elements.includeLowercase.checked &&
                !elements.includeNumbers.checked && !elements.includeSymbols.checked) {
                return {
                    isValid: false,
                    input: elements.passLength,
                    errorId: 'passError',
                    message: i18next.t('error.selectCharacterType', 'Please select at least one character type!')
                };
            }
            return { isValid: true, input: elements.passLength, errorId: 'passError' };
        };

        const process = () => {
            const length = parseInt(elements.passLength.value);
            const chars = [];
            if (elements.includeUppercase.checked) chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
            if (elements.includeLowercase.checked) chars.push('abcdefghijklmnopqrstuvwxyz');
            if (elements.includeNumbers.checked) chars.push('0123456789');
            if (elements.includeSymbols.checked) chars.push('!@#$%^&*()');
            const allChars = chars.join('');
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * allChars.length);
                password += allChars[randomIndex];
            }
            elements.passOutput.textContent = password;
            saveToHistory('password-generator', { password, length });
            saveToolState('password-generator', {
                passLength: length,
                includeUppercase: elements.includeUppercase.checked,
                includeLowercase: elements.includeLowercase.checked,
                includeNumbers: elements.includeNumbers.checked,
                includeSymbols: elements.includeSymbols.checked
            });
            showToast(i18next.t('generatePassword', 'Generate') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="generatePassword"]');
        processTool(button, 'passLoading', 'passResult', validate, process);
    }

    function copyPassword() {
        const password = elements.passOutput.textContent;
        if (password) {
            navigator.clipboard.writeText(password).then(() => {
                showToast(i18next.t('copyPassword', 'Copy') + ' ' + i18next.t('result', 'Result'), 'success');
            }).catch(() => {
                showToast('Failed to copy password!', 'error');
            });
        }
    }

    function countChars() {
        const validate = () => validateInput(elements.charInput.value, 'text', elements.charInput, 'charError');

        const process = () => {
            const text = elements.charInput.value;
            const charCount = text.length;
            const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            elements.charOutput.textContent = `${i18next.t('characters', 'Characters')}: ${charCount}, ${i18next.t('words', 'Words')}: ${wordCount}`;
            saveToHistory('char-counter', { text, charCount, wordCount });
            saveToolState('char-counter', { charInput: text });
            showToast(i18next.t('countChars', 'Count') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="countChars"]');
        processTool(button, 'charLoading', 'charResult', validate, process);
    }

    function checkURL() {
        const validate = () => validateInput(elements.urlInput.value, 'url', elements.urlInput, 'urlError');

        const process = () => {
            const url = elements.urlInput.value;
            fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client: { clientId: 'ToolHub', clientVersion: '1.0.0' },
                    threatInfo: {
                        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
                        platformTypes: ['ANY_PLATFORM'],
                        threatEntryTypes: ['URL'],
                        threatEntries: [{ url }]
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                const isSafe = !data.matches;
                elements.urlOutput.textContent = isSafe ? i18next.t('validUrl', 'Valid URL') : i18next.t('error.unsafeUrl', 'Unsafe URL detected!');
                saveToHistory('url-checker', { url, isSafe });
                saveToolState('url-checker', { urlInput: url });
                showToast(i18next.t('checkURL', 'Check') + ' ' + i18next.t('result', 'Result'), isSafe ? 'success' : 'error');
            })
            .catch(() => {
                showToast(i18next.t('error.apiError', 'Error connecting to API.'), 'error');
            });
        };

        const button = document.querySelector('[data-action="checkURL"]');
        processTool(button, 'urlLoading', 'urlResult', validate, process);
    }

    function convertTemp() {
        const validate = () => validateInput(elements.tempValue.value, 'number', elements.tempValue, 'tempError');

        const process = () => {
            const value = parseFloat(elements.tempValue.value);
            const fromUnit = elements.tempFrom.value;
            const toUnit = elements.tempTo.value;
            let celsius;
            if (fromUnit === 'C') celsius = value;
            else if (fromUnit === 'F') celsius = (value - 32) * 5 / 9;
            else if (fromUnit === 'K') celsius = value - 273.15;
            let result;
            if (toUnit === 'C') result = celsius;
            else if (toUnit === 'F') result = celsius * 9 / 5 + 32;
            else if (toUnit === 'K') result = celsius + 273.15;
            elements.tempOutput.querySelector('tbody').innerHTML = `
                <tr>
                    <td>${value.toFixed(2)}</td>
                    <td>${i18next.t(fromUnit)}</td>
                    <td>${result.toFixed(2)}</td>
                    <td>${i18next.t(toUnit)}</td>
                </tr>
            `;
            saveToHistory('temp-converter', { value, fromUnit, toUnit, result });
            saveToolState('temp-converter', { tempValue: value, tempFrom: fromUnit, tempTo: toUnit });
            showToast(i18next.t('convertTemp', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="convertTemp"]');
        processTool(button, 'tempLoading', 'tempResult', validate, process);
    }

    function convertCurrency() {
        const validate = () => validateInput(elements.currencyValue.value, 'number', elements.currencyValue, 'currencyError');

        const process = () => {
            const value = parseFloat(elements.currencyValue.value);
            const fromCurrency = elements.currencyFrom.value;
            const toCurrency = elements.currencyTo.value;
            fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/${fromCurrency}/${toCurrency}`)
                .then(response => response.json())
                .then(data => {
                    if (data.result !== 'success') {
                        throw new Error(i18next.t('error.apiFailed', 'Failed to fetch exchange rate.'));
                    }
                    const rate = data.conversion_rate;
                    const result = value * rate;
                    elements.currencyOutput.querySelector('tbody').innerHTML = `
                        <tr>
                            <td>${value.toFixed(2)}</td>
                            <td>${fromCurrency}</td>
                            <td>${result.toFixed(2)}</td>
                            <td>${toCurrency}</td>
                        </tr>
                    `;
                    saveToHistory('currency-converter', { value, fromCurrency, toCurrency, result });
                    saveToolState('currency-converter', { currencyValue: value, currencyFrom: fromCurrency, currencyTo: toCurrency });
                    showToast(i18next.t('convertCurrency', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
                })
                .catch(() => {
                    showToast(i18next.t('error.apiError', 'Error connecting to API.'), 'error');
                });
        };

        const button = document.querySelector('[data-action="convertCurrency"]');
        processTool(button, 'currencyLoading', 'currencyResult', validate, process);
    }

    function generateQR() {
        const validate = () => validateInput(elements.qrInput.value, 'text', elements.qrInput, 'qrError');

        const process = () => {
            const text = elements.qrInput.value;
            elements.qrOutput.src = '';
            QRCode.toDataURL(text, { width: 200, margin: 2 }, (err, url) => {
                if (err) {
                    showToast(i18next.t('error.qrFailed', 'Failed to generate QR code!'), 'error');
                    return;
                }
                elements.qrOutput.src = url;
                saveToHistory('qr-generator', { text, qrUrl: url });
                saveToolState('qr-generator', { qrInput: text });
                showToast(i18next.t('generateQR', 'Generate QR') + ' ' + i18next.t('result', 'Result'), 'success');
            });
        };

        const button = document.querySelector('[data-action="generateQR"]');
        processTool(button, 'qrLoading', 'qrResult', validate, process);
    }

    function compressImage() {
        const validate = () => {
            if (!elements.imageInput.files || elements.imageInput.files.length === 0) {
                return {
                    isValid: false,
                    input: elements.imageInput,
                    errorId: 'imageError',
                    message: i18next.t('error.noImage', 'Please select an image!')
                };
            }
            const file = elements.imageInput.files[0];
            if (!file.type.startsWith('image/')) {
                return {
                    isValid: false,
                    input: elements.imageInput,
                    errorId: 'imageError',
                    message: i18next.t('error.invalidImage', 'Invalid image format!')
                };
            }
            return { isValid: true, input: elements.imageInput, errorId: 'imageError' };
        };

        const process = () => {
            const file = elements.imageInput.files[0];
            new Compressor(file, {
                quality: 0.6,
                maxWidth: 1024,
                maxHeight: 1024,
                success(result) {
                    const url = URL.createObjectURL(result);
                    elements.imageResult.innerHTML = `
                        <p>${i18next.t('compressedImage', 'Compressed image')}</p>
                        <img src="${url}" alt="Compressed Image" style="max-width: 100%;">
                        <a href="${url}" download="compressed_${file.name}" class="button">${i18next.t('download', 'Download')}</a>
                    `;
                    saveToHistory('image-compressor', { originalSize: file.size, compressedSize: result.size });
                    showToast(i18next.t('compressImage', 'Compress') + ' ' + i18next.t('result', 'Result'), 'success');
                },
                error() {
                    showToast(i18next.t('error.compressFailed', 'Failed to compress image!'), 'error');
                }
            });
        };

        const button = document.querySelector('[data-action="compressImage"]');
        processTool(button, 'imageLoading', 'imageResult', validate, process);
    }

    function calculateBMI() {
        const validate = () => {
            const weight = validateInput(elements.weight.value, 'number', elements.weight, 'bmiError');
            if (!weight.isValid) return weight;
            return validateInput(elements.height.value, 'number', elements.height, 'bmiError');
        };

        const process = () => {
            const weight = parseFloat(elements.weight.value);
            const height = parseFloat(elements.height.value) / 100; // Convert cm to m
            const bmi = weight / (height * height);
            let status;
            if (bmi < 18.5) status = i18next.t('bmi.underweight', 'Underweight');
            else if (bmi < 25) status = i18next.t('bmi.normal', 'Normal');
            else if (bmi < 30) status = i18next.t('bmi.overweight', 'Overweight');
            else status = i18next.t('bmi.obese', 'Obese');
            elements.bmiOutput.querySelector('tbody').innerHTML = `
                <tr>
                    <td>${weight.toFixed(2)}</td>
                    <td>${(height * 100).toFixed(2)}</td>
                    <td>${bmi.toFixed(2)}</td>
                    <td>${status}</td>
                </tr>
            `;
            saveToHistory('bmi-calculator', { weight, height: height * 100, bmi, status });
            saveToolState('bmi-calculator', { weight, height: height * 100 });
            showToast(i18next.t('calculateBMI', 'Calculate BMI') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="calculateBMI"]');
        processTool(button, 'bmiLoading', 'bmiResult', validate, process);
    }

    function convertArea() {
        const validate = () => validateInput(elements.areaValue.value, 'number', elements.areaValue, 'areaError');

        const process = () => {
            const value = parseFloat(elements.areaValue.value);
            const fromUnit = elements.areaFrom.value;
            const toUnit = elements.areaTo.value;
            const conversionRates = {
                m2: 1,
                km2: 0.000001,
                ha: 0.0001,
                ft2: 10.7639
            };
            const result = (value * conversionRates[fromUnit]) / conversionRates[toUnit];
            elements.areaOutput.querySelector('tbody').innerHTML = `
                <tr>
                    <td>${value.toFixed(2)}</td>
                    <td>${i18next.t(fromUnit)}</td>
                    <td>${result.toFixed(2)}</td>
                    <td>${i18next.t(toUnit)}</td>
                </tr>
            `;
            saveToHistory('area-converter', { value, fromUnit, toUnit, result });
            saveToolState('area-converter', { areaValue: value, areaFrom: fromUnit, areaTo: toUnit });
            showToast(i18next.t('convertArea', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
        };

        const button = document.querySelector('[data-action="convertArea"]');
        processTool(button, 'areaLoading', 'areaResult', validate, process);
    }

    // Event Listeners
    function initEventListeners() {
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;
            switch (action) {
                case 'showHome': showHome(); break;
                case 'showHistory': showHistory(); break;
                case 'openContactModal': openContactModal(); break;
                case 'closeContactModal': closeContactModal(); break;
                case 'summarizeText': summarizeText(); break;
                case 'convertLength': convertLength(); break;
                case 'calculate': calculate(); break;
                case 'generatePassword': generatePassword(); break;
                case 'copyPassword': copyPassword(); break;
                case 'countChars': countChars(); break;
                case 'checkURL': checkURL(); break;
                case 'convertTemp': convertTemp(); break;
                case 'convertCurrency': convertCurrency(); break;
                case 'generateQR': generateQR(); break;
                case 'compressImage': compressImage(); break;
                case 'calculateBMI': calculateBMI(); break;
                case 'convertArea': convertArea(); break;
                case 'clearHistory': clearHistory(); break;
                case 'searchTools': searchTools(); break;
            }
        });

        document.querySelectorAll('.tool-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolId = link.dataset.tool;
                showTool(toolId);
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
    initEventListeners();
});
