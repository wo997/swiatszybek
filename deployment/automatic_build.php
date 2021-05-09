<?php

// TODO: remember about dependencies

if (isset($_GET["no_build"])) {
    return;
}

$new_build_info = [
    "scopes" => [], // anything with versions
    "routes" => [],
    "hooks" => []
];

Files::scanDirectories(
    [
        "include_paths" => ["bundles", "entities", "helpers", "prebuilds", "settings"],
    ],
    function ($path, $first_line, $parent_dir) use (&$new_build_info) {
        $mod_time = filemtime($path);
        $ext = Files::getFileExtension($path);

        $add_scope = function ($scope) use (&$new_build_info, &$mod_time, &$path) {
            $scope_name = str_replace("!", "", $scope); // load important things first, eeeezy

            //echo $scope_name;
            if (!in_array($scope_name, array_keys($new_build_info["scopes"]))) {
                $new_build_info["scopes"][$scope_name] = [
                    "mod_time" => 0,
                    "paths" => []
                ];
            }
            $new_build_info["scopes"][$scope_name]["mod_time"] += $mod_time;

            if (strpos($scope, "!") !== false) {
                array_unshift($new_build_info["scopes"][$scope_name]["paths"], $path);
            } else {
                $new_build_info["scopes"][$scope_name]["paths"][] = $path;
            }
        };

        if (in_array($ext, ["php"])) {
            $add_scope("php");

            if ($url = Files::getAnnotationRoute($first_line)) {
                if (isset($new_build_info["routes"][$url])) {
                    echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $new_build_info["routes"][$url] . "</b> and <b>" . $path . "</b><br>";
                    // TODO: developer tab with these errors?
                } else {
                    $new_build_info["routes"][$url] = $path;
                    $add_scope("routes");
                }
            } else if ($hook = Files::getAnnotationPHP("hook", $first_line)) {
                $new_build_info["hooks"][$hook][] = $path;
                $add_scope($hook);
            }

            return;
        }
        if (in_array($ext, ["css", "scss"])) {
            $add_scope("css");

            $scope = Files::getAnnotation("css", $first_line, $parent_dir);
            if ($scope) {
                $add_scope($scope);
            }

            return;
        }
        if (in_array($ext, ["js"])) {
            $add_scope("js");

            $scope = Files::getAnnotation("js", $first_line, $parent_dir);
            if ($scope) {
                $add_scope($scope);
            }

            return;
        }
        if (strpos($path, "settings/") === 0) {
            $add_scope("settings");
        }
    }
);

if ($build_info != $new_build_info || true || true || true || true) {
    foreach ($new_build_info["scopes"] as $name => $scope) {
        $version = def($build_info, ["scopes", $name, "version"], 0);
        $change = $scope["mod_time"] != def($build_info, ["scopes", $name, "mod_time"], 0);

        if ($change) {
            $version++;

            if ($name === "migration") {
                foreach (def($build_info, ["hooks", "migration"], []) as $path) {
                    @include $path;
                }
            }

            if (!in_array($name, ["php", "css", "js", "settings", "routes"])) {
                $css_full = "";
                $js_full = "";
                foreach (def($scope, ["paths"], []) as $path) {
                    $ext = Files::getFileExtension($path);

                    if (in_array($ext, ["css", "scss"])) {
                        $css_full .= file_get_contents($path);
                    }
                    if (in_array($ext, ["js"])) {
                        $js_full .= file_get_contents($path);
                    }
                }
                if ($css_full) {
                    Files::save(BUILDS_PATH . "$name.css", Assets::minifyCss($css_full));
                }
                if ($js_full) {
                    Files::save(BUILDS_PATH . "$name.js", Assets::minifyJs($js_full));
                }
            }
        }

        $new_build_info["scopes"][$name]["version"] = $version;
    }

    Files::save(BUILD_INFO_PATH, json_encode($new_build_info));
    $build_info = $new_build_info;
}
