const config = require('./env');

// Daftar origin frontend yang diizinkan (Publik & Internal)
const allowedOrigins = [
  config.cors.publicUrl,
  config.cors.internalUrl,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti mobile apps, Postman, curl, atau server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Izinkan semua origin localhost saat development & domain production BRMP DIY
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isBrmpDomain = /^https?:\/\/([a-zA-Z0-9-]+\.)?brmpdiy\.my\.id$/.test(origin);

    if (isLocalhost || isBrmpDomain || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      return callback(null, true); // Tetap izinkan request web client
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = {
  allowedOrigins,
  corsOptions,
};
