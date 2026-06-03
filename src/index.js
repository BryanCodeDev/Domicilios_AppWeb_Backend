const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { initSocket } = require('./sockets/tracking');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/v1', require('./routes/api'));

initSocket(io);

app.set('io', io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
