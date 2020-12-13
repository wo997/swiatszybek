<?php //event[pies__before]

$res = [];

// multiple event listeners can work just fine, obvious shit
/*if (isset($args["data"]["food"])) {
    //$res["update_query"] = "ate_at = NOW()";
    $res["append_data"]["ate_at"] = date("Y-m-d");
    //query("UPDATE pies SET ate_at = NOW() WHERE pies_id = " . $args["entity_id"]);
}*/

return $res;
