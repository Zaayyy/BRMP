<?php
/**
 * BRMP DIY - Native High-Performance PHP REST API
 * Production Engine for cPanel Hosting
 */

// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Database Configuration (cPanel Localhost Connection)
define('DB_HOST', 'localhost');
define('DB_NAME', 'brmy4429_brmp_db');
define('DB_USER', 'brmy4429_usertest');
define('DB_PASS', 'UMy^@cbv_7^c$8&t');
define('JWT_SECRET', 'brmp_secret_key_super_secure_2026_prod');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Gagal terhubung ke database server: ' . $e->getMessage()
            ]);
            exit();
        }
    }
    return $pdo;
}

// 3. JWT Helper Functions (Pure PHP HMAC-SHA256)
function generateJWT($payload, $secret = JWT_SECRET, $expirySeconds = 86400) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + $expirySeconds;
    $payload['iat'] = time();
    $payloadEncoded = json_encode($payload);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payloadEncoded));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($secret = JWT_SECRET) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Akses ditolak. Token otorisasi tidak ditemukan.']);
        exit();
    }

    $jwt = $matches[1];
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) !== 3) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Format token tidak valid.']);
        exit();
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $tokenParts;
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    if (!hash_equals($expectedSignature, $base64UrlSignature)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token tidak valid atau telah dimodifikasi.']);
        exit();
    }

    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Sesi login telah berakhir. Silakan login kembali.']);
        exit();
    }

    return $payload;
}

// 4. Request Routing & Path Normalization
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Strip query parameters
if (false !== $pos = strpos($uri, '?')) {
    $uri = substr($uri, 0, $pos);
}

// Extract path relative to /api
$path = preg_replace('#^.*?/api/#', '', $uri);
$path = trim($path, '/');
$segments = $path ? explode('/', $path) : [];

// Helper to get JSON input
function getJsonBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

