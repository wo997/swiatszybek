<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "active_carriers",
    "render" => function ($params) {
        $active_carriers_theme = def($params, ["v_node", "settings", "active_carriers_theme"], "light");
        $active_carriers_api_keys = DB::fetchCol("SELECT DISTINCT(api_key) FROM carrier WHERE active AND api_key <> '' ORDER BY pos");

        ob_start();

        foreach ($active_carriers_api_keys as $key) {
            foreach (EventListener::dispatch("get_carrier_img_set", ["api_key" => $key]) as $img_set) {
                if ($img_set) {
?>
                <img class="wo997_img block" data-src="/<?= $img_set[$active_carriers_theme] ?>" style="max-width: <?= round($img_set["scale"] * 100) ?>px;">
<?php
                }
            }
        }

        return ob_get_clean();
    },
    "css_path" => BUILDS_PATH . "modules/active_carriers.css",
]);
