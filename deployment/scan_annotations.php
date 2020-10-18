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
            if (preg_match("/\{.*\}/", $url, $matches)) {
                $static_url_width_curly_braces = $matches[0];
                $static_url = substr($static_url_width_curly_braces, 1, -1);
                //var_dump($static_url);
                //die;
                if (isset(STATIC_URLS[$static_url])) {
                    $url = str_replace($static_url_width_curly_braces, ltrim(STATIC_URLS[$static_url], "/"), $url);
                }
            }

            if (isset($_link_route_path[$url])) {
                /*// remove old route if existed on server, might cause data loss, pls dont do that
                if (filemtime($_link_route_path[$url]) < filemtime($path)) {
                    unlink($_link_route_path[$url]);
                    $_link_route_path[$url] = $path;
                } else {
                    unlink($path);
                }*/
                echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $_link_route_path[$url] . "</b> and <b>" . $path . "</b><br>";

                // TODO: developer tab with these errors?
            } else {
                $_link_route_path[$url] = $path;
            }
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

saveFile(BUILDS_PATH . "link_route_path.php", $out);

$out = "<?php return [\n";
foreach ($_link_event_paths as $event => $paths_strings) {
    $out .= " '$event' => [\n" . implode(",\n", $paths_strings) . "\n ],\n";
}
$out .= "];";

saveFile(BUILDS_PATH . "link_event_paths.php", $out);
