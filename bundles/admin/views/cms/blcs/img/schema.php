<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "img",
    "render" => function ($params) {
        $img_src = def($params, ["v_node", "settings", "img_src"]);
        $img_alt = def($params, ["v_node", "settings", "img_alt"]);
        $img_ext = def($params, ["v_node", "settings", "img_ext"]);
        if ($img_alt) {
            $img_alt = "alt=\"$img_alt\"";
        }
        if ($img_ext) {
            $img_ext = "data-same-ext";
        }
        if ($img_src) {
            return "<img class=\"wo997_img\" data-src=\"$img_src\" $img_alt $img_ext/>";
        }
        return "";
    },
]);
