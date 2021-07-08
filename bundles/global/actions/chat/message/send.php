<?php //route[/chat/message/send]

$user = User::getCurrent();
if (!$user) {
    die;
}
$user_id = $user->getId();
DB::insert("chat_message", ["client_id" => $user_id, "sender_id" => $user_id, "message" => $_POST["message"]]);
