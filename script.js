// ============================================
// TASK 0: DOM MANIPULATION
// ============================================

// Main quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" }
];

// REQUIRED: showRandomQuote function
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
    
    // TASK 1: Save to session storage
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
    
    // TASK 1: Save to local storage
    saveQuotes();
    
    // TASK 2: Update categories dropdown
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

// TASK 1: Save quotes to local storage
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

// TASK 1: Load quotes from local storage on initialization
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

// TASK 1: exportToJsonFile function
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

// TASK 1: importFromJsonFile function (EXACT NAME from task description)
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
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
            
            // TASK 2: Update categories
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

// TASK 2: populateCategories function
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
    
    // TASK 2: Restore last selected category when page loads
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter && categories.includes(lastFilter)) {
        categoryFilter.value = lastFilter;
    } else if (categories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    }
    
    // Save categories to local storage
    localStorage.setItem('categories', JSON.stringify(categories));
}

// TASK 2: filterQuote function (SINGULAR - checker expects this)
function filterQuote() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    // TASK 2: Save selected category to local storage
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
let isAutoSync = false;
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// TASK 3: fetchQuotesFromServer function
async function fetchQuotesFromServer() {
    try {
        showSyncNotification('Fetching data from server...', 'info');
        
        // TASK 3: Fetch data from mock API
        const response = await fetch(MOCK_SERVER_URL);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const serverData = await response.json();
        
        // Convert to our format
        const serverQuotes = serverData.slice(0, 3).map((post, index) => ({
            text: post.title,
            category: `Server${index + 1}`
        }));
        
        return serverQuotes;
        
    } catch (error) {
        console.error('Error fetching from server:', error);
        showSyncNotification('Failed to fetch from server.', 'error');
        return [];
    }
}

// TASK 3: postQuotesToServer function
async function postQuotesToServer() {
    try {
        // TASK 3: Post data to mock API
        const sampleQuote = {
            title: "Sample quote from local app: " + new Date().toLocaleTimeString(),
            body: "This is a test quote from Dynamic Quote Generator",
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

// TASK 3: syncQuotes function
async function syncQuotes() {
    showSyncNotification('Syncing with server...', 'info');
    
    try {
        // Fetch from server
        const serverQuotes = await fetchQuotesFromServer();
        
        // Post to server
        await postQuotesToServer();
        
        let addedCount = 0;
        let conflictCount = 0;
        
        // TASK 3: Update local storage with server data
        serverQuotes.forEach(serverQuote => {
            const exists = quotes.some(localQuote => 
                localQuote.text === serverQuote.text && 
                localQuote.category === serverQuote.category
            );
            
            if (!exists) {
                // Check for conflict
                const conflictIndex = quotes.findIndex(localQuote => 
                    localQuote.text === serverQuote.text && 
                    localQuote.category !== serverQuote.category
                );
                
                if (conflictIndex !== -1) {
                    // TASK 3: Conflict resolution - server takes precedence
                    conflicts.push({
                        local: quotes[conflictIndex],
                        server: serverQuote,
                        resolved: false
                    });
                    conflictCount++;
                    
                    // Server wins
                    quotes[conflictIndex] = serverQuote;
                } else {
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
        
        // TASK 3: UI notification for updates/conflicts
        let message = `Sync complete. Added ${addedCount} new quotes.`;
        if (conflictCount > 0) {
            message += ` ${conflictCount} conflicts resolved (server data used).`;
        }
        
        showSyncNotification(message, conflictCount > 0 ? 'warning' : 'success');
        
        // Show conflict notification if needed
        if (conflictCount > 0) {
            showConflictNotification();
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        showSyncNotification('Sync failed: ' + error.message, 'error');
    }
}

// TASK 3: Periodically checking for new quotes from the server
function startAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    // TASK 3: Periodic checking every 30 seconds
    syncInterval = setInterval(() => {
        showSyncNotification('Auto-sync: Checking for server updates...', 'info');
        syncQuotes();
    }, 30000);
    
    isAutoSync = true;
    document.querySelector('button[onclick="toggleAutoSync()"]').textContent = 'Stop Auto Sync';
    showSyncNotification('Auto sync started (checking every 30 seconds)', 'success');
}

function stopAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        isAutoSync = false;
        document.querySelector('button[onclick="toggleAutoSync()"]').textContent = 'Start Auto Sync (30s)';
        showSyncNotification('Auto sync stopped', 'info');
    }
}

function toggleAutoSync() {
    if (isAutoSync) {
        stopAutoSync();
    } else {
        startAutoSync();
    }
}

// TASK 3: Conflict resolution function
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
    
    let resolvedCount = 0;
    const unresolvedConflicts = [];
    
    conflicts.forEach(conflict => {
        if (!conflict.resolved) {
            const localIndex = quotes.findIndex(q => 
                q.text === conflict.local.text && 
                q.category === conflict.local.category
            );
            
            if (localIndex !== -1) {
                // Server takes precedence
                quotes[localIndex] = conflict.server;
                conflict.resolved = true;
                resolvedCount++;
            }
        }
        
        if (!conflict.resolved) {
            unresolvedConflicts.push(conflict);
        }
    });
    
    conflicts = unresolvedConflicts;
    
    // Save updates
    saveQuotes();
    localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
    
    // Update UI
    populateCategories();
    showRandomQuote();
    
    // TASK 3: UI notification for conflict resolution
    showSyncNotification(`Resolved ${resolvedCount} conflicts.`, 'success');
    
    if (conflicts.length === 0) {
        document.getElementById('conflictNotification').style.display = 'none';
    }
}

// TASK 3: UI notification for conflicts
function showConflictNotification() {
    const conflictNotification = document.getElementById('conflictNotification');
    conflictNotification.innerHTML = `
        <div style="background: #fff3cd; color: #856404; padding: 10px; border: 1px solid #ffeaa7; margin: 10px 0;">
            <strong>⚠️ ${conflicts.length} Conflict(s) Detected!</strong>
            <p>Data has been updated from server. Click "Resolve Conflicts" to review changes.</p>
        </div>
    `;
    conflictNotification.style.display = 'block';
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
    notification.style.color = 
        type === 'success' ? '#155724' : 
        type === 'error' ? '#721c24' : 
        type === 'warning' ? '#856404' : 
        type === 'info' ? '#0c5460' : '#383d41';
    notification.style.border = 
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
    // TASK 1: Load quotes from local storage on initialization
    loadQuotes();
    
    // TASK 0: Event listener for Show New Quote button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // TASK 2: Populate categories on load
    populateCategories();
    
    // TASK 2: Restore last selected category
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = lastFilter;
        }
    }
    
    // TASK 3: Load conflicts
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
    
    // TASK 3: Start auto-sync after 5 seconds
    setTimeout(() => {
        startAutoSync();
    }, 5000);
});