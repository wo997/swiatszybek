<?php //event[pies__before]

// args could also be suggested by the plugin, it's the entity event listener so that's easy to tell what it consists of 
$res = [];

// we can check if the value has changed or whether it's set to the same thing if the key is defined and we can possibly remove it? 
if (isset($args["data"]["food"]) && $args["data"]["food"] != $args["current_data"]["food"]) {
    // there are 3 options to set the ate_at time when the food value has changed

    // 1. by setting data explicitly
    // $res["append_data"]["ate_at"] = date("Y-m-d H:i:s");

    // 2. by appending raw sql
    $res["append_set_query"][] = "ate_at = NOW()";

    // 3. immediately (__before), but if you wanna validate data go for __after or maybe we could gather all sqls from here, less files to handle ofc
    //DB::execute("UPDATE pies SET ate_at = NOW() WHERE pies_id = " . $args["entity_id"]);

    if ($args["data"]["food"] < 0) {
        $res["errors"][] = "Food quantity: " . $args["data"]["food"] . " is below 0";
    }
}

return $res;
