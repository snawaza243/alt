// Main Application Module
const Arabica = (() => {
    // State Management
    let state = {
        currentUser: {
            name: "Ahmed",
            streak: 5,
            points: 420,
            avatar: "assets/images/avatar-default.png"
        },
        vocabulary: [],
        flashcards: [],
        currentTheme: 'light',
        dailyProgress: 75,
        notifications: []
    };

    // DOM Elements
    const elements = {
        appContainer: document.getElementById('app-container'),
        loadingScreen: document.getElementById('loading-screen'),
        themeButtons: document.querySelectorAll('.theme-btn'),
        navLinks: document.querySelectorAll('.sidebar a'),
        pages: document.querySelectorAll('.page'),
        flashcard: document.getElementById('flashcard'),
        flipButton: document.getElementById('flip-card'),
        writingCanvas: document.getElementById('writing-canvas'),
        addVocabModal: document.getElementById('add-vocab-modal'),
        vocabForm: document.getElementById('vocab-form')
    };

    // Initialize the application
    function init() {
        simulateLoading();
        setupEventListeners();
        loadInitialData();
        setupWritingCanvas();
        initCharts();
        applySavedTheme();
    }

    // Simulate loading data
    function simulateLoading() {
        setTimeout(() => {
            elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
                elements.appContainer.style.opacity = '1';
            }, 500);
        }, 1500);
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Theme switching
        elements.themeButtons.forEach(btn => {
            btn.addEventListener('click', switchTheme);
        });

        // Navigation
        elements.navLinks.forEach(link => {
            link.addEventListener('click', navigateToPage);
        });

        // Flashcard interactions
        elements.flashcard.addEventListener('click', flipCard);
        elements.flipButton.addEventListener('click', flipCard);
        
        // Swipe gestures for flashcards
        const hammer = new Hammer(elements.flashcard);
        hammer.on('swipeleft', goToNextCard);
        hammer.on('swiperight', goToPrevCard);

        // Writing canvas
        setupCanvasEvents();

        // Modal interactions
        document.querySelectorAll('.action-btn[data-action="add-vocab"]').forEach(btn => {
            btn.addEventListener('click', showAddVocabModal);
        });

        document.querySelector('.close-modal').addEventListener('click', hideAddVocabModal);

        elements.vocabForm.addEventListener('submit', handleVocabSubmit);
    }

    // Theme management
    function switchTheme(e) {
        const theme = e.currentTarget.dataset.theme;
        document.body.className = `${theme}-theme`;
        state.currentTheme = theme;
        localStorage.setItem('arabica-theme', theme);
        updateChartThemes();
    }

    function applySavedTheme() {
        const savedTheme = localStorage.getItem('arabica-theme') || 'light';
        document.body.className = `${savedTheme}-theme`;
        state.currentTheme = savedTheme;
        
        // Update active theme button
        elements.themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        });
    }

    // Navigation
    function navigateToPage(e) {
        e.preventDefault();
        const pageId = e.currentTarget.dataset.page;
        
        // Update active nav link
        elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        // Show selected page
        elements.pages.forEach(page => {
            page.classList.toggle('active', page.id === `${pageId}-page`);
        });

        // Special initialization for certain pages
        if (pageId === 'flashcards') {
            initFlashcards();
        } else if (pageId === 'practice') {
            resetWritingCanvas();
        }
    }

    // Flashcard system
    function initFlashcards() {
        // In a real app, this would load from the user's vocabulary
        state.flashcards = [
            { front: "Hello", back: "مرحبا", audio: "assets/audio/hello.mp3" },
            { front: "Thank you", back: "شكرا", audio: "assets/audio/thanks.mp3" },
            { front: "Water", back: "ماء", audio: "assets/audio/water.mp3" }
        ];
        
        updateFlashcardDisplay();
    }

    function flipCard() {
        elements.flashcard.classList.toggle('flipped');
    }

    function goToNextCard() {
        // Flashcard navigation logic
        console.log("Next card");
    }

    function goToPrevCard() {
        // Flashcard navigation logic
        console.log("Previous card");
    }

    function updateFlashcardDisplay() {
        // Update flashcard content display
    }

    // Writing practice
    function setupWritingCanvas() {
        elements.ctx = elements.writingCanvas.getContext('2d');
        elements.isDrawing = false;
        elements.writingCanvas.width = elements.writingCanvas.offsetWidth;
        elements.writingCanvas.height = elements.writingCanvas.offsetHeight;
        
        // Set initial canvas styles
        elements.ctx.strokeStyle = '#333';
        elements.ctx.lineWidth = 3;
        elements.ctx.lineCap = 'round';
    }

    function setupCanvasEvents() {
        elements.writingCanvas.addEventListener('mousedown', startDrawing);
        elements.writingCanvas.addEventListener('mousemove', draw);
        elements.writingCanvas.addEventListener('mouseup', stopDrawing);
        elements.writingCanvas.addEventListener('mouseout', stopDrawing);
        
        // Touch support
        elements.writingCanvas.addEventListener('touchstart', handleTouch);
        elements.writingCanvas.addEventListener('touchmove', handleTouch);
        elements.writingCanvas.addEventListener('touchend', stopDrawing);
    }

    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(
            e.type === 'touchstart' ? 'mousedown' : 'mousemove',
            {
                clientX: touch.clientX,
                clientY: touch.clientY
            }
        );
        elements.writingCanvas.dispatchEvent(mouseEvent);
    }

    function startDrawing(e) {
        elements.isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!elements.isDrawing) return;
        
        const rect = elements.writingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        elements.ctx.lineTo(x, y);
        elements.ctx.stroke();
        elements.ctx.beginPath();
        elements.ctx.moveTo(x, y);
    }

    function stopDrawing() {
        elements.isDrawing = false;
        elements.ctx.beginPath();
    }

    function resetWritingCanvas() {
        elements.ctx.clearRect(0, 0, elements.writingCanvas.width, elements.writingCanvas.height);
    }

    // Vocabulary management
    function showAddVocabModal() {
        elements.addVocabModal.style.display = 'block';
        setTimeout(() => {
            elements.addVocabModal.style.opacity = '1';
        }, 10);
    }

    function hideAddVocabModal() {
        elements.addVocabModal.style.opacity = '0';
        setTimeout(() => {
            elements.addVocabModal.style.display = 'none';
        }, 300);
    }

    function handleVocabSubmit(e) {
        e.preventDefault();
        
        const newVocab = {
            arabic: document.getElementById('arabic-word').value,
            english: document.getElementById('english-word').value,
            urdu: document.getElementById('urdu-word').value,
            category: document.getElementById('word-category').value,
            dateAdded: new Date().toISOString()
        };
        
        // In a real app, this would save to database
        state.vocabulary.push(newVocab);
        
        // Show success notification
        showNotification('Vocabulary added successfully!', 'success');
        
        // Reset form
        elements.vocabForm.reset();
        hideAddVocabModal();
    }

    // Charts and visualization
    function initCharts() {
        // Progress chart
        const progressCtx = document.getElementById('progress-chart').getContext('2d');
        state.progressChart = new Chart(progressCtx, {
            type: 'doughnut',
            data: {
                labels: ['Learned', 'Reviewing', 'New'],
                datasets: [{
                    data: [65, 20, 15],
                    backgroundColor: [
                        '#2ecc71',
                        '#f39c12',
                        '#3498db'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color')
                        }
                    }
                }
            }
        });
    }

    function updateChartThemes() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
        
        if (state.progressChart) {
            state.progressChart.options.plugins.legend.labels.color = textColor;
            state.progressChart.update();
        }
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <p>${message}</p>
            <button class="btn-close-notification">&times;</button>
        `;
        
        const notificationCenter = document.getElementById('notification-center');
        notificationCenter.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.btn-close-notification').addEventListener('click', () => {
            notification.remove();
        });
    }

    function getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Data loading
    function loadInitialData() {
        // In a real app, this would fetch from an API
        fetch('json/2025-07-20.json')
            .then(response => response.json())
            .then(data => {
                state.vocabulary = data.vocabulary.map(item => ({
                    ...item,
                    category: 'general',
                    dateAdded: data.date
                }));
            })
            .catch(error => {
                console.error('Error loading vocabulary:', error);
                showNotification('Failed to load vocabulary data', 'error');
            });
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', Arabica.init);