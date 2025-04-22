document.addEventListener('DOMContentLoaded', () => {
    console.log('Main script loaded successfully.');

    // Cache DOM elements for performance
    const elements = {
        darkModeToggle: document.getElementById('darkModeToggle'),
        searchInput: document.getElementById('searchInput'),
        hero: document.getElementById('hero'),
        contactModal: document.getElementById('contactModal')
    };

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

    // Event Listeners
    document.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const tool = e.target.closest('[data-tool]')?.dataset.tool;
        if (action === 'showHome') showHome();
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
        else if (tool) showTool(tool);
    });

    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    elements.searchInput.addEventListener('input', searchTools);

    // Initialize
    initDarkMode();
    initLanguage();
    showHome();
});