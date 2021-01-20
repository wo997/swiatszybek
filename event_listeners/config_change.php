<?php //event[config_change]


$props = DB::fetchArr("SELECT prop_id, prop_name, prop_value FROM konfiguracja");

$out = "<?php \$config=[";
foreach ($props as $p) {
    $k = addslashes($p["prop_name"]);
    $v = addslashes($p["prop_value"]);
    $out .= PHP_EOL . "\"$k\"=>\"$v\",";
}
$out .= PHP_EOL . "];";

saveFile(BUILDS_PATH . "config.php", $out);
