<?php //route[{ADMIN}/general_product/save]

try {
    DB::beginTransaction();
    $general_product = EntityManager::getEntity("general_product", json_decode($_POST["general_product"], true));
    $general_product_id = $general_product->getId();
    foreach (json_decode(def($_POST, "product_feature_options", "[]"), true) as $product_feature_option_data) {
        $product_feature_option = EntityManager::getEntityById("product_feature_option", $product_feature_option_data["product_feature_option_id"]);
        if (!$product_feature_option) {
            return;
        }
        $product_feature = $product_feature_option->getParent("product_feature");
        if (!$product_feature) {
            return;
        }
        if (!endsWith($product_feature->getProp("data_type"), "_value")) {
            return;
        }
        $product_feature_option_data["just_general_product_id"] = $general_product_id; // it's not really necessary, but leave it here
        $product_feature_option->setProps($product_feature_option_data);
    }
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["general_product_id" => $general_product_id]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
