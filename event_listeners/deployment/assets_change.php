<?php //event[assets_change]
// args [js: boolean, css: boolean] or empty for both

global $css_file_groups, $js_file_groups, $modifyCSS, $modifyJS; // event is already a function

$modifyCSS = def($args, "css", true);
$modifyJS = def($args, "js", true);

if (!$modifyJS && !$modifyCSS) {
    return;
}

use MatthiasMullie\Minify;
//use ScssPhp\ScssPhp\Compiler;
//use Patchwork\JSqueeze;

//$jz = new JSqueeze();

$css_file_groups = [];
$css_dependencies = [];
$js_file_groups = [];
$js_dependencies = [];

function appendGroup(&$file_groups, $group, $path, $parent_dir)
{
    if ($group === "view") {
        $view_path = $parent_dir . "view.php";
        if (file_exists($view_path)) {
            $first_line = def(file($view_path), 0, "");
            if ($url = getAnnotationRoute($first_line)) {
                $group = "views/" . $url;
            }
        }
    }
    $file_groups[$group][] = $path;
}

scanDirectories(
    [
        "get_first_line" => true,
        "exclude_paths" => ["vendor", "uploads", "builds"],
    ],
    function ($path, $first_line, $parent_dir) {
        global $css_file_groups, $js_file_groups, $modifyCSS, $modifyJS;

        if (strpos($path, ".css") !== false || strpos($path, ".scss") !== false) {
            if ($modifyCSS && $css_group = getAnnotation("css", $first_line)) {
                appendGroup($css_file_groups, $css_group, $path, $parent_dir);
            }
        } else if (strpos($path, ".js") !== false) {
            if ($modifyJS && $js_group = getAnnotation("js", $first_line)) {
                appendGroup($js_file_groups, $js_group, $path, $parent_dir);
            }
        }
    }
);

if ($modifyCSS) {
    foreach ($css_file_groups as $cssGroup => $files) {
        $scss = new Compiler();

        $css_full = "";
        foreach ($files as $file) {
            $css_full .= " " . file_get_contents($file);
        }
        $minifier = new Minify\CSS($scss->compile($css_full));
        saveFile(BUILDS_PATH . "$cssGroup.css", $minifier->minify());
    }
}
if ($modifyJS) {
    foreach ($js_file_groups as $jsGroup => $files) {
        //@include(admin/tools/newCms/template.html)

        $js_full = "";
        foreach ($files as $file) {
            $js_content = file_get_contents($file);
            $js_content_arr = explode(PHP_EOL, $js_content);

            $exclude_start_line = null;

            foreach ($js_content_arr as $line_id => $js_content_line) {
                if (preg_match("/\/\/.*exclude start/", $js_content_line, $matches, PREG_OFFSET_CAPTURE)) {
                    $exclude_start_line = $line_id;
                } else if ($exclude_start_line !== null) {
                    if (preg_match("/\/\/.*exclude end/", $js_content_line, $matches, PREG_OFFSET_CAPTURE)) {
                        for ($i = $exclude_start_line; $i <= $line_id; $i++) {
                            unset($js_content_arr[$i]);
                        }
                        $exclude_start_line = null;
                    }
                }
            }

            $js_content = implode(PHP_EOL, $js_content_arr);

            if (preg_match("/(?<=\@include\()[^\)]*(?=\))/", $js_content, $matches)) {
                foreach ($matches as $file_to_include) {
                    $js_dependencies[] = $file_to_include;
                    if (file_exists($file_to_include)) {
                        $js_content = str_replace("@include($file_to_include)", file_get_contents($file_to_include), $js_content);
                    }
                }
            }

            $js_full .= $js_content;
        }

        //$minifiedJs = \JShrink\Minifier::minify($js_full);

        //$myPacker = new GK\JavascriptPacker($js_full, 'None');
        //$minifiedJs = $js_full; //$myPacker->pack();

        // $minifiedJs = $jz->squeeze(
        //     $js_full,
        //     true,   // $singleLine
        //     true,   // $keepImportantComments
        //     false   // $specialVarRx
        // );

        //saveFile(BUILDS_PATH . "$jsGroup.js", $minifiedJs);
        //$minifier = new Minify\JS($js_full);
        saveFile(BUILDS_PATH . "$jsGroup.js", $minifier->minify());
    }
}


if ($modifyCSS) {
    $out = "<?php return [\n";
    $out .= "\"files_groups\" => [\n";
    foreach ($css_file_groups as $group => $file_path) {
        $out .= " \"$group\" => [\n  \"" . implode("\",\n  \"", $file_path) . "\"\n ],\n";
    }
    $out .= "],\n";

    if ($css_dependencies) {
        $out .= "\"dependencies\" => [\n \"";
        $out .= implode("\",\n \"", $css_dependencies);
        $out .= "\"\n]\n";
    }
    $out .= "];";

    saveFile(BUILDS_PATH . "css_schema.php", $out);
}

if ($modifyJS) {
    $out = "<?php return [\n";
    $out .= "\"files_groups\" => [\n";
    foreach ($js_file_groups as $group => $file_path) {
        $out .= " \"$group\" => [\n  \"" . implode("\",\n  \"", $file_path) . "\"\n ],\n";
    }
    $out .= "],\n";

    if ($js_dependencies) {
        $out .= "\"dependencies\" => [\n \"";
        $out .= implode("\",\n \"", $js_dependencies);
        $out .= "\"\n]\n";
    }
    $out .= "];";

    saveFile(BUILDS_PATH . "js_schema.php", $out);
}
