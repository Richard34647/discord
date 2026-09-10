const express = require('express');
const path = require('path');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔴 CRITICAL CONFIGURATION: 
// Replace these with the actual strings from your Discord Developer Portal
const PUBLIC_KEY = '4dfec88a8a885d4d9eb6405c5c1eb4565bc089e987a2dc52f2f100dbdbe89848'; 
const DEPLOYED_URL = 'https://ngrok-free.dev'; // Used for display on your dashboard

// Global in-memory variables to hold live statistics
let botStats = {
    servers: 142,          // Simulated base values; hooks directly to real database counts later
    interactions: 0,      // Increments dynamically every time a slash command runs
    status: "Online",
    endpointUrl: `${DEPLOYED_URL}/interactions`
};

// ==========================================
// 1. FRONTEND & DASHBOARD API ROUTES
// ==========================================

// Serve raw raw JSON strings directly to the dashboard.html polling loops
app.get('/api/stats', (req, res) => {
    res.json(botStats);
});

// Serve the production dashboard UI to http://localhost:3000/dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});


// ==========================================
// 2. DISCORD INTERACTION HTTP ENDPOINT
// ==========================================

// This endpoint receives security-validated POST payloads directly from Discord's servers
app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), (req, res) => {
    const { type, data } = req.body;

    // A. Handle the initial cryptographic handshake verification request
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    // B. Handle structural slash commands triggered inside channels
    if (type === InteractionType.APPLICATION_COMMAND) {
        // Increment global statistics to feed frontend visuals
        botStats.interactions++; 

        // Match your specific gaming command names
        if (data.name === 'ping') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: '🏓 Pong! Connection via secure HTTP Endpoint is fully functional.' }
            });
        }
        
        if (data.name === 'help') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: '🎮 **NexusGaming Commands:**\n`/create-hero` - Start RPG\n`/trivia` - Play mini-games' }
            });
        }
    }
});

// Catch-all route to redirect root traffic over to the management board
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.listen(PORT, () => {
    console.log(`🚀 Server fully operational on port ${PORT}`);
    console.log(`🖥️  Access Dashboard directly at: http://localhost:${PORT}/dashboard`);
});
