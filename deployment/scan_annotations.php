<?php

global $_link_route_path, $_link_event_paths;

$_link_route_path = [];
$_link_event_paths = [];

echo "<br><h3>Scanning annotations:</h3>";

scanDirectories(
    [
        "get_first_line" => true,
        "exclude_paths" => ["vendor", "uploads"],
    ],
    function ($path, $first_line) {
        global $_link_route_path, $_link_event_paths;

        if (!strpos($path, ".php")) {
            return;
        }

        if ($url = getAnnotationPHP("route", $first_line)) {
            if (isset($_link_route_path[$url])) {
                echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $_link_route_path[$url] . "</b> and <b>" . $path . "</b><br>";
            }
            $_link_route_path[$url] = $path;
        } else if ($event = getAnnotationPHP("event", $first_line)) {
            $_link_event_paths[$event][] = "  '$path'";
        }
    }
);

echo "<h3>✅ Scanning annotations completed</h3>";

$out = "<?php return [\n";
foreach ($_link_route_path as $url => $path) {
    $out .= "'$url' => '$path',\n";
}
$out .= "];";

file_put_contents(BUILDS_PATH . "link_route_path.php", $out);

$out = "<?php return [\n";
foreach ($_link_event_paths as $event => $paths_strings) {
    $out .= " '$event' => [\n" . implode(",\n", $paths_strings) . "\n ],\n";
}
$out .= "];";

file_put_contents(BUILDS_PATH . "link_event_paths.php", $out);
