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

function setBasketData($basket_json_or_array)
{
    global $app;

    if (is_array($basket_json_or_array)) {
        $basket_json = json_encode($basket_json_or_array);
    } else {
        $basket_json = $basket_json_or_array;
    }

    $_SESSION["basket"] = $basket_json;
    setcookie("basket", $basket_json, (time() + 31536000));

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
        setBasketData([]);
    }
}

function prepareBasketData()
{
    global $app;

    $user_basket = [];

    $basket = json_decode($_SESSION["basket"], true);

    $variant_id_list = "";
    foreach ($basket as $basket_item) {
        $variant_id_list .= $basket_item["variant_id"] . ",";
    }

    $where = "1";

    if ($variant_id_list) {
        $where .= " AND variant_id IN (" . substr($variant_id_list, 0, -1) . ")";
    }

    $unordered_variants = fetchArray("SELECT variant_id, product_id, title, link, name, zdjecie, price, rabat, stock, gallery FROM products i INNER JOIN variant v USING (product_id) WHERE $where");

    $variants = [];

    foreach ($basket as $basket_item) { // merge variants with quantity into basket, simple right?
        foreach ($unordered_variants as $unordered_variant) {
            if ($unordered_variant["variant_id"] == $basket_item["variant_id"]) {
                $unordered_variant["quantity"] = $basket_item["quantity"];
                $variants[] = $unordered_variant;
                break;
            }
        }
    }

    $totalBasketCost = 0;

    $item_count = 0;

    foreach ($variants as $variant_index => $variant) {
        $variant["real_price"] = $variant["price"] - $variant["rabat"];

        $total_price = 0;
        for ($i = 0; $i < $variant["quantity"]; $i++) // u can add special offers here later
        {
            $item_count++;
            $total_price += $variant["real_price"];
        }

        $variant["total_price"] = $total_price;

        $totalBasketCost += $total_price;

        $variants[$variant_index] = $variant;
    }

    $user_basket["variants"] = $variants;
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

        foreach ($app["user"]["basket"]["variants"] as $variant_index => $variant) {
            if ($variant["quantity"] > $variant["stock"]) {
                $app["user"]["basket"]["variants"][$variant_index]["quantity"] = $variant["stock"];
                $fail = true;
            }
            if ($variant["quantity"] <= 0) {
                unset($app["user"]["basket"]["variants"][$variant_index]);
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
        foreach ($app["user"]["basket"]["variants"] as $variant) {
            $variant_id = $variant["variant_id"];
            $stock = $variant["stock"];
            $quantity = $variant["quantity"];

            $qty_buttons = getQtyControl($variant_id, $quantity, $stock);

            $basketContent .= "
                <div class='product-block'>
                    <a href='" . getProductLink($variant["product_id"], $variant["link"]) . "'>
                        <img class='product-image' data-src='" . $variant["zdjecie"] . "' data-gallery='" . $variant["gallery"] . "' data-height='1w'>
                        <h3 class='product-title'><span class='check-tooltip'>" . $variant["title"] . " " . $variant["name"] . "</span></h3>
                    </a>
                    <div style='text-align:center'>
                        $qty_buttons
                        <span class='product-price pln'>" . $variant["total_price"] . " zł</span>
                    </div>
                    <button class='fas fa-times remove-product-btn' onclick='addVariantToBasket($variant_id,-100000);return false;'></button>
                </div>";
        }
    }
    return $basketContent;
}

function getQtyControl($variant_id, $quantity, $stock)
{
    $remove = "
        <button class='btn subtle qty-btn' onclick='addVariantToBasket($variant_id,-1)'>
            <i class='custom-minus'></i>
        </button>
    ";
    $add_visibility = $quantity < $stock ? "" : "disabled";
    $add = "
        <button $add_visibility class='btn subtle qty-btn' onclick='addVariantToBasket($variant_id,1)'>
            <i class='custom-plus'></i>
        </button>
    ";

    return "<div class='qty-control glue-children'>$remove <span class='qty-label'>$quantity</span> $add</div>";
}

function printBasketTable()
{
    global $app;

    $nr = 0;
    $res = "";

    foreach ($app["user"]["basket"]["variants"] as $variant) {
        $v = $variant;
        $quantity = $v["quantity"];
        $stock = $v["stock"];
        $variant_id = $v["variant_id"];

        if ($nr == 0) {
            $res .= "
                <table class='item-list item-list-full'><tr style='background: var(--primary-clr);color: white;'>
                <td>Produkt</td>
                <td></td>
                <td>Cena</td>
                <td>Ilość</td>
                <td>Suma</td>
                <td></td>
                </tr>
            ";
        }
        $nr++;

        $qty_buttons = getQtyControl($variant_id, $quantity, $stock);

        $res .= "<tr data-variant_id='$variant_id'>
                <td><img data-src='" . $v["zdjecie"] . "' data-height='1w' style='width:min(130px,100%);display:block;margin:auto;object-fit:contain'></td>
                <td><a class='linkable' href='" . getProductLink($v["product_id"], $v["link"]) . "'>" . $v["title"] . " " . $v["name"] . "</a></td>
                <td class='pln oneline' style='font-weight:normal'><label>Cena:</label> " . $v["real_price"] . " zł</td>
                <td class='oneline'>$qty_buttons</td>
                <td class='pln oneline'><label>Suma:</label> " . $v["total_price"] . " zł</td>
                <td><button class='fas fa-times remove-product-btn' onclick='addVariantToBasket($variant_id,-100000);return false;'></button></td>
            </tr>";
    }
    if ($nr > 0) {
        $res .= "</table>";
    }

    return $res;
}
