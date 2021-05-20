<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "video",
    "render" => function ($params) {
        $video_src = def($params, ["v_node", "settings", "video_src"]);
        if ($video_src) {
            //return "<img class=\"wo997_img\" data-src=\"$video_src\" />";
        }
        return "";
    },
]);
