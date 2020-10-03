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

function getBasketData()
{
    return json_decode($_SESSION["basket"], true);
}

function setBasketData($basket_json_or_array)
{
    global $app;

    if (is_array($basket_json_or_array)) {
        $basket_all = $basket_json_or_array;
    } else {
        $basket_all = json_decode($basket_json_or_array, true);
    }

    $basket = [];
    foreach ($basket_all as $basket_item) {
        $basket[] = [
            "variant_id" => $basket_item['variant_id'],
            "quantity" => $basket_item['quantity']
        ];
    }

    $basket_json = json_encode($basket);

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
        $basket = getBasketData();

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

function getVariantsFullData($variant_id_list)
{
    if (!$variant_id_list) {
        return [];
    }

    $where = "variant_id IN (" . join(",", $variant_id_list) . ")";
    $order = join(", ", array_map(function ($variant_id) {
        return "variant_id = $variant_id";
    }, $variant_id_list));

    $variant_list = fetchArray("SELECT variant_id, product_id, title, link, name, zdjecie, price, rabat, stock, gallery FROM products i INNER JOIN variant v USING (product_id) WHERE $where ORDER BY $order");

    foreach ($variant_list as $variant_index => $variant) {
        $variant["real_price"] = $variant["price"] - $variant["rabat"];
        $variant["full_link"] = getProductLink($variant["product_id"], $variant["link"]);
        $variant_list[$variant_index] = $variant;
    }

    return $variant_list;
}

function prepareBasketData()
{
    global $app;

    $user_basket = getBasketData();

    $basket_variant_id_list = [];
    foreach ($user_basket as $basket_item) {
        $basket_variant_id_list[] = intval($basket_item["variant_id"]);
    }
    $variant_list_full = getVariantsFullData($basket_variant_id_list);

    // add quantity into variant array
    foreach ($variant_list_full as $variant_key => $variant) {
        $v_id = $variant["variant_id"];
        $basket_variant_index = array_search($v_id, $basket_variant_id_list);

        // should find always
        if ($basket_variant_index !== false) {
            $qty = $user_basket[$basket_variant_index]["quantity"];
            $variant_list_full[$basket_variant_index]["quantity"] = $qty;
            $variant_list_full[$basket_variant_index]["total_price"] = $variant["real_price"] * $qty;
            break;
        }
    }

    $total_basket_cost = 0;
    $item_count = 0;
    foreach ($variant_list_full as $variant) {
        $item_count += $variant["quantity"];
        $total_basket_cost += $variant["total_price"];
    }


    $user_basket["variants"] = $variant_list_full;
    $user_basket["total_basket_cost"] = $total_basket_cost;
    $user_basket["item_count"] = $item_count;

    $app["user"]["basket"] = $user_basket;
}

function validateStock()
{
    global $app;

    prepareBasketData();

    try {
        $fail = false;

        foreach ($app["user"]["basket"]["variants"] as $key => $variant) {
            if ($variant["quantity"] > $variant["stock"]) {
                $app["user"]["basket"]["variants"][$key]["quantity"] = $variant["stock"];
                $fail = true;
            }
            if ($variant["quantity"] <= 0) {
                unset($app["user"]["basket"]["variants"][$key]);
            }
        }

        setBasketData($app["user"]["basket"]["variants"]);

        if ($fail) {
            throw new Exception("out of stock");
        }
    } catch (Exception $e) {
        // TODO: rework that script man, it's bad to redirect no matter what the request is
        // redirect when kupuje ziom xd, reload?
        /*if (!isset($_GET['produkt'])) { // cannot loop man
            header("Location: /zakup?produkt=brak");
            die;
        }*/
        //if (!IS_XHR)
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

    $response = [];

    $response["basket"] = $app["user"]["basket"]["variants"];
    $response["total_basket_cost"] = $app["user"]["basket"]["total_basket_cost"];
    $response["item_count"] = $app["user"]["basket"]["item_count"];

    return $response;
}


function getTrackingLink($track, $dostawa, $dostawa_name)
{
    global $config;
    if (!$track) return "";
    $track = htmlspecialchars($track);
    if ($dostawa == 'k') {
        return $config['kurier_tracking'] . $track;
    } else if ($dostawa == 'p') {
        return $config['paczkomat_tracking'] . $track;
    }
    return "";
}


function getZamowienieLink($link, $relative = false)
{
    return ($relative ? "" : SITE_URL) . "/zamowienie/$link";
}
