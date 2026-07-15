<?php

/**
 * Returns a shared PDO connection to the local SQLite database.
 * The database file is created automatically if it does not exist.
 *
 * @return PDO
 */
function get_db_connection() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dbPath = __DIR__ . '/../data/app.db';
    $dsn = 'sqlite:' . $dbPath;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, null, null, $options);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT "user",
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            SN TEXT NOT NULL UNIQUE,
            listing TEXT,
            laptop TEXT,
            name TEXT,
            division TEXT,
            status TEXT,
            spesifikasi TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME NOT NULL,
            name TEXT,
            keterangan TEXT,
            SN TEXT,
            Division TEXT,
            Laptop TEXT,
            Brand TEXT,
            spesifikasi TEXT
        )'
    );

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = :username');
    $stmt->execute([':username' => 'admin']);

    if ($stmt->fetchColumn() == 0) {
        $insert = $pdo->prepare(
            'INSERT INTO users (username, password_hash, full_name, role) VALUES (:username, :password_hash, :full_name, :role)'
        );

        $insert->execute([
            ':username' => 'admin',
            ':password_hash' => password_hash('admin123', PASSWORD_DEFAULT),
            ':full_name' => 'Administrator',
            ':role' => 'admin',
        ]);
    }

    $defaultUsers = [
        ['username' => 'user', 'password' => 'user123', 'full_name' => 'Regular User', 'role' => 'user'],
        ['username' => 'viewer', 'password' => 'viewer123', 'full_name' => 'Viewer User', 'role' => 'viewer'],
    ];

    foreach ($defaultUsers as $defaultUser) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = :username');
        $stmt->execute([':username' => $defaultUser['username']]);

        if ($stmt->fetchColumn() == 0) {
            $insert = $pdo->prepare(
                'INSERT INTO users (username, password_hash, full_name, role) VALUES (:username, :password_hash, :full_name, :role)'
            );

            $insert->execute([
                ':username' => $defaultUser['username'],
                ':password_hash' => password_hash($defaultUser['password'], PASSWORD_DEFAULT),
                ':full_name' => $defaultUser['full_name'],
                ':role' => $defaultUser['role'],
            ]);
        }
    }

    return $pdo;
}

/**
 * Fetches a user record by username.
 *
 * @param string $username
 * @return array|false
 */
function find_user_by_username($username) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = :username');
    $stmt->execute([':username' => $username]);
    return $stmt->fetch();
}

/**
 * Creates a new user record in the local SQLite database.
 *
 * @param string $username
 * @param string $password
 * @param string|null $full_name
 * @param string $role
 * @return bool
 */
function create_user($username, $password, $full_name = null, $role = 'user') {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES (:username, :password_hash, :full_name, :role)'
    );

    return $stmt->execute([
        ':username' => $username,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':full_name' => $full_name,
        ':role' => $role,
    ]);
}

/**
 * Fetch all devices.
 *
 * @return array
 */
function get_all_devices() {
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT * FROM devices ORDER BY id DESC');
    return $stmt->fetchAll();
}

/**
 * Fetch a device by ID.
 *
 * @param int $id
 * @return array|false
 */
function get_device_by_id($id) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('SELECT * FROM devices WHERE id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch();
}

/**
 * Fetch a device by SN.
 *
 * @param string $sn
 * @return array|false
 */
function get_device_by_sn($sn) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('SELECT * FROM devices WHERE SN = :SN');
    $stmt->execute([':SN' => $sn]);
    return $stmt->fetch();
}

/**
 * Create a new device.
 *
 * @param array $data
 * @return int|false
 */
function create_device(array $data) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare(
        'INSERT INTO devices (SN, listing, laptop, brand, name, division, status, spesifikasi, created_at, updated_at)
         VALUES (:SN, :listing, :laptop, :brand, :name, :division, :status, :spesifikasi, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    );

    $success = $stmt->execute([
        ':SN' => $data['SN'] ?? '',
        ':listing' => $data['listing'] ?? '',
        ':laptop' => $data['laptop'] ?? '',
        ':brand' => $data['brand'] ?? '',
        ':name' => $data['name'] ?? '',
        ':division' => $data['division'] ?? '',
        ':status' => $data['status'] ?? '',
        ':spesifikasi' => $data['spesifikasi'] ?? '',
    ]);

    return $success ? (int) get_db_connection()->lastInsertId() : false;
}

/**
 * Update a device by ID.
 *
 * @param int $id
 * @param array $data
 * @return bool
 */
function update_device($id, array $data) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare(
        'UPDATE devices SET SN = :SN, listing = :listing, laptop = :laptop, brand = :brand, name = :name, division = :division, status = :status, spesifikasi = :spesifikasi, updated_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    );

    return $stmt->execute([
        ':SN' => $data['SN'] ?? '',
        ':listing' => $data['listing'] ?? '',
        ':laptop' => $data['laptop'] ?? '',
        ':brand' => $data['brand'] ?? '',
        ':name' => $data['name'] ?? '',
        ':division' => $data['division'] ?? '',
        ':status' => $data['status'] ?? '',
        ':spesifikasi' => $data['spesifikasi'] ?? '',
        ':id' => $id,
    ]);
}

/**
 * Update a device by SN.
 *
 * @param string $sn
 * @param array $data
 * @return bool
 */
function update_device_by_sn($sn, array $data) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare(
        'UPDATE devices SET listing = :listing, laptop = :laptop, brand = :brand, name = :name, division = :division, status = :status, spesifikasi = :spesifikasi, updated_at = CURRENT_TIMESTAMP
         WHERE SN = :SN'
    );

    return $stmt->execute([
        ':SN' => $sn,
        ':listing' => $data['listing'] ?? '',
        ':laptop' => $data['laptop'] ?? '',
        ':brand' => $data['brand'] ?? '',
        ':name' => $data['name'] ?? '',
        ':division' => $data['division'] ?? '',
        ':status' => $data['status'] ?? '',
        ':spesifikasi' => $data['spesifikasi'] ?? '',
    ]);
}

/**
 * Delete a device by ID.
 *
 * @param int $id
 * @return bool
 */
function delete_device($id) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('DELETE FROM devices WHERE id = :id');
    return $stmt->execute([':id' => $id]);
}

/**
 * Fetch all history entries.
 *
 * @return array
 */
function get_all_history() {
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT * FROM history ORDER BY timestamp DESC');
    return $stmt->fetchAll();
}

/**
 * Create a new history entry.
 *
 * @param array $data
 * @return bool
 */
function create_history_entry(array $data) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare(
        'INSERT INTO history (timestamp, name, keterangan, SN, Division, Laptop, Brand, spesifikasi)
         VALUES (:timestamp, :name, :keterangan, :SN, :Division, :Laptop, :Brand, :spesifikasi)'
    );

    return $stmt->execute([
        ':timestamp' => $data['timestamp'] ?? date('Y-m-d H:i:s'),
        ':name' => $data['name'] ?? '',
        ':keterangan' => $data['keterangan'] ?? '',
        ':SN' => $data['SN'] ?? '',
        ':Division' => $data['Division'] ?? '',
        ':Laptop' => $data['Laptop'] ?? '',
        ':Brand' => $data['Brand'] ?? '',
        ':spesifikasi' => $data['spesifikasi'] ?? '',
    ]);
}
