// ============================================
// TASK 0: DOM MANIPULATION
// ============================================

// Main quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" }
];

// REQUIRED FUNCTION: showRandomQuote (Task 0 specifies this name)
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available. Add some quotes!</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p><strong>"${quote.text}"</strong></p>
        <p><em>Category: ${quote.category}</em></p>
    `;
    
    // Save to session storage (Task 1 requirement)
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// REQUIRED FUNCTION: addQuote (Task 0 specifies this name)
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
    
    // Save to local storage (Task 1 requirement)
    saveQuotes();
    
    // Update categories dropdown (Task 2 requirement)
    populateCategories();
    
    showNotification('Quote added successfully!', 'success');
    
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show the new quote
    showRandomQuote();
}

// ============================================
// TASK 1: WEB STORAGE & JSON HANDLING
// ============================================

// REQUIRED: Save quotes to local storage
function saveQuotes() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        return true;
    } catch (error) {
        console.error('Error saving quotes:', error);
        showNotification('Error saving quotes to storage.', 'error');
        return false;
    }
}

// REQUIRED: Load quotes from local storage on initialization
function loadQuotes() {
    try {
        const savedQuotes = localStorage.getItem('quotes');
        if (savedQuotes) {
            const parsedQuotes = JSON.parse(savedQuotes);
            if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) {
                quotes = parsedQuotes;
                return true;
            }
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
    return false;
}

// REQUIRED: exportToJsonFile function (Task 1 specifies this name)
function exportToJsonFile() {
    try {
        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `quotes.json`;
        
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

// REQUIRED: importFromJsonFile function (Task 1 specifies this name)
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid JSON format. Expected an array of quotes.');
            }
            
            // Check each quote has required properties
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && quote.text.trim() !== '' &&
                typeof quote.category === 'string' && quote.category.trim() !== ''
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file.');
            }
            
            // Add imported quotes
            quotes.push(...validQuotes);
            
            // Save to local storage
            saveQuotes();
            
            // Update categories
            populateCategories();
            
            showNotification(`Imported ${validQuotes.length} quotes successfully!`, 'success');
            
            // Update display
            showRandomQuote();
            
        } catch (error) {
            console.error('Error importing quotes:', error);
            showNotification('Error importing quotes: ' + error.message, 'error');
        }
    };
    
    fileReader.readAsText(event.target.files[0]);
}

// ============================================
// TASK 2: FILTERING SYSTEM
// ============================================

// REQUIRED: populateCategories function (Task 2 specifies this name)
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Get unique categories
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
    } else if (currentSelection !== 'all') {
        // Load last filter from local storage
        const lastFilter = localStorage.getItem('lastFilter');
        if (lastFilter && categories.includes(lastFilter)) {
            categoryFilter.value = lastFilter;
        }
    }
    
    // Save categories to local storage
    localStorage.setItem('categories', JSON.stringify(categories));
}

// REQUIRED: filterQuotes function (Task 2 specifies this name)
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    // Save last selected filter to local storage
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
    
    // Display filtered quotes (in a simple way)
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes found in category "${selectedCategory}"</p>`;
    } else {
        // Show first filtered quote
        const quote = filteredQuotes[0];
        quoteDisplay.innerHTML = `
            <p><strong>"${quote.text}"</strong></p>
            <p><em>Category: ${quote.category}</em></p>
            <p><small>Showing 1 of ${filteredQuotes.length} quotes in this category</small></p>
        `;
    }
}

// ============================================
// TASK 3: SERVER SYNC & CONFLICT RESOLUTION
// ============================================

// Server simulation variables
let conflicts = [];
let syncInterval = null;
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// REQUIRED: fetchQuotesFromServer function
async function fetchQuotesFromServer() {
    try {
        showSyncNotification('Fetching quotes from server...', 'info');
        
        const response = await fetch(MOCK_SERVER_URL);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const serverData = await response.json();
        
        // Convert to our format
        const serverQuotes = serverData.slice(0, 3).map(post => ({
            text: post.title,
            category: 'Server'
        }));
        
        return serverQuotes;
        
    } catch (error) {
        console.error('Error fetching from server:', error);
        showSyncNotification('Failed to fetch from server.', 'error');
        return [];
    }
}

