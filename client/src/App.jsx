import { useState, useEffect } from 'react';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wsConnected, setWsConnected] = useState(false);
  const [ws, setWs] = useState(null);

  const connectWebSocket = () => {
    const wsInstance = new WebSocket('ws://localhost:3000');

    wsInstance.onopen = () => {
      setWsConnected(true);
    };

    wsInstance.onclose = () => {
      setWsConnected(false);
      if (isOnline) {
        // Attempt to reconnect after 3 seconds if we're online
        setTimeout(connectWebSocket, 3000);
      }
    };

    wsInstance.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    // Implement heartbeat response
    wsInstance.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ping') {
        wsInstance.send(JSON.stringify({ type: 'pong' }));
      }
    };

    setWs(wsInstance);
  };

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      if (!wsConnected) {
        connectWebSocket();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (ws) {
        ws.close();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial WebSocket connection
    if (isOnline) {
      connectWebSocket();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="error-container">
        <h1>Failed to connect to the server.</h1>
        <p>Please check your internet connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}>
        {wsConnected ? 'Connected to Server' : 'Disconnected from Server'}
      </div>
      <div className="content">
        <h1>WebSocket Assessment</h1>
        <p>Connection Status: {wsConnected ? 'Online' : 'Offline'}</p>
      </div>
    </div>
  );
}

export default App;