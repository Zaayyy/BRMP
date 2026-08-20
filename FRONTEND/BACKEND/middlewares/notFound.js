// Middleware untuk menangani route yang tidak ditemukan (404)
const notFound = (req, res, next) => {
  const error = new Error(`Resource tidak ditemukan - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = notFound;
