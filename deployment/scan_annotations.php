<?php

global $_link_route_path, $_link_event_paths, $_link_hooks_paths;

$_link_route_path = [];
$_link_event_paths = [];
$_link_hooks_paths = [];

echo "<br><h3>Scanning annotations:</h3>";

Files::scanDirectories(
    [
        "exclude_paths" => ["vendor", "uploads", "builds"],
    ],
    function ($path, $first_line) {
        global $_link_route_path, $_link_event_paths, $_link_hooks_paths;

        if (!strpos($path, ".php")) {
            return;
        }

        if ($url = Files::getAnnotationRoute($first_line)) {
            if (isset($_link_route_path[$url])) {
                echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $_link_route_path[$url] . "</b> and <b>" . $path . "</b><br>";
                // TODO: developer tab with these errors?
            } else {
                $_link_route_path[$url] = $path;
            }
        } else if ($event = Files::getAnnotationPHP("event", $first_line)) {
            $_link_event_paths[$event][] = "  '$path'";
        } else if ($hook = Files::getAnnotationPHP("hook", $first_line)) {
            $_link_hooks_paths[$hook][] = "include_once \"$path\";";
        }
    }
);

echo "<h3>✅ Scanning annotations completed</h3>";


$out = "<?php return [\n";
foreach ($_link_route_path as $url => $path) {
    $out .= "'$url' => '$path',\n";
}
$out .= "];";

Files::save(BUILDS_PATH . "link_route_path.php", $out);

$out = "<?php return [\n";
foreach ($_link_event_paths as $event => $paths_strings) {
    $out .= " '$event' => [\n" . implode(",\n", $paths_strings) . "\n ],\n";
}
$out .= "];";

Files::save(BUILDS_PATH . "link_event_paths.php", $out);

foreach ($_link_hooks_paths as $name => $paths_strings) {
    $out = "<?php\n";
    $out .= implode("\n", $paths_strings);
    Files::save(BUILDS_PATH . "hooks/" . "$name.php", $out);
}

// that's nasty, will work as u build it
//@include BUILDS_PATH . "include_hooks.php";
