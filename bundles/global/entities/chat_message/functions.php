<?php //hook[helper]

function forgetLastTypings()
{
    DB::delete("chat_typing", "typed_at < \"" . date("Y-m-d H:i:s", strtotime("- 3 seconds")) . "\"");
}
