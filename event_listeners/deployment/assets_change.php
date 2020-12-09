<?php //event[assets_change]
// args [js: boolean, css: boolean] or empty for both

global $cssFileGroups, $jsFileGroups, $modifyCSS, $modifyJS; // event is already a function

$modifyCSS = nonull($args, "css", true);
$modifyJS = nonull($args, "js", true);

if (!$modifyJS && !$modifyCSS) {
    return;
}

use MatthiasMullie\Minify;
use ScssPhp\ScssPhp\Compiler;

$cssFileGroups = [];
$jsFileGroups = [];

scanDirectories(
    [
        "get_first_line" => true,
        "exclude_paths" => ["vendor", "uploads", "builds"],
    ],
    function ($path, $first_line, $parent_dir) {
        global $cssFileGroups, $jsFileGroups, $modifyCSS, $modifyJS;

        if (strpos($path, ".css") !== false || strpos($path, ".scss") !== false) {
            if ($modifyCSS && $css_group = getAnnotation("css", $first_line)) {
                $cssFileGroups[$css_group][] = $path;
            }
        } else if (strpos($path, ".js") !== false) {
            if ($modifyJS && $js_group = getAnnotation("js", $first_line)) {
                $jsFileGroups[$js_group][] = $path;
            }
        }
    }
);

if ($modifyCSS) {
    foreach ($cssFileGroups as $cssGroup => $files) {
        $scss = new Compiler();

        $css_full = "";
        foreach ($files as $file) {
            $css_full .= " " . file_get_contents($file);
        }
        $minifier = new Minify\CSS($scss->compile($css_full));
        $minifier->minify(BUILDS_PATH . "$cssGroup.css");
    }
}
if ($modifyJS) {
    foreach ($jsFileGroups as $jsGroup => $files) {
        $minifier = new Minify\JS(...$files);
        $minifier->minify(BUILDS_PATH . "$jsGroup.js");
    }
}


$out = "<?php return [\n";
foreach ($cssFileGroups as $group => $file_path) {
    $out .= " '$group' => [\n  '" . implode("',\n  '", $file_path) . "'\n ],\n";
}
$out .= "];";

saveFile(BUILDS_PATH . "css_schema.php", $out);

$out = "<?php return [\n";
foreach ($jsFileGroups as $group => $file_path) {
    $out .= " '$group' => [\n  '" . implode("',\n  '", $file_path) . "'\n ],\n";
}
$out .= "];";

saveFile(BUILDS_PATH . "js_schema.php", $out);
