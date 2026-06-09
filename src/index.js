const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initSocket } = require('./sockets/tracking');
const errorHandler = require('./middlewares/errorHandler');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err.message));

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'script-src': ["'self'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/v1', require('./routes/api'));

initSocket(io);

app.set('io', io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));
