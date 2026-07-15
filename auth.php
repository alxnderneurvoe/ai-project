<?php
session_start();

/**
 * Require an authenticated session.
 */
function require_login() {
    if (!isset($_SESSION['login'])) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Require an authenticated session for API endpoints.
 */
function require_api_login() {
    if (!isset($_SESSION['login'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized. Please login first.'
        ]);
        exit;
    }
}

/**
 * Get the current user's role.
 *
 * @return string
 */
function current_user_role() {
    return $_SESSION['user_role'] ?? 'viewer';
}

/**
 * Require that the current user has one of the allowed roles.
 *
 * @param array $allowedRoles
 */
function require_role(array $allowedRoles) {
    require_login();

    if (!in_array(current_user_role(), $allowedRoles, true)) {
        header('HTTP/1.1 403 Forbidden');
        echo '<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body style="font-family:Arial,sans-serif;background:#111;color:#eee;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="max-width:480px;text-align:center;"><h1 style="font-size:3rem;margin-bottom:0.25rem;">403</h1><p style="font-size:1.15rem;margin-bottom:1.5rem;">Akses ditolak. Anda tidak memiliki izin yang cukup untuk halaman ini.</p><a href="dashboard.php" style="color:#60a5fa;text-decoration:none;font-weight:600;">Kembali ke Dashboard</a></div></body></html>';
        exit;
    }
}

/**
 * Require that the current API user has one of the allowed roles.
 *
 * @param array $allowedRoles
 */
function require_api_role(array $allowedRoles) {
    require_api_login();

    if (!in_array(current_user_role(), $allowedRoles, true)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden. You do not have sufficient privileges.'
        ]);
        exit;
    }
}
?>