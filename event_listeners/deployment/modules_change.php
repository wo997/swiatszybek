<?php //event[modules_change]

use MatthiasMullie\Minify;

global $_module_block_js_path, $_module_path, $_event_paths, $_module_block_php_path, $_module_block_form_path, $_module_form_path;

$_module_block_js_path = [];
$_module_path = [];
$_event_paths = [];
$_module_block_php_path = [];
$_module_block_form_path = [];
$_module_form_path = [];

echo "<br><h3>Scanning modules:</h3>";

scanDirectories(
    [
        "get_first_line" => true,
        "include_paths" => ["modules"],
    ],
    function ($path, $first_line) {
        global $_module_path, $_module_block_php_path, $_module_block_form_path, $_module_block_js_path, $_module_form_path;

        // do the same in automatic build ;)
        if ($module_name = getAnnotationPHP("module", $first_line)) {
            $_module_path[$module_name] = $path;
        } else if ($module_block_name = getAnnotationPHP("module_block", $first_line)) {
            $_module_block_php_path[$module_block_name] = $path;
        } else if ($module_block_form_name = getAnnotationPHP("module_block_form", $first_line)) {
            $_module_block_form_path[$module_block_form_name] = $path;
        } else if ($module_block_name = getAnnotation("module_block", $first_line)) {
            $_module_block_js_path[$module_block_name] = $path;
        } else if ($module_form_name = getAnnotationPHP("module_form", $first_line)) {
            $_module_form_path[$module_form_name] = $path;
        }
    }
);

echo "<h3>✅ Scanning modules completed</h3>";

$out = "<?php return [\n";
foreach ($_module_path as $module_name => $path) {
    $out .= "'$module_name' => '$path',\n";
}
$out .= "];";
file_put_contents(BUILDS_PATH . "link_module_path.php", $out);

$out = "<?php return [\n";
foreach ($_module_block_php_path as $module_block_name => $path) {
    $out .= "'$module_block_name' => '$path',\n";
}
$out .= "];";
file_put_contents(BUILDS_PATH . "link_module_block_php_path.php", $out);

$out = "<?php return [\n";
foreach ($_module_block_form_path as $module_block_form_name => $path) {
    $out .= "'$module_block_form_name' => '$path',\n";
}
$out .= "];";
file_put_contents(BUILDS_PATH . "link_module_block_form_path.php", $out);

$out = "<?php return [\n";
foreach ($_module_form_path as $module_form_name => $path) {
    $out .= "'$module_form_name' => '$path',\n";
}
$out .= "];";
file_put_contents(BUILDS_PATH . "link_module_form_path.php", $out);

$out = "var module_blocks = {};";
foreach ($_module_block_js_path as $module_block_name => $path) {
    $out .= prepareModuleBlock(file_get_contents($path), $module_block_name);
}
(new Minify\JS($out))->minify(BUILDS_PATH . "module_blocks.js");

$out = "var modules = {";
foreach ($_module_path as $module_name => $path) {
    $out .= "\"$module_name\": " . json_encode(include $path) . ",";
}
$out .= "};";
(new Minify\JS($out))->minify(BUILDS_PATH . "modules.js");
