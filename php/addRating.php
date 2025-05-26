<?php

    // Allow cross-origin requests if needed
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");

    // Get the JSON data from the request
    $jsonData = file_get_contents('php://input');
    file_put_contents('../json/ratings.json', $jsonData);
?>