document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded successfully.');

    // API Keys (Replace with your own or use environment variables)
    const EXCHANGE_RATE_API_KEY = 'YOUR_EXCHANGERATE_API_KEY'; // Get from exchangerate-api.com
    const GOOGLE_SAFE_BROWSING_KEY = 'YOUR_GOOGLE_SAFE_BROWSING_KEY'; // Get from Google Cloud
    const GROK_API_KEY = 'YOUR_GROK_API_KEY'; // Get from xAI

    // Cache DOM elements for performance
    const elements = {
        darkModeToggle: document.getElementById('darkModeToggle'),
        languageSelector: document.getElementById('languageSelector'),
        contactModal: document.getElementById('contactModal'),
        toast: document.getElementById('toast'),
        hero: document.getElementById('hero'),
        searchInput: document.getElementById('searchInput'),
        textInput: document.getElementById('textInput'),
        summaryLength: document.getElementById('summaryLength'),
        textError: document.getElementById('textError'),
        textResult: document.getElementById('textResult'),
        textLoading: document.getElementById('textLoading'),
        lengthValue: document.getElementById('lengthValue'),
        lengthFrom: document.getElementById('lengthFrom'),
        lengthTo: document.getElementById('lengthTo'),
        lengthError: document.getElementById('lengthError'),
        lengthResult: document.getElementById('lengthResult'),
        lengthLoading: document.getElementById('lengthLoading'),
        num1: document.getElementById('num1'),
        operator: document.getElementById('operator'),
        num2: document.getElementById('num2'),
        calcError: document.getElementById('calcError'),
        calcResult: document.getElementById('calcResult'),
        calcLoading: document.getElementById('calcLoading'),
        passLength: document.getElementById('passLength'),
        includeUppercase: document.getElementById('includeUppercase'),
        includeLowercase: document.getElementById('includeLowercase'),
        includeNumbers: document.getElementById('includeNumbers'),
        includeSymbols: document.getElementById('includeSymbols'),
        passError: document.getElementById('passError'),
        passResult: document.getElementById('passResult'),
        passLoading: document.getElementById('passLoading'),
        charInput: document.getElementById('charInput'),
        charError: document.getElementById('charError'),
        charResult: document.getElementById('charResult'),
        charLoading: document.getElementById('charLoading'),
        urlInput: document.getElementById('urlInput'),
        urlError: document.getElementById('urlError'),
        urlResult: document.getElementById('urlResult'),
        urlLoading: document.getElementById('urlLoading'),
        tempValue: document.getElementById('tempValue'),
        tempFrom: document.getElementById('tempFrom'),
        tempTo: document.getElementById('tempTo'),
        tempError: document.getElementById('tempError'),
        tempResult: document.getElementById('tempResult'),
        tempLoading: document.getElementById('tempLoading'),
        currencyValue: document.getElementById('currencyValue'),
        currencyFrom: document.getElementById('currencyFrom'),
        currencyTo: document.getElementById('currencyTo'),
        currencyError: document.getElementById('currencyError'),
        currencyResult: document.getElementById('currencyResult'),
        currencyLoading: document.getElementById('currencyLoading'),
        qrInput: document.getElementById('qrInput'),
        qrError: document.getElementById('qrError'),
        qrResult: document.getElementById('qrResult'),
        qrLoading: document.getElementById('qrLoading'),
        imageInput: document.getElementById('imageInput'),
        imageError: document.getElementById('imageError'),
        imageResult: document.getElementById('imageResult'),
        imageLoading: document.getElementById('imageLoading'),
        weight: document.getElementById('weight'),
        height: document.getElementById('height'),
        bmiError: document.getElementById('bmiError'),
        bmiResult: document.getElementById('bmiResult'),
        bmiLoading: document.getElementById('bmiLoading'),
        areaValue: document.getElementById('areaValue'),
        areaFrom: document.getElementById('areaFrom'),
        areaTo: document.getElementById('areaTo'),
        areaError: document.getElementById('areaError'),
        areaResult: document.getElementById('areaResult'),
        areaLoading: document.getElementById('areaLoading'),
        historyResult: document.getElementById('historyResult'),
        historyStats: document.getElementById('historyStats')
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
        console.log('Toggling dark mode...');
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
        console.log('Opening contact modal...');
        if (!elements.contactModal) return;
        elements.contactModal.classList.add('active', 'animate__animated', 'animate__fadeIn');
    }

    function closeContactModal() {
        console.log('Closing contact modal...');
        if (!elements.contactModal) return;
        elements.contactModal.classList.remove('active');
    }

    function showHome() {
        console.log('Showing home...');
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
        console.log(`Showing tool: ${toolId}`);
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
        console.log('Showing history...');
        showTool('history');
        if (!elements.historyResult || !elements.historyStats) return;
        const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');

        // Calculate statistics
        const stats = {};
        history.forEach(item => {
            stats[item.toolId] = (stats[item.toolId] || 0) + 1;
        });

        // Display statistics
        elements.historyStats.innerHTML = `
            <div class="history-stats">
                <h4 data-i18n="usageStats">${i18next.t('usageStats', 'Usage Statistics')}</h4>
                <ul>
                    ${Object.entries(stats).map(([toolId, count]) => `
                        <li>${i18next.t(toolId, toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))}: ${count} ${i18next.t('times', 'times')}</li>
                    `).join('')}
                </ul>
            </div>
        `;

        // Display history
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
        console.log('Clearing history...');
        localStorage.removeItem('toolHistory');
        showHistory();
        showToast(i18next.t('historyCleared', 'History cleared!'), 'success');
    }

    function exportJSON() {
        console.log('Exporting history as JSON...');
        const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'toolhub_history.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast(i18next.t('exportJSON', 'Export JSON') + ' ' + i18next.t('result', 'Result'), 'success');
    }

    function exportPDF() {
        console.log('Exporting history as PDF...');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');

        doc.setFontSize(16);
        doc.text(i18next.t('history', 'History'), 10, 10);
        let y = 20;
        history.forEach((item, index) => {
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${i18next.t(item.toolId, item.toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))} (${item.timestamp})`, 10, y);
            y += 10;
            doc.setFontSize(10);
            const resultText = JSON.stringify(item.result, null, 2).split('\n');
            resultText.forEach(line => {
                doc.text(line, 10, y);
                y += 5;
            });
            y += 5;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });

        doc.save('toolhub_history.pdf');
        showToast(i18next.t('exportPDF', 'Export PDF') + ' ' + i18next.t('result', 'Result'), 'success');
    }

    function searchTools() {
        console.log('Searching tools...');
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
        console.log('Initializing language...');
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
                        summarizeDesc: 'Condense long content into a concise summary using AI.',
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
                        areaConverterDesc: 'Convert between square meters, kilometers, hectares, square feet, and mau.',
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
                        celsius: 'Celsius (°C)',
                        fahrenheit: 'Fahrenheit (°F)',
                        kelvin: 'Kelvin (K)',
                        m2: 'Square Meter (m²)',
                        km2: 'Square Kilometer (km²)',
                        ha: 'Hectare (ha)',
                        ft2: 'Square Foot (ft²)',
                        mau: 'Mau (mẫu)',
                        creator: 'Creator',
                        dob: 'Date of Birth',
                        email: 'Email',
                        phone: 'Phone',
                        close: 'Close',
                        usageStats: 'Usage Statistics',
                        times: 'times',
                        exportJSON: 'Export JSON',
                        exportPDF: 'Export PDF',
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
                            compressFailed: 'Failed to compress image!',
                            summarizeFailed: 'Failed to summarize text!'
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
                        searchPlaceholder: 'Search tools...',
                        clearHistory: 'Clear History',
                        weight: 'Weight (kg)',
                        height: 'Height (cm)',
                        status: 'Status',
                        createdBy: 'Created by'
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
                        summarizeDesc: 'Tóm tắt nội dung dài thành một bản ngắn gọn bằng AI.',
                        lengthConverterDesc: 'Chuyển đổi độ dài giữa mét, kilômét, centimeters, inch, feet và yard.',
                        calculatorDesc: 'Thực hiện các phép tính cơ bản: cộng, trừ, nhân, chia.',
                        passwordGeneratorDesc: 'Tạo mật khẩu ngẫu nhiên an toàn với độ dài và loại ký tự tùy chỉnh.',
                        charCounterDesc: 'Đếm số ký tự và từ trong văn bản của bạn.',
                        urlCheckerDesc: 'Kiểm tra xem URL có hợp lệ và an toàn hay không.',
                        tempConverterDesc: 'Chuyển đổi giữa độ C, độ F và Kelvin.',
                        currencyConverterDesc: 'Chuyển đổi giữa các loại tiền tệ với tỷ giá thời gian thực.',
                        qrGeneratorDesc: 'Tạo mã QR cho URL hoặc văn bản.',
                        imageCompressorDesc: 'Nén ảnh để giảm kích thước tệp.',
                        bmiCalculatorDesc: 'Tính chỉ số khối cơ thể (BMI) của bạn.',
                        areaConverterDesc: 'Chuyển đổi giữa mét vuông, kilômét vuông, hecta, feet vuông và mẫu.',
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
                        celsius: 'Độ C (°C)',
                        fahrenheit: 'Độ F (°F)',
                        kelvin: 'Kelvin (K)',
                        m2: 'Mét vuông (m²)',
                        km2: 'Kilômét vuông (km²)',
                        ha: 'Hecta (ha)',
                        ft2: 'Feet vuông (ft²)',
                        mau: 'Mẫu (mẫu)',
                        creator: 'Tác giả',
                        dob: 'Ngày sinh',
                        email: 'Email',
                        phone: 'Số điện thoại',
                        close: 'Đóng',
                        usageStats: 'Thống kê sử dụng',
                        times: 'lần',
                        exportJSON: 'Xuất JSON',
                        exportPDF: 'Xuất PDF',
                        error: {
                            emptyText: 'Vui lòng nhập văn bản hợp lệ!',
                            invalidNumber: 'Vui lòng nhập số dương hợp lệ!',
                            invalidUrl: 'Vui lòng nhập URL hợp lệ!',
                            textTooLong: 'Văn bản quá dài (tối đa 10,000 ký tự)!',
                            invalidLength: 'Độ dài phải từ 8 đến 32!',
                            selectCharacterType: 'Vui lòng chọn ít nhất một loại ký tự!',
                            divideByZero: 'Không thể chia cho 0!',
                            noImage: 'Vui lòng chọn một hình ảnh!',
                            invalidImage: 'Định dạng hình ảnh không hợp lệ!',
                            apiFailed: 'Không thể lấy tỷ giá hối đoái.',
                            apiError: 'Lỗi kết nối API.',
                            unsafeUrl: 'Phát hiện URL không an toàn!',
                            qrFailed: 'Không thể tạo mã QR!',
                            compressFailed: 'Không thể nén hình ảnh!',
                            summarizeFailed: 'Không thể tóm tắt văn bản!'
                        },
                        summarizeText: 'Tóm tắt',
                        convertLength: 'Chuyển đổi',
                        calculate: 'Tính toán',
                        generatePassword: 'Tạo',
                        copyPassword: 'Sao chép',
                        countChars: 'Đếm',
                        checkURL: 'Kiểm tra',
                        convertTemp: 'Chuyển đổi',
                        convertCurrency: 'Chuyển đổi',
                        generateQR: 'Tạo mã QR',
                        compressImage: 'Nén',
                        calculateBMI: 'Tính BMI',
                        convertArea: 'Chuyển đổi',
                        searchTools: 'Tìm kiếm',
                        noHistory: 'Không có lịch sử.',
                        historyCleared: 'Đã xóa lịch sử!',
                        noToolsFound: 'Không tìm thấy công cụ!',
                        originalValue: 'Giá trị gốc',
                        originalUnit: 'Đơn vị gốc',
                        convertedValue: 'Giá trị chuyển đổi',
                        targetUnit: 'Đơn vị đích',
                        result: 'Kết quả',
                        characters: 'Ký tự',
                        words: 'Từ',
                        validUrl: 'URL hợp lệ',
                        compressedImage: 'Hình ảnh đã nén',
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
                        searchPlaceholder: 'Tìm kiếm công cụ...',
                        clearHistory: 'Xóa lịch sử',
                        weight: 'Cân nặng (kg)',
                        height: 'Chiều cao (cm)',
                        status: 'Trạng thái',
                        createdBy: 'Tạo bởi'
                    }
                },
                ja: {
                    translation: {
                        title: 'ToolHub - 多機能ツールハブ',
                        home: 'ホーム',
                        history: '履歴',
                        contact: '連絡先',
                        summarize: 'テキスト要約',
                        'length-converter': '長さ変換',
                        calculator: '電卓',
                        'password-generator': 'パスワード生成',
                        'char-counter': '文字数カウント',
                        'url-checker': 'URLチェッカー',
                        'temp-converter': '温度変換',
                        'currency-converter': '通貨変換',
                        'qr-generator': 'QRコード生成',
                        'image-compressor': '画像圧縮',
                        'bmi-calculator': 'BMI計算',
                        'area-converter': '面積変換',
                        welcome: 'ToolHubへようこそ',
                        description: 'テキストの要約、単位変換、QRコード生成など、すべて無料で簡単に使用できます。',
                        summarizeDesc: '長いコンテンツをAIを使用して簡潔な要約にします。',
                        lengthConverterDesc: 'メートル、キロメートル、センチメートル、インチ、フィート、ヤード間で長さを変換します。',
                        calculatorDesc: '基本的な計算（加算、減算、乗算、除算）を実行します。',
                        passwordGeneratorDesc: 'カスタマイズ可能な長さと文字タイプで安全なランダムパスワードを生成します。',
                        charCounterDesc: 'テキストの文字数と単語数をカウントします。',
                        urlCheckerDesc: 'URLが有効かつ安全かどうかを確認します。',
                        tempConverterDesc: '摂氏、華氏、ケルビン間で変換します。',
                        currencyConverterDesc: 'リアルタイムの為替レートを使用して通貨を変換します。',
                        qrGeneratorDesc: 'URLまたはテキスト用のQRコードを生成します。',
                        imageCompressorDesc: '画像を圧縮してファイルサイズを縮小します。',
                        bmiCalculatorDesc: '体格指数（BMI）を計算します。',
                        areaConverterDesc: '平方メートル、平方キロメートル、ヘクタール、平方フィート、畝間で面積を変換します。',
                        short: '短い (~20%)',
                        medium: '中 (~30%)',
                        long: '長い (~40%)',
                        meter: 'メートル (m)',
                        kilometer: 'キロメートル (km)',
                        centimeter: 'センチメートル (cm)',
                        inch: 'インチ (in)',
                        foot: 'フィート (ft)',
                        yard: 'ヤード (yd)',
                        add: '加算 (+)',
                        subtract: '減算 (-)',
                        multiply: '乗算 (*)',
                        divide: '除算 (/)',
                        uppercase: '大文字 (A-Z)',
                        lowercase: '小文字 (a-z)',
                        numbers: '数字 (0-9)',
                        symbols: '記号 (!@#$%)',
                        celsius: '摂氏 (°C)',
                        fahrenheit: '華氏 (°F)',
                        kelvin: 'ケルビン (K)',
                        m2: '平方メートル (m²)',
                        km2: '平方キロメートル (km²)',
                        ha: 'ヘクタール (ha)',
                        ft2: '平方フィート (ft²)',
                        mau: '畝 (mẫu)',
                        creator: '作成者',
                        dob: '生年月日',
                        email: 'メール',
                        phone: '電話番号',
                        close: '閉じる',
                        usageStats: '使用統計',
                        times: '回',
                        exportJSON: 'JSONにエクスポート',
                        exportPDF: 'PDFにエクスポート',
                        error: {
                            emptyText: '有効なテキストを入力してください！',
                            invalidNumber: '有効な正の数を入力してください！',
                            invalidUrl: '有効なURLを入力してください！',
                            textTooLong: 'テキストが長すぎます（最大10,000文字）！',
                            invalidLength: '長さは8から32の間でなければなりません！',
                            selectCharacterType: '少なくとも1つの文字タイプを選択してください！',
                            divideByZero: 'ゼロで割ることはできません！',
                            noImage: '画像を選択してください！',
                            invalidImage: '無効な画像形式です！',
                            apiFailed: '為替レートの取得に失敗しました。',
                            apiError: 'API接続エラー。',
                            unsafeUrl: '安全でないURLが検出されました！',
                            qrFailed: 'QRコードの生成に失敗しました！',
                            compressFailed: '画像の圧縮に失敗しました！',
                            summarizeFailed: 'テキストの要約に失敗しました！'
                        },
                        summarizeText: '要約',
                        convertLength: '変換',
                        calculate: '計算',
                        generatePassword: '生成',
                        copyPassword: 'コピー',
                        countChars: 'カウント',
                        checkURL: 'チェック',
                        convertTemp: '変換',
                        convertCurrency: '変換',
                        generateQR: 'QRコード生成',
                        compressImage: '圧縮',
                        calculateBMI: 'BMI計算',
                        convertArea: '変換',
                        searchTools: '検索',
                        noHistory: '履歴がありません。',
                        historyCleared: '履歴がクリアされました！',
                        noToolsFound: 'ツールが見つかりません！',
                        originalValue: '元の値',
                        originalUnit: '元の単位',
                        convertedValue: '変換後の値',
                        targetUnit: '目標単位',
                        result: '結果',
                        characters: '文字数',
                        words: '単語数',
                        validUrl: '有効なURL',
                        compressedImage: '圧縮された画像',
                        download: 'ダウンロード',
                        bmi: {
                            underweight: '低体重',
                            normal: '正常',
                            overweight: '過体重',
                            obese: '肥満'
                        },
                        textInputPlaceholder: '要約するテキストを入力...',
                        valuePlaceholder: '値を入力',
                        firstNumberPlaceholder: '最初の数',
                        secondNumberPlaceholder: '2番目の数',
                        passLengthPlaceholder: 'パスワードの長さ (8-32)',
                        charInputPlaceholder: 'テキストを入力...',
                        urlInputPlaceholder: 'URLを入力...',
                        searchPlaceholder: 'ツールを検索...',
                        clearHistory: '履歴をクリア',
                        weight: '体重 (kg)',
                        height: '身長 (cm)',
                        status: '状態',
                        createdBy: '作成者'
                    }
                }
            }
        }, () => {
            updateLanguage();
            elements.languageSelector.value = i18next.language;
        });

        elements.languageSelector.addEventListener('change', () => {
            const newLang = elements.languageSelector.value;
            i18next.changeLanguage(newLang, () => {
                localStorage.setItem('language', newLang);
                updateLanguage();
                showHistory();
            });
        });

        function updateLanguage() {
            document.querySelectorAll('[data-i18n]').forEach(elem => {
                const key = elem.getAttribute('data-i18n');
                elem.textContent = i18next.t(key);
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-placeholder');
                elem.placeholder = i18next.t(key);
            });
            document.title = i18next.t('title');
        }
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
            searchTools();
        }
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            toggleDarkMode();
        }
    });

    // Tool Functions
    async function summarizeText() {
        console.log('Summarizing text...');
        const button = document.querySelector('[data-action="summarizeText"]');
        processTool(button, 'textLoading', 'textResult', () => {
            const text = elements.textInput.value.trim();
            const length = elements.summaryLength.value;
            if (text.length > 10000) {
                return {
                    isValid: false,
                    input: elements.textInput,
                    errorId: 'textError',
                    message: i18next.t('error.textTooLong', 'Text is too long (max 10,000 characters)!')
                };
            }
            return validateInput(text, 'text', elements.textInput, 'textError');
        }, async () => {
            try {
                elements.textLoading.style.display = 'block';
                const response = await fetch('https://api.x.ai/grok/summarize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROK_API_KEY}`
                    },
                    body: JSON.stringify({
                        text: elements.textInput.value,
                        length: elements.summaryLength.value
                    })
                });
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                const summary = data.summary || i18next.t('error.summarizeFailed', 'Failed to summarize text!');
                document.getElementById('summaryOutput').textContent = summary;
                saveToHistory('summarize', { input: elements.textInput.value, length, output: summary });
                saveToolState('summarize', { textInput: elements.textInput.value, summaryLength: length });
                showToast(i18next.t('summarizeText', 'Summarize') + ' ' + i18next.t('result', 'Result'), 'success');
            } catch (error) {
                console.error('Summarize error:', error);
                showError(elements.textInput, 'textError', i18next.t('error.summarizeFailed', 'Failed to summarize text!'));
            } finally {
                elements.textLoading.style.display = 'none';
            }
        });
    }

    function convertLength() {
        console.log('Converting length...');
        const button = document.querySelector('[data-action="convertLength"]');
        processTool(button, 'lengthLoading', 'lengthResult', () => {
            return validateInput(elements.lengthValue.value, 'number', elements.lengthValue, 'lengthError');
        }, () => {
            const value = parseFloat(elements.lengthValue.value);
            const fromUnit = elements.lengthFrom.value;
            const toUnit = elements.lengthTo.value;
            const conversions = {
                m: 1,
                km: 1000,
                cm: 0.01,
                inch: 0.0254,
                foot: 0.3048,
                yard: 0.9144
            };
            const result = (value * conversions[fromUnit]) / conversions[toUnit];
            const outputTable = document.getElementById('lengthOutput').querySelector('tbody');
            outputTable.innerHTML = `
                <tr>
                    <td>${value.toFixed(2)}</td>
                    <td>${i18next.t(fromUnit)}</td>
                    <td>${result.toFixed(2)}</td>
                    <td>${i18next.t(toUnit)}</td>
                </tr>
            `;
            saveToHistory('length-converter', { value, fromUnit, toUnit, result });
            saveToolState('length-converter', {
                lengthValue: value,
                lengthFrom: fromUnit,
                lengthTo: toUnit
            });
            showToast(i18next.t('convertLength', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    function calculate() {
        console.log('Calculating...');
        const button = document.querySelector('[data-action="calculate"]');
        processTool(button, 'calcLoading', 'calcResult', () => {
            const num1 = parseFloat(elements.num1.value);
            const num2 = parseFloat(elements.num2.value);
            if (isNaN(num1) || isNaN(num2)) {
                return {
                    isValid: false,
                    input: elements.num1,
                    errorId: 'calcError',
                    message: i18next.t('error.invalidNumber', 'Please enter a valid positive number!')
                };
            }
            if (elements.operator.value === '/' && num2 === 0) {
                return {
                    isValid: false,
                    input: elements.num2,
                    errorId: 'calcError',
                    message: i18next.t('error.divideByZero', 'Cannot divide by zero!')
                };
            }
            return { isValid: true, input: elements.num1, errorId: 'calcError' };
        }, () => {
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
            document.getElementById('calcOutput').textContent = `${num1} ${operator} ${num2} = ${result.toFixed(2)}`;
            saveToHistory('calculator', { num1, operator, num2, result });
            saveToolState('calculator', {
                num1: elements.num1.value,
                operator: operator,
                num2: elements.num2.value
            });
            showToast(i18next.t('calculate', 'Calculate') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    function generatePassword() {
        console.log('Generating password...');
        const button = document.querySelector('[data-action="generatePassword"]');
        processTool(button, 'passLoading', 'passResult', () => {
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
        }, () => {
            const length = parseInt(elements.passLength.value);
            const chars = [
                elements.includeUppercase.checked ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
                elements.includeLowercase.checked ? 'abcdefghijklmnopqrstuvwxyz' : '',
                elements.includeNumbers.checked ? '0123456789' : '',
                elements.includeSymbols.checked ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : ''
            ].join('');
            let password = '';
            for (let i = 0; i < length; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            document.getElementById('passOutput').textContent = password;
            saveToHistory('password-generator', { length, password });
            saveToolState('password-generator', {
                passLength: length,
                includeUppercase: elements.includeUppercase.checked,
                includeLowercase: elements.includeLowercase.checked,
                includeNumbers: elements.includeNumbers.checked,
                includeSymbols: elements.includeSymbols.checked
            });
            showToast(i18next.t('generatePassword', 'Generate') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    function copyPassword() {
        console.log('Copying password...');
        const password = document.getElementById('passOutput').textContent;
        navigator.clipboard.writeText(password).then(() => {
            showToast(i18next.t('copyPassword', 'Copy') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    function countChars() {
        console.log('Counting characters...');
        const button = document.querySelector('[data-action="countChars"]');
        processTool(button, 'charLoading', 'charResult', () => {
            return validateInput(elements.charInput.value, 'text', elements.charInput, 'charError');
        }, () => {
            const text = elements.charInput.value;
            const charCount = text.length;
            const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
            document.getElementById('charOutput').innerHTML = `
                ${i18next.t('characters', 'Characters')}: ${charCount}<br>
                ${i18next.t('words', 'Words')}: ${wordCount}
            `;
            saveToHistory('char-counter', { text, charCount, wordCount });
            saveToolState('char-counter', { charInput: text });
            showToast(i18next.t('countChars', 'Count') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    async function checkURL() {
        console.log('Checking URL...');
        const button = document.querySelector('[data-action="checkURL"]');
        processTool(button, 'urlLoading', 'urlResult', () => {
            return validateInput(elements.urlInput.value, 'url', elements.urlInput, 'urlError');
        }, async () => {
            try {
                const url = elements.urlInput.value;
                const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client: { clientId: 'toolhub', clientVersion: '1.0.0' },
                        threatInfo: {
                            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
                            platformTypes: ['ANY_PLATFORM'],
                            threatEntryTypes: ['URL'],
                            threatEntries: [{ url }]
                        }
                    })
                });
                const data = await response.json();
                const isSafe = !data.matches;
                document.getElementById('urlOutput').textContent = isSafe
                    ? i18next.t('validUrl', 'Valid URL')
                    : i18next.t('error.unsafeUrl', 'Unsafe URL detected!');
                saveToHistory('url-checker', { url, isSafe });
                saveToolState('url-checker', { urlInput: url });
                showToast(i18next.t('checkURL', 'Check') + ' ' + i18next.t('result', 'Result'), isSafe ? 'success' : 'error');
            } catch (error) {
                console.error('URL check error:', error);
                showError(elements.urlInput, 'urlError', i18next.t('error.apiError', 'Error connecting to API.'));
            }
        });
    }

    function convertTemp() {
        console.log('Converting temperature...');
        const button = document.querySelector('[data-action="convertTemp"]');
        processTool(button, 'tempLoading', 'tempResult', () => {
            return validateInput(elements.tempValue.value, 'number', elements.tempValue, 'tempError');
        }, () => {
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
            const outputTable = document.getElementById('tempOutput').querySelector('tbody');
            outputTable.innerHTML = `
                <tr>
                    <td>${value.toFixed(2)}</td>
                    <td>${i18next.t(fromUnit)}</td>
                    <td>${result.toFixed(2)}</td>
                    <td>${i18next.t(toUnit)}</td>
                </tr>
            `;
            saveToHistory('temp-converter', { value, fromUnit, toUnit, result });
            saveToolState('temp-converter', {
                tempValue: value,
                tempFrom: fromUnit,
                tempTo: toUnit
            });
            showToast(i18next.t('convertTemp', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    async function convertCurrency() {
        console.log('Converting currency...');
        const button = document.querySelector('[data-action="convertCurrency"]');
        processTool(button, 'currencyLoading', 'currencyResult', () => {
            return validateInput(elements.currencyValue.value, 'number', elements.currencyValue, 'currencyError');
        }, async () => {
            try {
                const value = parseFloat(elements.currencyValue.value);
                const fromCurrency = elements.currencyFrom.value;
                const toCurrency = elements.currencyTo.value;
                const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${fromCurrency}`);
                const data = await response.json();
                if (data.result !== 'success') throw new Error('API Error');
                const rate = data.conversion_rates[toCurrency];
                const result = value * rate;
                const outputTable = document.getElementById('currencyOutput').querySelector('tbody');
                outputTable.innerHTML = `
                    <tr>
                        <td>${value.toFixed(2)}</td>
                        <td>${fromCurrency}</td>
                        <td>${result.toFixed(2)}</td>
                        <td>${toCurrency}</td>
                    </tr>
                `;
                saveToHistory('currency-converter', { value, fromCurrency, toCurrency, result });
                saveToolState('currency-converter', {
                    currencyValue: value,
                    currencyFrom: fromCurrency,
                    currencyTo: toCurrency
                });
                showToast(i18next.t('convertCurrency', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
            } catch (error) {
                console.error('Currency conversion error:', error);
                showError(elements.currencyValue, 'currencyError', i18next.t('error.apiFailed', 'Failed to fetch exchange rate.'));
            }
        });
    }

    function generateQR() {
        console.log('Generating QR code...');
        const button = document.querySelector('[data-action="generateQR"]');
        processTool(button, 'qrLoading', 'qrResult', () => {
            return validateInput(elements.qrInput.value, 'text', elements.qrInput, 'qrError');
        }, () => {
            try {
                const text = elements.qrInput.value;
                document.getElementById('qrOutput').src = '';
                QRCode.toDataURL(text, { width: 200, margin: 2 }, (err, url) => {
                    if (err) {
                        console.error('QR code error:', err);
                        showError(elements.qrInput, 'qrError', i18next.t('error.qrFailed', 'Failed to generate QR code!'));
                        return;
                    }
                    document.getElementById('qrOutput').src = url;
                    saveToHistory('qr-generator', { text, qrUrl: url });
                    saveToolState('qr-generator', { qrInput: text });
                    showToast(i18next.t('generateQR', 'Generate QR') + ' ' + i18next.t('result', 'Result'), 'success');
                });
            } catch (error) {
                console.error('QR code error:', error);
                showError(elements.qrInput, 'qrError', i18next.t('error.qrFailed', 'Failed to generate QR code!'));
            }
        });
    }

    function compressImage() {
        console.log('Compressing image...');
        const button = document.querySelector('[data-action="compressImage"]');
        processTool(button, 'imageLoading', 'imageResult', () => {
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
        }, () => {
            const file = elements.imageInput.files[0];
            new Compressor(file, {
                quality: 0.6,
                maxWidth: 800,
                success(result) {
                    const url = URL.createObjectURL(result);
                    elements.imageResult.innerHTML = `
                        <p>${i18next.t('compressedImage', 'Compressed image')}:</p>
                        <img src="${url}" alt="Compressed Image" style="max-width: 100%;">
                        <a href="${url}" download="${file.name.split('.')[0]}_compressed.jpg">${i18next.t('download', 'Download')}</a>
                    `;
                    saveToHistory('image-compressor', { originalSize: file.size, compressedSize: result.size });
                    showToast(i18next.t('compressImage', 'Compress') + ' ' + i18next.t('result', 'Result'), 'success');
                },
                error(err) {
                    console.error('Image compression error:', err);
                    showError(elements.imageInput, 'imageError', i18next.t('error.compressFailed', 'Failed to compress image!'));
                }
            });
        });
    }

    function calculateBMI() {
        console.log('Calculating BMI...');
        const button = document.querySelector('[data-action="calculateBMI"]');
        processTool(button, 'bmiLoading', 'bmiResult', () => {
            const weight = parseFloat(elements.weight.value);
            const height = parseFloat(elements.height.value);
            if (isNaN(weight) || weight <= 0) {
                return {
                    isValid: false,
                    input: elements.weight,
                    errorId: 'bmiError',
                    message: i18next.t('error.invalidNumber', 'Please enter a valid positive number!')
                };
            }
            if (isNaN(height) || height <= 0) {
                return {
                    isValid: false,
                    input: elements.height,
                    errorId: 'bmiError',
                    message: i18next.t('error.invalidNumber', 'Please enter a valid positive number!')
                };
            }
            return { isValid: true, input: elements.weight, errorId: 'bmiError' };
        }, () => {
            const weight = parseFloat(elements.weight.value);
            const height = parseFloat(elements.height.value) / 100;
            const bmi = weight / (height * height);
            let status;
            if (bmi < 18.5) status = i18next.t('bmi.underweight', 'Underweight');
            else if (bmi < 25) status = i18next.t('bmi.normal', 'Normal');
            else if (bmi < 30) status = i18next.t('bmi.overweight', 'Overweight');
            else status = i18next.t('bmi.obese', 'Obese');
            const outputTable = document.getElementById('bmiOutput').querySelector('tbody');
            outputTable.innerHTML = `
                <tr>
                    <td>${weight.toFixed(2)}</td>
                    <td>${height * 100}</td>
                    <td>${bmi.toFixed(2)}</td>
                    <td>${status}</td>
                </tr>
            `;
            saveToHistory('bmi-calculator', { weight, height, bmi, status });
            saveToolState('bmi-calculator', {
                weight: elements.weight.value,
                height: elements.height.value
            });
            showToast(i18next.t('calculateBMI', 'Calculate BMI') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    function convertArea() {
        console.log('Converting area...');
        const button = document.querySelector('[data-action="convertArea"]');
        processTool(button, 'areaLoading', 'areaResult', () => {
            return validateInput(elements.areaValue.value, 'number', elements.areaValue, 'areaError');
        }, () => {
            const value = parseFloat(elements.areaValue.value);
            const fromUnit = elements.areaFrom.value;
            const toUnit = elements.areaTo.value;
            const conversions = {
                m2: 1,
                km2: 1000000,
                ha: 10000,
                ft2: 0.092903,
                mau: 3600 // 1 mẫu = 3600 m²
            };
            const result = (value * conversions[fromUnit]) / conversions[toUnit];
            const outputTable = document.getElementById('areaOutput').querySelector('tbody');
            outputTable.innerHTML = `
                <tr>
                    <td>${value.toFixed(2)}</td>
                    <td>${i18next.t(fromUnit)}</td>
                    <td>${result.toFixed(2)}</td>
                    <td>${i18next.t(toUnit)}</td>
                </tr>
            `;
            saveToHistory('area-converter', { value, fromUnit, toUnit, result });
            saveToolState('area-converter', {
                areaValue: value,
                areaFrom: fromUnit,
                areaTo: toUnit
            });
            showToast(i18next.t('convertArea', 'Convert') + ' ' + i18next.t('result', 'Result'), 'success');
        });
    }

    // Event Listeners
    document.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const tool = e.target.closest('[data-tool]')?.dataset.tool;
        if (action === 'showHome') showHome();
        else if (action === 'showHistory') showHistory();
        else if (action === 'openContactModal') openContactModal();
        else if (action === 'closeContactModal') closeContactModal();
        else if (action === 'searchTools') searchTools();
        else if (action === 'summarizeText') summarizeText();
        else if (action === 'convertLength') convertLength();
        else if (action === 'calculate') calculate();
        else if (action === 'generatePassword') generatePassword();
        else if (action === 'copyPassword') copyPassword();
        else if (action === 'countChars') countChars();
        else if (action === 'checkURL') checkURL();
        else if (action === 'convertTemp') convertTemp();
        else if (action === 'convertCurrency') convertCurrency();
        else if (action === 'generateQR') generateQR();
        else if (action === 'compressImage') compressImage();
        else if (action === 'calculateBMI') calculateBMI();
        else if (action === 'convertArea') convertArea();
        else if (action === 'clearHistory') clearHistory();
        else if (action === 'exportJSON') exportJSON();
        else if (action === 'exportPDF') exportPDF();
        else if (tool) showTool(tool);
    });

    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    elements.searchInput.addEventListener('input', searchTools);

    // Initialize
    initDarkMode();
    initLanguage();
    showHome();

    // Check for QRCode and Compressor libraries
    if (!window.QRCode) console.error('QRCode library not loaded!');
    if (!window.Compressor) console.error('Compressor library not loaded!');
});
