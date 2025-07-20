document.addEventListener('DOMContentLoaded', function() {
    // Dark mode functionality
    function initializeDarkMode() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Update Chart.js colors for dark mode
        if (darkMode && window.vocabChart) {
            updateChartForDarkMode(window.vocabChart);
        }
        
        return darkMode;
    }
    
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update Chart.js colors if chart exists
        if (window.vocabChart) {
            updateChartForDarkMode(window.vocabChart);
        }
        
        return isDarkMode;
    }
    
    function updateChartForDarkMode(chart) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            chart.options.scales.x.grid.color = 'rgba(255, 255, 255, 0.1)';
            chart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
            chart.options.scales.x.ticks.color = '#e0e0e0';
            chart.options.scales.y.ticks.color = '#e0e0e0';
            chart.options.plugins.title.color = '#e0e0e0';
        } else {
            chart.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.1)';
            chart.options.scales.y.grid.color = 'rgba(0, 0, 0, 0.1)';
            chart.options.scales.x.ticks.color = '#666';
            chart.options.scales.y.ticks.color = '#666';
            chart.options.plugins.title.color = '#333';
        }
        
        chart.update();
    }
    
    // Initialize dark mode
    const isDarkMode = initializeDarkMode();
    
    // Set up theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.textContent = isDarkMode ? '🌞' : '🌙';
    themeToggle.addEventListener('click', function() {
        const isDarkMode = toggleDarkMode();
        this.textContent = isDarkMode ? '🌞' : '🌙';
    });
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Navigation between pages
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${pageId}-page`).classList.add('active');
            
            // Load data if needed
            if (pageId === 'vocabulary') {
                loadVocabularyPage();
            } else if (pageId === 'stats') {
                loadStatisticsPage();
            }
        });
    });
    
    // Load all JSON files and display data
    loadAllNotes();
    
    // Function to fetch all JSON files from the json folder
async function loadAllNotes() {
    try {
        // Define the dates you have files for
        const dates = [
            '2025-07-20',
            '2025-07-19',
            '2025-07-18'
            // Add more dates as needed
        ];
        
        const allNotes = [];
        
        // Load each file in parallel
        const filePromises = dates.map(async date => {
            try {
                const response = await fetch(`json/${date}.json`);
                if (!response.ok) return null; // Skip if file doesn't exist
                return await response.json();
            } catch (e) {
                return null; // Skip if there's an error
            }
        });
        
        const loadedNotes = await Promise.all(filePromises);
        // Filter out null values (files that didn't exist)
        allNotes.push(...loadedNotes.filter(note => note !== null));
        
        // Display all notes
        displayDailyNotes(allNotes);
        
        // Initialize other pages with all data
        initializeVocabularyPage(allNotes);
        initializeStatisticsPage(allNotes);
    } catch (error) {
        console.error('Error loading notes:', error);
        alert('Failed to load learning notes. Please try again later.');
    }
}
    
    // Display daily notes on the home page
    function displayDailyNotes(notes) {
        const container = document.getElementById('notes-container');
        container.innerHTML = '';
        
        // Sort notes by date (newest first)
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'daily-note';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'note-date';
            dateHeader.textContent = formatDate(note.date) + ' - ' + note.topic;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'note-content';
            
            // Add vocabulary section
            if (note.vocabulary && note.vocabulary.length > 0) {
                const vocabHeader = document.createElement('h3');
                vocabHeader.textContent = 'Vocabulary';
                contentDiv.appendChild(vocabHeader);
                
                const vocabList = document.createElement('div');
                vocabList.className = 'vocab-list';
                
                note.vocabulary.forEach(vocab => {
                    const vocabItem = document.createElement('div');
                    vocabItem.className = 'vocab-item';
                    
                    const arabicDiv = document.createElement('div');
                    arabicDiv.innerHTML = `<strong>Arabic:</strong> ${vocab.arabic}`;
                    
                    const englishDiv = document.createElement('div');
                    englishDiv.innerHTML = `<strong>English:</strong> ${vocab.english}`;
                    
                    const urduDiv = document.createElement('div');
                    urduDiv.innerHTML = `<strong>Urdu:</strong> ${vocab.urdu || 'N/A'}`;
                    
                    vocabItem.appendChild(arabicDiv);
                    vocabItem.appendChild(englishDiv);
                    vocabItem.appendChild(urduDiv);
                    
                    if (vocab.example) {
                        const exampleDiv = document.createElement('div');
                        exampleDiv.className = 'example';
                        exampleDiv.innerHTML = `<strong>Example:</strong> ${vocab.example.arabic} (${vocab.example.english})`;
                        vocabItem.appendChild(exampleDiv);
                    }
                    
                    vocabList.appendChild(vocabItem);
                });
                
                contentDiv.appendChild(vocabList);
            }
            
            // Add sentences section
            if (note.sentences && note.sentences.length > 0) {
                const sentencesHeader = document.createElement('h3');
                sentencesHeader.textContent = 'Sentences';
                contentDiv.appendChild(sentencesHeader);
                
                const sentenceList = document.createElement('div');
                sentenceList.className = 'sentence-list';
                
                note.sentences.forEach(sentence => {
                    const sentenceItem = document.createElement('div');
                    sentenceItem.className = 'sentence-item';
                    
                    const arabicDiv = document.createElement('div');
                    arabicDiv.innerHTML = `<strong>Arabic:</strong> ${sentence.arabic}`;
                    
                    const englishDiv = document.createElement('div');
                    englishDiv.innerHTML = `<strong>English:</strong> ${sentence.english}`;
                    
                    sentenceItem.appendChild(arabicDiv);
                    sentenceItem.appendChild(englishDiv);
                    sentenceList.appendChild(sentenceItem);
                });
                
                contentDiv.appendChild(sentenceList);
            }
            
            // Toggle functionality
            dateHeader.addEventListener('click', function() {
                this.classList.toggle('active');
                contentDiv.classList.toggle('active');
            });
            
            noteElement.appendChild(dateHeader);
            noteElement.appendChild(contentDiv);
            container.appendChild(noteElement);
        });
    }
    
    // Initialize vocabulary page
    function initializeVocabularyPage(notes) {
        // This would be called when the page loads or when new data is added
        // For now, we'll just store the notes for when the vocabulary page is opened
        window.vocabularyNotes = notes;
    }
    
    // Load vocabulary page content
    function loadVocabularyPage() {
        const container = document.getElementById('vocabulary-container');
        container.innerHTML = '';
        
        if (!window.vocabularyNotes) return;
        
        // Flatten all vocabulary from all notes
        let allVocabulary = [];
        window.vocabularyNotes.forEach(note => {
            if (note.vocabulary && note.vocabulary.length > 0) {
                note.vocabulary.forEach(vocab => {
                    allVocabulary.push({
                        ...vocab,
                        date: note.date
                    });
                });
            }
        });
        
        // Apply search filter
        const searchTerm = document.getElementById('vocab-search').value.toLowerCase();
        if (searchTerm) {
            allVocabulary = allVocabulary.filter(vocab => 
                vocab.arabic.toLowerCase().includes(searchTerm) || 
                vocab.english.toLowerCase().includes(searchTerm) ||
                (vocab.urdu && vocab.urdu.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply sorting
        const sortOption = document.getElementById('vocab-sort').value;
        switch (sortOption) {
            case 'date-desc':
                allVocabulary.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                allVocabulary.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'word-asc':
                allVocabulary.sort((a, b) => a.english.localeCompare(b.english));
                break;
            case 'word-desc':
                allVocabulary.sort((a, b) => b.english.localeCompare(a.english));
                break;
        }
        
        // Display vocabulary
        allVocabulary.forEach(vocab => {
            const vocabCard = document.createElement('div');
            vocabCard.className = 'vocab-card';
            
            const arabicHeading = document.createElement('h3');
            arabicHeading.textContent = vocab.arabic;
            vocabCard.appendChild(arabicHeading);
            
            const englishPara = document.createElement('p');
            englishPara.innerHTML = `<strong>English:</strong> ${vocab.english}`;
            vocabCard.appendChild(englishPara);
            
            const urduPara = document.createElement('p');
            urduPara.innerHTML = `<strong>Urdu:</strong> ${vocab.urdu || 'N/A'}`;
            vocabCard.appendChild(urduPara);
            
            if (vocab.example) {
                const examplePara = document.createElement('p');
                examplePara.className = 'example';
                examplePara.innerHTML = `<strong>Example:</strong> ${vocab.example.arabic} <em>(${vocab.example.english})</em>`;
                vocabCard.appendChild(examplePara);
            }
            
            const datePara = document.createElement('p');
            datePara.className = 'vocab-date';
            datePara.innerHTML = `<small>Added on: ${formatDate(vocab.date)}</small>`;
            vocabCard.appendChild(datePara);
            
            container.appendChild(vocabCard);
        });
        
        // Add event listeners for search and sort
        document.getElementById('vocab-search').addEventListener('input', loadVocabularyPage);
        document.getElementById('vocab-sort').addEventListener('change', loadVocabularyPage);
    }
    
    // Initialize statistics page
    function initializeStatisticsPage(notes) {
        // This would be called when the page loads or when new data is added
        // For now, we'll just store the notes for when the stats page is opened
        window.statsNotes = notes;
    }
    
    // Load statistics page content
    function loadStatisticsPage() {
        if (!window.statsNotes) return;
        
        // Calculate basic statistics
        let totalVocab = 0;
        let totalSentences = 0;
        const vocabByDate = [];
        const wordFrequency = {};
        const earliestDate = new Date(window.statsNotes[0].date);
        const latestDate = new Date(window.statsNotes[0].date);
        
        window.statsNotes.forEach(note => {
            const noteDate = new Date(note.date);
            if (noteDate < earliestDate) earliestDate = noteDate;
            if (noteDate > latestDate) latestDate = noteDate;
            // Count vocabulary
            if (note.vocabulary) {
                totalVocab += note.vocabulary.length;
                vocabByDate.push({
                    date: note.date,
                    count: note.vocabulary.length
                });
                
                // Count word frequency
                note.vocabulary.forEach(vocab => {
                    const key = `${vocab.arabic}|${vocab.english}`;
                    wordFrequency[key] = (wordFrequency[key] || 0) + 1;
                });
            }
            
            // Count sentences
            if (note.sentences) {
                totalSentences += note.sentences.length;
            }
        });
        
    // Calculate days between first and last note
    const daysLearning = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Update statistics cards
    document.getElementById('total-vocab').textContent = totalVocab;
    document.getElementById('total-sentences').textContent = totalSentences;
    document.getElementById('total-days').textContent = daysLearning;
        
        // Prepare word frequency list
        const wordFrequencyList = Object.entries(wordFrequency)
            .map(([key, count]) => {
                const [arabic, english] = key.split('|');
                return { arabic, english, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 most frequent words
        
        const frequencyListElement = document.getElementById('word-frequency-list');
        frequencyListElement.innerHTML = '';
        
        wordFrequencyList.forEach(word => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${word.arabic}</strong> (${word.english}) - <em>${word.count} ${word.count === 1 ? 'time' : 'times'}</em>`;
            frequencyListElement.appendChild(li);
        });
        
        // Create vocabulary over time chart
        createVocabularyChart(vocabByDate);
    }
    
    // Create Chart.js chart for vocabulary over time
    function createVocabularyChart(data) {
        const ctx = document.getElementById('vocab-chart').getContext('2d');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Sort data by date
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const dates = data.map(item => formatDate(item.date, true));
        const counts = data.map(item => item.count);
        
        // Destroy previous chart if it exists
        if (window.vocabChart) {
            window.vocabChart.destroy();
        }
        
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const ticksColor = isDarkMode ? '#e0e0e0' : '#666';
        const titleColor = isDarkMode ? '#e0e0e0' : '#333';
        
        window.vocabChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Vocabulary Learned',
                    data: counts,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Vocabulary Learning Progress',
                        color: titleColor
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Words: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Words',
                            color: ticksColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: ticksColor
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            color: ticksColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: ticksColor
                        }
                    }
                }
            }
        });
    }
    
    // Helper function to format dates
    function formatDate(dateString, short = false) {
        const date = new Date(dateString);
        if (short) {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
});
