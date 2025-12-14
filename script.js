// Main quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Inspiration" },
    { text: "Whoever is happy will make others happy too.", category: "Happiness" },
    { text: "You must be the change you wish to see in the world.", category: "Change" }
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const showAllQuotesBtn = document.getElementById('showAllQuotes');
const notification = document.getElementById('notification');

// Auto-sync variables
let autoSyncInterval = null;
let isAutoSyncEnabled = false;

// Conflict tracking
let conflicts = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from localStorage if available
    loadQuotesFromStorage();
    
    // Populate categories dropdown
    populateCategories();
    
    // Load last selected filter
    loadLastFilter();
    
    // Display initial random quote
    showRandomQuote();
    
    // Show all quotes
    showAllQuotes();
    
    // Setup event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    showAllQuotesBtn.addEventListener('click', showAllQuotes);
    
    // Setup import file listener
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);
    
    // Check for server updates periodically
    checkForServerUpdates();
    
    // Simulate initial server sync
    setTimeout(() => {
        simulateServerUpdate();
    }, 5000);
});

// TASK 0: DOM Manipulation Functions

function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="quote-text">No quotes available. Add some quotes!</p><span class="quote-category">Empty</span>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${quote.text}"</p>
        <span class="quote-category">${quote.category}</span>
    `;
    
    // Save last viewed quote to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function showAllQuotes() {
    const allQuotesList = document.getElementById('allQuotesList');
    
    if (quotes.length === 0) {
        allQuotesList.innerHTML = '<p>No quotes available.</p>';
        return;
    }
    
    let html = '<h3>All Quotes (' + quotes.length + ')</h3>';
    quotes.forEach((quote, index) => {
        html += `
            <div class="quote-item">
                <p>"${quote.text}"</p>
                <span class="quote-category">${quote.category}</span>
                <button onclick="deleteQuote(${index})" style="background: #dc3545; padding: 2px 8px; font-size: 0.8em;">Delete</button>
            </div>
        `;
    });
    
    allQuotesList.innerHTML = html;
}

function createAddQuoteForm() {
    // Form is already in HTML, this function ensures the form is properly integrated
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    
    // Clear form fields
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    
    // Focus on text input
    newQuoteText.focus();
}

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
    
    // Save to localStorage
    saveQuotes();
    
    // Update categories dropdown
    populateCategories();
    
    // Show success message
    showNotification('Quote added successfully!', 'success');
    
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Update display
    showAllQuotes();
}

function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const deletedQuote = quotes.splice(index, 1)[0];
        saveQuotes();
        populateCategories();
        showAllQuotes();
        showNotification(`Deleted quote: "${deletedQuote.text}"`, 'success');
    }
}

// TASK 1: Web Storage and JSON Handling

function saveQuotes() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        localStorage.setItem('lastUpdated', new Date().toISOString());
        
        // Also save to session storage for demonstration
        sessionStorage.setItem('currentQuotesCount', quotes.length.toString());
        
        return true;
    } catch (error) {
        console.error('Error saving quotes:', error);
        showNotification('Error saving quotes to storage.', 'error');
        return false;
    }
}

function loadQuotesFromStorage() {
    try {
        const savedQuotes = localStorage.getItem('quotes');
        if (savedQuotes) {
            const parsedQuotes = JSON.parse(savedQuotes);
            if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) {
                quotes = parsedQuotes;
                showNotification('Loaded quotes from local storage.', 'info');
            }
        }
        
        // Load from session storage for demonstration
        const sessionCount = sessionStorage.getItem('currentQuotesCount');
        if (sessionCount) {
            console.log(`Session has ${sessionCount} quotes`);
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
        showNotification('Error loading quotes from storage.', 'error');
    }
}

function exportToJson() {
    try {
        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'quotes-export-' + new Date().toISOString().split('T')[0] + '.json';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
        
        showNotification('Quotes exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting quotes:', error);
        showNotification('Error exporting quotes.', 'error');
    }
}

function importFromJson() {
    const fileInput = document.getElementById('importFile');
    
    if (!fileInput.files.length) {
        showNotification('Please select a JSON file to import.', 'error');
        return;
    }
    
    importFromJsonFile({ target: fileInput });
}

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
            
            // Validate each quote has required fields
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && typeof quote.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file.');
            }
            
            // Check for conflicts with existing quotes
            const newQuotes = [];
            validQuotes.forEach(importedQuote => {
                const exists = quotes.some(existingQuote => 
                    existingQuote.text === importedQuote.text && 
                    existingQuote.category === importedQuote.category
                );
                
                if (!exists) {
                    newQuotes.push(importedQuote);
                }
            });
            
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            showAllQuotes();
            
            showNotification(`Imported ${newQuotes.length} new quotes successfully!`, 'success');
            
            // Clear file input
            event.target.value = '';
            
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

function saveSessionPreference() {
    const currentFilter = categoryFilter.value;
    const lastQuote = quotes[quotes.length - 1];
    
    sessionStorage.setItem('preferredFilter', currentFilter);
    if (lastQuote) {
        sessionStorage.setItem('lastAddedQuote', JSON.stringify(lastQuote));
    }
    
    showNotification('Session preferences saved!', 'success');
}

function loadSessionPreference() {
    const savedFilter = sessionStorage.getItem('preferredFilter');
    const lastQuote = sessionStorage.getItem('lastAddedQuote');
    
    if (savedFilter) {
        categoryFilter.value = savedFilter;
        filterQuotes();
    }
    
    if (lastQuote) {
        try {
            const quote = JSON.parse(lastQuote);
            showNotification(`Last added quote: "${quote.text}"`, 'info');
        } catch (error) {
            console.error('Error parsing last quote:', error);
        }
    }
}

function clearAllQuotes() {
    if (confirm('Are you sure you want to clear all quotes? This cannot be undone.')) {
        quotes = [];
        saveQuotes();
        populateCategories();
        showAllQuotes();
        showRandomQuote();
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
        saveQuotes();
        populateCategories();
        showAllQuotes();
        showRandomQuote();
        showNotification('Reset to default quotes.', 'success');
    }
}

// TASK 2: Dynamic Content Filtering System

function populateCategories() {
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Save current selection
    const currentSelection = categoryFilter.value;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
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
    
    // Save categories to localStorage
    localStorage.setItem('categories', JSON.stringify(categories));
}

function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Save filter preference
    localStorage.setItem('lastFilter', selectedCategory);
    
    // Filter quotes
    let filteredQuotes;
    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Update the all quotes display with filtered results
    const allQuotesList = document.getElementById('allQuotesList');
    
    if (filteredQuotes.length === 0) {
        allQuotesList.innerHTML = `<p>No quotes found in category: "${selectedCategory}"</p>`;
        return;
    }
    
    let html = `<h3>Filtered Quotes (${filteredQuotes.length} in "${selectedCategory}")</h3>`;
    filteredQuotes.forEach((quote, index) => {
        const originalIndex = quotes.findIndex(q => q.text === quote.text && q.category === quote.category);
        html += `
            <div class="quote-item">
                <p>"${quote.text}"</p>
                <span class="quote-category">${quote.category}</span>
                <button onclick="deleteQuote(${originalIndex})" style="background: #dc3545; padding: 2px 8px; font-size: 0.8em;">Delete</button>
            </div>
        `;
    });
    
    allQuotesList.innerHTML = html;
    
    // Show notification
    if (selectedCategory !== 'all') {
        showNotification(`Showing ${filteredQuotes.length} quotes in category: "${selectedCategory}"`, 'info');
    }
}

function loadLastFilter() {
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        categoryFilter.value = lastFilter;
        // Don't auto-filter on load, let user decide
    }
}

// TASK 3: Server Sync and Conflict Resolution

async function syncWithServer() {
    showSyncNotification('Syncing with server...', 'info');
    
    try {
        // Simulate server call with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real application, this would be a fetch() call to your API
        // For simulation, we'll use localStorage as a mock server
        const mockServerData = JSON.parse(localStorage.getItem('mockServerQuotes') || '[]');
        
        if (mockServerData.length === 0) {
            // First time sync, push local data to server
            localStorage.setItem('mockServerQuotes', JSON.stringify(quotes));
            showSyncNotification('Initial sync complete. Data uploaded to server.', 'success');
            return;
        }
        
        // Merge data
        const mergedQuotes = [...quotes];
        let addedCount = 0;
        let conflictCount = 0;
        
        mockServerData.forEach(serverQuote => {
            const exists = mergedQuotes.some(localQuote => 
                localQuote.text === serverQuote.text && 
                localQuote.category === serverQuote.category
            );
            
            if (!exists) {
                // Check for potential conflict (same text but different category)
                const conflict = mergedQuotes.find(localQuote => 
                    localQuote.text === serverQuote.text && 
                    localQuote.category !== serverQuote.category
                );
                
                if (conflict) {
                    // This is a conflict
                    conflicts.push({
                        local: conflict,
                        server: serverQuote,
                        resolved: false
                    });
                    conflictCount++;
                } else {
                    // No conflict, add server quote
                    mergedQuotes.push(serverQuote);
                    addedCount++;
                }
            }
        });
        
        // Update local quotes
        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        
        // Save conflicts
        if (conflicts.length > 0) {
            localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
        }
        
        // Update server with merged data
        localStorage.setItem('mockServerQuotes', JSON.stringify(quotes));
        localStorage.setItem('lastServerSync', new Date().toISOString());
        
        let message = `Sync complete. Added ${addedCount} new quotes from server.`;
        if (conflictCount > 0) {
            message += ` ${conflictCount} conflicts detected.`;
        }
        
        showSyncNotification(message, conflictCount > 0 ? 'error' : 'success');
        
        if (conflictCount > 0) {
            showConflictResolution();
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        showSyncNotification('Sync failed: ' + error.message, 'error');
    }
}

function toggleAutoSync() {
    const statusElement = document.getElementById('autoSyncStatus');
    
    if (isAutoSyncEnabled) {
        clearInterval(autoSyncInterval);
        isAutoSyncEnabled = false;
        statusElement.textContent = 'Auto Sync: Off';
        statusElement.style.color = '#dc3545';
        showSyncNotification('Auto sync disabled', 'info');
    } else {
        autoSyncInterval = setInterval(() => {
            syncWithServer();
        }, 30000); // 30 seconds
        isAutoSyncEnabled = true;
        statusElement.textContent = 'Auto Sync: On (30s)';
        statusElement.style.color = '#28a745';
        showSyncNotification('Auto sync enabled (every 30 seconds)', 'success');
        // Do initial sync
        syncWithServer();
    }
}

function checkForServerUpdates() {
    // Check if we should sync (e.g., every 5 minutes)
    const lastSync = localStorage.getItem('lastServerSync');
    if (lastSync) {
        const lastSyncTime = new Date(lastSync);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (lastSyncTime < fiveMinutesAgo) {
            // It's been more than 5 minutes, suggest sync
            showSyncNotification('It has been a while since last sync. Consider syncing with server.', 'info');
        }
    }
}

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
    
    // Simple resolution: server wins
    let resolvedCount = 0;
    
    conflicts.forEach(conflict => {
        if (!conflict.resolved) {
            // Find and update the local quote with server data
            const index = quotes.findIndex(q => 
                q.text === conflict.local.text && 
                q.category === conflict.local.category
            );
            
            if (index !== -1) {
                quotes[index] = conflict.server;
                conflict.resolved = true;
                resolvedCount++;
            }
        }
    });
    
    saveQuotes();
    populateCategories();
    
    // Remove resolved conflicts
    conflicts = conflicts.filter(c => !c.resolved);
    localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
    
    showSyncNotification(`Resolved ${resolvedCount} conflicts (server data used).`, 'success');
    showAllQuotes();
}

function showConflictResolution() {
    if (conflicts.length === 0) {
        const savedConflicts = localStorage.getItem('quoteConflicts');
        if (savedConflicts) {
            conflicts = JSON.parse(savedConflicts);
        }
    }
    
    if (conflicts.length === 0) {
        showSyncNotification('No conflicts found.', 'info');
        return;
    }
    
    const unresolvedConflicts = conflicts.filter(c => !c.resolved);
    
    if (unresolvedConflicts.length === 0) {
        showSyncNotification('All conflicts have been resolved.', 'success');
        return;
    }
    
    let message = `Found ${unresolvedConflicts.length} unresolved conflicts:\n\n`;
    
    unresolvedConflicts.forEach((conflict, index) => {
        message += `Conflict ${index + 1}:\n`;
        message += `  Local: "${conflict.local.text}" (${conflict.local.category})\n`;
        message += `  Server: "${conflict.server.text}" (${conflict.server.category})\n\n`;
    });
    
    message += 'Use "Resolve Conflicts" button to apply server version.';
    
    alert(message);
    showSyncNotification(`${unresolvedConflicts.length} conflicts need resolution.`, 'error');
}

function simulateServerUpdate() {
    // This simulates the server being updated independently
    const mockServerQuotes = JSON.parse(localStorage.getItem('mockServerQuotes') || '[]');
    
    // Add a simulated server-only quote
    const serverQuotes = [
        { text: "Simulated server update: The server has new data!", category: "System" },
        { text: "Another quote from the server side.", category: "Server" }
    ];
    
    serverQuotes.forEach(quote => {
        const exists = mockServerQuotes.some(q => q.text === quote.text);
        if (!exists) {
            mockServerQuotes.push(quote);
        }
    });
    
    localStorage.setItem('mockServerQuotes', JSON.stringify(mockServerQuotes));
    
    // Show notification about available updates
    setTimeout(() => {
        showSyncNotification('Server has updates available. Consider syncing.', 'info');
    }, 8000);
}

function showSyncNotification(message, type) {
    const syncNotification = document.getElementById('syncNotification');
    syncNotification.textContent = message;
    syncNotification.className = `notification ${type}`;
    syncNotification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        syncNotification.style.display = 'none';
    }, 5000);
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}