const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30000;

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Set up heartbeat for this connection
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Send initial connection status
    ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        ws.isAlive = false;
    });
});

// Implement heartbeat mechanism
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
    clearInterval(interval);
});