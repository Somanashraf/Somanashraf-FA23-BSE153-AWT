const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const config = require('./config/env');
const createApp = require('./app');
const configureSocket = require('./socket');
const logger = require('./utils/logger');

fs.mkdirSync(config.uploadDir, { recursive: true });
const server = http.createServer();
const io = new Server(server, { cors: { origin: config.clientUrl, credentials: true } });
configureSocket(io);
const app = createApp(io);
server.removeAllListeners('request');
server.on('request', app);
server.listen(config.port, () => logger.info({ message: `Doctor Hub API running on ${config.port}` }));
