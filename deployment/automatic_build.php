<?php

// TODO: remember about dependencies

if (isset($_GET["no_build"])) {
    return;
}

$new_build_info = [
    "file_types" => [
        "php" => ["mod_time" => 0],
        "js" => ["mod_time" => 0],
        "css" => ["mod_time" => 0],
        "settings" => ["mod_time" => 0],
    ],
    "scopes" => [],
    "routes" => [],
    "hooks" => []
];

Files::scanDirectories(
    [
        "include_paths" => ["bundles", "entities", "helpers", "prebuilds"],
    ],
    function ($path, $first_line, $parent_dir) use (&$new_build_info) {
        $empty_scope = [
            "version" => 0,
            "mod_time" => 0
        ];

        $mod_time = filemtime($path);
        $ext = Files::getFileExtension($path);
        if (in_array($ext, ["php"])) {
            $new_build_info["file_types"]["php"]["mod_time"] += $mod_time;

            if ($url = Files::getAnnotationRoute($first_line)) {
                if (isset($new_build_info["routes"][$url])) {
                    echo "⚠️ Routes conflict: <b>$url</b> found in <b>" . $new_build_info["routes"][$url] . "</b> and <b>" . $path . "</b><br>";
                    // TODO: developer tab with these errors?
                } else {
                    $new_build_info["routes"][$url] = $path;
                }
            } else if ($hook = Files::getAnnotationPHP("hook", $first_line)) {
                $new_build_info["hooks"][$hook][] = $path;
            }

            return;
        }
        if (in_array($ext, ["css", "scss"])) {
            $new_build_info["file_types"]["css"]["mod_time"] += $mod_time;

            $scope = Files::getAnnotation("css", $first_line, $parent_dir);
            if ($scope) {
                $scope = str_replace("!", "", $scope);
                if (!in_array($scope, $new_build_info["scopes"])) {
                    $new_build_info["scopes"][$scope] = $empty_scope;
                }
                $new_build_info["scopes"][$scope]["mod_time"] += $mod_time;
            }

            return;
        }
        if (in_array($ext, ["js"])) {
            $new_build_info["file_types"]["js"]["mod_time"] += $mod_time;

            $scope = Files::getAnnotation("js", $first_line, $parent_dir);
            if ($scope) {
                $scope = str_replace("!", "", $scope);
                if (!in_array($scope, $new_build_info["scopes"])) {
                    $new_build_info["scopes"][$scope] = $empty_scope;
                }
                $new_build_info["scopes"][$scope]["mod_time"] += $mod_time;
            }

            return;
        }
    }
);


Files::scanDirectories(
    [
        "include_paths" => ["settings"],
    ],
    function ($path) use (&$new_build_info) {
        $mod_time = filemtime($path);
        $new_build_info["file_types"]["settings"]["mod_time"] += $mod_time;
    }
);

function getScopesVersions()
{
    global $build_info;

    $versions = [];
    foreach ($build_info["scopes"] as $scope_name => $data) {
        $versions[$scope_name] = $data["version"];
    }

    return $versions;
}

if ($build_info != $new_build_info || true || true || true || true) {
    foreach ($new_build_info["file_types"] as $name => $file_type) {
        $change = $file_type["mod_time"] != def($build_info, ["file_types", $name, "mod_time"], 0);

        // if ($change) {
        //     if ($name === "")
        // }
    }
    //def($build_info) = 


    Files::save(BUILD_INFO_PATH, json_encode($new_build_info));
    $build_info = $new_build_info;
}