// REQUIRED: postQuotesToServer function
async function postQuotesToServer() {
    try {
        // Send sample data to server
        const sampleQuote = {
            title: "Sample quote from local app",
            body: "This is a test quote",
            userId: 1
        };
        
        const response = await fetch(MOCK_SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sampleQuote)
        });
        
        if (!response.ok) {
            throw new Error(`Post failed: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Error posting to server:', error);
        return null;
    }
}

// REQUIRED: syncQuotes function
async function syncQuotes() {
    showSyncNotification('Syncing with server...', 'info');
    
    try {
        // Fetch from server
        const serverQuotes = await fetchQuotesFromServer();
        
        // Post to server
        await postQuotesToServer();
        
        let addedCount = 0;
        let conflictCount = 0;
        
        // Merge server quotes with local
        serverQuotes.forEach(serverQuote => {
            const exists = quotes.some(localQuote => 
                localQuote.text === serverQuote.text && 
                localQuote.category === serverQuote.category
            );
            
            if (!exists) {
                // Check for conflict (same text, different category)
                const conflictIndex = quotes.findIndex(localQuote => 
                    localQuote.text === serverQuote.text && 
                    localQuote.category !== serverQuote.category
                );
                
                if (conflictIndex !== -1) {
                    // Add to conflicts
                    conflicts.push({
                        local: quotes[conflictIndex],
                        server: serverQuote,
                        resolved: false
                    });
                    conflictCount++;
                } else {
                    // Add new quote
                    quotes.push(serverQuote);
                    addedCount++;
                }
            }
        });
        
        // Save updated quotes
        saveQuotes();
        populateCategories();
        
        // Save conflicts
        if (conflicts.length > 0) {
            localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
        }
        
        // Update UI
        showRandomQuote();
        
        // Show results
        let message = `Sync complete. Added ${addedCount} new quotes.`;
        if (conflictCount > 0) {
            message += ` ${conflictCount} conflicts detected.`;
            showConflictNotification();
        }
        
        showSyncNotification(message, conflictCount > 0 ? 'warning' : 'success');
        
    } catch (error) {
        console.error('Sync error:', error);
        showSyncNotification('Sync failed: ' + error.message, 'error');
    }
}

// REQUIRED: Periodic checking
function startAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    syncInterval = setInterval(() => {
        syncQuotes();
    }, 30000); // 30 seconds
    
    document.getElementById('autoSyncBtn').textContent = 'Stop Auto Sync';
    showSyncNotification('Auto sync started (every 30 seconds)', 'info');
}

function stopAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        document.getElementById('autoSyncBtn').textContent = 'Start Auto Sync (30s)';
        showSyncNotification('Auto sync stopped', 'info');
    }
}

// Toggle auto sync
function toggleAutoSync() {
    if (syncInterval) {
        stopAutoSync();
    } else {
        startAutoSync();
    }
}

// REQUIRED: Conflict resolution
function resolveConflicts() {
    // Load conflicts if needed
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
    
    conflicts.forEach((conflict, index) => {
        if (!conflict.resolved) {
            const localIndex = quotes.findIndex(q => 
                q.text === conflict.local.text && 
                q.category === conflict.local.category
            );
            
            if (localIndex !== -1) {
                quotes[localIndex] = conflict.server;
                conflict.resolved = true;
                resolvedCount++;
            }
        }
    });
    
    // Save updates
    saveQuotes();
    localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
    
    // Update UI
    populateCategories();
    showRandomQuote();
    
    showSyncNotification(`Resolved ${resolvedCount} conflicts.`, 'success');
}

// REQUIRED: UI notifications for conflicts
function showConflictNotification() {
    const syncNotification = document.getElementById('syncNotification');
    syncNotification.innerHTML = `
        <div style="background: #fff3cd; color: #856404; padding: 10px; border: 1px solid #ffeaa7;">
            <strong>⚠️ ${conflicts.length} Conflict(s) Detected!</strong>
            <p>Click "Resolve Conflicts" to fix them.</p>
        </div>
    `;
    syncNotification.style.display = 'block';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.backgroundColor = 
        type === 'success' ? '#d4edda' : 
        type === 'error' ? '#f8d7da' : 
        type === 'info' ? '#d1ecf1' : '#fff3cd';
    notification.style.color = 
        type === 'success' ? '#155724' : 
        type === 'error' ? '#721c24' : 
        type === 'info' ? '#0c5460' : '#856404';
    notification.style.border = 
        type === 'success' ? '1px solid #c3e6cb' : 
        type === 'error' ? '1px solid #f5c6cb' : 
        type === 'info' ? '1px solid #bee5eb' : '1px solid #ffeaa7';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function showSyncNotification(message, type) {
    const syncNotification = document.getElementById('syncNotification');
    syncNotification.textContent = message;
    syncNotification.style.display = 'block';
    syncNotification.style.backgroundColor = 
        type === 'success' ? '#d4edda' : 
        type === 'error' ? '#f8d7da' : 
        type === 'warning' ? '#fff3cd' : 
        type === 'info' ? '#d1ecf1' : '#e2e3e5';
    syncNotification.style.color = 
        type === 'success' ? '#155724' : 
        type === 'error' ? '#721c24' : 
        type === 'warning' ? '#856404' : 
        type === 'info' ? '#0c5460' : '#383d41';
    syncNotification.style.border = 
        type === 'success' ? '1px solid #c3e6cb' : 
        type === 'error' ? '1px solid #f5c6cb' : 
        type === 'warning' ? '1px solid #ffeaa7' : 
        type === 'info' ? '1px solid #bee5eb' : '1px solid #d6d8db';
    
    setTimeout(() => {
        syncNotification.style.display = 'none';
    }, 5000);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Task 1: Load quotes from local storage on initialization
    loadQuotes();
    
    // Task 0: Event listener for Show New Quote button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Task 1: Setup import file listener
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);
    
    // Task 2: Populate categories on load
    populateCategories();
    
    // Task 2: Load last filter
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = lastFilter;
        }
    }
    
    // Task 3: Setup auto sync button
    document.getElementById('autoSyncBtn').addEventListener('click', toggleAutoSync);
    
    // Task 3: Load conflicts
    const savedConflicts = localStorage.getItem('quoteConflicts');
    if (savedConflicts) {
        conflicts = JSON.parse(savedConflicts);
        if (conflicts.length > 0) {
            setTimeout(() => {
                showConflictNotification();
            }, 1000);
        }
    }
    
    // Show initial quote
    showRandomQuote();
});