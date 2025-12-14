// server-simulation.js
// Optional Node.js server for local testing

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// In-memory database
let serverQuotes = [
    { id: 1, text: "Server quote 1: Always sync your data!", category: "System" },
    { id: 2, text: "Server quote 2: Keep your data consistent.", category: "System" },
    { id: 3, text: "Server quote 3: Conflict resolution is important.", category: "System" }
];

// Get all quotes
app.get('/quotes', (req, res) => {
    res.json(serverQuotes);
});

// Get quote by ID
app.get('/quotes/:id', (req, res) => {
    const quote = serverQuotes.find(q => q.id === parseInt(req.params.id));
    if (quote) {
        res.json(quote);
    } else {
        res.status(404).json({ error: 'Quote not found' });
    }
});

// Add new quote
app.post('/quotes', (req, res) => {
    const newQuote = {
        id: serverQuotes.length + 1,
        text: req.body.text || 'No text provided',
        category: req.body.category || 'Uncategorized'
    };
    serverQuotes.push(newQuote);
    res.status(201).json(newQuote);
});

// Update quote
app.put('/quotes/:id', (req, res) => {
    const index = serverQuotes.findIndex(q => q.id === parseInt(req.params.id));
    if (index !== -1) {
        serverQuotes[index] = { ...serverQuotes[index], ...req.body };
        res.json(serverQuotes[index]);
    } else {
        res.status(404).json({ error: 'Quote not found' });
    }
});

// Delete quote
app.delete('/quotes/:id', (req, res) => {
    const index = serverQuotes.findIndex(q => q.id === parseInt(req.params.id));
    if (index !== -1) {
        serverQuotes.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Quote not found' });
    }
});

// Sync endpoint
app.post('/sync', (req, res) => {
    const clientQuotes = req.body.quotes || [];
    const conflicts = [];
    
    // Simple conflict detection
    clientQuotes.forEach(clientQuote => {
        const serverQuote = serverQuotes.find(sq => sq.text === clientQuote.text);
        if (serverQuote && serverQuote.category !== clientQuote.category) {
            conflicts.push({
                client: clientQuote,
                server: serverQuote
            });
        }
    });
    
    // Merge quotes
    clientQuotes.forEach(quote => {
        if (!serverQuotes.some(sq => sq.text === quote.text)) {
            serverQuotes.push({
                id: serverQuotes.length + 1,
                ...quote
            });
        }
    });
    
    res.json({
        message: 'Sync successful',
        serverQuotes,
        conflicts,
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Mock server running at http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('  GET    /quotes');
    console.log('  GET    /quotes/:id');
    console.log('  POST   /quotes');
    console.log('  PUT    /quotes/:id');
    console.log('  DELETE /quotes/:id');
    console.log('  POST   /sync');
});