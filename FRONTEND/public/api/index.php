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
                PDO::ATTR_EMULATE_PREPARES => true,
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

// Helper to auto-create missing lab_trackings columns on existing databases
function ensureLabColumnsExist($pdo) {
    static $checked = false;
    if ($checked) return;
    $cols = [
        'no_reg' => "VARCHAR(50) NULL AFTER id",
        'spk' => "VARCHAR(100) NULL AFTER no_reg",
        'sampel_tanah' => "VARCHAR(100) NULL AFTER nama_pemohon",
        'sampel_air' => "VARCHAR(100) NULL AFTER sampel_tanah",
        'sampel_pupuk' => "VARCHAR(100) NULL AFTER sampel_air",
        'sampel_tanaman' => "VARCHAR(100) NULL AFTER sampel_pupuk",
        'jumlah_sampel' => "VARCHAR(50) NULL AFTER sampel_tanaman",
        'parameter_uji' => "TEXT NULL AFTER jumlah_sampel",
        'telepon' => "VARCHAR(50) NULL AFTER parameter_uji",
        'biaya' => "VARCHAR(100) NULL AFTER telepon",
        'status_bayar' => "VARCHAR(50) NOT NULL DEFAULT 'Belum Bayar' AFTER biaya",
        'tahap_proses' => "VARCHAR(255) NULL AFTER status_uji",
    ];
    try {
        $existing = [];
        $res = $pdo->query("SHOW COLUMNS FROM lab_trackings");
        if ($res) {
            foreach ($res->fetchAll() as $col) {
                $existing[] = strtolower($col['Field']);
            }
        }
        foreach ($cols as $colName => $colDef) {
            if (!in_array(strtolower($colName), $existing)) {
                $pdo->exec("ALTER TABLE lab_trackings ADD COLUMN {$colName} {$colDef}");
            }
        }
        // Pastikan kolom status_uji dapat menampung nama status baru (Pembayaran, Verif Sampel, Pengujian, Analis Data, Selesai)
        $pdo->exec("ALTER TABLE lab_trackings MODIFY COLUMN status_uji VARCHAR(100) NOT NULL DEFAULT 'Pembayaran'");
    } catch (Exception $e) {
        // Silently skip if table doesn't exist yet
    }
    $checked = true;
}

// 2b. Helper Sinkronisasi Role Akun Analis & Schema MySQL
function ensureUserRolesExist($pdo) {
    static $checkedRole = false;
    if ($checkedRole) return;
    try {
        // Hapus limitasi ENUM lama di MySQL agar kolom role dapat menyimpan 'Analis'
        $pdo->exec("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'PetugasLab'");
        // Sinkronkan akun dengan kata 'analis' agar rolenya menjadi 'Analis'
        $pdo->exec("UPDATE users SET role = 'Analis' WHERE LOWER(nama) LIKE '%analis%' OR LOWER(email) LIKE '%analis%'");
    } catch (Exception $e) {
        // Silently skip
    }
    $checkedRole = true;
}

// 2c. Helper Table Pengaturan Sistem (Settings)
function ensureSettingsTableExists($pdo) {
    static $checkedSettings = false;
    if ($checkedSettings) return;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = (int)$pdo->query("SELECT COUNT(*) FROM system_settings")->fetchColumn();
        if ($count === 0) {
            $defaults = [
                'nama_sistem' => 'BRMP DIY - Agro Modern Service',
                'nama_instansi' => 'Balai Penerapan Standar Instrumen Pertanian (BRMP) D.I. Yogyakarta',
                'email_kontak' => 'layanan@brmpdiy.my.id',
                'whatsapp_hotline' => '0812-3456-7890',
                'alamat_kantor' => 'Jl. Gondosuli No. 1, Semaki, Umbulharjo, Kota Yogyakarta, D.I. Yogyakarta 55166',
                'sla_hari' => '45',
                'sla_kuning_hari' => '14',
                'sla_merah_hari' => '7',
                'notifikasi_email' => '1',
                'notifikasi_wa' => '1',
                'session_timeout_menit' => '30',
                'format_spk' => 'CE-{KATEGORI}/{BULAN}-{TAHUN}/{NO}',
            ];
            $ins = $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (:k, :v)");
            foreach ($defaults as $k => $v) {
                $ins->execute([':k' => $k, ':v' => $v]);
            }
        }
    } catch (Exception $e) {
        // Silently skip
    }
    $checkedSettings = true;
}

