# Server Connection Fix - Instructions

## Issues Fixed

1. **Missing socket.io-client package**: Added the WebSocket client library
2. **Socket configuration**: Improved connection options with:
   - Fallback to polling if WebSocket fails
   - Automatic reconnection with exponential backoff
   - Connection error handling and logging
3. **Missing leaveRoom method**: Added handler for players leaving rooms
4. **Server leave event**: Added server-side handling for `leave:room` event
5. **Environment variables**: Created `.env` file for socket URL configuration

## How to Run

### Terminal 1: Start the Backend Server
```powershell
npm run server
```

The server will run on `http://localhost:3001` and will log:
```
Server running on port 3001
```

### Terminal 2: Start the Frontend Dev Server
```powershell
npm run dev
```

The frontend will run on `http://localhost:8080` (or the port shown in terminal output).

## Testing the Connection

1. Open the frontend in your browser
2. Navigate to the Multiplayer Arena
3. The browser console should show:
   - `Socket connected: [socket-id]` when connected successfully
   - Any connection errors will be logged with details

## Troubleshooting

### Server won't start
- Ensure port 3001 is not in use: `netstat -ano | findstr :3001`
- Try killing the process using that port

### WebSocket connection fails
- Verify the server is running on port 3001
- Check that both server and client are on the same network (for development)
- The client will auto-retry up to 5 times before giving up

### Browser shows connection errors
- Open DevTools (F12) and check the Console tab
- Look for `Socket connection error` messages
- Verify `VITE_SOCKET_URL` is correctly set in `.env`

## Configuration

Edit `.env` file to change the socket server URL:
```
VITE_SOCKET_URL=http://localhost:3001
```

For production, you may need to update this to your server's actual address.
