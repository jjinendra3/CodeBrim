import { Server } from 'socket.io';
import express from "express";
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);

server.listen(8080, () => {
  console.log(`Server running on http://localhost:${8080}`);
});
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
});

export { io };