<?php //route[{ADMIN}/chat/get_clients]

$client_ids = DB::fetchCol("SELECT DISTINCT(client_id) FROM chat_message");

$clients = [];
foreach ($client_ids as $client_id) {
    $clients[] = DB::fetchRow("SELECT client_id, sender_id, receiver_id, message, sent_at, COUNT(1) count FROM chat_message WHERE client_id = ? ORDER BY chat_message_id", [$client_id]);
}

Request::jsonResponse(["clients" => $clients]);
