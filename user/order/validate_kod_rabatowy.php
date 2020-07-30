<?php //route[validate_kod_rabatowy]

if (!$app["user"]["id"]) die;

$kod = $_POST["code"];
$action = $_POST["action"];

if ($action == "remove")
{
    unset($_SESSION["kod"]);
    unset($_SESSION["rabat"]);
    die;
}

$kod_data = fetchRow("SELECT kwota, user_id_list, product_list_metadata, ilosc, date_from, date_to, type FROM kody_rabatowe WHERE kod = ? ORDER BY kod_id DESC LIMIT 1",[$kod]);

if ($kod_data)
{
    $now = strtotime(date("Y-m-d"));
    if ($kod_data["date_from"] && $now < strtotime($kod_data["date_from"]))
    {
        die('{"error":"Kod dostępny od '.$kod_data["date_from"].'"}');
    }
    if ($kod_data["date_to"] && $now > strtotime($kod_data["date_to"]))
    {
        die('{"error":"Kod dostępny do '.$kod_data["date_to"].'"}');
    }
    if ($kod_data["ilosc"] < 1)
    {
        die('{"error":"Kod wyczerpany!"}');
    }
    if (strlen($kod_data["user_id_list"]) > 2 && strpos($kod_data["user_id_list"], ",".$app["user"]["id"].",") === false)
    {
        die('{"error":"Kod niedostępny dla tego użytkownika!"}');
    }
    if ($kod_data["kwota"] < 1)
    {
        die('{"error":"Błąd aktywacji kodu!"}');
    }

    // products start
    $error = "";
    foreach (json_decode($kod_data["product_list_metadata"], true) as $required_product_id => $required_product) {
        $basket_variant_quantity = 0;
        foreach($app["user"]["basket"]["variants"] as $variant) {
            if ($required_product_id == $variant['product_id']) {
                $basket_variant_quantity += $variant["quantity"];
            }
        }

        $required_quantity = isset($required_product["qty"]) ? $required_product["qty"] : 1;

        if ($basket_variant_quantity < $required_quantity)
        {
            $i_product = fetchRow("SELECT title, link FROM products WHERE product_id = ".intval($required_product_id));
            $product_link = "<a href='".getProductLink($required_product_id,$i_product["link"])."'>".$i_product["title"]."</a>";
            if ($required_quantity == 1) {
                $error .= "<br>- $product_link";
            }
            else {
                $missing = $required_quantity - $basket_variant_quantity;
                $error .= "<br>- <b>$missing szt.</b> $product_link";
            }
        }
    }
    if ($error) {
        unset($_SESSION["kod"]);
        unset($_SESSION["rabat"]);
        die('{"error":"Do aktywacji kodu brakuje:'.$error.'"}');
    }
    // products end

    $_SESSION["kod"] = $kod;
    $_SESSION["rabat"] = $kod_data["kwota"];
    $_SESSION["rabat_type"] = $kod_data["type"];

    die(json_encode([
        "success" => true,
        "kwota" => $kod_data["kwota"],
        "type" => $kod_data["type"]
    ]));
}
else {
    die('{"error":"Błędny kod rabatowy!"}');
}
