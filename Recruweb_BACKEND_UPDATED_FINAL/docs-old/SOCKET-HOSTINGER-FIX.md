Hostinger WebSocket proxy compatibility fix:
- Socket.IO client uses HTTP long-polling only on the shared hosting proxy.
- This avoids repeated WebSocket handshake errors where the proxy returns HTTP 200 instead of upgrading.
- Real-time events continue through Socket.IO polling.
