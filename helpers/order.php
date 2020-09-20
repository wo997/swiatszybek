<?php

$dostawy = ["paczkomat" => "Paczkomat", "kurier" => "Kurier", "osobisty" => "Odbiór osobisty"];

// statuses
$status_list = [
    [
        "id" => 0,
        "title" => "Oczekuje na opłatę",
        "color" => "dd3",
        "state" => "open",
    ],
    [
        "id" => 1,
        "title" => "W realizacji",
        "color" => "3a3",
        "state" => "open",
    ],
    [
        "id" => 2,
        "title" => "Do odbioru",
        "color" => "e90",
        "state" => "open",
    ],
    [
        "id" => 3,
        "title" => "Wysłano",
        "color" => "44d",
        "state" => "closed",
    ],
    [
        "id" => 4,
        "title" => "Odebrano",
        "color" => "39c",
        "state" => "closed",
    ],
    [
        "id" => 100,
        "title" => "Anulowano",
        "color" => "b33",
        "state" => "closed",
    ],
];

$zamowienia_status_groups = [
    [
        "name" => "open",
        "label" => '<span style="color:#3c3;font-weight:600">Otwarte <i class="fas fa-chevron-right"></i></span>',
        "ids" => flatMapArray(
            filterArrayByKey($status_list, "state", "open"),
            "id"
        ),
    ],
    [
        "name" => "closed",
        "label" => '<span style="color:#c33;font-weight:600">Zamknięte <i class="fas fa-chevron-right"></i></span>',
        "ids" => flatMapArray(
            filterArrayByKey($status_list, "state", "closed"),
            "id"
        ),
    ],
];

function setBasketData($basket_json)
{
    global $app;

    $_SESSION["basket"] = $basket_json;
    setcookie("basket", $basket_json, (time() + 31536000), '/');
    //$_COOKIE["basket"] = "[]"; // TODO reserach comparing cookies

    if ($app["user"]["id"]) {
        query("UPDATE users SET basket = ? WHERE user_id = ?", [
            $basket_json, $app["user"]["id"]
        ]);
    }
}

function validateBasket()
{
    try {
        $basket = json_decode($_SESSION["basket"], true);

        if ($basket === null) {
            throw new Exception('json parse error');
        }

        foreach ($basket as $basket_item) {
            if (
                !isset($basket_item["variant_id"])
                || !isset($basket_item["quantity"])
            ) {
                throw new Exception('missing content');
                break;
            }
        }
    } catch (Exception $e) {
        $_SESSION["basket"] = "[]";
        $_COOKIE["basket"] = "[]";
    }
}

function prepareBasketData()
{
    global $app;

    $user_basket = [];

    $basket = json_decode($_SESSION["basket"], true);

    $basket_variant_id_list = "";
    foreach ($basket as $basket_item) {
        $basket_variant_id_list .= $basket_item["variant_id"] . ",";
    }

    $where = "1";

    if ($basket_variant_id_list) {
        $where .= " AND variant_id IN (" . substr($basket_variant_id_list, 0, -1) . ")";
    }

    $unordered_basket_variants = fetchArray("SELECT variant_id, product_id, title, link, name, zdjecie, price, rabat, stock, gallery FROM products i INNER JOIN variant v USING (product_id) WHERE $where");

    $basket_variants = [];

    foreach ($basket as $basket_item) { // merge variants with quantity into basket, simple right?
        foreach ($unordered_basket_variants as $unordered_basket_variant) {
            if ($unordered_basket_variant["variant_id"] == $basket_item["variant_id"]) {
                $unordered_basket_variant["quantity"] = $basket_item["quantity"];
                $basket_variants[] = $unordered_basket_variant;
                break;
            }
        }
    }

    $totalBasketCost = 0;

    $item_count = 0;

    foreach ($basket_variants as $basket_variant_index => $basket_variant) {
        $basket_variant["real_price"] = $basket_variant["price"] - $basket_variant["rabat"];

        $total_price = 0;
        for ($i = 0; $i < $basket_variant["quantity"]; $i++) // u can add special offers here later
        {
            $item_count++;
            $total_price += $basket_variant["real_price"];
        }

        $basket_variant["total_price"] = $total_price;

        $totalBasketCost += $total_price;

        $basket_variants[$basket_variant_index] = $basket_variant;
    }

    $user_basket["variants"] = $basket_variants;
    $user_basket["total_basket_cost"] = $totalBasketCost;
    $user_basket["item_count"] = $item_count;

    $app["user"]["basket"] = $user_basket;
}

