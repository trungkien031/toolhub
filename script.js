<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="ToolHub - Bộ sưu tập công cụ tiện ích đa năng cho mọi nhu cầu hàng ngày.">
    <title>ToolHub - Hộp Công Cụ Đa Năng</title>
    <link href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/compressorjs@1.1.1/dist/compressor.min.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="bg-decor">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
    </div>

    <header>
        <div class="logo" data-action="showHome">ToolHub</div>
        <nav class="nav">
            <a href="#" data-action="showHome">Trang Chủ</a>
            <a href="#" data-action="showHistory">Lịch Sử</a>
            <a href="#" data-action="openContactModal">Liên Hệ</a>
            <select id="languageSwitch">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
            </select>
        </nav>
        <div class="dark-mode-toggle">
            <input type="checkbox" id="darkModeToggle">
            <label for="darkModeToggle"><i class="fas fa-moon"></i></label>
        </div>
    </header>

    <!-- Magic Menu -->
    <div class="magic-menu">
        <div class="magic-menu-toggle">
            <i class="fas fa-bars"></i>
        </div>
        <div class="magic-menu-content">
            <a href="#" data-tool="summarize"><i class="fas fa-compress-alt"></i> Tóm Tắt Văn Bản</a>
            <a href="#" data-tool="length-converter"><i class="fas fa-ruler"></i> Chuyển Đổi Độ Dài</a>
            <a href="#" data-tool="calculator"><i class="fas fa-calculator"></i> Máy Tính</a>
            <a href="#" data-tool="password-generator"><i class="fas fa-lock"></i> Tạo Mật Khẩu</a>
            <a href="#" data-tool="char-counter"><i class="fas fa-text-height"></i> Đếm Ký Tự</a>
            <a href="#" data-tool="url-checker"><i class="fas fa-link"></i> Kiểm Tra URL</a>
            <a href="#" data-tool="temp-converter"><i class="fas fa-thermometer-half"></i> Chuyển Đổi Nhiệt Độ</a>
            <a href="#" data-tool="currency-converter"><i class="fas fa-dollar-sign"></i> Chuyển Đổi Tiền Tệ</a>
            <a href="#" data-tool="qr-generator"><i class="fas fa-qrcode"></i> Tạo Mã QR</a>
            <a href="#" data-tool="image-compressor"><i class="fas fa-image"></i> Nén Ảnh</a>
            <a href="#" data-tool="bmi-calculator"><i class="fas fa-weight"></i> Tính BMI</a>
            <a href="#" data-tool="area-converter"><i class="fas fa-expand-arrows-alt"></i> Chuyển Đổi Diện Tích</a>
            <a href="#" data-tool="history"><i class="fas fa-history"></i> Lịch Sử</a>
        </div>
    </div>

    <section id="hero">
        <img src="https://via.placeholder.com/200" alt="ToolHub Logo" class="hero-image">
        <h1 data-lang="hero_title">ToolHub - Hộp Công Cụ Đa Năng</h1>
        <p data-lang="hero_description">Bộ sưu tập công cụ tiện ích giúp bạn giải quyết mọi vấn đề hàng ngày một cách nhanh chóng và hiệu quả!</p>
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="searchInput" data-lang-placeholder="search_placeholder" placeholder="Tìm kiếm công cụ...">
            <button data-action="searchTools">Tìm</button>
        </div>
    </section>

    <nav class="tool-nav">
        <a href="#" data-tool="summarize" class="tooltip" data-tooltip="Tóm Tắt Văn Bản"><i class="fas fa-compress-alt"></i></a>
        <a href="#" data-tool="length-converter" class="tooltip" data-tooltip="Chuyển Đổi Độ Dài"><i class="fas fa-ruler"></i></a>
        <a href="#" data-tool="calculator" class="tooltip" data-tooltip="Máy Tính"><i class="fas fa-calculator"></i></a>
        <a href="#" data-tool="password-generator" class="tooltip" data-tooltip="Tạo Mật Khẩu"><i class="fas fa-lock"></i></a>
        <a href="#" data-tool="char-counter" class="tooltip" data-tooltip="Đếm Ký Tự"><i class="fas fa-text-height"></i></a>
        <a href="#" data-tool="url-checker" class="tooltip" data-tooltip="Kiểm Tra URL"><i class="fas fa-link"></i></a>
        <a href="#" data-tool="temp-converter" class="tooltip" data-tooltip="Chuyển Đổi Nhiệt Độ"><i class="fas fa-thermometer-half"></i></a>
        <a href="#" data-tool="currency-converter" class="tooltip" data-tooltip="Chuyển Đổi Tiền Tệ"><i class="fas fa-dollar-sign"></i></a>
        <a href="#" data-tool="qr-generator" class="tooltip" data-tooltip="Tạo Mã QR"><i class="fas fa-qrcode"></i></a>
        <a href="#" data-tool="image-compressor" class="tooltip" data-tooltip="Nén Ảnh"><i class="fas fa-image"></i></a>
        <a href="#" data-tool="bmi-calculator" class="tooltip" data-tooltip="Tính BMI"><i class="fas fa-weight"></i></a>
        <a href="#" data-tool="area-converter" class="tooltip" data-tooltip="Chuyển Đổi Diện Tích"><i class="fas fa-expand-arrows-alt"></i></a>
    </nav>

    <section id="summarize" class="tools-section" data-tool-name="summarize">
        <div class="tool-card">
            <h3><i class="fas fa-compress-alt"></i> <span data-lang="summarize_title">Tóm Tắt Văn Bản</span></h3>
            <p data-lang="summarize_description">Tóm tắt nội dung văn bản dài thành ngắn gọn, dễ hiểu.</p>
            <textarea id="textInput" data-lang-placeholder="summarize_input_placeholder" placeholder="Nhập văn bản cần tóm tắt..."></textarea>
            <div class="error-message" id="textError"></div>
            <select id="summaryLength">
                <option value="short">Ngắn</option>
                <option value="medium">Trung bình</option>
                <option value="long">Dài</option>
            </select>
            <button data-action="summarizeText">Tóm Tắt</button>
            <div class="loading" id="textLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="textResult">
                <h4 data-lang="summarize_result">Kết Quả Tóm Tắt:</h4>
                <p id="summaryOutput"></p>
            </div>
        </div>
    </section>

    <section id="length-converter" class="tools-section" data-tool-name="length-converter">
        <div class="tool-card">
            <h3><i class="fas fa-ruler"></i> <span data-lang="length_converter_title">Chuyển Đổi Độ Dài</span></h3>
            <p data-lang="length_converter_description">Chuyển đổi giữa các đơn vị độ dài như mét, kilomet, inch, foot...</p>
            <input type="number" id="lengthValue" data-lang-placeholder="length_converter_input_placeholder" placeholder="Nhập giá trị độ dài">
            <div class="error-message" id="lengthError"></div>
            <select id="lengthFrom">
                <option value="m">Mét (m)</option>
                <option value="km">Kilomet (km)</option>
                <option value="cm">Centimet (cm)</option>
                <option value="inch">Inch</option>
                <option value="foot">Foot</option>
                <option value="yard">Yard</option>
            </select>
            <select id="lengthTo">
                <option value="m">Mét (m)</option>
                <option value="km">Kilomet (km)</option>
                <option value="cm">Centimet (cm)</option>
                <option value="inch">Inch</option>
                <option value="foot">Foot</option>
                <option value="yard">Yard</option>
            </select>
            <button data-action="convertLength">Chuyển Đổi</button>
            <div class="loading" id="lengthLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="lengthResult">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th data-lang="length_converter_original">Giá Trị Gốc</th>
                            <th data-lang="length_converter_from">Đơn Vị Gốc</th>
                            <th data-lang="length_converter_converted">Giá Trị Đã Chuyển</th>
                            <th data-lang="length_converter_to">Đơn Vị Đích</th>
                        </tr>
                    </thead>
                    <tbody id="lengthOutput"></tbody>
                </table>
            </div>
        </div>
    </section>

    <section id="calculator" class="tools-section" data-tool-name="calculator">
        <div class="tool-card">
            <h3><i class="fas fa-calculator"></i> <span data-lang="calculator_title">Máy Tính</span></h3>
            <p data-lang="calculator_description">Thực hiện các phép tính cơ bản: cộng, trừ, nhân, chia.</p>
            <input type="number" id="num1" data-lang-placeholder="calculator_num1_placeholder" placeholder="Số thứ nhất">
            <select id="operator">
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="*">×</option>
                <option value="/">÷</option>
            </select>
            <input type="number" id="num2" data-lang-placeholder="calculator_num2_placeholder" placeholder="Số thứ hai">
            <div class="error-message" id="calcError"></div>
            <button data-action="calculate">Tính</button>
            <div class="loading" id="calcLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="calcResult">
                <p id="calcOutput"></p>
            </div>
        </div>
    </section>

    <section id="password-generator" class="tools-section" data-tool-name="password-generator">
        <div class="tool-card">
            <h3><i class="fas fa-lock"></i> <span data-lang="password_generator_title">Tạo Mật Khẩu</span></h3>
            <p data-lang="password_generator_description">Tạo mật khẩu ngẫu nhiên an toàn với các tùy chọn linh hoạt.</p>
            <input type="number" id="passLength" value="12" min="8" max="32" data-lang-placeholder="password_generator_length_placeholder" placeholder="Độ dài mật khẩu (8-32)">
            <div class="checkbox-group">
                <label><input type="checkbox" id="includeUppercase" checked> <span data-lang="password_generator_uppercase">Chữ hoa</span></label>
                <label><input type="checkbox" id="includeLowercase" checked> <span data-lang="password_generator_lowercase">Chữ thường</span></label>
                <label><input type="checkbox" id="includeNumbers" checked> <span data-lang="password_generator_numbers">Số</span></label>
                <label><input type="checkbox" id="includeSymbols" checked> <span data-lang="password_generator_symbols">Ký tự đặc biệt</span></label>
            </div>
            <div class="error-message" id="passError"></div>
            <button data-action="generatePassword">Tạo Mật Khẩu</button>
            <div class="loading" id="passLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="passResult">
                <p id="passOutput"></p>
                <button class="copy-btn" data-action="copyPassword" data-lang="password_generator_copy">Sao Chép</button>
            </div>
        </div>
    </section>

    <section id="char-counter" class="tools-section" data-tool-name="char-counter">
        <div class="tool-card">
            <h3><i class="fas fa-text-height"></i> <span data-lang="char_counter_title">Đếm Ký Tự</span></h3>
            <p data-lang="char_counter_description">Đếm số ký tự và từ trong văn bản của bạn.</p>
            <textarea id="charInput" data-lang-placeholder="char_counter_input_placeholder" placeholder="Nhập văn bản để đếm..."></textarea>
            <div class="error-message" id="charError"></div>
            <button data-action="countChars">Đếm</button>
            <div class="loading" id="charLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="charResult">
                <p id="charOutput"></p>
            </div>
        </div>
    </section>

    <section id="url-checker" class="tools-section" data-tool-name="url-checker">
        <div class="tool-card">
            <h3><i class="fas fa-link"></i> <span data-lang="url_checker_title">Kiểm Tra URL</span></h3>
            <p data-lang="url_checker_description">Kiểm tra tính hợp lệ của một URL.</p>
            <input type="text" id="urlInput" data-lang-placeholder="url_checker_input_placeholder" placeholder="Nhập URL để kiểm tra...">
            <div class="error-message" id="urlError"></div>
            <button data-action="checkURL">Kiểm Tra</button>
            <div class="loading" id="urlLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="urlResult">
                <p id="urlOutput"></p>
            </div>
        </div>
    </section>

    <section id="temp-converter" class="tools-section" data-tool-name="temp-converter">
        <div class="tool-card">
            <h3><i class="fas fa-thermometer-half"></i> <span data-lang="temp_converter_title">Chuyển Đổi Nhiệt Độ</span></h3>
            <p data-lang="temp_converter_description">Chuyển đổi giữa các đơn vị nhiệt độ: Celsius, Fahrenheit, Kelvin.</p>
            <input type="number" id="tempValue" data-lang-placeholder="temp_converter_input_placeholder" placeholder="Nhập giá trị nhiệt độ">
            <div class="error-message" id="tempError"></div>
            <select id="tempFrom">
                <option value="C">Celsius (C)</option>
                <option value="F">Fahrenheit (F)</option>
                <option value="K">Kelvin (K)</option>
            </select>
            <select id="tempTo">
                <option value="C">Celsius (C)</option>
                <option value="F">Fahrenheit (F)</option>
                <option value="K">Kelvin (K)</option>
            </select>
            <button data-action="convertTemp">Chuyển Đổi</button>
            <div class="loading" id="tempLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="tempResult">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th data-lang="temp_converter_original">Giá Trị Gốc</th>
                            <th data-lang="temp_converter_from">Đơn Vị Gốc</th>
                            <th data-lang="temp_converter_converted">Giá Trị Đã Chuyển</th>
                            <th data-lang="temp_converter_to">Đơn Vị Đích</th>
                        </tr>
                    </thead>
                    <tbody id="tempOutput"></tbody>
                </table>
            </div>
        </div>
    </section>

    <section id="currency-converter" class="tools-section" data-tool-name="currency-converter">
        <div class="tool-card">
            <h3><i class="fas fa-dollar-sign"></i> <span data-lang="currency_converter_title">Chuyển Đổi Tiền Tệ</span></h3>
            <p data-lang="currency_converter_description">Chuyển đổi giữa các loại tiền tệ phổ biến.</p>
            <input type="number" id="currencyValue" data-lang-placeholder="currency_converter_input_placeholder" placeholder="Nhập số tiền">
            <div class="error-message" id="currencyError"></div>
            <select id="currencyFrom">
                <option value="USD">USD</option>
                <option value="VND">VND</option>
                <option value="EUR">EUR</option>
                <option value="JPY">JPY</option>
                <option value="GBP">GBP</option>
                <option value="CNY">CNY</option>
            </select>
            <select id="currencyTo">
                <option value="USD">USD</option>
                <option value="VND">VND</option>
                <option value="EUR">EUR</option>
                <option value="JPY">JPY</option>
                <option value="GBP">GBP</option>
                <option value="CNY">CNY</option>
            </select>
            <button data-action="convertCurrency">Chuyển Đổi</button>
            <div class="loading" id="currencyLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="currencyResult">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th data-lang="currency_converter_original">Số Tiền Gốc</th>
                            <th data-lang="currency_converter_from">Tiền Tệ Gốc</th>
                            <th data-lang="currency_converter_converted">Số Tiền Đã Chuyển</th>
                            <th data-lang="currency_converter_to">Tiền Tệ Đích</th>
                        </tr>
                    </thead>
                    <tbody id="currencyOutput"></tbody>
                </table>
            </div>
        </div>
    </section>

    <section id="qr-generator" class="tools-section" data-tool-name="qr-generator">
        <div class="tool-card">
            <h3><i class="fas fa-qrcode"></i> <span data-lang="qr_generator_title">Tạo Mã QR</span></h3>
            <p data-lang="qr_generator_description">Tạo mã QR từ văn bản hoặc URL.</p>
            <input type="text" id="qrInput" data-lang-placeholder="qr_generator_input_placeholder" placeholder="Nhập văn bản hoặc URL">
            <div class="error-message" id="qrError"></div>
            <button data-action="generateQR">Tạo Mã QR</button>
            <div class="loading" id="qrLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="qrResult">
                <img id="qrOutput" alt="QR Code">
            </div>
        </div>
    </section>

    <section id="image-compressor" class="tools-section" data-tool-name="image-compressor">
        <div class="tool-card">
            <h3><i class="fas fa-image"></i> <span data-lang="image_compressor_title">Nén Ảnh</span></h3>
            <p data-lang="image_compressor_description">Giảm dung lượng ảnh mà vẫn giữ chất lượng tốt.</p>
            <input type="file" id="imageInput" accept="image/*">
            <div class="error-message" id="imageError"></div>
            <button data-action="compressImage">Nén Ảnh</button>
            <div class="loading" id="imageLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="imageResult"></div>
        </div>
    </section>

    <section id="bmi-calculator" class="tools-section" data-tool-name="bmi-calculator">
        <div class="tool-card">
            <h3><i class="fas fa-weight"></i> <span data-lang="bmi_calculator_title">Tính BMI</span></h3>
            <p data-lang="bmi_calculator_description">Tính chỉ số BMI dựa trên cân nặng và chiều cao.</p>
            <input type="number" id="weight" data-lang-placeholder="bmi_calculator_weight_placeholder" placeholder="Cân nặng (kg)">
            <input type="number" id="height" data-lang-placeholder="bmi_calculator_height_placeholder" placeholder="Chiều cao (cm)">
            <div class="error-message" id="bmiError"></div>
            <button data-action="calculateBMI">Tính BMI</button>
            <div class="loading" id="bmiLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="bmiResult">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th data-lang="bmi_calculator_weight">Cân Nặng (kg)</th>
                            <th data-lang="bmi_calculator_height">Chiều Cao (cm)</th>
                            <th data-lang="bmi_calculator_bmi">Chỉ Số BMI</th>
                            <th data-lang="bmi_calculator_status">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody id="bmiOutput"></tbody>
                </table>
            </div>
        </div>
    </section>

    <section id="area-converter" class="tools-section" data-tool-name="area-converter">
        <div class="tool-card">
            <h3><i class="fas fa-expand-arrows-alt"></i> <span data-lang="area_converter_title">Chuyển Đổi Diện Tích</span></h3>
            <p data-lang="area_converter_description">Chuyển đổi giữa các đơn vị diện tích: m², km², ha, ft²...</p>
            <input type="number" id="areaValue" data-lang-placeholder="area_converter_input_placeholder" placeholder="Nhập giá trị diện tích">
            <div class="error-message" id="areaError"></div>
            <select id="areaFrom">
                <option value="m2">Mét vuông (m²)</option>
                <option value="km2">Kilomet vuông (km²)</option>
                <option value="ha">Hecta (ha)</option>
                <option value="ft2">Feet vuông (ft²)</option>
            </select>
            <select id="areaTo">
                <option value="m2">Mét vuông (m²)</option>
                <option value="km2">Kilomet vuông (km²)</option>
                <option value="ha">Hecta (ha)</option>
                <option value="ft2">Feet vuông (ft²)</option>
            </select>
            <button data-action="convertArea">Chuyển Đổi</button>
            <div class="loading" id="areaLoading">
                <span class="spinner"></span> <span data-lang="loading">Đang xử lý...</span>
            </div>
            <div class="result" id="areaResult">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th data-lang="area_converter_original">Giá Trị Gốc</th>
                            <th data-lang="area_converter_from">Đơn Vị Gốc</th>
                            <th data-lang="area_converter_converted">Giá Trị Đã Chuyển</th>
                            <th data-lang="area_converter_to">Đơn Vị Đích</th>
                        </tr>
                    </thead>
                    <tbody id="areaOutput"></tbody>
                </table>
            </div>
        </div>
    </section>

    <section id="history" class="tools-section">
        <div class="tool-card">
            <h3><i class="fas fa-history"></i> <span data-lang="history_title">Lịch Sử Sử Dụng</span></h3>
            <button data-action="clearHistory">Xóa Lịch Sử</button>
            <div class="result" id="historyResult"></div>
        </div>
    </section>

    <div class="modal" id="contactModal">
        <div class="modal-content">
            <h2 data-lang="contact_title">Liên Hệ Với Chúng Tôi</h2>
            <p><strong>Email:</strong> support@toolhub.com</p>
            <p><strong data-lang="contact_phone">Số Điện Thoại:</strong> +84 123 456 789</p>
            <p><strong data-lang="contact_address">Địa Chỉ:</strong> 123 Đường Công Nghệ, TP. Hồ Chí Minh, Việt Nam</p>
            <button data-action="closeContactModal">Đóng</button>
        </div>
    </div>

    <div class="toast" id="toast"></div>

    <footer>
        <p>&copy; 2025 ToolHub. <span data-lang="footer_text">Mọi quyền được bảo lưu.</span> | <a href="#" data-action="openContactModal">Liên Hệ</a></p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
