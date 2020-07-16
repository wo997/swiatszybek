<?php //->[admin/save_variant]

if (isset($_POST["remove"])) {
    query("DELETE FROM variant WHERE variant_id = ?",[
        $_POST["variant_id"]
    ]);
}
else {
    $variant_id = isset($_POST["variant_id"]) ? $_POST["variant_id"] : "-1";
    if ($variant_id == "-1") {
        query("INSERT INTO variant () VALUES ()");
        $variant_id = getLastInsertedId();
    }

    query("UPDATE variant SET name = ?, product_code = ?, zdjecie = ?, color = ?, published = ?, price = ?, rabat = ?, product_id = ? WHERE variant_id = ".intval($variant_id),[
        $_POST["name"],$_POST["product_code"],$_POST["zdjecie"],$_POST["color"],$_POST["published"],$_POST["price"],$_POST["rabat"],$_POST["product_id"]
    ]);

    $input = ["variant_id" => intval($variant_id), "quantity_difference" => intval($_POST["quantity"]) - intval($_POST["was_quantity"])];
    include "events/variant_quantity_change.php";

    $input = ["product_id" => intval($_POST["product_id"])];
    include "events/variant_price_change.php";
}

die;
