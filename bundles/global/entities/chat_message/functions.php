<?php //hook[helper]

function forgetLastTypings()
{
    DB::delete("chat_typing", "typed_at <= \"" . date("Y-m-d H:i:s", strtotime("- 2 seconds")) . "\"");
}

function isAdminTyping($user_id)
{
    return DB::fetchVal("SELECT 1 FROM chat_typing WHERE sender_id = $user_id AND receiver_id IS NOT NULL") ? 1 : 0;
}

function whatIsClientTyping($user_id)
{
    return DB::fetchVal("SELECT message FROM chat_typing WHERE sender_id = $user_id AND receiver_id IS NULL") ? 1 : 0;
}
