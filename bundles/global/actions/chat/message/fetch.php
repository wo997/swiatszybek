<?php //route[/chat/message/fetch]

// long polling sucks duude
// set_time_limit(0);
// session_write_close();
// ignore_user_abort(true);

$user = User::getCurrent();
$user_id = $user->getId();
$limit = 30;

$where = "client_id = $user_id";
$order = "chat_message_id DESC";

$res = [];

if (isset($_POST["from_chat_message_id"])) {
    $from_chat_message_id = def($_POST, "from_chat_message_id", 0);

    $long_polling = def($_POST, "long_polling");
    if ($long_polling) {
        $cnt = 0;
        // up to N seconds and repeat the cycle from the front
        // 10s
        // while ($cnt++ < 40) {
        //     if (connection_status() != CONNECTION_NORMAL) {
        //         die;
        //     }

        //     forgetLastTypings();
        //     $is_chatter_typing = isAdminTyping($user_id);
        //     if ($_POST["is_chatter_typing"] != $is_chatter_typing) {
        //         break;
        //     }
        //     $max_chat_message_id = DB::fetchVal("SELECT MAX(chat_message_id) FROM chat_message WHERE $where");
        //     if ($max_chat_message_id > $from_chat_message_id) {
        //         break;
        //     }
        //     usleep(250 * 1000);
        // }
    }
    if ($from_chat_message_id) {
        $where .= " AND chat_message_id > " . intval($from_chat_message_id);
    }
    $order = "chat_message_id ASC";
} else if (isset($_POST["to_chat_message_id"])) {
    $where .= " AND chat_message_id < " . intval($_POST["to_chat_message_id"]);
}

$is_chatter_typing = isAdminTyping($user_id);
$messages = DB::fetchArr("SELECT chat_message_id, sender_id, receiver_id, message, sent_at FROM chat_message WHERE $where ORDER BY $order LIMIT $limit");

if (strpos($order, "DESC") !== false) {
    $messages = array_reverse($messages);
}

Request::jsonResponse(["messages" => $messages, "is_chatter_typing" => $is_chatter_typing]);
