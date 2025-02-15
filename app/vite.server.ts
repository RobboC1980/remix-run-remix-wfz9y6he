import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import type { ViteDevServer } from 'vite';
import type { IncomingMessage } from 'node:http';
import type { Server } from 'node:http';

export function webSocketPlugin() {
  return {
    name: 'web-socket-plugin',
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) return;

      const wss = new WebSocketServer({ 
        noServer: true,
        path: '/socket'
      });

      server.httpServer.on('upgrade', (request, socket, head) => {
        if (request.url === '/socket') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      });

      wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
        console.log('WebSocket client connected');

        ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            // Handle messages here
            console.log('Received message:', message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
        });

        ws.on('close', () => {
          console.log('WebSocket client disconnected');
        });
      });

      server.httpServer.once('close', () => {
        wss.clients.forEach((client) => {
          client.terminate();
        });
        wss.close();
      });
    }
  };
} 