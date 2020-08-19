<?php

function addZamowienieLog($log, $zamowienie_id, $log_user_id = null)
{
    addLog($log, $log_user_id, "order", $zamowienie_id);
}

function addLog($log, $log_user_id = null, $scope = "", $scope_item_id = null)
{
    global $app;
    if (!$log_user_id) $log_user_id = $app["user"]["id"];
    query("INSERT INTO activity_log (log, user_id, scope, scope_item_id) VALUES (?,?,?,?)", [
        $log, $log_user_id, $scope, $scope_item_id
    ]);
}
