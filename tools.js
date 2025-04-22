const EXCHANGE_RATE_API_KEY = 'YOUR_EXCHANGERATE_API_KEY';
const GOOGLE_SAFE_BROWSING_KEY = 'YOUR_GOOGLE_SAFE_BROWSING_KEY';
const GROK_API_KEY = 'YOUR_GROK_API_KEY';

// Cache DOM elements for performance
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

// 1. Text Summary Tool
async function summarizeText() {
    const button = document.querySelector('[data-action="summarizeText"]');
    processTool(button, 'textLoading', 'textResult', () => {
        const text = elements.textInput.value;
        const validation = validateInput(text, 'text', elements.textInput, 'textError');
        if (text.length > 10000) {
            validation.isValid = false;
            validation.message = i18next.t('error.textTooLong', 'Text is too long (max 10,000 characters)!');
        }
        return validation;
    }, async () => {
        const text = elements.textInput.value;
        const length = elements.summaryLength.value;
        let summaryRatio;
        switch (length) {
            case 'short': summaryRatio = 0.2; break;
            case 'medium': summaryRatio = 0.3; break;
            case 'long': summaryRatio = 0.4; break;
        }
        const response = await fetch('https://api.x.ai/grok/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_API_KEY}`
            },
            body: JSON.stringify({ text, summaryRatio })
        });
        if (!response.ok) throw new Error(i18next.t('error.summarizeFailed', 'Failed to summarize text!'));
        const data = await response.json();
        const summary = data.summary || i18next.t('error.summarizeFailed', 'Failed to summarize text!');
        document.getElementById('summaryOutput').textContent = summary;
        saveToolState('summarize', { textInput: text, summaryLength: length });
        saveToHistory('summarize', summary);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 2. Length Converter Tool
async function convertLength() {
    const button = document.querySelector('[data-action="convertLength"]');
    processTool(button, 'lengthLoading', 'lengthResult', () => {
        return validateInput(elements.lengthValue.value, 'number', elements.lengthValue, 'lengthError');
    }, async () => {
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
        const valueInMeters = value / conversionRates[fromUnit];
        const convertedValue = valueInMeters * conversionRates[toUnit];
        const result = `${value} ${fromUnit} = ${convertedValue.toFixed(2)} ${toUnit}`;
        document.getElementById('lengthOutput').innerHTML = `
            <tr>
                <td>${value}</td>
                <td>${fromUnit}</td>
                <td>${convertedValue.toFixed(2)}</td>
                <td>${toUnit}</td>
            </tr>
        `;
        saveToolState('length-converter', { lengthValue: value, lengthFrom: fromUnit, lengthTo: toUnit });
        saveToHistory('length-converter', result);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 3. Calculator Tool
async function calculate() {
    const button = document.querySelector('[data-action="calculate"]');
    processTool(button, 'calcLoading', 'calcResult', () => {
        const validation1 = validateInput(elements.num1.value, 'number', elements.num1, 'calcError');
        const validation2 = validateInput(elements.num2.value, 'number', elements.num2, 'calcError');
        return { isValid: validation1.isValid && validation2.isValid, input: elements.num1, errorId: 'calcError', message: validation1.message || validation2.message };
    }, async () => {
        const num1 = parseFloat(elements.num1.value);
        const num2 = parseFloat(elements.num2.value);
        const op = elements.operator.value;
        let result;
        switch (op) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/':
                if (num2 === 0) throw new Error(i18next.t('error.divideByZero', 'Cannot divide by zero!'));
                result = num1 / num2;
                break;
        }
        const output = `${num1} ${op} ${num2} = ${result.toFixed(2)}`;
        document.getElementById('calcOutput').textContent = output;
        saveToolState('calculator', { num1: num1, operator: op, num2: num2 });
        saveToHistory('calculator', output);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 4. Password Generator Tool
async function generatePassword() {
    const button = document.querySelector('[data-action="generatePassword"]');
    processTool(button, 'passLoading', 'passResult', () => {
        const lengthValidation = validateInput(elements.passLength.value, 'number', elements.passLength, 'passError');
        if (lengthValidation.isValid) {
            const length = parseInt(elements.passLength.value);
            if (length < 8 || length > 32) {
                lengthValidation.isValid = false;
                lengthValidation.message = i18next.t('error.invalidLength', 'Length must be between 8 and 32!');
            }
            const hasCharacterType = elements.includeUppercase.checked || elements.includeLowercase.checked || elements.includeNumbers.checked || elements.includeSymbols.checked;
            if (!hasCharacterType) {
                lengthValidation.isValid = false;
                lengthValidation.message = i18next.t('error.selectCharacterType', 'Please select at least one character type!');
            }
        }
        return lengthValidation;
    }, async () => {
        const length = parseInt(elements.passLength.value);
        const charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        let characters = '';
        if (elements.includeUppercase.checked) characters += charSets.uppercase;
        if (elements.includeLowercase.checked) characters += charSets.lowercase;
        if (elements.includeNumbers.checked) characters += charSets.numbers;
        if (elements.includeSymbols.checked) characters += charSets.symbols;
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }
        document.getElementById('passOutput').textContent = password;
        saveToolState('password-generator', {
            passLength: length,
            includeUppercase: elements.includeUppercase.checked,
            includeLowercase: elements.includeLowercase.checked,
            includeNumbers: elements.includeNumbers.checked,
            includeSymbols: elements.includeSymbols.checked
        });
        saveToHistory('password-generator', password);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

async function copyPassword() {
    const password = document.getElementById('passOutput').textContent;
    if (password) {
        try {
            await navigator.clipboard.writeText(password);
            showToast(i18next.t('copyPassword', 'Copied!'), 'success');
        } catch (err) {
            showToast(i18next.t('error.apiError', 'Failed to copy!'), 'error');
        }
    }
}

// 5. Character Counter Tool
async function countChars() {
    const button = document.querySelector('[data-action="countChars"]');
    processTool(button, 'charLoading', 'charResult', () => {
        return validateInput(elements.charInput.value, 'text', elements.charInput, 'charError');
    }, async () => {
        const text = elements.charInput.value;
        const charCount = text.length;
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const output = `${i18next.t('characters', 'Characters')}: ${charCount}\n${i18next.t('words', 'Words')}: ${wordCount}`;
        document.getElementById('charOutput').textContent = output;
        saveToolState('char-counter', { charInput: text });
        saveToHistory('char-counter', output);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 6. URL Checker Tool
async function checkURL() {
    const button = document.querySelector('[data-action="checkURL"]');
    processTool(button, 'urlLoading', 'urlResult', () => {
        return validateInput(elements.urlInput.value, 'url', elements.urlInput, 'urlError');
    }, async () => {
        const url = elements.urlInput.value;
        const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client: { clientId: "ToolHub", clientVersion: "1.0.0" },
                threatInfo: {
                    threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [{ url }]
                }
            })
        });
        const data = await response.json();
        const output = data.matches ? i18next.t('error.unsafeUrl', 'Unsafe URL detected!') : i18next.t('validUrl', 'Valid URL');
        document.getElementById('urlOutput').textContent = output;
        saveToolState('url-checker', { urlInput: url });
        saveToHistory('url-checker', output);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 7. Temperature Converter Tool
async function convertTemp() {
    const button = document.querySelector('[data-action="convertTemp"]');
    processTool(button, 'tempLoading', 'tempResult', () => {
        return validateInput(elements.tempValue.value, 'number', elements.tempValue, 'tempError');
    }, async () => {
        const value = parseFloat(elements.tempValue.value);
        const fromUnit = elements.tempFrom.value;
        const toUnit = elements.tempTo.value;
        let valueInCelsius;
        switch (fromUnit) {
            case 'C': valueInCelsius = value; break;
            case 'F': valueInCelsius = (value - 32) * 5 / 9; break;
            case 'K': valueInCelsius = value - 273.15; break;
        }
        let convertedValue;
        switch (toUnit) {
            case 'C': convertedValue = valueInCelsius; break;
            case 'F': convertedValue = valueInCelsius * 9 / 5 + 32; break;
            case 'K': convertedValue = valueInCelsius + 273.15; break;
        }
        const result = `${value} ${fromUnit} = ${convertedValue.toFixed(2)} ${toUnit}`;
        document.getElementById('tempOutput').innerHTML = `
            <tr>
                <td>${value}</td>
                <td>${fromUnit}</td>
                <td>${convertedValue.toFixed(2)}</td>
                <td>${toUnit}</td>
            </tr>
        `;
        saveToolState('temp-converter', { tempValue: value, tempFrom: fromUnit, tempTo: toUnit });
        saveToHistory('temp-converter', result);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 8. Currency Converter Tool
async function convertCurrency() {
    const button = document.querySelector('[data-action="convertCurrency"]');
    processTool(button, 'currencyLoading', 'currencyResult', () => {
        return validateInput(elements.currencyValue.value, 'number', elements.currencyValue, 'currencyError');
    }, async () => {
        const value = parseFloat(elements.currencyValue.value);
        const fromCurrency = elements.currencyFrom.value;
        const toCurrency = elements.currencyTo.value;
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}?apiKey=${EXCHANGE_RATE_API_KEY}`);
        if (!response.ok) throw new Error(i18next.t('error.apiFailed', 'Failed to fetch exchange rate.'));
        const data = await response.json();
        const rate = data.rates[toCurrency];
        const convertedValue = value * rate;
        const result = `${value} ${fromCurrency} = ${convertedValue.toFixed(2)} ${toCurrency}`;
        document.getElementById('currencyOutput').innerHTML = `
            <tr>
                <td>${value}</td>
                <td>${fromCurrency}</td>
                <td>${convertedValue.toFixed(2)}</td>
                <td>${toCurrency}</td>
            </tr>
        `;
        saveToolState('currency-converter', { currencyValue: value, currencyFrom: fromCurrency, currencyTo: toCurrency });
        saveToHistory('currency-converter', result);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 9. QR Code Generator Tool
async function generateQR() {
    const button = document.querySelector('[data-action="generateQR"]');
    processTool(button, 'qrLoading', 'qrResult', () => {
        return validateInput(elements.qrInput.value, 'text', elements.qrInput, 'qrError');
    }, async () => {
        const text = elements.qrInput.value;
        const qrOutput = document.getElementById('qrOutput');
        await QRCode.toDataURL(text, { width: 200, height: 200 }, (err, url) => {
            if (err) throw new Error(i18next.t('error.qrFailed', 'Failed to generate QR code!'));
            qrOutput.src = url;
        });
        saveToolState('qr-generator', { qrInput: text });
        saveToHistory('qr-generator', i18next.t('result', 'Result'));
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 10. Image Compressor Tool
async function compressImage() {
    const button = document.querySelector('[data-action="compressImage"]');
    processTool(button, 'imageLoading', 'imageResult', () => {
        const file = elements.imageInput.files[0];
        if (!file) {
            return { isValid: false, input: elements.imageInput, errorId: 'imageError', message: i18next.t('error.noImage', 'Please select an image!') };
        }
        return { isValid: true, input: elements.imageInput, errorId: 'imageError' };
    }, async () => {
        const file = elements.imageInput.files[0];
        new Compressor(file, {
            quality: 0.6,
            success(result) {
                const url = URL.createObjectURL(result);
                const img = document.createElement('img');
                img.src = url;
                img.alt = i18next.t('compressedImage', 'Compressed image');
                img.style.maxWidth = '200px';
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = 'compressed-image.jpg';
                downloadLink.textContent = i18next.t('download', 'Download');
                downloadLink.style.display = 'block';
                downloadLink.style.marginTop = '10px';
                elements.imageResult.innerHTML = '';
                elements.imageResult.appendChild(img);
                elements.imageResult.appendChild(downloadLink);
                saveToHistory('image-compressor', i18next.t('compressedImage', 'Compressed image'));
                showToast(i18next.t('result', 'Result'), 'success');
            },
            error(err) {
                throw new Error(i18next.t('error.compressFailed', 'Failed to compress image!'));
            }
        });
    });
}

// 11. BMI Calculator Tool
async function calculateBMI() {
    const button = document.querySelector('[data-action="calculateBMI"]');
    processTool(button, 'bmiLoading', 'bmiResult', () => {
        const weightValidation = validateInput(elements.weight.value, 'number', elements.weight, 'bmiError');
        const heightValidation = validateInput(elements.height.value, 'number', elements.height, 'bmiError');
        return { isValid: weightValidation.isValid && heightValidation.isValid, input: elements.weight, errorId: 'bmiError', message: weightValidation.message || heightValidation.message };
    }, async () => {
        const weight = parseFloat(elements.weight.value);
        const height = parseFloat(elements.height.value) / 100; // Convert cm to m
        const bmi = weight / (height * height);
        let status;
        if (bmi < 18.5) status = i18next.t('bmi.underweight', 'Underweight');
        else if (bmi < 25) status = i18next.t('bmi.normal', 'Normal');
        else if (bmi < 30) status = i18next.t('bmi.overweight', 'Overweight');
        else status = i18next.t('bmi.obese', 'Obese');
        document.getElementById('bmiOutput').innerHTML = `
            <tr>
                <td>${weight}</td>
                <td>${height * 100}</td>
                <td>${bmi.toFixed(2)}</td>
                <td>${status}</td>
            </tr>
        `;
        saveToolState('bmi-calculator', { weight: weight, height: height * 100 });
        saveToHistory('bmi-calculator', `BMI: ${bmi.toFixed(2)} - ${status}`);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}

// 12. Area Converter Tool
async function convertArea() {
    const button = document.querySelector('[data-action="convertArea"]');
    processTool(button, 'areaLoading', 'areaResult', () => {
        return validateInput(elements.areaValue.value, 'number', elements.areaValue, 'areaError');
    }, async () => {
        const value = parseFloat(elements.areaValue.value);
        const fromUnit = elements.areaFrom.value;
        const toUnit = elements.areaTo.value;
        const conversionRates = {
            m2: 1,
            km2: 0.000001,
            ha: 0.0001,
            ft2: 10.7639,
            mau: 0.0002777778 // 1 mau = 3600 m²
        };
        const valueInSquareMeters = value / conversionRates[fromUnit];
        const convertedValue = valueInSquareMeters * conversionRates[toUnit];
        const result = `${value} ${fromUnit} = ${convertedValue.toFixed(2)} ${toUnit}`;
        document.getElementById('areaOutput').innerHTML = `
            <tr>
                <td>${value}</td>
                <td>${fromUnit}</td>
                <td>${convertedValue.toFixed(2)}</td>
                <td>${toUnit}</td>
            </tr>
        `;
        saveToolState('area-converter', { areaValue: value, areaFrom: fromUnit, areaTo: toUnit });
        saveToHistory('area-converter', result);
        showToast(i18next.t('result', 'Result'), 'success');
    });
}
