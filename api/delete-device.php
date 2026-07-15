<?php

require_once '../config/webhook.php';
require_once '../auth.php';
require_api_role(['admin']);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
    exit;
}

$sn = trim($input['SN'] ?? '');
if ($sn === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Serial Number (SN) is required.']);
    exit;
}

$payload = ['SN' => $sn];

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => WEBHOOK_DELETE_DEVICE,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_FAILONERROR => false,
]);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Connection to n8n failed: ' . $curl_error]);
    exit;
}

if ($http_code >= 400) {
    http_response_code($http_code);
    echo json_encode(['success' => false, 'message' => 'n8n returned HTTP status code: ' . $http_code, 'raw_response' => $result]);
    exit;
}

$decoded = json_decode($result, true);
if ($decoded !== null && isset($decoded['success']) && !$decoded['success']) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $decoded['message'] ?? 'n8n returned an error', 'response' => $decoded]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Device deleted successfully.', 'response' => $decoded ?? $result]);
