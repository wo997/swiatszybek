<?php //route[/chat/message/fetch]

$user = User::getCurrent();
$user_id = $user->getId();
$limit = 100;

$where = "client_id = $user_id";
$order = "chat_message_id DESC";
if (isset($_POST["from_chat_message_id"])) {
    $from_chat_message_id = def($_POST, "from_chat_message_id", 0);

    if (def($_POST, "long_polling")) {
        session_write_close();
        $cnt = 0;
        // up to N seconds and repeat the cycle from the front
        while ($cnt++ < 100) {
            $max_chat_message_id = DB::fetchVal("SELECT MAX(chat_message_id) FROM chat_message WHERE $where");
            if ($max_chat_message_id > $from_chat_message_id) {
                break;
            }
            sleep(0.2);
        }
    }
    if ($from_chat_message_id) {
        $where .= " AND chat_message_id > " . intval($from_chat_message_id);
    }
    $order = "chat_message_id ASC";
} else if (isset($_POST["to_chat_message_id"])) {
    $where .= " AND chat_message_id < " . intval($_POST["to_chat_message_id"]);
}

$messages = DB::fetchArr("SELECT chat_message_id, sender_id, receiver_id, message, sent_at FROM chat_message WHERE $where ORDER BY $order LIMIT $limit");
Request::jsonResponse($messages);
