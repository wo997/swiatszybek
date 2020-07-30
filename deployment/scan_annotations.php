<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";
$link_route_path = [];
$link_module_path = [];

function getAnnotation($type, $line)
{
    if (preg_match("/<\?php \/\/$type\[.*\]/", $line, $match)) {
        return substr($match[0], strlen("<?php //" . $type . "["), -1);
    }
}

function processDir($parent_dir)
{
    global $base_path, $link_route_path, $link_module_path;
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

        if ($url = getAnnotation("route", $first_line)) {
            if (isset($link_route_path[$url])) {
                echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $link_route_path[$url] . "</b> and <b>" . $path . "</b><br>";
            }
            $link_route_path[$url] = $path;
        } else if ($module_name = getAnnotation("module", $first_line)) {

            $link_module_path[$module_name] = $path;
        }
    }
}

echo "<br><h3>Scanning annotations (routes / modules):</h3>";

processDir("");

echo "<h3>✅ Scanning annotations completed</h3>";


createDir(BUILDS_PATH);


$out = "<?php return [\n";
foreach ($link_route_path as $url => $path) {
    $out .= "'$url' => '$path',\n";
}
$out .= "];";

file_put_contents(BUILDS_PATH . "link_route_path.php", $out);


$out = "<?php return [\n";
foreach ($link_module_path as $module_name => $path) {
    $out .= "'$module_name' => '$path',\n";
}
$out .= "];";

file_put_contents(BUILDS_PATH . "link_module_path.php", $out);
