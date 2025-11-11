// Global variables
let players = [];
let tournaments = [];
let currentPlayerStats = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Load players and tournaments
        await loadPlayers();
        await loadTournaments();
        
        // Set up form event listeners
        setupEventListeners();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error initializing application', 'error');
    }
}

function setupEventListeners() {
    const form = document.getElementById('predictionForm');
    form.addEventListener('submit', handlePrediction);
    
    // Add change listeners for player selection to load stats
    document.getElementById('player1').addEventListener('change', function() {
        if (this.value) {
            loadPlayerStats(this.value);
        }
    });
    
    document.getElementById('player2').addEventListener('change', function() {
        if (this.value) {
            loadPlayerStats(this.value);
        }
    });
    
    // Add listener for surface change to update background theme
    document.getElementById('surface').addEventListener('change', function() {
        updateBackgroundTheme(this.value);
    });
    
    // Set initial theme based on default surface
    const defaultSurface = document.getElementById('surface').value;
    updateBackgroundTheme(defaultSurface);
}

function updateBackgroundTheme(surface) {
    const background = document.getElementById('animatedBackground');
    if (!background) return;
    
    // Remove all surface theme classes
    background.classList.remove('surface-theme-hard', 'surface-theme-clay', 'surface-theme-grass');
    
    // Add the appropriate theme class
    switch(surface) {
        case 'Clay':
            background.classList.add('surface-theme-clay');
            break;
        case 'Grass':
            background.classList.add('surface-theme-grass');
            break;
        case 'Hard':
        default:
            background.classList.add('surface-theme-hard');
            break;
    }
}

async function loadPlayers() {
    try {
        const response = await fetch('/api/players');
        const data = await response.json();
        
        if (data.players) {
            players = data.players;
            populateSelect('player1', players);
            populateSelect('player2', players);
        }
    } catch (error) {
        console.error('Error loading players:', error);
        // Fallback to default players
        players = ['Djokovic N.', 'Nadal R.', 'Federer R.', 'Alcaraz C.', 'Sinner J.', 'Medvedev D.', 'Tsitsipas S.', 'Zverev A.'];
        populateSelect('player1', players);
        populateSelect('player2', players);
    }
}

async function loadTournaments() {
    try {
        const response = await fetch('/api/tournaments');
        const data = await response.json();
        
        if (data.tournaments) {
            tournaments = data.tournaments;
            populateSelect('tournament', tournaments);
        }
    } catch (error) {
        console.error('Error loading tournaments:', error);
        // Fallback to default tournaments
        tournaments = ['Australian Open', 'French Open', 'Wimbledon', 'US Open', 'ATP Masters', 'ATP 500', 'ATP 250'];
        populateSelect('tournament', tournaments);
    }
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Add new options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    // Restore previous value if it exists
    if (currentValue && options.includes(currentValue)) {
        select.value = currentValue;
    }
}

async function loadPlayerStats(playerName) {
    try {
        const response = await fetch(`/api/player-stats/${encodeURIComponent(playerName)}`);
        const data = await response.json();
        
        if (data.error) {
            console.warn(`Stats not available for ${playerName}:`, data.error);
            return;
        }
        
        currentPlayerStats = data;
        updateStatsDisplay(data);
    } catch (error) {
        console.error('Error loading player stats:', error);
    }
}

function updateStatsDisplay(stats) {
    document.getElementById('totalMatches').textContent = stats.total_matches || '-';
    document.getElementById('winRate').textContent = stats.win_rate ? `${(stats.win_rate * 100).toFixed(1)}%` : '-';
    document.getElementById('avgRank').textContent = stats.avg_rank ? Math.round(stats.avg_rank) : '-';
    document.getElementById('favoriteSurface').textContent = stats.favorite_surface || '-';
}

async function handlePrediction(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const predictionData = {
        player1: formData.get('player1'),
        player2: formData.get('player2'),
        tournament: formData.get('tournament'),
        surface: formData.get('surface')
        // Date removed - not used in predictions anymore
    };
    
    // Validate form
    if (!predictionData.player1 || !predictionData.player2) {
        showNotification('Please select both players', 'error');
        return;
    }
    
    if (predictionData.player1 === predictionData.player2) {
        showNotification('Please select different players', 'error');
        return;
    }
    
    // Show loading overlay
    showLoadingOverlay();
    
    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(predictionData)
        });
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        displayPredictionResults(result);
        showNotification('Prediction completed successfully!', 'success');
        
    } catch (error) {
        console.error('Prediction error:', error);
        showNotification(`Prediction failed: ${error.message}`, 'error');
    } finally {
        hideLoadingOverlay();
    }
}

function displayPredictionResults(result) {
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Update match info (date removed)
    document.getElementById('matchTournament').textContent = result.tournament;
    document.getElementById('matchSurface').textContent = result.surface;
    
    // Update player names
    document.getElementById('player1Name').textContent = result.player1;
    document.getElementById('player2Name').textContent = result.player2;
    
    // Calculate probabilities for both players
    const player1Prob = result.player1_probability !== undefined ? result.player1_probability : result.probability;
    const player2Prob = result.player2_probability !== undefined ? result.player2_probability : (1 - result.probability);
    
    // Update player probabilities
    document.getElementById('player1Probability').textContent = `${(player1Prob * 100).toFixed(1)}%`;
    document.getElementById('player2Probability').textContent = `${(player2Prob * 100).toFixed(1)}%`;
    
    // Determine winner and update UI
    const isPlayer1Winner = result.prediction === 1;
    const player1Card = document.getElementById('player1Card');
    const player2Card = document.getElementById('player2Card');
    
    // Reset card styles
    player1Card.classList.remove('winner');
    player2Card.classList.remove('winner');
    
    // Add winner class to the winning player
    if (isPlayer1Winner) {
        player1Card.classList.add('winner');
    } else {
        player2Card.classList.add('winner');
    }
    
    // Update winner prediction
    document.getElementById('winnerName').textContent = result.winner;
    document.getElementById('winProbability').textContent = `${(result.probability * 100).toFixed(1)}%`;
    
    // Update explanation
    document.getElementById('explanationText').textContent = result.explanation;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function showLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#48bb78';
            break;
        case 'error':
            notification.style.backgroundColor = '#e53e3e';
            break;
        default:
            notification.style.backgroundColor = '#667eea';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
