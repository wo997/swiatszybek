<?php //route[{ADMIN}/carrier/save_many]

try {
    DB::beginTransaction();
    foreach (json_decode($_POST["carriers"], true) as $carrier) {
        EntityManager::getEntity("carrier", $carrier);
    }
    EntityManager::saveAll();
    DB::commitTransaction();

    if (isset($_POST["config"])) {
        saveSetting("general", "deliveries", [
            "path" => [],
            "value" => json_decode($_POST["config"], true)
        ], false);
    }

    Request::jsonResponse(["success" => true]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
