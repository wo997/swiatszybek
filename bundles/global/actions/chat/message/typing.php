<?php //route[/chat/message/typing]

$user = User::getCurrent();
$user_id = $user->getId();

$where = "sender_id = $user_id AND receiver_id IS NULL";
if (!DB::fetchRow("SELECT 1 FROM chat_typing WHERE $where")) {
    DB::insert("chat_typing", ["client_id" => $user_id, "sender_id" => $user_id, "message" => $_POST["message"], "typed_at" => date("Y-m-d H:i:s")]);
}
DB::update("chat_typing", ["message" => $_POST["message"], "typed_at" => date("Y-m-d H:i:s")], $where);
