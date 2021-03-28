<?php

require_once __DIR__ . "/przelewy24_service.php";

$p24_settings = getSetting(["modules", "przelewy24"]);

if ($p24_settings) {
    $app["przelewy24"] = new Przelewy24($p24_settings["merchant_id"], $p24_settings["pos_id"], $p24_settings["crc"], $p24_settings["test_mode"]);
}
