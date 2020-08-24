<?php //event[config_change]


$props = fetchArray("SELECT prop_id, prop_name, prop_value FROM konfiguracja");

$out = "<?php \$config=[";
foreach ($props as $p) {
    $k = addslashes($p["prop_name"]);
    $v = addslashes($p["prop_value"]);
    $out .= PHP_EOL . "\"$k\"=>\"$v\",";
}
$out .= PHP_EOL . "];";

file_put_contents(BUILDS_PATH . "config.php", $out);