// 2c. Helper Log Aktivitas Pengguna (Audit Trail)
function logActivity($pdo, $user, $action, $detail, $tipe = 'system') {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            user_nama VARCHAR(100) NOT NULL,
            user_role VARCHAR(50) NOT NULL,
            action VARCHAR(100) NOT NULL,
            detail TEXT NOT NULL,
            tipe VARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $uName = !empty($user['nama']) ? $user['nama'] : (!empty($user['name']) ? $user['name'] : 'Petugas');
        $uRole = !empty($user['role']) ? $user['role'] : 'Admin';
        $uId   = !empty($user['id']) ? (int)$user['id'] : null;

        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, user_nama, user_role, action, detail, tipe, created_at) VALUES (:uid, :unama, :urole, :act, :det, :tipe, NOW())");
        $stmt->execute([
            ':uid' => $uId,
            ':unama' => $uName,
            ':urole' => $uRole,
            ':act' => $action,
            ':det' => $detail,
            ':tipe' => $tipe
        ]);
    } catch (Exception $e) {
        // Skip on error so main operations never fail
    }
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

function getAuthorizationHeader() {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (!empty($headers['Authorization'])) return $headers['Authorization'];
        if (!empty($headers['authorization'])) return $headers['authorization'];
    }
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (!empty($headers['Authorization'])) return $headers['Authorization'];
        if (!empty($headers['authorization'])) return $headers['authorization'];
    }
    return '';
}

