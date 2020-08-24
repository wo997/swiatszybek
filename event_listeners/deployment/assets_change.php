<?php //event[assets_change]
// input [js: boolean, css: boolean] or empty for both

global $cssFileGroups, $jsFileGroups, $modifyCSS, $modifyJS; // event it already a function

$modifyJS = nonull($input, "js", true);
$modifyCSS = nonull($input, "css", true);

if (!$modifyJS && !$modifyCSS) {
    return;
}

use MatthiasMullie\Minify;

$cssFileGroups = [];
$jsFileGroups = [];

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
    function ($path, $first_line) {
        global $cssFileGroups, $jsFileGroups, $modifyCSS, $modifyJS;

        if (strpos($path, ".css") !== false) {
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

foreach ($jsFileGroups as $jsGroup => $files) {
    (new Minify\JS(...$files))->minify("builds/$jsGroup.js");
}
foreach ($cssFileGroups as $cssGroup => $files) {
    (new Minify\CSS(...$files))->minify("builds/$cssGroup.css");
}


//$minifier = new Minify\CSS($sourcePath);

//$sourcePath2 = '/path/to/second/source/css/file.css';


// or we can just add plain CSS
//$css = 'body { color: #000000; }';
//$minifier->add($css);

// save minified file to disk

//sendEmail("wojtekwo997@gmail.com", json_encode([$modifyJS, $modifyCSS]), "");
