<?php //helper[global]

if (!isset($input["exceptions"])) {
    $input["exceptions"] = [];
}

$res = [];
foreach ($_POST as $var_name => $var_value) {
    if (in_array($var_name, $input["exceptions"])) {
        continue;
    }
    $res["$var_name"] = isset($input["exceptions"][$var_name]);
    $_POST[$var_name] = htmlspecialchars($var_value);
}
