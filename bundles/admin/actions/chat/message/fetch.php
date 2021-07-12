<?php //route[{ADMIN}/chat/message/fetch]

$client_id = $_POST["client_id"];
$limit = 30;

$where = "client_id = $client_id";
$order = "chat_message_id DESC";

$res = [];

if (isset($_POST["from_chat_message_id"])) {
    $from_chat_message_id = def($_POST, "from_chat_message_id", 0);
    if ($from_chat_message_id) {
        $where .= " AND chat_message_id > " . intval($from_chat_message_id);
    }
    $order = "chat_message_id ASC";
} else if (isset($_POST["to_chat_message_id"])) {
    $where .= " AND chat_message_id < " . intval($_POST["to_chat_message_id"]);
}

$what_is_client_typing = whatIsClientTyping($client_id);
$messages = DB::fetchArr("SELECT chat_message_id, sender_id, receiver_id, message, sent_at FROM chat_message WHERE $where ORDER BY $order LIMIT $limit");

if (strpos($order, "DESC") !== false) {
    $messages = array_reverse($messages);
}

Request::jsonResponse(["messages" => $messages, "what_is_client_typing" => $what_is_client_typing]);
