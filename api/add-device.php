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

$payload = [
    'SN' => trim($_POST['sn'] ?? ''),
    'Type' => trim($_POST['type'] ?? ''),
    'laptop' => trim($_POST['laptop'] ?? ''),
    'brand' => trim($_POST['brand'] ?? ''),
    'spesifikasi' => trim($_POST['spesifikasi'] ?? ''),
    'cpu' => trim($_POST['cpu'] ?? ''),
    'ram' => trim($_POST['ram'] ?? ''),
    'storage' => trim($_POST['storage_full'] ?? ''),
];

if ($payload['SN'] === '' || $payload['Type'] === '' || $payload['laptop'] === '' || $payload['brand'] === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'SN, Type, Laptop, and Brand are required.']);
    exit;
}

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => WEBHOOK_ADD_DEVICE,
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
if ($decoded === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON response from n8n.', 'raw_response' => $result]);
    exit;
}

$source = [];
if (is_array($decoded)) {
    if (isset($decoded[0]) && is_array($decoded[0])) {
        $source = $decoded[0];
    } else {
        $source = $decoded;
    }
} else {
    $source = (array) $decoded;
}

$output = [
    'SN' => $source['SN'] ?? $source['sn'] ?? '',
    'Type' => $source['Type'] ?? $source['type'] ?? '',
    'laptop' => $source['laptop'] ?? $source['Laptop'] ?? '',
    'brand' => $source['brand'] ?? $source['Brand'] ?? '',
    'spesifikasi' => $source['spesifikasi'] ?? $source['Spesifikasi'] ?? '',
    'cpu' => $source['cpu'] ?? $source['CPU'] ?? '',
    'ram' => $source['ram'] ?? $source['RAM'] ?? '',
    'storage' => $source['storage'] ?? $source['Storage'] ?? '',
    'storage_type' => $source['storage_type'] ?? $source['Storage Type'] ?? $source['storage_type'] ?? $source['storage_type'] ?? '',
];

echo json_encode(['success' => true, 'data' => $output]);
