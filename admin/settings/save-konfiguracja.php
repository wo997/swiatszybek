<?php //route[admin/save-konfiguracja]

foreach ($_POST["prop_val"] as $k => $v) {
  query("UPDATE konfiguracja SET prop_value = ? WHERE prop_id = " . intval($k), [$v]);
}

triggerEvent("config_change");
die;
