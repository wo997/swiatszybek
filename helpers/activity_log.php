<?php //hook[helper]

function addZamowienieLog($zamowienie_id, $log, $previous_state = "", $current_state = "", $log_user_id = null)
{
    addLog($log, $previous_state, $current_state, $log_user_id, "order", $zamowienie_id);
}

function addLog($log, $previous_state = "", $current_state = "", $log_user_id = null, $scope = "", $scope_item_id = null)
{
    global $app;
    if (!$log_user_id) $log_user_id = $app["user"]["id"];
    query("INSERT INTO activity_log (log, current_state, previous_state, user_id, scope, scope_item_id) VALUES (?,?,?,?,?,?)", [
        $log, $current_state, $previous_state, $log_user_id, $scope, $scope_item_id
    ]);
}
