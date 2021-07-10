<?php //hook[migration]

DB::createTable(
    "chat_message",
    [
        ["name" => "chat_message_id", "type" => "INT", "index" => "primary"],
        ["name" => "client_id", "type" => "INT", "index" => "index"],
        ["name" => "sender_id", "type" => "INT", "index" => "index"],
        ["name" => "receiver_id", "type" => "INT", "index" => "index", "null" => true],
        ["name" => "message", "type" => "TEXT"],
        ["name" => "sent_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ]
);

// no indices cause it's smoll
DB::createTable(
    "chat_typing",
    [
        ["name" => "client_id", "type" => "INT"],
        ["name" => "sender_id", "type" => "INT"],
        ["name" => "receiver_id", "type" => "INT", "null" => true],
        ["name" => "message", "type" => "TEXT"],
        ["name" => "typed_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ]
);

// DB::createTable(
//     "chat_seen",
//     [
//         ["name" => "client_id", "type" => "INT", "index" => "index"],
//         ["name" => "sender_id", "type" => "INT", "index" => "index"],
//         ["name" => "receiver_id", "type" => "INT", "null" => true],
//         ["name" => "chat_message_id", "type" => "INT", "index" => "index"],
//     ]
// );
