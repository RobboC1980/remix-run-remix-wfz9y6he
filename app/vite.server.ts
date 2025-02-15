import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import type { ViteDevServer } from 'vite';
import type { IncomingMessage } from 'node:http';

export function webSocketPlugin() {
  return {
    name: 'web-socket-plugin',
    configureServer(server: ViteDevServer) {
      const httpServer = createServer();
      const wss = new WebSocketServer({ server: httpServer });

      wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
        ws.on('message', (data: WebSocket.Data) => {
          // Handle messages here
        });
      });

      httpServer.listen(3001);
    }
  };
} 