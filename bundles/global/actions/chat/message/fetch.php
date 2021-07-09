<?php //route[/chat/message/fetch]

$user = User::getCurrent();
$user_id = $user->getId();
$limit = 100;

$where = "client_id = $user_id";
$order = "chat_message_id DESC";
if (isset($_POST["from_chat_message_id"])) {
    $where .= " AND chat_message_id > " . intval($_POST["from_chat_message_id"]);
    $order = "chat_message_id ASC";
} else if (isset($_POST["to_chat_message_id"])) {
    $where .= " AND chat_message_id < " . intval($_POST["to_chat_message_id"]);
}

$messages = DB::fetchArr("SELECT chat_message_id, sender_id, receiver_id, message, sent_at FROM chat_message WHERE $where ORDER BY $order LIMIT $limit");
Request::jsonResponse($messages);
