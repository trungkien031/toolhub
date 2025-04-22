const EXCHANGE_RATE_API_KEY = 'YOUR_EXCHANGERATE_API_KEY';
const GOOGLE_SAFE_BROWSING_KEY = 'YOUR_GOOGLE_SAFE_BROWSING_KEY';
const GROK_API_KEY = 'YOUR_GROK_API_KEY';

const elements = {
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
    areaLoading: document.getElementById('areaLoading')
};

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
        const outputTable = document.getElementById('lengthOutput');
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
        const outputTable = document.getElementById('tempOutput');
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
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}?apiKey=${EXCHANGE_RATE_API_KEY}`);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            const rate = data.rates[toCurrency];
            const result = value * rate;
            const outputTable = document.getElementById('currencyOutput');
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
        const text = elements.qrInput.value;
        const qrOutput = document.getElementById('qrOutput');
        try {
            qrOutput.src = '';
            QRCode.toDataURL(text, { width: 200, margin: 1 }, (err, url) => {
                if (err) throw err;
                qrOutput.src = url;
                saveToHistory('qr-generator', { text, qrUrl: url });
                saveToolState('qr-generator', { qrInput: text });
                showToast(i18next.t('generateQR', 'Generate QR') + ' ' + i18next.t('result', 'Result'), 'success');
            });
        } catch (error) {
            console.error('QR generation error:', error);
            showError(elements.qrInput, 'qrError', i18next.t('error.qrFailed', 'Failed to generate QR code!'));
        }
    });
}

function compressImage() {
    console.log('Compressing image...');
    const button = document.querySelector('[data-action="compressImage"]');
    processTool(button, 'imageLoading', 'imageResult', () => {
        const file = elements.imageInput.files[0];
        if (!file) {
            return {
                isValid: false,
                input: elements.imageInput,
                errorId: 'imageError',
                message: i18next.t('error.noImage', 'Please select an image!')
            };
        }
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
            maxHeight: 800,
            success(result) {
                const url = URL.createObjectURL(result);
                const img = document.createElement('img');
                img.src = url;
                img.alt = i18next.t('compressedImage', 'Compressed image');
                const link = document.createElement('a');
                link.href = url;
                link.download = `compressed_${file.name}`;
                link.textContent = i18next.t('download', 'Download');
                elements.imageResult.innerHTML = '';
                elements.imageResult.appendChild(img);
                elements.imageResult.appendChild(link);
                saveToHistory('image-compressor', { originalSize: file.size, compressedSize: result.size });
                saveToolState('image-compressor', {});
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
        const height = parseFloat(elements.height.value) / 100; // Convert cm to m
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
        const height = parseFloat(elements.height.value) / 100; // Convert cm to m
        const bmi = weight / (height * height);
        let status;
        if (bmi < 18.5) status = i18next.t('bmi.underweight', 'Underweight');
        else if (bmi < 25) status = i18next.t('bmi.normal', 'Normal');
        else if (bmi < 30) status = i18next.t('bmi.overweight', 'Overweight');
        else status = i18next.t('bmi.obese', 'Obese');
        const outputTable = document.getElementById('bmiOutput');
        outputTable.innerHTML = `
            <tr>
                <td>${weight.toFixed(1)}</td>
                <td>${elements.height.value}</td>
                <td>${bmi.toFixed(1)}</td>
                <td>${status}</td>
            </tr>
        `;
        saveToHistory('bmi-calculator', { weight, height: elements.height.value, bmi, status });
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
            mau: 3600 // 1 mau = 3600 m²
        };
        const result = (value * conversions[fromUnit]) / conversions[toUnit];
        const outputTable = document.getElementById('areaOutput');
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