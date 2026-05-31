const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

function configureSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      socket.user = jwt.verify(token, config.jwt.accessSecret);
      socket.join(`user:${socket.user.id}`);
      socket.join(`role:${socket.user.role}`);
      next();
    } catch (error) {
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info({ message: 'Socket connected', id: socket.id, user: socket.user?.id });
    socket.on('doctor:join', (doctorId) => socket.join(`doctor:${doctorId}`));
  });
}

module.exports = configureSocket;
