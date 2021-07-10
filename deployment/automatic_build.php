<?php

$new_build_info = [
    "scopes" => [], // anything with versions
    "routes" => [],
    "hooks" => []
];

$app_paths = ["bundles", "entities", "helpers", "prebuilds", "settings", "xxx"];

Files::scanDirectories(
    [
        "include_paths" => $app_paths,
    ],
    function ($path, $first_line, $parent_dir) use (&$new_build_info) {
        $ext = Files::getFileExtension($path);

        $add_scope = function ($scopes_str, $path) use (&$new_build_info) {
            $mod_time = filemtime($path);

            $scopes = explode(" ", $scopes_str); // load important things first, eeeezy

            foreach ($scopes as $scope) {
                $scope_name = str_replace("!", "", $scope);

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
            }
        };

        if (in_array($ext, ["php"])) {
            $add_scope("php", $path);

            if ($url = Files::getAnnotationRoute($first_line)) {
                if (isset($new_build_info["routes"][$url])) {
                    echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $new_build_info["routes"][$url] . "</b> and <b>" . $path . "</b><br>";
                    // TODO: developer tab with these errors?
                } else {
                    $new_build_info["routes"][$url] = $path;
                    $add_scope("routes", $path);
                }
            } else if ($hook = Files::getAnnotationPHP("hook", $first_line)) {
                $new_build_info["hooks"][$hook][] = $path;
                $add_scope($hook, $path);
            }

            return;
        }
        if (in_array($ext, ["css", "scss"])) {
            $add_scope("css", $path);

            $scope = Files::getAnnotation("css", $first_line, $parent_dir);
            if ($scope) {
                $add_scope($scope, $path);
            }

            return;
        }
        if (in_array($ext, ["js"])) {
            $add_scope("js", $path);

            $scope = Files::getAnnotation("js", $first_line, $parent_dir);
            if ($scope) {
                $add_scope($scope, $path);
            }

            return;
        }
        if (strpos($path, "settings/") === 0) {
            $add_scope("settings", $path);

            return;
        }
        if (endsWith($path, "/build.json")) {
            $scope = Files::getViewScope($parent_dir);
            if ($scope) {
                $build_schema = json_decode(file_get_contents($path), true);
                foreach (def($build_schema, ["include", "js"], []) as $path) {
                    $add_scope($scope, $path);
                }
                foreach (def($build_schema, ["include", "css"], []) as $path) {
                    $add_scope($scope, $path);
                }
            }
            return;
        }
    }
);

$build_template_ids = [];
$build_page_ids = [];

if ($build_info != $new_build_info) {
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
                        $content = file_get_contents($path);
                        if ($content) {
                            $css_full .= "/*path:$path*/\n";
                            $css_full .= Minifiers::minifyCss($content);
                        }
                    }
                    if (in_array($ext, ["js"])) {
                        $content = file_get_contents($path);
                        if ($content) {
                            $js_full .= "/*path:$path*/\n";
                            $js_full .=  Minifiers::minifyJs($content);
                        }
                    }
                }
                if ($css_full) {
                    Files::save(BUILDS_PATH . "$name.css", "@charset \"UTF-8\";\n" . $css_full);
                }
                if ($js_full) {
                    Files::save(BUILDS_PATH . "$name.js", $js_full);
                }
            }

            if ($name === "settings") {
                buildSettings();
            }

            if (startsWith($name, "modules/")) {
                $module_name = substr($name, strlen("modules/"));

                foreach (DB::fetchCol("SELECT template_id FROM template WHERE FIND_IN_SET(?, used_modules_csv)", [$module_name]) as $template_id) {
                    if (!in_array($template_id, $build_template_ids)) {
                        $build_template_ids[] = $template_id;
                    }
                }
                foreach (DB::fetchCol("SELECT page_id FROM page WHERE FIND_IN_SET(?, used_modules_csv)", [$module_name]) as $page_id) {
                    if (!in_array($page_id, $build_page_ids)) {
                        $build_page_ids[] = $page_id;
                    }
                }
            }
        }

        $new_build_info["scopes"][$name]["version"] = $version;
    }

    Files::save(BUILD_INFO_PATH, json_encode($new_build_info));
    $build_info = $new_build_info;
}
