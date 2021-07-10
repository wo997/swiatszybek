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