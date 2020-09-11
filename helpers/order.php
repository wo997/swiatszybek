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

    $unordered_basket_variants = fetchArray("SELECT variant_id, product_id, title, link, name, zdjecie, price, rabat, stock FROM products i INNER JOIN variant v USING (product_id) WHERE $where");

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

function getBasketContent()
{
    global $app;

    $basketContent = "";

    if (!$app["user"]["basket"]["item_count"]) {
        $basketContent = "<h5 style='text-align:center'>Twój koszyk jest pusty!</h5>";
    } else {
        foreach ($app["user"]["basket"]["variants"] as $basket_variant_index => $basket_variant) {
            if ($basketContent == "") $basketContent = "<div class='basketSplit'><div class='basketItemsWrapper'><div class='scrollableContent'>";

            $basket_name = $basket_variant["name"];
            $basket_quantity = $basket_variant["quantity"];
            $basket_quantity = $basket_quantity > 1 ? " - $basket_quantity szt." : "";

            $title_html = "<span style='font-size:16px'>" . $basket_variant["title"] . "</span>";
            if (!empty($basket_name))
                $title_html .= "<br><span style='font-size:15px'>" . $basket_variant["name"] . "</span>";

            $basketContent .= "
                <div>
                    <a href='" . getProductLink($basket_variant["product_id"], $basket_variant["link"]) . "'>
                        <img data-src='" . $basket_variant["zdjecie"] . "' style='width: 100%;height: 120px;object-fit: contain;margin-top:10px'>
                        <div class='item-desc'>
                            <span>
                                <h3>$title_html<b>" . $basket_quantity . "</b></h3>
                                <span class='pln'>" . $basket_variant["total_price"] . " zł</span>
                            </span>
                        </div>
                    </a>
                </div>";
        }

        $basketContent .=
            '</div></div><div><a class="btn primary big fill" href="/zakup" style="position:relative">
            Przejdź do kasy
            <i class="fa fa-chevron-right"></i>
            </a></div></div>';
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
            $res .= "<table class='item-list item-list-full'><tr style='background: var(--primary-clr);color: white;'>
        <td>Produkt</td>
        <td></td>
        <td>Cena</td>
        <td>Ilość</td>
        <td>Suma</td>
        </tr>";
        }
        $nr++;

        $remove = "<button class='removeBtn' type='button' onclick='addItem(-1," . $v["variant_id"] . ")'>-</button>";
        $add = $quantity < $stock ?
            "<button class='addBtn' type='button' onclick='addItem(1," . $v["variant_id"] . ")'>+</button>"
            : "<button type='button' style='visibility:hidden'>+</button>";

        $res .= "<tr data-variant_id='" . $v["variant_id"] . "'>
                <td><img src='/uploads/sm" . getUploadedFileName($v["zdjecie"]) . "' style='max-width:130px;display:block;margin:auto'></td>
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
