<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "img",
    "render" => function ($params) {
        $img_src = def($params, ["v_node", "settings", "img_src"]);
        if ($img_src) {
            return "<img class=\"wo997_img\" data-src=\"$img_src\" />";
        }
        return "";
    },
]);
