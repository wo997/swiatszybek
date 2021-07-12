<?php //route[{ADMIN}/settings/save_additional_scripts]  

$additional_scripts = json_decode($_POST["additional_scripts"], true);
saveSetting("general", "additional_scripts", ["path" => [], "value" => $additional_scripts]);

Files::save(PREBUILDS_PATH . "custom_global_js.js", "/* js[global] */\n" . $additional_scripts["global_js"]);
Files::save(PREBUILDS_PATH . "custom_global_css.scss", "/* css[global] */\n" . $additional_scripts["global_css"]);