function validateStock()
{
    global $app;

    prepareBasketData();

    try {
        $fail = false;

        foreach ($app["user"]["basket"]["variants"] as $basket_variant_index => $basket_variant) {
            if ($basket_variant["quantity"] > $basket_variant["stock"]) {
                $app["user"]["basket"]["variants"][$basket_variant_index]["quantity"] = $basket_variant["stock"];
                $fail = true;
            }
            if ($basket_variant["quantity"] <= 0) {
                unset($app["user"]["basket"]["variants"][$basket_variant_index]);
            }
        }

        setBasketData(json_encode(($app["user"]["basket"]["variants"])));

        if ($fail) {
            throw new Exception("out of stock");
        }
    } catch (Exception $e) {
        // TODO: rework that script man, it's bad to redirect no matter what the request is
        if (!isset($_GET['produkt'])) { // cannot loop man
            header("Location: /zakup?produkt=brak");
            die;
        }
    }
}

// also order.js
function renderStatus($status_id)
{
    global $status_list;
    $status = getRowById($status_list, $status_id);
    return "<div class='rect' style='background:#" . $status["color"] . "'>" . $status["title"] . "</div>";
}

function getBasketDataAll()
{
    global $app;

    prepareBasketData();

    $basket = json_decode($_SESSION["basket"], true);

    $response = [];

    $response["basket"] = $basket;

    $response["basket_content_html"] = getBasketContent();

    $response["basket_table_html"] = printBasketTable();
    $response["total_basket_cost"] = $app["user"]["basket"]["total_basket_cost"];
    $response["item_count"] = $app["user"]["basket"]["item_count"];

    return $response;
}

function getBasketContent()
{
    global $app;

    $basketContent = "";

    if (!$app["user"]["basket"]["item_count"]) {
        $basketContent = "<h3 style='text-align:center;font-size:17px'>Twój koszyk jest pusty!</h3>";
    } else {
        foreach ($app["user"]["basket"]["variants"] as $basket_variant) {

            $basket_quantity = $basket_variant["quantity"];
            $basket_quantity = $basket_quantity > 1 ? " - $basket_quantity szt." : "";

            $basketContent .= "
                <div class='product-block'>
                    <a href='" . getProductLink($basket_variant["product_id"], $basket_variant["link"]) . "'>
                        <img class='product-image' data-src='" . $basket_variant["zdjecie"] . "' data-gallery='" . $basket_variant["gallery"] . "' data-height='1w'>
                        <h3 class='product-title'><span class='check-tooltip'>" . $basket_variant["title"] . " " . $basket_variant["name"] . "</span></h3>
                        <span class='product-price pln'>" . $basket_variant["total_price"] . " zł</span>
                        <span>$basket_quantity</span>
                    </a>
                </div>";
        }
    }
    return $basketContent;
}

function printBasketTable()
{
    global $app;

    $nr = 0;
    $res = "";

    foreach ($app["user"]["basket"]["variants"] as $basket_variant) {
        $v = $basket_variant;
        $quantity = $v["quantity"];
        $stock = $v["stock"];

        if ($nr == 0) {
            $res .= "
                <table class='item-list item-list-full'><tr style='background: var(--primary-clr);color: white;'>
                <td>Produkt</td>
                <td></td>
                <td>Cena</td>
                <td>Ilość</td>
                <td>Suma</td>
                </tr>
            ";
        }
        $nr++;

        $remove = "<button class='removeBtn' type='button' onclick='addItemtoBasket(" . $v["variant_id"] . ",-1)'>-</button>";
        $add = $quantity < $stock ?
            "<button class='addBtn' type='button' onclick='addItemtoBasket(" . $v["variant_id"] . ",1)'>+</button>"
            : "<button type='button' style='visibility:hidden'>+</button>";

        $res .= "<tr data-variant_id='" . $v["variant_id"] . "'>
                <td><img data-src='" . $v["zdjecie"] . "' data-height='1w' style='width:min(130px,100%);display:block;margin:auto;object-fit:contain'></td>
                <td><a class='linkable' href='" . getProductLink($v["product_id"], $v["link"]) . "'>" . $v["title"] . " " . $v["name"] . "</a></td>
                <td class='pln oneline' style='font-weight:normal'><label>Cena:</label> " . $v["real_price"] . " zł</td>
                <td class='oneline' data-stock='$stock'>$remove $quantity szt. $add</td>
                <td class='pln oneline'><label>Suma:</label> " . $v["total_price"] . " zł</td>
            </tr>";
    }
    if ($nr > 0) {
        $res .= "</table>";
    }

    return $res;
}
