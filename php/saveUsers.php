<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$jsonData = file_get_contents('php://input');

if ($jsonData === false) {
    http_response_code(400);
    echo json_encode(["error" => "No se recibió JSON."]);
    exit;
}

$filePath = '../json/users.json';

// Verificar que el directorio y archivo sean escribibles
if (!is_writable($filePath)) {
    http_response_code(500);
    echo json_encode(["error" => "No se puede escribir en el archivo users.json."]);
    exit;
}

if (file_put_contents($filePath, $jsonData) === false) {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar datos."]);
    exit;
}

echo json_encode(["success" => true]);
?>