try {
    $pdo = getDB();

    // ==========================================
    // ROUTE: Health Check
    // ==========================================
    if ($path === '' || $path === 'health') {
        echo json_encode([
            'success' => true,
            'message' => 'BRMP DIY Native PHP API is active & running smoothly on cPanel',
            'timestamp' => date('c'),
            'environment' => 'production',
            'database' => 'connected'
        ]);
        exit();
    }

    // ==========================================
    // ROUTE: /auth/login
    // ==========================================
    if ($segments[0] === 'auth' && ($segments[1] ?? '') === 'login' && $method === 'POST') {
        $body = getJsonBody();
        $identifier = trim($body['email'] ?? $body['username'] ?? '');
        $password = $body['password'] ?? '';

        if (!$identifier || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email/username dan password wajib diisi.']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :id LIMIT 1");
        $stmt->execute([':id' => $identifier]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Kombinasi email atau password salah.']);
            exit();
        }

        $tokenPayload = [
            'id' => (int)$user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'nama' => $user['nama']
        ];
        $token = generateJWT($tokenPayload);

        $userData = [
            'id' => (int)$user['id'],
            'nama' => $user['nama'],
            'email' => $user['email'],
            'role' => $user['role'],
            'createdAt' => $user['created_at']
        ];

        echo json_encode([
            'success' => true,
            'message' => 'Login berhasil. Selamat datang kembali, ' . $user['nama'] . '!',
            'token' => $token,
            'user' => $userData,
            'data' => [
                'token' => $token,
                'user' => $userData
            ]
        ]);
        exit();
    }

    // ==========================================
    // ROUTE: /auth/me
    // ==========================================
    if ($segments[0] === 'auth' && ($segments[1] ?? '') === 'me' && $method === 'GET') {
        $authUser = verifyJWT();
        $stmt = $pdo->prepare("SELECT id, nama, email, role, created_at FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $authUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Pengguna tidak ditemukan.']);
            exit();
        }

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => (int)$user['id'],
                'nama' => $user['nama'],
                'email' => $user['email'],
                'role' => $user['role'],
                'createdAt' => $user['created_at']
            ]
        ]);
        exit();
    }

    // ==========================================
    // ROUTE: /public/benih
    // ==========================================
    if ($segments[0] === 'public' && ($segments[1] ?? '') === 'benih' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, nama_benih, nama_benih as namaBenih, deskripsi, stok, gambar_url, gambar_url as gambarUrl, created_at, created_at as createdAt FROM benih ORDER BY id DESC");
        $data = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $data]);
        exit();
    }

    // ==========================================
    // ROUTE: /public/tracking/:kode (Lab & Smart Fallback)
    // ==========================================
    if ($segments[0] === 'public' && ($segments[1] ?? '') === 'tracking' && isset($segments[2]) && $method === 'GET') {
        $kode = trim($segments[2]);
        $stmt = $pdo->prepare("SELECT t.id, t.kode_tracking, t.kode_tracking as kodeTracking, t.nama_pemohon, t.nama_pemohon as namaPemohon, t.status_uji, t.status_uji as statusUji, t.hasil_dokumen_url, t.hasil_dokumen_url as hasilDokumenUrl, t.keterangan, t.tanggal_masuk, t.tanggal_masuk as tanggalMasuk, t.tanggal_selesai, t.tanggal_selesai as tanggalSelesai, u.nama as namaPetugas, u.nama as nama_petugas FROM lab_trackings t LEFT JOIN users u ON t.petugas_id = u.id WHERE LOWER(TRIM(t.kode_tracking)) = LOWER(:kode) LIMIT 1");
        $stmt->execute([':kode' => $kode]);
        $tracking = $stmt->fetch();

        if ($tracking) {
            echo json_encode(['success' => true, 'data' => $tracking]);
            exit();
        }

        // Smart fallback: Cek apakah kode ini adalah kode pengaduan
        $stmtP = $pdo->prepare("SELECT id, kode_tracking, kode_tracking as kodeTracking, jenis_layanan, jenis_layanan as jenisLayanan, nama_pelapor, nama_pelapor as namaPelapor, status_tanggapan, status_tanggapan as statusTanggapan, tanggapan_petugas, tanggapan_petugas as tanggapanPetugas, tanggal, tanggal as tanggal_masuk, tanggal as tanggalMasuk, tanggal_tanggapan, tanggal_tanggapan as tanggalTanggapan FROM pengaduan WHERE LOWER(TRIM(kode_tracking)) = LOWER(:kode) LIMIT 1");
        $stmtP->execute([':kode' => $kode]);
        $pengaduan = $stmtP->fetch();

        if ($pengaduan) {
            echo json_encode(['success' => true, 'data' => $pengaduan]);
            exit();
        }

        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "Kode tracking '{$kode}' tidak ditemukan."]);
        exit();
    }

    // ==========================================
    // ROUTE: /public/pengaduan/track/:kode or /public/pengaduan/:kode (GET)
    // ==========================================
    if ($segments[0] === 'public' && ($segments[1] ?? '') === 'pengaduan' && $method === 'GET') {
        $kode = '';
        if (($segments[2] ?? '') === 'track' && isset($segments[3])) {
            $kode = $segments[3];
        } else if (isset($segments[2]) && $segments[2] !== 'track') {
            $kode = $segments[2];
        }

        $kode = trim($kode);
        if (!$kode) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Parameter kode tracking pengaduan wajib diisi.']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id, kode_tracking, kode_tracking as kodeTracking, jenis_layanan, jenis_layanan as jenisLayanan, nama_pelapor, nama_pelapor as namaPelapor, tanggal, tanggal as tanggal_masuk, tanggal as tanggalMasuk, status_tanggapan, status_tanggapan as statusTanggapan, tanggapan_petugas, tanggapan_petugas as tanggapanPetugas, tanggal_tanggapan, tanggal_tanggapan as tanggalTanggapan FROM pengaduan WHERE LOWER(TRIM(kode_tracking)) = LOWER(:kode) LIMIT 1");
        $stmt->execute([':kode' => $kode]);
        $pengaduan = $stmt->fetch();

        if ($pengaduan) {
            echo json_encode([
                'success' => true,
                'message' => 'Status pengaduan berhasil ditemukan.',
                'data' => $pengaduan
            ]);
            exit();
        }

        // Smart fallback: Cek apakah kode ini adalah kode lab
        $stmtL = $pdo->prepare("SELECT t.id, t.kode_tracking, t.kode_tracking as kodeTracking, t.nama_pemohon, t.nama_pemohon as namaPemohon, t.status_uji, t.status_uji as statusUji, t.hasil_dokumen_url, t.hasil_dokumen_url as hasilDokumenUrl, t.keterangan, t.tanggal_masuk, t.tanggal_masuk as tanggalMasuk, t.tanggal_selesai, t.tanggal_selesai as tanggalSelesai, u.nama as namaPetugas, u.nama as nama_petugas FROM lab_trackings t LEFT JOIN users u ON t.petugas_id = u.id WHERE LOWER(TRIM(t.kode_tracking)) = LOWER(:kode) LIMIT 1");
        $stmtL->execute([':kode' => $kode]);
        $lab = $stmtL->fetch();

        if ($lab) {
            echo json_encode([
                'success' => true,
                'message' => 'Status pengujian lab berhasil ditemukan.',
                'data' => [
                    'id' => $lab['id'],
                    'kode_tracking' => $lab['kode_tracking'],
                    'kodeTracking' => $lab['kode_tracking'],
                    'jenis_layanan' => 'Uji Mutu Laboratorium',
                    'jenisLayanan' => 'Uji Mutu Laboratorium',
                    'nama_pelapor' => $lab['nama_pemohon'],
                    'tanggal_masuk' => $lab['tanggal_masuk'],
                    'tanggalMasuk' => $lab['tanggal_masuk'],
                    'status_tanggapan' => $lab['status_uji'],
                    'statusTanggapan' => $lab['status_uji'],
                    'tanggapan_petugas' => $lab['keterangan'] ?: ('Status pengujian: ' . $lab['status_uji']),
                    'tanggapanPetugas' => $lab['keterangan'] ?: ('Status pengujian: ' . $lab['status_uji']),
                    'tanggal_tanggapan' => $lab['tanggal_selesai'],
                    'tanggalTanggapan' => $lab['tanggal_selesai'],
                    'hasil_dokumen_url' => $lab['hasil_dokumen_url']
                ]
            ]);
            exit();
        }

        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "Pengaduan dengan kode tracking '{$kode}' tidak ditemukan. Mohon periksa kembali kode tiket Anda."
        ]);
        exit();
    }

    // ==========================================
    // ROUTE: /public/pengaduan (POST)
    // ==========================================
    if ($segments[0] === 'public' && ($segments[1] ?? '') === 'pengaduan' && $method === 'POST') {
        $body = getJsonBody();
        $kode = 'PGD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        
        $stmt = $pdo->prepare("INSERT INTO pengaduan (kode_tracking, jenis_layanan, nama_pelapor, email_pelapor, no_telp_pelapor, isi_pengaduan, status_tanggapan, tanggal) VALUES (:kode, :jenis, :nama, :email, :telp, :isi, 'Menunggu', NOW())");
        $stmt->execute([
            ':kode' => $kode,
            ':jenis' => $body['jenis_layanan'] ?? 'Pengaduan Masyarakat',
            ':nama' => $body['nama_pelapor'] ?? $body['nama'] ?? 'Masyarakat',
            ':email' => $body['email_pelapor'] ?? $body['email'] ?? null,
            ':telp' => $body['no_telp_pelapor'] ?? $body['telepon'] ?? null,
            ':isi' => $body['isi_pengaduan'] ?? $body['pesan'] ?? ''
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Laporan pengaduan berhasil dikirim.',
            'data' => [
                'id' => (int)$pdo->lastInsertId(),
                'kodeTracking' => $kode,
                'kode_tracking' => $kode
            ]
        ]);
        exit();
    }

    // ==========================================
    // INTERNAL ROUTES (Require JWT Authentication)
    // ==========================================
    if ($segments[0] === 'internal') {
        $authUser = verifyJWT();
        $sub = $segments[1] ?? '';
        $id = isset($segments[2]) && is_numeric($segments[2]) ? (int)$segments[2] : null;

        // ------------------------------------------
        // USER MANAGEMENT (/internal/users) - Admin Only
        // ------------------------------------------
        if ($sub === 'users') {
            if ($authUser['role'] !== 'Admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Akses ditolak. Fitur ini hanya untuk Administrator.']);
                exit();
            }

            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT id, nama, email, role, created_at, created_at as createdAt, updated_at, updated_at as updatedAt FROM users ORDER BY id ASC");
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
                exit();
            }

            if ($method === 'POST') {
                $body = getJsonBody();
                if (empty($body['nama']) || empty($body['email']) || empty($body['password']) || empty($body['role'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Semua kolom wajib diisi.']);
                    exit();
                }

                $hash = password_hash($body['password'], PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("INSERT INTO users (nama, email, password_hash, role) VALUES (:nama, :email, :hash, :role)");
                $stmt->execute([
                    ':nama' => $body['nama'],
                    ':email' => $body['email'],
                    ':hash' => $hash,
                    ':role' => $body['role']
                ]);

                echo json_encode([
                    'success' => true,
                    'message' => 'Pengguna baru berhasil ditambahkan.',
                    'data' => ['id' => (int)$pdo->lastInsertId(), 'nama' => $body['nama'], 'email' => $body['email'], 'role' => $body['role']]
                ]);
                exit();
            }

            if ($method === 'PUT' && $id) {
                $body = getJsonBody();
                if (!empty($body['password'])) {
                    $hash = password_hash($body['password'], PASSWORD_BCRYPT);
                    $stmt = $pdo->prepare("UPDATE users SET nama = :nama, email = :email, role = :role, password_hash = :hash WHERE id = :id");
                    $stmt->execute([':nama' => $body['nama'], ':email' => $body['email'], ':role' => $body['role'], ':hash' => $hash, ':id' => $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE users SET nama = :nama, email = :email, role = :role WHERE id = :id");
                    $stmt->execute([':nama' => $body['nama'], ':email' => $body['email'], ':role' => $body['role'], ':id' => $id]);
                }

                echo json_encode(['success' => true, 'message' => 'Data pengguna berhasil diperbarui.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                if ($id === (int)$authUser['id']) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.']);
                    exit();
                }
                $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Pengguna berhasil dihapus.']);
                exit();
            }
        }

        // ------------------------------------------
        // BENIH MANAGEMENT (/internal/benih)
        // ------------------------------------------
        if ($sub === 'benih') {
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT id, nama_benih, nama_benih as namaBenih, deskripsi, stok, gambar_url, gambar_url as gambarUrl, created_at, created_at as createdAt, updated_at, updated_at as updatedAt FROM benih ORDER BY id DESC");
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
                exit();
            }

            if ($method === 'POST') {
                $body = getJsonBody();
                $stmt = $pdo->prepare("INSERT INTO benih (nama_benih, deskripsi, stok, gambar_url, created_by_id) VALUES (:nama, :deskripsi, :stok, :gambar, :user_id)");
                $stmt->execute([
                    ':nama' => $body['nama_benih'] ?? $body['namaBenih'] ?? '',
                    ':deskripsi' => $body['deskripsi'] ?? '',
                    ':stok' => (int)($body['stok'] ?? 0),
                    ':gambar' => $body['gambar_url'] ?? $body['gambarUrl'] ?? null,
                    ':user_id' => $authUser['id']
                ]);
                echo json_encode(['success' => true, 'message' => 'Data benih berhasil ditambahkan.']);
                exit();
            }

            if ($method === 'PUT' && $id) {
                $body = getJsonBody();
                
                // Ambil data existing terlebih dahulu agar partial update (seperti update stok saja) tidak menghapus nama/foto/deskripsi
                $stmtExisting = $pdo->prepare("SELECT * FROM benih WHERE id = :id LIMIT 1");
                $stmtExisting->execute([':id' => $id]);
                $existing = $stmtExisting->fetch();

                if (!$existing) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Data benih tidak ditemukan.']);
                    exit();
                }

                $nama = isset($body['nama_benih']) ? $body['nama_benih'] : (isset($body['namaBenih']) ? $body['namaBenih'] : $existing['nama_benih']);
                $deskripsi = isset($body['deskripsi']) ? $body['deskripsi'] : $existing['deskripsi'];
                $stok = isset($body['stok']) ? (int)$body['stok'] : (int)$existing['stok'];
                $gambar = array_key_exists('gambar_url', $body) ? $body['gambar_url'] : (array_key_exists('gambarUrl', $body) ? $body['gambarUrl'] : $existing['gambar_url']);

                $stmt = $pdo->prepare("UPDATE benih SET nama_benih = :nama, deskripsi = :deskripsi, stok = :stok, gambar_url = :gambar WHERE id = :id");
                $stmt->execute([
                    ':nama' => $nama,
                    ':deskripsi' => $deskripsi,
                    ':stok' => $stok,
                    ':gambar' => $gambar,
                    ':id' => $id
                ]);
                echo json_encode(['success' => true, 'message' => 'Data benih berhasil diperbarui.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM benih WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Data benih berhasil dihapus.']);
                exit();
            }
        }

        // ------------------------------------------
        // LAB TRACKING MANAGEMENT (/internal/tracking)
        // ------------------------------------------
        if ($sub === 'tracking') {
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT t.id, t.kode_tracking, t.kode_tracking as kodeTracking, t.nama_pemohon, t.nama_pemohon as namaPemohon, t.status_uji, t.status_uji as statusUji, t.hasil_dokumen_url, t.hasil_dokumen_url as hasilDokumenUrl, t.keterangan, t.tanggal_masuk, t.tanggal_masuk as tanggalMasuk, t.tanggal_selesai, t.tanggal_selesai as tanggalSelesai, u.nama as namaPetugas, u.nama as nama_petugas FROM lab_trackings t LEFT JOIN users u ON t.petugas_id = u.id ORDER BY t.id DESC");
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
                exit();
            }

            if ($method === 'POST') {
                $body = getJsonBody();
                $kode = $body['kode_tracking'] ?? $body['kodeTracking'] ?? ('LAB-' . date('Y') . '-' . strtoupper(substr(uniqid(), -4)));
                $stmt = $pdo->prepare("INSERT INTO lab_trackings (kode_tracking, nama_pemohon, status_uji, keterangan, petugas_id, tanggal_masuk) VALUES (:kode, :pemohon, :status, :keterangan, :petugas, NOW())");
                $stmt->execute([
                    ':kode' => $kode,
                    ':pemohon' => $body['nama_pemohon'] ?? $body['namaPemohon'] ?? '',
                    ':status' => $body['status_uji'] ?? $body['statusUji'] ?? 'Diterima',
                    ':keterangan' => $body['keterangan'] ?? '',
                    ':petugas' => $authUser['id']
                ]);
                echo json_encode(['success' => true, 'message' => 'Data tracking berhasil dibuat.']);
                exit();
            }

            if ($method === 'PUT' && $id) {
                $body = getJsonBody();
                $status = $body['status_uji'] ?? $body['statusUji'] ?? 'Proses';
                $tglSelesai = ($status === 'Selesai') ? date('Y-m-d H:i:s') : null;

                $stmt = $pdo->prepare("UPDATE lab_trackings SET status_uji = :status, hasil_dokumen_url = :dokumen, keterangan = :keterangan, tanggal_selesai = :tgl_selesai WHERE id = :id");
                $stmt->execute([
                    ':status' => $status,
                    ':dokumen' => $body['hasil_dokumen_url'] ?? $body['hasilDokumenUrl'] ?? null,
                    ':keterangan' => $body['keterangan'] ?? '',
                    ':tgl_selesai' => $tglSelesai,
                    ':id' => $id
                ]);
                echo json_encode(['success' => true, 'message' => 'Status pengujian berhasil diperbarui.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM lab_trackings WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Data tracking berhasil dihapus.']);
                exit();
            }
        }

        // ------------------------------------------
        // PENGADUAN MANAGEMENT (/internal/pengaduan)
        // ------------------------------------------
        if ($sub === 'pengaduan') {
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT p.id, p.kode_tracking, p.kode_tracking as kodeTracking, p.jenis_layanan, p.jenis_layanan as jenisLayanan, p.nama_pelapor, p.nama_pelapor as namaPelapor, p.email_pelapor, p.email_pelapor as emailPelapor, p.no_telp_pelapor, p.no_telp_pelapor as noTelpPelapor, p.isi_pengaduan, p.isi_pengaduan as isiPengaduan, p.status_tanggapan, p.status_tanggapan as statusTanggapan, p.tanggapan_petugas, p.tanggapan_petugas as tanggapanPetugas, p.tanggal, p.tanggal_tanggapan, p.tanggal_tanggapan as tanggalTanggapan, u.nama as ditanggapiOleh, u.nama as ditanggapi_oleh FROM pengaduan p LEFT JOIN users u ON p.ditanggapi_oleh_id = u.id ORDER BY p.id DESC");
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
                exit();
            }

            if ($method === 'PUT' && $id) {
                $body = getJsonBody();
                $stmt = $pdo->prepare("UPDATE pengaduan SET status_tanggapan = :status, tanggapan_petugas = :tanggapan, ditanggapi_oleh_id = :user_id, tanggal_tanggapan = NOW() WHERE id = :id");
                $stmt->execute([
                    ':status' => $body['status_tanggapan'] ?? $body['statusTanggapan'] ?? 'Diproses',
                    ':tanggapan' => $body['tanggapan_petugas'] ?? $body['tanggapanPetugas'] ?? '',
                    ':user_id' => $authUser['id'],
                    ':id' => $id
                ]);
                echo json_encode(['success' => true, 'message' => 'Tanggapan berhasil disimpan.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM pengaduan WHERE id = :id");
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true, 'message' => 'Data pengaduan berhasil dihapus.']);
                exit();
            }
        }
    }

    // 404 Route Not Found
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Endpoint API tidak ditemukan: ' . $method . ' ' . $path]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan pada server API: ' . $e->getMessage()
    ]);
}
