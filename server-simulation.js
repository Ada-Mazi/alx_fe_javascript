// This is an optional file for more advanced server simulation
// You can run this in Node.js to simulate a REST API

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let serverQuotes = [
    { id: 1, text: "Server quote 1: Always sync your data!", category: "System" },
    { id: 2, text: "Server quote 2: Keep your data consistent.", category: "System" }
];

app.get('/quotes', (req, res) => {
    res.json(serverQuotes);
});

app.post('/quotes', (req, res) => {
    const newQuote = req.body;
    newQuote.id = serverQuotes.length + 1;
    serverQuotes.push(newQuote);
    res.json({ success: true, quote: newQuote });
});

app.get('/quotes/sync', (req, res) => {
    const lastSync = req.query.lastSync;
    // In real implementation, you would return only quotes updated since lastSync
    res.json(serverQuotes);
});

app.listen(port, () => {
    console.log(`Mock server running at http://localhost:${port}`);
});