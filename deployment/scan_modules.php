<?php

use MatthiasMullie\Minify;

$_module_block_js_files = [];
$_link_event_paths = [];
$_link_module_block_path = [];
$_link_module_block_form_path = [];

echo "<br><h3>Scanning modules:</h3>";

scanDirectories(
    [
        "get_first_line" => true,
        "include_paths" => ["modules"],
    ],
    function ($path, $first_line) {
        global $_link_module_path, $_link_module_block_path, $_link_module_block_form_path, $_module_block_js_files;

        // include everything lol
        /*if (!strpos($path, ".php")) { 
            return;
        }*/

        if ($module_name = getAnnotationPHP("module", $first_line)) {
            $_link_module_path[$module_name] = $path;
        } else if ($module_block_name = getAnnotationPHP("module_block", $first_line)) {
            $_link_module_block_path[$module_block_name] = $path;
        } else if ($module_block_form_name = getAnnotationPHP("module_block_form", $first_line)) {
            $_link_module_block_form_path[$module_block_form_name] = $path;
        } else  if ($module_block_name = getAnnotation("module_block", $first_line)) {
            $_module_block_js_files[$module_block_name] = file_get_contents($path);
        }
    }
);

echo "<h3>✅ Scanning modules completed</h3>";


$out = "<?php return [\n";
foreach ($_link_module_path as $module_name => $path) {
    $out .= "'$module_name' => '$path',\n";
}
$out .= "];";
file_put_contents(BUILDS_PATH . "link_module_path.php", $out);


$out = "<?php return [\n";
foreach ($_link_module_block_path as $module_block_name => $path) {
    $out .= "'$module_block_name' => '$path',\n";
}
$out .= "];";
file_put_contents(BUILDS_PATH . "link_module_block_path.php", $out);


$out = "<?php return [\n";
foreach ($_link_module_block_form_path as $module_block_form_name => $path) {
    $out .= "'$module_block_form_name' => '$path',\n";
}
$out .= "];";
file_put_contents(BUILDS_PATH . "link_module_block_form_path.php", $out);

$module_blocks_js = "";
foreach ($_module_block_js_files as $module_block_name => $module_block_file) {
    $module_blocks_js .= prepareModuleBlock($module_block_file, $module_block_name);
}

$minifier = new Minify\JS($module_blocks_js);
$minifier->minify("builds/module_blocks.js");
