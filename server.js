const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Sirve el frontend
app.use(express.static(path.join(__dirname, 'public')));

// Guarda usuarios conectados por sala: { roomCode: { socketId: { name, lat, lng, updatedAt } } }
const rooms = {};

io.on('connection', (socket) => {
  console.log('Nueva conexión:', socket.id);

  let currentRoom = null;
  let currentName = null;
  let currentDeviceType = 'phone';

  // El cliente se une a una sala (circulo/grupo) con un código
  socket.on('join-room', ({ roomCode, name, deviceType }) => {
    currentRoom = roomCode;
    currentName = name || 'Anónimo';
    currentDeviceType = deviceType === 'pc' ? 'pc' : 'phone';
    socket.join(roomCode);

    if (!rooms[roomCode]) rooms[roomCode] = {};

    rooms[roomCode][socket.id] = {
      name: currentName,
      deviceType: currentDeviceType,
      lat: null,
      lng: null,
      updatedAt: Date.now()
    };

    // Envía al nuevo usuario el estado actual de la sala
    socket.emit('room-state', rooms[roomCode]);

    // Avisa a los demás que alguien se unió
    socket.to(roomCode).emit('user-joined', { id: socket.id, name: currentName, deviceType: currentDeviceType });
  });

  // El cliente envía su ubicación actualizada
  socket.on('update-location', ({ lat, lng }) => {
    if (!currentRoom || !rooms[currentRoom]) return;

    rooms[currentRoom][socket.id] = {
      ...rooms[currentRoom][socket.id],
      lat,
      lng,
      updatedAt: Date.now()
    };

    // Reenvía la ubicación a todos los demás en la sala
    socket.to(currentRoom).emit('location-update', {
      id: socket.id,
      name: currentName,
      deviceType: currentDeviceType,
      lat,
      lng,
      updatedAt: Date.now()
    });
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      delete rooms[currentRoom][socket.id];
      socket.to(currentRoom).emit('user-left', { id: socket.id });

      // Limpia salas vacías
      if (Object.keys(rooms[currentRoom]).length === 0) {
        delete rooms[currentRoom];
      }
    }
    console.log('Desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
