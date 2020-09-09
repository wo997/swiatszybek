<?php //event[assets_change]
// input [js: boolean, css: boolean] or empty for both

global $cssFileGroups, $jsFileGroups, $modifyCSS, $modifyJS, $module_forms, $modules; // event is already a function

$modifyCSS = nonull($input, "css", true);
$modifyJS = nonull($input, "js", true);

if (!$modifyJS && !$modifyCSS) {
    return;
}

use MatthiasMullie\Minify;

$cssFileGroups = [];
$jsFileGroups = [];

$module_forms = [];
$modules = [];

function getAnnotation($type, $line)
{
    if (preg_match("/(?<=$type\[).*(?=\])/", $line, $match)) {
        return $match[0];
    }
    return null;
}

scanDirectories(
    [
        "get_first_line" => true,
        "exclude_paths" => ["vendor", "uploads", "builds"],
    ],
    function ($path, $first_line, $parent_dir) {
        global $cssFileGroups, $jsFileGroups, $modifyCSS, $modifyJS, $module_forms, $modules;

        if (strpos($path, ".css") !== false) {
            if ($modifyCSS && $css_group = getAnnotation("css", $first_line)) {
                $cssFileGroups[$css_group][] = $path;
            }
        } else if (strpos($path, ".js") !== false) {
            if ($modifyJS && $js_group = getAnnotation("js", $first_line)) {
                if ($js_group == "modules") {
                    $form_file = $parent_dir . "form.html";
                    if (file_exists($form_file)) {
                        $module_name = pathinfo($parent_dir)["filename"];
                        $module_forms[$module_name] = file_get_contents($form_file);
                        $modules[$module_name] = file_get_contents($path);
                    }
                } else {
                    $jsFileGroups[$js_group][] = $path;
                }
            }
        }
    }
);

foreach ($cssFileGroups as $cssGroup => $files) {
    (new Minify\CSS(...$files))->minify("builds/$cssGroup.css");
}
foreach ($jsFileGroups as $jsGroup => $files) {
    $minifier = new Minify\JS(...$files);
    $minifier->minify("builds/$jsGroup.js");
}


$jsGroup = "modules";

$modules_js = "";

foreach ($modules as $module_name => $module_js) {
    $case_form = "modules['MODULE_NAME'].form_html = `" . $module_forms[$module_name] . "`;";

    $module_js = "
        window.addEventListener(\"DOMContentLoaded\", () => {
            var module_form = $(`#module_$module_name`);
            " . $module_js . "
            $case_form
        });";

    $module_js = str_replace("MODULE_NAME", $module_name, $module_js);
    $module_js = str_replace("MODULE", "modules.$module_name", $module_js);

    $modules_js .= $module_js;
}

$minifier = new Minify\JS($modules_js);

$minifier->minify("builds/$jsGroup.js");





$out = "<?php return [\n";
foreach ($cssFileGroups as $group => $file_path) {
    $out .= " '$group' => [\n  '" . implode("',\n  '", $file_path) . "'\n ],\n";
}
$out .= "];";

file_put_contents(BUILDS_PATH . "css_schema.php", $out);

$out = "<?php return [\n";
foreach ($jsFileGroups as $group => $file_path) {
    $out .= " '$group' => [\n  '" . implode("',\n  '", $file_path) . "'\n ],\n";
}
$out .= "];";

file_put_contents(BUILDS_PATH . "js_schema.php", $out);


//$minifier = new Minify\CSS($sourcePath);

//$sourcePath2 = '/path/to/second/source/css/file.css';


// or we can just add plain CSS
//$css = 'body { color: #000000; }';
//$minifier->add($css);

// save minified file to disk

//sendEmail("wojtekwo997@gmail.com", json_encode([$modifyJS, $modifyCSS]), "");
