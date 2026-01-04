// Task 0: Initial quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Wisdom" },
    { text: "Be the change that you wish to see in the world.", category: "Inspiration" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" }
];

// Task 1 & 2: Web Storage functions
function loadQuotesFromStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
    
    const storedFilter = localStorage.getItem('lastFilter');
    if (storedFilter) {
        document.getElementById('categoryFilter').value = storedFilter;
    }
    
    // Session storage demo
    const lastView = sessionStorage.getItem('lastViewedQuote');
    if (lastView) {
        console.log('Last viewed quote was:', lastView);
    }
}

function saveQuotesToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function saveLastFilter(filter) {
    localStorage.setItem('lastFilter', filter);
}

// Task 0: Display functions
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = '<p>No quotes available. Add some quotes!</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    // Save to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    
    displayQuote(quote);
}

function displayQuote(quote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <h2>Quote</h2>
        <p><em>"${quote.text}"</em></p>
        <p><strong>Category:</strong> ${quote.category}</p>
        <p><small>Total quotes in collection: ${quotes.length}</small></p>
    `;
}

// Task 0: Add quote form functionality
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();
    
    if (!text || !category) {
        alert('Please enter both quote text and category');
        return;
    }
    
    const newQuote = {
        text: text,
        category: category
    };
    
    quotes.push(newQuote);
    saveQuotesToStorage();
    
    // Clear inputs
    textInput.value = '';
    categoryInput.value = '';
    
    // Update categories dropdown
    populateCategories();
    
    // Show notification
    showNotification('Quote added successfully!');
    
    // Display the new quote
    displayQuote(newQuote);
}

// Task 2: Category filtering functions
function populateCategories() {
    const filterSelect = document.getElementById('categoryFilter');
    
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Save current value
    const currentValue = filterSelect.value;
    
    // Clear and repopulate
    filterSelect.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterSelect.appendChild(option);
    });
    
    // Restore selection
    if (categories.includes(currentValue)) {
        filterSelect.value = currentValue;
    }
    
    filterQuotes();
}

function filterQuotes() {
    const filterSelect = document.getElementById('categoryFilter');
    const selectedCategory = filterSelect.value;
    
    // Save filter preference
    saveLastFilter(selectedCategory);
    
    // Filter logic
    let filteredQuotes;
    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Display filtered quotes count
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (filteredQuotes.length > 0) {
        // Show random quote from filtered list
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        displayQuote(filteredQuotes[randomIndex]);
        quoteDisplay.innerHTML += `<p>Showing ${filteredQuotes.length} quote(s) in this category</p>`;
    } else {
        quoteDisplay.innerHTML = `<p>No quotes found in category: "${selectedCategory}"</p>`;
    }
}

// Task 1: JSON Import/Export functions
function exportToJson() {
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const downloadUrl = URL.createObjectURL(dataBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'quotes.json';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(downloadUrl);
    
    showNotification('Quotes exported successfully!');
}

function importFromJson() {
    const fileInput = document.getElementById('importFile');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a JSON file first');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid format: Expected an array of quotes');
            }
            
            // Basic validation
            const validQuotes = importedQuotes.filter(q => 
                q && typeof q === 'object' && 
                typeof q.text === 'string' && 
                typeof q.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in file');
            }
            
            // Add imported quotes
            quotes.push(...validQuotes);
            saveQuotesToStorage();
            populateCategories();
            showNotification(`Successfully imported ${validQuotes.length} quote(s)!`);
            
            // Clear file input
            fileInput.value = '';
            
        } catch (error) {
            alert(`Error importing quotes: ${error.message}`);
            console.error('Import error:', error);
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file');
    };
    
    reader.readAsText(file);
}

// Task 3: Server sync simulation (using JSONPlaceholder)
let lastSyncTime = null;

async function syncWithServer() {
    try {
        showNotification('Syncing with server...');
        
        // Simulate fetching from server (using JSONPlaceholder as mock API)
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
        const serverPosts = await response.json();
        
        // Convert posts to our quote format
        const serverQuotes = serverPosts.map(post => ({
            text: post.title,
            category: 'Server Sync'
        }));
        
        // Conflict resolution: Server data takes precedence
        // Remove any existing server-synced quotes
        quotes = quotes.filter(q => q.category !== 'Server Sync');
        
        // Add new server quotes
        quotes.push(...serverQuotes);
        saveQuotesToStorage();
        
        lastSyncTime = new Date();
        showNotification(`Synced ${serverQuotes.length} quotes from server at ${lastSyncTime.toLocaleTimeString()}`);
        
        // Update display
        populateCategories();
        
    } catch (error) {
        console.error('Sync failed:', error);
        showNotification('Server sync failed. Working offline.', 'error');
    }
}

// Task 3: Conflict resolution notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Style based on type
    if (type === 'error') {
        notification.style.backgroundColor = '#ffebee';
        notification.style.borderLeftColor = '#f44336';
    } else {
        notification.style.backgroundColor = '#e7f3fe';
        notification.style.borderLeftColor = '#2196F3';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Task 3: Manual conflict resolution option
function resolveConflict(conflictData) {
    if (confirm('Conflict detected! Would you like to keep local changes?')) {
        // Keep local data
        showNotification('Local changes preserved');
    } else {
        // Use server data
        quotes = conflictData.serverQuotes;
        saveQuotesToStorage();
        populateCategories();
        showNotification('Using server data');
    }
}

// Initialize application
function init() {
    // Load from storage
    loadQuotesFromStorage();
    
    // Populate categories
    populateCategories();
    
    // Show initial random quote
    showRandomQuote();
    
    // Event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
    
    // Task 3: Auto-sync every 30 seconds
    setInterval(syncWithServer, 30000);
    
    // Initial sync after 5 seconds
    setTimeout(syncWithServer, 5000);
    
    console.log('Dynamic Quote Generator initialized');
}

// Make functions globally available for onclick attributes
window.addQuote = addQuote;
window.importFromJson = importFromJson;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);