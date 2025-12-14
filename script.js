// ============================================
// MAIN DATA AND CONFIGURATION
// ============================================

// Main quotes array (REQUIRED for Task 0)
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" },
    { text: "Whoever is happy will make others happy too.", category: "Happiness" },
    { text: "You must be the change you wish to see in the world.", category: "Change" }
];

// Server sync variables
let isSyncing = false;
let syncInterval = null;
let conflicts = [];
let lastSyncTime = null;

// Mock server URL (JSONPlaceholder - REQUIRED for Task 3)
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// ============================================
// TASK 0: DOM MANIPULATION FUNCTIONS
// ============================================

// REQUIRED: displayRandomQuote function
function displayRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = `
            <p class="quote-text">No quotes available. Add some quotes!</p>
            <span class="quote-category">Empty</span>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    document.getElementById('quoteDisplay').innerHTML = `
        <p class="quote-text">"${quote.text}"</p>
        <span class="quote-category">${quote.category}</span>
    `;
    
    // Save last viewed quote to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// REQUIRED: addQuote function
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (!newQuoteText || !newQuoteCategory) {
        showNotification('Please enter both quote text and category.', 'error');
        return;
    }
    
    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };
    
    quotes.push(newQuote);
    
    // Save to local storage
    saveQuotesToLocalStorage();
    
    // Update UI
    updateQuoteCount();
    populateCategories();
    
    // Show success
    showNotification(`"${newQuoteText}" added to ${newQuoteCategory}!`, 'success');
    
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Display the new quote
    displayRandomQuote();
}

// Helper: Show all quotes
function showAllQuotes() {
    const section = document.getElementById('quotesListSection');
    const list = document.getElementById('allQuotesList');
    
    if (quotes.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666;">No quotes yet. Add some quotes!</p>';
        section.style.display = 'block';
        return;
    }
    
    let html = '';
    quotes.forEach((quote, index) => {
        html += `
            <div class="quote-item">
                <div class="quote-item-content">
                    <p class="quote-item-text">"${quote.text}"</p>
                    <span class="quote-item-category">${quote.category}</span>
                </div>
                <button onclick="deleteQuote(${index})" class="danger" style="padding: 5px 10px; font-size: 0.9em;">
                    <span>🗑️</span>
                </button>
            </div>
        `;
    });
    
    list.innerHTML = html;
    section.style.display = 'block';
}

// Helper: Delete quote
function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const deletedQuote = quotes.splice(index, 1)[0];
        saveQuotesToLocalStorage();
        updateQuoteCount();
        populateCategories();
        showAllQuotes();
        showNotification(`Deleted quote from ${deletedQuote.category}`, 'info');
    }
}

// ============================================
// TASK 1: WEB STORAGE AND JSON FUNCTIONS
// ============================================

// REQUIRED: Save quotes to local storage
function saveQuotesToLocalStorage() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        localStorage.setItem('lastUpdated', new Date().toISOString());
        return true;
    } catch (error) {
        console.error('Error saving quotes:', error);
        showNotification('Error saving quotes to storage.', 'error');
        return false;
    }
}

// REQUIRED: Load quotes from local storage on initialization
function loadQuotesFromLocalStorage() {
    try {
        const savedQuotes = localStorage.getItem('quotes');
        if (savedQuotes) {
            const parsedQuotes = JSON.parse(savedQuotes);
            if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) {
                quotes = parsedQuotes;
                updateQuoteCount();
                populateCategories();
                showNotification(`Loaded ${quotes.length} quotes from local storage.`, 'success');
                return true;
            }
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
        showNotification('Error loading quotes from storage.', 'error');
    }
    return false;
}

// Session storage functions
function saveSessionPreference() {
    const currentFilter = document.getElementById('categoryFilter').value;
    sessionStorage.setItem('preferredFilter', currentFilter);
    sessionStorage.setItem('lastVisit', new Date().toISOString());
    showNotification('Session preferences saved!', 'success');
}

function loadSessionPreference() {
    const savedFilter = sessionStorage.getItem('preferredFilter');
    const lastVisit = sessionStorage.getItem('lastVisit');
    
    if (savedFilter) {
        document.getElementById('categoryFilter').value = savedFilter;
        filterQuotes();
    }
    
    if (lastVisit) {
        showNotification(`Welcome back! Last visit: ${new Date(lastVisit).toLocaleString()}`, 'info');
    }
}

// REQUIRED: Export quotes to JSON file
function exportToJsonFile() {
    try {
        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
        
        showNotification(`Exported ${quotes.length} quotes to JSON file.`, 'success');
        return true;
    } catch (error) {
        console.error('Error exporting quotes:', error);
        showNotification('Error exporting quotes.', 'error');
        return false;
    }
}

// REQUIRED: Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid JSON format. Expected an array of quotes.');
            }
            
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && quote.text.trim() !== '' &&
                typeof quote.category === 'string' && quote.category.trim() !== ''
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file.');
            }
            
            // Check for conflicts
            let addedCount = 0;
            validQuotes.forEach(importedQuote => {
                const exists = quotes.some(existingQuote => 
                    existingQuote.text === importedQuote.text && 
                    existingQuote.category === importedQuote.category
                );
                
                if (!exists) {
                    quotes.push(importedQuote);
                    addedCount++;
                }
            });
            
            saveQuotesToLocalStorage();
            updateQuoteCount();
            populateCategories();
            event.target.value = '';
            
            showNotification(`Imported ${addedCount} new quotes successfully!`, 'success');
            
        } catch (error) {
            console.error('Error importing quotes:', error);
            showNotification('Error importing quotes: ' + error.message, 'error');
        }
    };
    
    fileReader.onerror = function() {
        showNotification('Error reading file.', 'error');
    };
    
    fileReader.readAsText(file);
}

// Data management functions
function clearAllQuotes() {
    if (confirm('Are you sure you want to clear ALL quotes? This cannot be undone.')) {
        quotes = [];
        saveQuotesToLocalStorage();
        updateQuoteCount();
        populateCategories();
        displayRandomQuote();
        document.getElementById('quotesListSection').style.display = 'none';
        showNotification('All quotes cleared.', 'success');
    }
}

function resetToDefault() {
    if (confirm('Reset to default quotes? This will replace all current quotes.')) {
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Motivation" },
            { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
            { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" },
            { text: "Whoever is happy will make others happy too.", category: "Happiness" },
            { text: "You must be the change you wish to see in the world.", category: "Change" }
        ];
        saveQuotesToLocalStorage();
        updateQuoteCount();
        populateCategories();
        displayRandomQuote();
        showNotification('Reset to default quotes.', 'success');
    }
}

// ============================================
// TASK 2: FILTERING FUNCTIONS
// ============================================

// REQUIRED: populateCategories function
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Save current selection
    const currentSelection = categoryFilter.value;
    
    // Clear and rebuild options
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (categories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    }
    
    // Save categories to local storage
    localStorage.setItem('categories', JSON.stringify(categories));
}

// REQUIRED: filterQuotes function
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    // Save filter preference
    localStorage.setItem('lastFilter', selectedCategory);
    
    // Filter quotes
    let filteredQuotes;
    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
        showNotification(`Showing all ${quotes.length} quotes.`, 'info');
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        showNotification(`Showing ${filteredQuotes.length} quotes in "${selectedCategory}".`, 'info');
    }
    
    // Display filtered quotes
    const list = document.getElementById('allQuotesList');
    const section = document.getElementById('quotesListSection');
    
    if (filteredQuotes.length === 0) {
        list.innerHTML = `<p style="text-align: center; color: #666;">No quotes found in category "${selectedCategory}"</p>`;
    } else {
        let html = '';
        filteredQuotes.forEach((quote, index) => {
            const originalIndex = quotes.findIndex(q => q.text === quote.text && q.category === quote.category);
            html += `
                <div class="quote-item">
                    <div class="quote-item-content">
                        <p class="quote-item-text">"${quote.text}"</p>
                        <span class="quote-item-category">${quote.category}</span>
                    </div>
                    <button onclick="deleteQuote(${originalIndex})" class="danger" style="padding: 5px 10px; font-size: 0.9em;">
                        <span>🗑️</span>
                    </button>
                </div>
            `;
        });
        list.innerHTML = html;
    }
    
    section.style.display = 'block';
}

function clearFilter() {
    document.getElementById('categoryFilter').value = 'all';
    localStorage.removeItem('lastFilter');
    showAllQuotes();
    showNotification('Filter cleared.', 'info');
}

// ============================================
// TASK 3: SERVER SYNC FUNCTIONS
// ============================================

// REQUIRED: fetchQuotesFromServer function
async function fetchQuotesFromServer() {
    try {
        showSyncNotification('Fetching quotes from server...', 'info');
        
        // Using JSONPlaceholder as mock API
        const response = await fetch(MOCK_SERVER_URL);
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const serverData = await response.json();
        
        // Convert server data to our quote format
        const serverQuotes = serverData.slice(0, 10).map(post => ({
            text: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
            category: 'Server'
        }));
        
        showSyncNotification(`Fetched ${serverQuotes.length} quotes from server.`, 'success');
        return serverQuotes;
        
    } catch (error) {
        console.error('Error fetching from server:', error);
        showSyncNotification('Failed to fetch from server: ' + error.message, 'error');
        return [];
    }
}

// REQUIRED: postQuotesToServer function
async function postQuotesToServer() {
    try {
        showSyncNotification('Posting quotes to server...', 'info');
        
        // Prepare data for server
        const quotesToSend = quotes.slice(0, 5).map((quote, index) => ({
            id: index + 1,
            title: quote.text,
            body: `Category: ${quote.category}`,
            userId: 1
        }));
        
        // Post to mock server
        const responses = await Promise.all(
            quotesToSend.map(quote => 
                fetch(MOCK_SERVER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(quote)
                })
            )
        );
        
        const results = await Promise.all(responses.map(r => r.json()));
        
        showSyncNotification(`Posted ${results.length} quotes to server.`, 'success');
        return results;
        
    } catch (error) {
        console.error('Error posting to server:', error);
        showSyncNotification('Failed to post to server: ' + error.message, 'error');
        return [];
    }
}

// REQUIRED: syncQuotes function
async function syncQuotes() {
    if (isSyncing) {
        showSyncNotification('Sync already in progress.', 'info');
        return;
    }
    
    isSyncing = true;
    updateSyncStatus('syncing');
    showSyncNotification('Starting sync with server...', 'info');
    
    try {
        // Fetch from server
        const serverQuotes = await fetchQuotesFromServer();
        
        // Post local quotes to server
        await postQuotesToServer();
        
        // Merge server quotes with local quotes
        let addedCount = 0;
        let conflictCount = 0;
        const newConflicts = [];
        
        serverQuotes.forEach(serverQuote => {
            const exists = quotes.some(localQuote => 
                localQuote.text === serverQuote.text && 
                localQuote.category === serverQuote.category
            );
            
            if (!exists) {
                // Check for conflicts
                const conflict = quotes.find(localQuote => 
                    localQuote.text === serverQuote.text && 
                    localQuote.category !== serverQuote.category
                );
                
                if (conflict) {
                    newConflicts.push({
                        local: conflict,
                        server: serverQuote,
                        timestamp: new Date().toISOString()
                    });
                    conflictCount++;
                } else {
                    quotes.push(serverQuote);
                    addedCount++;
                }
            }
        });
        
        // Add new conflicts
        if (newConflicts.length > 0) {
            conflicts.push(...newConflicts);
            localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
        }
        
        // Save updated quotes
        saveQuotesToLocalStorage();
        updateQuoteCount();
        populateCategories();
        
        // Update last sync time
        lastSyncTime = new Date();
        document.getElementById('lastSyncTime').textContent = lastSyncTime.toLocaleTimeString();
        localStorage.setItem('lastSync', lastSyncTime.toISOString());
        
        // Show summary
        let message = `Sync complete. Added ${addedCount} new quotes.`;
        if (conflictCount > 0) {
            message += ` ${conflictCount} conflicts detected.`;
            showConflictNotification();
        }
        
        showSyncNotification(message, conflictCount > 0 ? 'warning' : 'success');
        
    } catch (error) {
        console.error('Sync error:', error);
        showSyncNotification('Sync failed: ' + error.message, 'error');
    } finally {
        isSyncing = false;
        updateSyncStatus('online');
    }
}

// REQUIRED: Auto sync functionality
function startAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    syncInterval = setInterval(() => {
        syncQuotes();
    }, 30000); // 30 seconds
    
    document.getElementById('autoSyncBtn').innerHTML = '<span>⏹️</span> Stop Auto Sync';
    showSyncNotification('Auto-sync started (every 30 seconds).', 'success');
}

function stopAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        document.getElementById('autoSyncBtn').innerHTML = '<span>⏰</span> Start Auto Sync (30s)';
        showSyncNotification('Auto-sync stopped.', 'info');
    }
}

function toggleAutoSync() {
    if (syncInterval) {
        stopAutoSync();
    } else {
        startAutoSync();
    }
}

// REQUIRED: Conflict resolution
function resolveConflicts() {
    if (conflicts.length === 0) {
        const savedConflicts = localStorage.getItem('quoteConflicts');
        if (savedConflicts) {
            conflicts = JSON.parse(savedConflicts);
        }
    }
    
    if (conflicts.length === 0) {
        showSyncNotification('No conflicts to resolve.', 'info');
        return;
    }
    
    let resolvedCount = 0;
    const unresolvedConflicts = [];
    
    conflicts.forEach(conflict => {
        const index = quotes.findIndex(q => 
            q.text === conflict.local.text && 
            q.category === conflict.local.category
        );
        
        if (index !== -1) {
            quotes[index] = conflict.server;
            resolvedCount++;
        } else {
            unresolvedConflicts.push(conflict);
        }
    });
    
    conflicts = unresolvedConflicts;
    
    saveQuotesToLocalStorage();
    localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
    updateQuoteCount();
    populateCategories();
    
    showSyncNotification(`Resolved ${resolvedCount} conflicts.`, 'success');
    
    if (conflicts.length === 0) {
        document.getElementById('conflictNotification').style.display = 'none';
    }
}

// REQUIRED: UI notifications for conflicts
function showConflictNotification() {
    const notification = document.getElementById('conflictNotification');
    notification.innerHTML = `
        <strong>⚠️ ${conflicts.length} Conflict(s) Detected!</strong>
        <p>Some quotes have different versions between local and server.</p>
        <div style="margin-top: 10px;">
            <button onclick="showConflictDetails()" style="background: #ed8936; margin-right: 10px;">
                View Details
            </button>
            <button onclick="resolveConflicts()" style="background: #48bb78;">
                Resolve Now
            </button>
        </div>
    `;
    notification.style.display = 'block';
}

function showConflictDetails() {
    if (conflicts.length === 0) {
        alert('No conflicts found.');
        return;
    }
    
    let details = `Found ${conflicts.length} conflict(s):\n\n`;
    
    conflicts.forEach((conflict, index) => {
        details += `Conflict ${index + 1}:\n`;
        details += `  📱 Local: "${conflict.local.text}" (${conflict.local.category})\n`;
        details += `  🌐 Server: "${conflict.server.text}" (${conflict.server.category})\n\n`;
    });
    
    details += 'Click "Resolve Conflicts" to use server versions.';
    
    alert(details);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function updateQuoteCount() {
    document.getElementById('quoteCount').textContent = quotes.length;
}

function updateSyncStatus(status) {
    const indicator = document.getElementById('syncStatus');
    indicator.className = 'status-indicator';
    
    if (status === 'online') {
        indicator.classList.add('status-online');
    } else if (status === 'offline') {
        indicator.classList.add('status-offline');
    } else if (status === 'syncing') {
        indicator.classList.add('status-syncing');
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function showSyncNotification(message, type) {
    const notification = document.getElementById('syncNotification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from local storage
    loadQuotesFromLocalStorage();
    
    // Populate categories
    populateCategories();
    
    // Load last filter
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        document.getElementById('categoryFilter').value = lastFilter;
    }
    
    // Load last sync time
    const lastSync = localStorage.getItem('lastSync');
    if (lastSync) {
        lastSyncTime = new Date(lastSync);
        document.getElementById('lastSyncTime').textContent = lastSyncTime.toLocaleTimeString();
    }
    
    // Load conflicts
    const savedConflicts = localStorage.getItem('quoteConflicts');
    if (savedConflicts) {
        conflicts = JSON.parse(savedConflicts);
        if (conflicts.length > 0) {
            setTimeout(() => {
                showConflictNotification();
            }, 1000);
        }
    }
    
    // Set up event listeners
    document.getElementById('newQuote').addEventListener('click', displayRandomQuote);
    document.getElementById('showAllQuotes').addEventListener('click', showAllQuotes);
    document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);
    document.getElementById('syncBtn').addEventListener('click', syncQuotes);
    document.getElementById('autoSyncBtn').addEventListener('click', toggleAutoSync);
    document.getElementById('resolveBtn').addEventListener('click', resolveConflicts);
    
    // Display initial quote
    displayRandomQuote();
    updateQuoteCount();
    updateSyncStatus('online');
    
    // Auto-sync on startup (optional)
    // setTimeout(() => startAutoSync(), 5000);
});