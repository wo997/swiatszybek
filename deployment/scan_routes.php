<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";
$scanned_routes_array = [];

function processDir($parent_dir)
{
    global $scanned_routes_string, $base_path, $scanned_routes_array;
    $exclude = ["vendor", "uploads"];
    foreach (scandir($base_path . $parent_dir) as $file) {
        $path = $parent_dir . $file;
        if (substr($file, 0, 1) == "." || in_array($file, $exclude)) {
            continue;
        }
        if (is_dir($path)) {
            processDir($path . "/");
            continue;
        } else if (strpos($file, ".php") != strlen($file) - 4) {
            continue;
        }
        $first_line = nonull(file($path), 0, "");

        if (!preg_match("/<\?php \/\/->\[.*\]/", $first_line, $match)) continue;

        $url = substr($match[0], 11, -1);

        if (isset($scanned_routes_array[$url])) {
            echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $scanned_routes_array[$url] . "</b> and <b>" . $path . "</b><br>";
        }
        $scanned_routes_array[$url] = $path;
    }
}

echo "<br><h3>Scanning routes:</h3>";

processDir("");

echo "<h3>✅ Scanning routes completed</h3>";


$scanned_routes_string = "";
foreach ($scanned_routes_array as $url => $path) {
    $scanned_routes_string .= "'$url' => '$path',\n";
}

$out = "<?php return [\n";
$out .= $scanned_routes_string;
$out .= "];";

file_put_contents("scanned_routes.php", $out);
