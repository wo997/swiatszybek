<?php //route[minify]

use MatthiasMullie\Minify;

$minifierCSS = new Minify\CSS();
$minifierJS = new Minify\JS();

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
        "exclude_paths" => ["vendor", "uploads"],
    ],
    function ($path, $first_line) {
        global $minifierCSS, $minifierJS;

        if (strpos($path, ".css")) {
            if ($css = getAnnotation("css", $first_line)) {
                $minifierCSS->add($path);
            }
        } else if (strpos($path, ".js")) {
            if ($js = getAnnotation("js", $first_line)) {
                $minifierJS->add($path);
            }
        }
    }
);

//$minifier = new Minify\CSS($sourcePath);

//$sourcePath2 = '/path/to/second/source/css/file.css';


// or we can just add plain CSS
//$css = 'body { color: #000000; }';
//$minifier->add($css);

// save minified file to disk



$minifierCSS->minify(BUILDS_PATH . 'global.css');
$minifierJS->minify(BUILDS_PATH . 'global.js');
