<?php

require_once '../config/webhook.php';
require_once '../auth.php';
require_api_role(['admin', 'user']);
header('Content-Type: application/json');

$keterangan = trim($_POST['keterangan'] ?? '');
$name = trim($_POST['name'] ?? '');
$sn = trim($_POST['sn'] ?? '');
$division = trim($_POST['division'] ?? '');

if ($keterangan === '' || $name === '' || $sn === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Mandatory fields are missing. Please provide Keterangan, Nama, and Serial Number.',
    ]);
    exit;
}

$payload = [
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => $name,
    'keterangan' => $keterangan,
    'SN' => $sn,
    'Division' => $division,
];

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => WEBHOOK_UPDATE,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Connection to n8n webhook failed: ' . $curl_error,
    ]);
    exit;
}

if ($http_code >= 400) {
    http_response_code($http_code);
    echo json_encode([
        'success' => false,
        'message' => 'n8n transaction failed with status code: ' . $http_code,
        'raw_response' => $response,
    ]);
    exit;
}

$decoded = json_decode($response, true);
if ($decoded !== null && isset($decoded['success']) && !$decoded['success']) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $decoded['message'] ?? 'n8n processing error',
        'response' => $decoded,
    ]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Transaction submitted successfully!', 'response' => $decoded ?? $response]);
