<?php //route[{ADMIN}/general_product/save]

try {
    DB::beginTransaction();

    $general_product_data = json_decode($_POST["general_product"], true);

    $general_product_id = $general_product_data[EntityManager::getEntityIdColumn("general_product")];
    $page_id = DB::fetchVal("SELECT page_id FROM page WHERE link_what_id=$general_product_id AND page_type='general_product'");
    $page = $page_id ? EntityManager::getEntityById("page", $page_id) : null;
    if ($page) {
        updatePageableModificationTime("page", $page->getId());
    }

    $general_product = EntityManager::getEntity("general_product", $general_product_data);

    foreach (json_decode(def($_POST, "product_feature_options", "[]"), true) as $product_feature_option_data) {
        $product_feature_option = EntityManager::getEntityById("product_feature_option", $product_feature_option_data["product_feature_option_id"]);
        if (!$product_feature_option) {
            continue;
        }
        $product_feature = $product_feature_option->getParent("product_feature");
        if (!$product_feature) {
            continue;
        }
        if (!endsWith($product_feature->getProp("data_type"), "_value")) {
            continue;
        }
        $product_feature_option_data["just_general_product_id"] = $general_product_id; // it's not really necessary, but leave it here
        $product_feature_option->setProps($product_feature_option_data);
    }
    if (!$page) {
        $general_product->setProp("active", 0);
    }

    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["general_product_id" => $general_product_id]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
