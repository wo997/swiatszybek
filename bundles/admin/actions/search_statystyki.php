<?php //route[{ADMIN}search_statystyki]


$where = "oplacono IS NOT NULL AND status_id NOT IN (4)";

$dateLimit = "";
if (isset($_POST['dateFrom'])) {
    $dateLimit .= " AND DATE(oplacono) >= " . DB::escape($_POST['dateFrom']);
}
if (isset($_POST['dateTo'])) {
    $dateLimit .= " AND DATE(oplacono) <= " . DB::escape($_POST['dateTo']);
}
$where .= $dateLimit;

// data
$zamowienia = DB::fetchArr("SELECT SUM(1) as zamowienia, DATE(oplacono) as zlozono FROM zamowienia WHERE $where GROUP BY DATE(oplacono) ORDER BY oplacono ASC");
$oplacono = DB::fetchArr("SELECT SUM(koszt) as kwota, SUM(1) as zamowienia, DATE(oplacono) as oplacono FROM zamowienia WHERE $where GROUP BY DATE(oplacono) ORDER BY oplacono ASC");
$variants = DB::fetchArr(
    "SELECT title, SUM(purchase_price) as all_purchase_price, SUM(total_price) as all_total_price, SUM(quantity) as all_quantity
    FROM basket_content c INNER JOIN zamowienia USING (zamowienie_id)
    WHERE $where
    GROUP BY c.variant_id
    ORDER BY SUM(total_price) DESC"
);

Request::jsonResponse([
    "zamowienia" => $zamowienia,
    "oplacono" => $oplacono,
    "variants" => $variants
]);
