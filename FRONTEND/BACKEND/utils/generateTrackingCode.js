const crypto = require('crypto');

/**
 * Menghasilkan kode tracking unik acak dengan format:
 * [PREFIX]-YYYYMMDD-[RandomString]
 * Contoh output default: PGD-20260819-A8F2K
 *
 * @param {string} prefix - Awalan kode tracking (default: 'PGD')
 * @param {number} length - Panjang karakter acak (default: 5)
 * @returns {string} Kode tracking yang di-generate
 */
const generateTrackingCode = (prefix = 'PGD', length = 5) => {
  const now = new Date();
  
  // Format YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Kumpulan karakter alfanumerik yang mudah dibaca (menghindari karakter ambigu seperti 0/O, 1/I jika diinginkan)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  
  // Menggunakan crypto.randomBytes untuk keacakan kriptografis yang aman
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    randomPart += chars[randomBytes[i] % chars.length];
  }

  return `${prefix.toUpperCase()}-${datePart}-${randomPart}`;
};

module.exports = {
  generateTrackingCode,
};