function verifyJWT($secret = JWT_SECRET) {
    $authHeader = getAuthorizationHeader();

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

function requireAuth($secret = JWT_SECRET) {
    return verifyJWT($secret);
}

function requireRole($allowedRoles = ['Admin']) {
    $user = verifyJWT();
    $role = $user['role'] ?? '';
    if (!in_array($role, $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Akses ditolak. Peran Anda (' . $role . ') tidak memiliki wewenang untuk tindakan ini.']);
        exit();
    }
    return $user;
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
    ensureLabColumnsExist($pdo);
    ensureUserRolesExist($pdo);
    ensureSettingsTableExists($pdo);

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

        // Sinkronisasi otomatis: Akun yang bernama Analis atau email analis dipastikan ber-role 'Analis'
        if ((stripos($user['nama'], 'analis') !== false || stripos($user['email'], 'analis') !== false) && $user['role'] === 'PetugasLab') {
            $user['role'] = 'Analis';
            try {
                $pdo->exec("UPDATE users SET role = 'Analis' WHERE id = " . (int)$user['id']);
            } catch (Exception $e) {}
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

        logActivity($pdo, $userData, 'Login Sistem', "Masuk ke Panel Admin BRMP DIY sebagai {$user['role']}", 'auth');

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
    // ==========================================
    // ROUTE: /public/tracking/:kode (Lab & Smart Fallback)
    // ==========================================
    // ROUTE: /public/tracking/:kode or /public/lab-tracking/:kode (Lab & Smart Fallback)
    // ==========================================
    if ($segments[0] === 'public' && (in_array($segments[1] ?? '', ['tracking', 'lab-tracking'])) && $method === 'GET') {
        ensureLabColumnsExist($pdo);
        
        // Ekstraksi kode lengkap (mendukung SPK berslash seperti CE-3/09-26/294, encode/decode, atau ?q= / ?kode=)
        $kode = '';
        if (!empty($_GET['kode'])) {
            $kode = trim($_GET['kode']);
        } else if (!empty($_GET['q'])) {
            $kode = trim($_GET['q']);
        } else {
            // Potong prefix 'public/tracking/' atau 'public/lab-tracking/'
            $kode = preg_replace('#^public/(tracking|lab-tracking)/#i', '', $path);
            $kode = urldecode(trim($kode));
        }

        if (empty($kode)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nomor SPK atau kode tracking wajib diisi.']);
            exit();
        }

        $cleanKode = trim($kode);
        $spkSuffix = '%/' . $cleanKode;

        $stmt = $pdo->prepare("SELECT 
            t.id, 
            t.no_reg, t.no_reg as noReg,
            t.spk, t.spk as noSpk,
            t.kode_tracking, t.kode_tracking as kodeTracking, 
            t.nama_pemohon, t.nama_pemohon as namaPemohon, 
            t.sampel_tanah, t.sampel_tanah as sampelTanah,
            t.sampel_air, t.sampel_air as sampelAir,
            t.sampel_pupuk, t.sampel_pupuk as sampelPupuk,
            t.sampel_tanaman, t.sampel_tanaman as sampelTanaman,
            t.jumlah_sampel, t.jumlah_sampel as jumlahSampel,
            t.parameter_uji, t.parameter_uji as parameterUji,
            t.telepon, t.telepon as noTelepon,
            t.biaya,
            t.status_bayar, t.status_bayar as statusBayar,
            t.status_uji, t.status_uji as statusUji, 
            t.tahap_proses, t.tahap_proses as tahapProses,
            t.hasil_dokumen_url, t.hasil_dokumen_url as hasilDokumenUrl, 
            t.keterangan, 
            t.tanggal_masuk, t.tanggal_masuk as tanggalMasuk, 
            t.tanggal_selesai, t.tanggal_selesai as tanggalSelesai, 
            u.nama as namaPetugas, u.nama as nama_petugas 
        FROM lab_trackings t 
        LEFT JOIN users u ON t.petugas_id = u.id 
        WHERE (t.spk IS NOT NULL AND LOWER(TRIM(t.spk)) = LOWER(:spk1))
           OR (t.kode_tracking IS NOT NULL AND LOWER(TRIM(t.kode_tracking)) = LOWER(:spk2))
           OR (t.spk IS NOT NULL AND LOWER(TRIM(t.spk)) LIKE LOWER(:spkSuffix))
        ORDER BY t.id DESC
        LIMIT 1");
        $stmt->execute([
            ':spk1' => $cleanKode,
            ':spk2' => $cleanKode,
            ':spkSuffix' => $spkSuffix,
        ]);
        $tracking = $stmt->fetch();

        if ($tracking) {
            echo json_encode(['success' => true, 'data' => $tracking]);
            exit();
        }

        http_response_code(404);
        echo json_encode(['success' => false, 'message' => "Pengujian laboratorium dengan Nomor SPK '{$kode}' tidak ditemukan. Pastikan format SPK benar (Contoh: CE-2/09-26/297)."]);
        exit();
    }

    // ==========================================
    // ROUTE: /public/pengaduan/track/:kode or /public/pengaduan/:kode (GET)
    // ==========================================
    if ($segments[0] === 'public' && ($segments[1] ?? '') === 'pengaduan' && $method === 'GET') {
        $kode = '';
        if (!empty($_GET['kode'])) {
            $kode = trim($_GET['kode']);
        } else if (!empty($_GET['q'])) {
            $kode = trim($_GET['q']);
        } else {
            $kode = preg_replace('#^public/pengaduan/(track/)?#i', '', $path);
            $kode = urldecode(trim($kode));
        }

        $cleanKode = trim($kode);
        if (!$cleanKode) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Parameter kode tracking pengaduan wajib diisi.']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id, kode_tracking, kode_tracking as kodeTracking, jenis_layanan, jenis_layanan as jenisLayanan, nama_pelapor, nama_pelapor as namaPelapor, email_pelapor, no_telp_pelapor, isi_pengaduan, tanggal, tanggal as tanggal_masuk, tanggal as tanggalMasuk, status_tanggapan, status_tanggapan as statusTanggapan, tanggapan_petugas, tanggapan_petugas as tanggapanPetugas, tanggal_tanggapan, tanggal_tanggapan as tanggalTanggapan FROM pengaduan WHERE LOWER(TRIM(kode_tracking)) = LOWER(:q1) OR (no_telp_pelapor IS NOT NULL AND TRIM(no_telp_pelapor) = :q2) LIMIT 1");
        $stmt->execute([
            ':q1' => $cleanKode,
            ':q2' => $cleanKode,
        ]);
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
        $stmtL = $pdo->prepare("SELECT 
            t.id, 
            t.no_reg, t.no_reg as noReg,
            t.spk, t.spk as noSpk,
            t.kode_tracking, t.kode_tracking as kodeTracking, 
            t.nama_pemohon, t.nama_pemohon as namaPemohon, 
            t.sampel_tanah, t.sampel_air, t.sampel_pupuk, t.sampel_tanaman,
            t.status_uji, t.status_uji as statusUji, 
            t.tahap_proses, t.tahap_proses as tahapProses,
            t.hasil_dokumen_url, t.hasil_dokumen_url as hasilDokumenUrl, 
            t.keterangan, 
            t.tanggal_masuk, t.tanggal_masuk as tanggalMasuk, 
            t.tanggal_selesai, t.tanggal_selesai as tanggalSelesai, 
            u.nama as namaPetugas, u.nama as nama_petugas 
        FROM lab_trackings t 
        LEFT JOIN users u ON t.petugas_id = u.id 
        WHERE LOWER(TRIM(t.kode_tracking)) = LOWER(:lk1) 
           OR (t.spk IS NOT NULL AND LOWER(TRIM(t.spk)) = LOWER(:lk2))
           OR (t.spk IS NOT NULL AND LOWER(TRIM(t.spk)) LIKE LOWER(:spkSuffix))
        ORDER BY t.id DESC
        LIMIT 1");
        $stmtL->execute([
            ':lk1' => $cleanKode,
            ':lk2' => $cleanKode,
            ':spkSuffix' => '%/' . $cleanKode,
        ]);
        $lab = $stmtL->fetch();

        if ($lab) {
            echo json_encode([
                'success' => true,
                'message' => 'Status pengujian lab berhasil ditemukan.',
                'data' => [
                    'id' => $lab['id'],
                    'kode_tracking' => $lab['spk'] ?: $lab['kode_tracking'],
                    'kodeTracking' => $lab['spk'] ?: $lab['kode_tracking'],
                    'jenis_layanan' => 'Uji Mutu Laboratorium',
                    'jenisLayanan' => 'Uji Mutu Laboratorium',
                    'nama_pelapor' => $lab['nama_pemohon'],
                    'tanggal_masuk' => $lab['tanggal_masuk'],
                    'tanggalMasuk' => $lab['tanggal_masuk'],
                    'status_tanggapan' => $lab['status_uji'],
                    'statusTanggapan' => $lab['status_uji'],
                    'tanggapan_petugas' => $lab['keterangan'] ?: ('Status: ' . ($lab['tahap_proses'] ?: $lab['status_uji'])),
                    'tanggapanPetugas' => $lab['keterangan'] ?: ('Status: ' . ($lab['tahap_proses'] ?: $lab['status_uji'])),
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

                $newUserId = (int)$pdo->lastInsertId();
                logActivity($pdo, $authUser, 'Tambah Pengguna', "Mendaftarkan akun baru '{$body['nama']}' ({$body['role']})", 'user');

                echo json_encode([
                    'success' => true,
                    'message' => 'Pengguna baru berhasil ditambahkan.',
                    'data' => ['id' => $newUserId, 'nama' => $body['nama'], 'email' => $body['email'], 'role' => $body['role']]
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

                logActivity($pdo, $authUser, 'Update Pengguna', "Memperbarui profil akun '{$body['nama']}' ({$body['role']})", 'user');

                echo json_encode(['success' => true, 'message' => 'Data pengguna berhasil diperbarui.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                if ($id === (int)$authUser['id']) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.']);
                    exit();
                }

                $userDel = $pdo->query("SELECT nama, role FROM users WHERE id = " . (int)$id)->fetch();
                $uDelName = $userDel['nama'] ?? "ID #{$id}";
                
                $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
                $stmt->execute([':id' => $id]);

                logActivity($pdo, $authUser, 'Hapus Pengguna', "Menghapus akun '{$uDelName}' dari sistem", 'user');

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
                $nama = $body['nama_benih'] ?? $body['namaBenih'] ?? '';
                $stok = (int)($body['stok'] ?? 0);
                $stmt = $pdo->prepare("INSERT INTO benih (nama_benih, deskripsi, stok, gambar_url, created_by_id) VALUES (:nama, :deskripsi, :stok, :gambar, :user_id)");
                $stmt->execute([
                    ':nama' => $nama,
                    ':deskripsi' => $body['deskripsi'] ?? '',
                    ':stok' => $stok,
                    ':gambar' => $body['gambar_url'] ?? $body['gambarUrl'] ?? null,
                    ':user_id' => $authUser['id']
                ]);

                logActivity($pdo, $authUser, 'Tambah Varietas Benih', "Menambahkan benih '{$nama}' dengan stok awal {$stok} kg", 'benih');

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

                logActivity($pdo, $authUser, 'Update Stok Benih', "Memperbarui stok '{$nama}' menjadi {$stok} kg", 'benih');

                echo json_encode(['success' => true, 'message' => 'Data benih berhasil diperbarui.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                $benihItem = $pdo->query("SELECT nama_benih FROM benih WHERE id = " . (int)$id)->fetch();
                $bName = $benihItem['nama_benih'] ?? "ID #{$id}";

                $stmt = $pdo->prepare("DELETE FROM benih WHERE id = :id");
                $stmt->execute([':id' => $id]);

                logActivity($pdo, $authUser, 'Hapus Benih', "Menghapus varietas benih '{$bName}'", 'benih');

                echo json_encode(['success' => true, 'message' => 'Data benih berhasil dihapus.']);
                exit();
            }
        }

        // ------------------------------------------
        // LAB TRACKING MANAGEMENT (/internal/tracking)
        // ------------------------------------------
        if ($sub === 'tracking') {
            ensureLabColumnsExist($pdo);

            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT 
                    t.id, 
                    t.no_reg, t.no_reg as noReg,
                    t.spk, t.spk as noSpk,
                    t.kode_tracking, t.kode_tracking as kodeTracking, 
                    t.nama_pemohon, t.nama_pemohon as namaPemohon, 
                    t.sampel_tanah, t.sampel_tanah as sampelTanah,
                    t.sampel_air, t.sampel_air as sampelAir,
                    t.sampel_pupuk, t.sampel_pupuk as sampelPupuk,
                    t.sampel_tanaman, t.sampel_tanaman as sampelTanaman,
                    t.jumlah_sampel, t.jumlah_sampel as jumlahSampel, t.jumlah_sampel as jumlah,
                    t.parameter_uji, t.parameter_uji as parameterUji,
                    t.telepon, t.telepon as noTelepon,
                    t.biaya,
                    t.status_bayar, t.status_bayar as statusBayar,
                    t.status_uji, t.status_uji as statusUji, 
                    t.tahap_proses, t.tahap_proses as tahapProses,
                    t.hasil_dokumen_url, t.hasil_dokumen_url as hasilDokumenUrl, 
                    t.keterangan, 
                    t.tanggal_masuk, t.tanggal_masuk as tanggalMasuk, 
                    t.tanggal_selesai, t.tanggal_selesai as tanggalSelesai, 
                    u.nama as namaPetugas, u.nama as nama_petugas 
                FROM lab_trackings t 
                LEFT JOIN users u ON t.petugas_id = u.id 
                ORDER BY t.id DESC");
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
                exit();
            }

            if ($method === 'POST') {
                $body = getJsonBody();
                $spk = trim($body['spk'] ?? $body['noSpk'] ?? '');
                $kode = trim($body['kode_tracking'] ?? $body['kodeTracking'] ?? '');
                if (empty($kode)) {
                    $kode = !empty($spk) ? $spk : ('LAB-' . date('Y') . '-' . strtoupper(substr(uniqid(), -4)));
                }

                $tglMasuk = !empty($body['tanggal_masuk']) ? $body['tanggal_masuk'] : date('Y-m-d H:i:s');
                $statusBayar = $body['status_bayar'] ?? $body['statusBayar'] ?? 'Belum Bayar';
                $tahapProses = $body['tahap_proses'] ?? $body['tahapProses'] ?? '1. Penerimaan & Registrasi Sampel';
                $pemohon = $body['nama_pemohon'] ?? $body['namaPemohon'] ?? '';

                $stmt = $pdo->prepare("INSERT INTO lab_trackings (
                    no_reg, spk, kode_tracking, nama_pemohon, 
                    sampel_tanah, sampel_air, sampel_pupuk, sampel_tanaman, 
                    jumlah_sampel, parameter_uji,
                    telepon, biaya, status_bayar, status_uji, tahap_proses, keterangan, petugas_id, tanggal_masuk
                ) VALUES (
                    :no_reg, :spk, :kode, :pemohon, 
                    :sampel_tanah, :sampel_air, :sampel_pupuk, :sampel_tanaman, 
                    :jumlah_sampel, :parameter_uji,
                    :telepon, :biaya, :status_bayar, :status, :tahap_proses, :keterangan, :petugas, :tanggal_masuk
                )");
                $stmt->execute([
                    ':no_reg' => $body['no_reg'] ?? $body['noReg'] ?? null,
                    ':spk' => $spk ?: null,
                    ':kode' => $kode,
                    ':pemohon' => $pemohon,
                    ':sampel_tanah' => $body['sampel_tanah'] ?? $body['sampelTanah'] ?? null,
                    ':sampel_air' => $body['sampel_air'] ?? $body['sampelAir'] ?? null,
                    ':sampel_pupuk' => $body['sampel_pupuk'] ?? $body['sampelPupuk'] ?? null,
                    ':sampel_tanaman' => $body['sampel_tanaman'] ?? $body['sampelTanaman'] ?? null,
                    ':jumlah_sampel' => $body['jumlah_sampel'] ?? $body['jumlahSampel'] ?? $body['jumlah'] ?? '1',
                    ':parameter_uji' => $body['parameter_uji'] ?? $body['parameterUji'] ?? null,
                    ':telepon' => $body['telepon'] ?? $body['noTelepon'] ?? null,
                    ':biaya' => $body['biaya'] ?? null,
                    ':status_bayar' => $statusBayar,
                    ':status' => $body['status_uji'] ?? $body['statusUji'] ?? 'Proses',
                    ':tahap_proses' => $tahapProses,
                    ':keterangan' => $body['keterangan'] ?? '',
                    ':petugas' => $authUser['id'],
                    ':tanggal_masuk' => $tglMasuk
                ]);

                $insertId = (int)$pdo->lastInsertId();
                $spkLabel = $spk ?: $kode;
                logActivity($pdo, $authUser, 'Pendaftaran Sampel Lab', "Mendaftarkan sampel SPK {$spkLabel} ({$pemohon})", 'lab');

                echo json_encode([
                    'success' => true, 
                    'message' => 'Data pendaftaran sampel lab berhasil disimpan.',
                    'data' => [
                        'id' => $insertId,
                        'kode_tracking' => $kode,
                        'spk' => $spk
                    ]
                ]);
                exit();
            }

            if ($method === 'PUT' && $id) {
                $body = getJsonBody();
                
                $stmtExisting = $pdo->prepare("SELECT * FROM lab_trackings WHERE id = :id LIMIT 1");
                $stmtExisting->execute([':id' => $id]);
                $existing = $stmtExisting->fetch();

                if (!$existing) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Data pengujian tidak ditemukan.']);
                    exit();
                }

                $status = $body['status_uji'] ?? $body['statusUji'] ?? $existing['status_uji'];
                $tglSelesai = $existing['tanggal_selesai'];
                if ($status === 'Selesai' && empty($tglSelesai)) {
                    $tglSelesai = date('Y-m-d H:i:s');
                }
                if (!empty($body['tanggal_selesai'])) {
                    $tglSelesai = $body['tanggal_selesai'];
                }

                $noReg = array_key_exists('no_reg', $body) ? $body['no_reg'] : (array_key_exists('noReg', $body) ? $body['noReg'] : $existing['no_reg']);
                $spk = array_key_exists('spk', $body) ? $body['spk'] : (array_key_exists('noSpk', $body) ? $body['noSpk'] : $existing['spk']);
                $nama = array_key_exists('nama_pemohon', $body) ? $body['nama_pemohon'] : (array_key_exists('namaPemohon', $body) ? $body['namaPemohon'] : $existing['nama_pemohon']);
                $tanah = array_key_exists('sampel_tanah', $body) ? $body['sampel_tanah'] : (array_key_exists('sampelTanah', $body) ? $body['sampelTanah'] : $existing['sampel_tanah']);
                $air = array_key_exists('sampel_air', $body) ? $body['sampel_air'] : (array_key_exists('sampelAir', $body) ? $body['sampelAir'] : $existing['sampel_air']);
                $pupuk = array_key_exists('sampel_pupuk', $body) ? $body['sampel_pupuk'] : (array_key_exists('sampelPupuk', $body) ? $body['sampelPupuk'] : $existing['sampel_pupuk']);
                $tanaman = array_key_exists('sampel_tanaman', $body) ? $body['sampel_tanaman'] : (array_key_exists('sampelTanaman', $body) ? $body['sampelTanaman'] : $existing['sampel_tanaman']);
                $jumlahSampel = array_key_exists('jumlah_sampel', $body) ? $body['jumlah_sampel'] : (array_key_exists('jumlahSampel', $body) ? $body['jumlahSampel'] : (array_key_exists('jumlah', $body) ? $body['jumlah'] : ($existing['jumlah_sampel'] ?? '1')));
                $parameterUji = array_key_exists('parameter_uji', $body) ? $body['parameter_uji'] : (array_key_exists('parameterUji', $body) ? $body['parameterUji'] : ($existing['parameter_uji'] ?? ''));
                $telepon = array_key_exists('telepon', $body) ? $body['telepon'] : (array_key_exists('noTelepon', $body) ? $body['noTelepon'] : $existing['telepon']);
                $biaya = array_key_exists('biaya', $body) ? $body['biaya'] : $existing['biaya'];
                $statusBayar = array_key_exists('status_bayar', $body) ? $body['status_bayar'] : (array_key_exists('statusBayar', $body) ? $body['statusBayar'] : ($existing['status_bayar'] ?? 'Belum Bayar'));
                $tahapProses = array_key_exists('tahap_proses', $body) ? $body['tahap_proses'] : (array_key_exists('tahapProses', $body) ? $body['tahapProses'] : ($existing['tahap_proses'] ?? '3. Pengujian & Analisis Laboratorium'));
                $dokumen = array_key_exists('hasil_dokumen_url', $body) ? $body['hasil_dokumen_url'] : (array_key_exists('hasilDokumenUrl', $body) ? $body['hasilDokumenUrl'] : $existing['hasil_dokumen_url']);
                $keterangan = array_key_exists('keterangan', $body) ? $body['keterangan'] : $existing['keterangan'];

                $stmt = $pdo->prepare("UPDATE lab_trackings SET 
                    no_reg = :no_reg,
                    spk = :spk,
                    nama_pemohon = :nama,
                    sampel_tanah = :sampel_tanah,
                    sampel_air = :sampel_air,
                    sampel_pupuk = :sampel_pupuk,
                    sampel_tanaman = :sampel_tanaman,
                    jumlah_sampel = :jumlah_sampel,
                    parameter_uji = :parameter_uji,
                    telepon = :telepon,
                    biaya = :biaya,
                    status_bayar = :status_bayar,
                    status_uji = :status, 
                    tahap_proses = :tahap_proses,
                    hasil_dokumen_url = :dokumen, 
                    keterangan = :keterangan, 
                    tanggal_selesai = :tgl_selesai 
                WHERE id = :id");
                $stmt->execute([
                    ':no_reg' => $noReg,
                    ':spk' => $spk,
                    ':nama' => $nama,
                    ':sampel_tanah' => $tanah,
                    ':sampel_air' => $air,
                    ':sampel_pupuk' => $pupuk,
                    ':sampel_tanaman' => $tanaman,
                    ':jumlah_sampel' => $jumlahSampel,
                    ':parameter_uji' => $parameterUji,
                    ':telepon' => $telepon,
                    ':biaya' => $biaya,
                    ':status_bayar' => $statusBayar,
                    ':status' => $status,
                    ':tahap_proses' => $tahapProses,
                    ':dokumen' => $dokumen,
                    ':keterangan' => $keterangan,
                    ':tgl_selesai' => $tglSelesai,
                    ':id' => $id
                ]);

                $spkLabel = $spk ?: ($existing['kode_tracking'] ?? "#{$id}");
                logActivity($pdo, $authUser, 'Update Analisis Lab', "Memperbarui SPK {$spkLabel} ({$nama}) — Tahap: {$tahapProses}", 'lab');

                echo json_encode(['success' => true, 'message' => 'Data pengujian laboratorium berhasil diperbarui.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                $labDel = $pdo->query("SELECT spk, kode_tracking, nama_pemohon FROM lab_trackings WHERE id = " . (int)$id)->fetch();
                $spkDel = $labDel['spk'] ?? ($labDel['kode_tracking'] ?? "#{$id}");

                $stmt = $pdo->prepare("DELETE FROM lab_trackings WHERE id = :id");
                $stmt->execute([':id' => $id]);

                logActivity($pdo, $authUser, 'Hapus Sampel Lab', "Menghapus sampel lab SPK {$spkDel}", 'lab');

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
                $status = $body['status_tanggapan'] ?? $body['statusTanggapan'] ?? 'Diproses';
                $tanggapan = $body['tanggapan_petugas'] ?? $body['tanggapanPetugas'] ?? '';

                $stmt = $pdo->prepare("UPDATE pengaduan SET status_tanggapan = :status, tanggapan_petugas = :tanggapan, ditanggapi_oleh_id = :user_id, tanggal_tanggapan = NOW() WHERE id = :id");
                $stmt->execute([
                    ':status' => $status,
                    ':tanggapan' => $tanggapan,
                    ':user_id' => $authUser['id'],
                    ':id' => $id
                ]);

                $pdItem = $pdo->query("SELECT kode_tracking, nama_pelapor FROM pengaduan WHERE id = " . (int)$id)->fetch();
                $pdKode = $pdItem['kode_tracking'] ?? "#{$id}";
                $pdNama = $pdItem['nama_pelapor'] ?? 'Pemohon';

                logActivity($pdo, $authUser, 'Tanggapi Permohonan', "Menanggapi tiket #{$pdKode} ({$pdNama}) status: {$status}", 'pengaduan');

                echo json_encode(['success' => true, 'message' => 'Tanggapan berhasil disimpan.']);
                exit();
            }

            if ($method === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM pengaduan WHERE id = :id");
                $stmt->execute([':id' => $id]);

                logActivity($pdo, $authUser, 'Hapus Permohonan', "Menghapus permohonan layanan ID #{$id}", 'pengaduan');

                echo json_encode(['success' => true, 'message' => 'Data pengaduan berhasil dihapus.']);
                exit();
            }
        }

        // ------------------------------------------
        // ACTIVITY LOGS (/internal/activities)
        // ------------------------------------------
        if ($sub === 'activities' || $sub === 'activity-logs') {
            $pdo->exec("CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                user_nama VARCHAR(100) NOT NULL,
                user_role VARCHAR(50) NOT NULL,
                action VARCHAR(100) NOT NULL,
                detail TEXT NOT NULL,
                tipe VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            // Build dynamic filtering & search query
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 2000) : 500;
            if ($limit <= 0) $limit = 500;

            $whereParts = [];
            $params = [];

            if (!empty($_GET['tipe']) && $_GET['tipe'] !== 'semua' && $_GET['tipe'] !== 'all') {
                $whereParts[] = "tipe = :tipe";
                $params[':tipe'] = $_GET['tipe'];
            }

            if (!empty($_GET['role']) && $_GET['role'] !== 'semua' && $_GET['role'] !== 'all') {
                $whereParts[] = "user_role = :role";
                $params[':role'] = $_GET['role'];
            }

            if (!empty($_GET['search'])) {
                $whereParts[] = "(user_nama LIKE :search OR action LIKE :search OR detail LIKE :search)";
                $params[':search'] = '%' . trim($_GET['search']) . '%';
            }

            if (!empty($_GET['startDate'])) {
                $whereParts[] = "DATE(created_at) >= :startDate";
                $params[':startDate'] = $_GET['startDate'];
            }

            if (!empty($_GET['endDate'])) {
                $whereParts[] = "DATE(created_at) <= :endDate";
                $params[':endDate'] = $_GET['endDate'];
            }

            $whereSql = !empty($whereParts) ? ('WHERE ' . implode(' AND ', $whereParts)) : '';

            $stmt = $pdo->prepare("SELECT id, user_id, user_nama as userNama, user_nama as nama, user_role as userRole, user_role as role, action, detail, tipe, created_at as createdAt, created_at FROM activity_logs {$whereSql} ORDER BY id DESC LIMIT {$limit}");
            $stmt->execute($params);
            $logs = $stmt->fetchAll();

            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM activity_logs {$whereSql}");
            $countStmt->execute($params);
            $totalCount = (int)$countStmt->fetchColumn();

            echo json_encode([
                'success' => true,
                'total' => $totalCount,
                'data' => $logs
            ]);
            exit();
        }

        // ------------------------------------------
        // PENGATURAN SISTEM (/internal/settings)
        // ------------------------------------------
        if ($sub === 'settings') {
            ensureSettingsTableExists($pdo);

            if ($method === 'GET') {
                $rows = $pdo->query("SELECT setting_key, setting_value FROM system_settings")->fetchAll();
                $settings = [];
                foreach ($rows as $row) {
                    $settings[$row['setting_key']] = $row['setting_value'];
                }
                echo json_encode([
                    'success' => true,
                    'data' => $settings
                ]);
                exit();
            }

            if ($method === 'POST' || $method === 'PUT') {
                $uRole = strtolower(trim($authUser['role'] ?? ''));
                if ($uRole !== 'admin') {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Akses ditolak. Fitur ini khusus Administrator.']);
                    exit();
                }
                $body = getJsonBody();
                $upsert = $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (:k, :v) ON DUPLICATE KEY UPDATE setting_value = :v2");
                foreach ($body as $key => $val) {
                    $valStr = is_bool($val) ? ($val ? '1' : '0') : (string)$val;
                    $upsert->execute([':k' => $key, ':v' => $valStr, ':v2' => $valStr]);
                }

                logActivity($pdo, $authUser, 'Update Pengaturan', 'Admin memperbarui konfigurasi sistem aplikasi', 'settings');

                echo json_encode([
                    'success' => true,
                    'message' => 'Pengaturan aplikasi berhasil disimpan ke database server.'
                ]);
                exit();
            }
        }

        // ------------------------------------------
        // GANTI PASSWORD (/internal/change-password)
        // ------------------------------------------
        if ($sub === 'change-password' && $method === 'POST') {
            $body = getJsonBody();
            $currentPassword = $body['current_password'] ?? '';
            $newPassword = $body['new_password'] ?? '';
            $confirmPassword = $body['confirm_password'] ?? '';

            if (empty($currentPassword) || empty($newPassword)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Password saat ini dan password baru wajib diisi.']);
                exit();
            }

            if ($newPassword !== $confirmPassword) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Konfirmasi password baru tidak cocok.']);
                exit();
            }

            if (strlen($newPassword) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Password baru minimal 6 karakter.']);
                exit();
            }

            // Cek password lama di database
            $stmt = $pdo->prepare("SELECT id, password_hash, email, nama FROM users WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $authUser['id']]);
            $u = $stmt->fetch();

            if (!$u || !password_verify($currentPassword, $u['password_hash'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Password saat ini salah.']);
                exit();
            }

            // Update password baru
            $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
            $up = $pdo->prepare("UPDATE users SET password_hash = :hash WHERE id = :id");
            $up->execute([':hash' => $newHash, ':id' => $authUser['id']]);

            logActivity($pdo, $authUser, 'Ganti Password', 'Pengguna mengganti kata sandi akun', 'security');

            echo json_encode(['success' => true, 'message' => 'Password berhasil diperbarui. Silakan gunakan password baru pada login berikutnya.']);
            exit();
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
