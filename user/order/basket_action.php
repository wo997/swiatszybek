<?php //route[basket_action]

$basket = json_decode($_SESSION["basket"], true);

$basket_variant_limit = 100;

if (isset($_POST["quantity_diff"]) && isset($_POST["variant_id"])) {
    $quantity_diff = intval($_POST["quantity_diff"]);
    $variant_id = $_POST["variant_id"];

    $variant_found = false;
    foreach ($basket as $basket_item_id => $basket_item) {
        if ($basket[$basket_item_id]["variant_id"] == $variant_id) {
            $variant_found = true;
            $basket[$basket_item_id]["quantity"] = min($basket[$basket_item_id]["quantity"] + $quantity_diff, $basket_variant_limit);
            if ($basket[$basket_item_id]["quantity"] < 1) {
                unset($basket[$basket_item_id]);
            }
            break;
        }
    }

    if (!$variant_found && $quantity_diff > 0) {
        $basket[] = [
            "variant_id" => $variant_id,
            "quantity" => $quantity_diff
        ];
    }

    setBasketData($basket);
    validateStock();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    json_response(getBasketDataAll());
}
