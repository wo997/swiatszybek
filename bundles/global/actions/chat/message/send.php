<?php //route[/chat/message/send]

$user = User::getCurrent();
$user_id = $user->getId();

$last_sent_at = DB::fetchVal("SELECT sent_at FROM chat_message WHERE sender_id = $user_id AND receiver_id IS NULL ORDER BY chat_message_id DESC LIMIT 4,1");
if ($last_sent_at) {
    $seconds_passed = time() - strtotime($last_sent_at);
    if ($seconds_passed < 10) {
        // 4 messages in 10 seconds? get the fuck out XD
        die;
    }
}

DB::insert("chat_message", ["client_id" => $user_id, "sender_id" => $user_id, "message" => $_POST["message"]]);
