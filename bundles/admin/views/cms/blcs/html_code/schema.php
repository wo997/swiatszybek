<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "html_code",
    "render" => function ($params) {
        return def($params, ["v_node", "settings", "html_code"]);
    },
]);
