<?php

require_once '../config/webhook.php';

header('Content-Type: application/json');

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => WEBHOOK_HISTORY,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 25, // Google Sheets + n8n can take up to 15s
    CURLOPT_FAILONERROR => false
]);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Connection to n8n failed: ' . $curl_error
    ]);
} else if ($http_code >= 400) {
    http_response_code($http_code);
    echo json_encode([
        'success' => false,
        'message' => 'n8n returned HTTP status code: ' . $http_code,
        'raw_response' => $result
    ]);
} else {
    echo $result;
}