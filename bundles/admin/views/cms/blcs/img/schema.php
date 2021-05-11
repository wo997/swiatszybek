<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "google_map",
    "render" => function ($params) {
        $google_map_embed_code = def($params, ["v_node", "settings", "google_map_embed_code"]);
        if ($google_map_embed_code && preg_match('/src=".*?"/', $google_map_embed_code, $matches)) {
            $src = $matches[0];
            return "<iframe $src allowfullscreen=\"\" loading=\"lazy\"></iframe>";
        }
        return "";
    },
]);
