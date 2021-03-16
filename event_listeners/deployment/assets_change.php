<?php //event[assets_change]
// args [js: boolean, css: boolean] or empty for both

global $css_file_groups, $js_file_groups, $modifyCSS, $modifyJS; // event is already a function

$modifyCSS = def($args, "css", true);
$modifyJS = def($args, "js", true);

if (!$modifyJS && !$modifyCSS) {
    return;
}

use MatthiasMullie\Minify;
use ScssPhp\ScssPhp\Compiler;
//use Patchwork\JSqueeze;

//$jz = new JSqueeze();

$css_file_groups = [];
$css_dependencies = [];
$js_file_groups = [];
$js_dependencies = [];

function appendGroup(&$file_groups, $group, $path, $parent_dir)
{
    $important = strpos($group, "!") !== false;
    $group = str_replace("!", "", $group);

    if ($group === "view") {
        $view_path = $parent_dir . "view.php";
        if (file_exists($view_path)) {
            $first_line = def(file($view_path), 0, "");
            if ($url = getAnnotationRoute($first_line)) {
                $group = "views" . $url;
            }
        }
    }
    if ($important) {
        array_unshift($file_groups[$group], $path);
    } else {
        $file_groups[$group][] = $path;
    }
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

        // that's sad
        preg_match_all("/grid-area:.*?[};]/", $css_full, $matches);
        if ($matches) {
            foreach ($matches as $match) {
                $new = str_replace([':', ';'], [':"', '";'], $match);
                $css_full = str_replace($match, $new, $css_full);
            }
        }

        $css_full = $scss->compile($css_full);
        $css_full = (new Minify\CSS($css_full))->minify();

        preg_match_all("/grid-area:.*?[};]/", $css_full, $matches);
        if ($matches) {
            foreach ($matches as $match) {
                $new = str_replace('"', '', $match);
                $css_full = str_replace($match, $new, $css_full);
            }
        }

        Files::save(BUILDS_PATH . "$cssGroup.css", $css_full);
    }
}
if ($modifyJS) {
    foreach ($js_file_groups as $jsGroup => $files) {
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

            //@include(admin/tools/newCms/template.html)
            if (preg_match_all("/(?<=\@include\()[^\)]*(?=\))/", $js_content, $matches)) {
                foreach ($matches[0] as $file_to_include) {
                    $js_dependencies[] = $file_to_include;
                    if (file_exists($file_to_include)) {
                        $js_content = str_replace("@include($file_to_include)", file_get_contents($file_to_include), $js_content);
                    }
                }
            }

            $js_full .= $js_content;
        }

        // minify first, then you are safe to say that all variables are in a single line, ok, strings are not ;) but .* does the trick
        $js_full = (new Minify\JS($js_full))->minify();

        // fake lit-html lol
        $js_full = str_replace('html`', '`', $js_full);

        // allows reactive data 
        $js_full = str_replace('{${', '{{', $js_full);

        // reactive classes
        if (preg_match_all('/\{\$\{.*?\}\?.*?\}/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                $rep = strReplaceFirst('$', '', $match);
                $rep = htmlspecialchars($rep);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // reactive attributes - just escaping
        if (preg_match_all('/(?<=["\'])\{\{.*?\}\}(?=["\'])/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                if (strpos($match, "&quot;") !== false) {
                    continue;
                }
                $rep = htmlspecialchars($match);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // binding
        if (preg_match_all('/data-bind="\{\{.*?data\..*?\}\}"/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                $rep = $match;
                $rep = preg_replace("/(?<=[\s{])data\./s", "", $rep);
                $rep = preg_replace("/\s/", "", $rep);
                $rep = str_replace(["{{", "}}"], "", $rep);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // nodes
        if (preg_match_all('/data-node="\{\{.*?comp\._nodes\..*?\}\}"/s', $js_full, $matches)) {
            foreach ($matches[0] as $match) {
                $rep = $match;
                $rep = preg_replace("/(?<=[\s{])comp\._nodes\./s", "", $rep);
                $rep = preg_replace("/\s/", "", $rep);
                $rep = str_replace(["{{", "}}"], "", $rep);
                $js_full = str_replace($match, $rep, $js_full);
            }
        }

        // fuck everything, even html strings etc, everything will become a single line lol, that's not clever
        // BUT!!! you can give the developer an option to mark elements that might require whitespaces, ezy
        $js_full = preg_replace('/\s{2,}/', ' ', $js_full);

        //var_dump(BUILDS_PATH . "$jsGroup.js");
        //var_dump($js_full, "<br><br><br><br><br><br><br><br><br><br><br>");
        Files::save(BUILDS_PATH . "$jsGroup.js", $js_full);
    }
    //die; // if u wanna see the output
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

    Files::save(BUILDS_PATH . "css_schema.php", $out);
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

    Files::save(BUILDS_PATH . "js_schema.php", $out);
}
