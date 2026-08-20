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

    // Izinkan semua origin localhost saat development
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isLocalhost || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const error = new Error(`Akses diblokir oleh CORS policy untuk origin: ${origin}`);
      error.status = 403;
      return callback(error, false);
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
