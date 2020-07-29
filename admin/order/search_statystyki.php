<?php //->[admin/search_statystyki]


$where = "oplacono IS NOT NULL AND status NOT IN (4)";

$dateLimit = "";
if (isset($_POST['dateFrom'])) {
    $dateLimit .= " AND DATE(oplacono) >= '" . escapeSQL($_POST['dateFrom']) . "'";
}
if (isset($_POST['dateTo'])) {
    $dateLimit .= " AND DATE(oplacono) <= '" . escapeSQL($_POST['dateTo']) . "'";
}
$where .= $dateLimit;

// data
$zamowienia = fetchArray("SELECT SUM(1) as zamowienia, DATE(oplacono) as zlozono FROM zamowienia WHERE $where GROUP BY DATE(oplacono) ORDER BY oplacono ASC");
$oplacono = fetchArray("SELECT SUM(koszt) as kwota, SUM(1) as zamowienia, DATE(oplacono) as oplacono FROM zamowienia WHERE $where GROUP BY DATE(oplacono) ORDER BY oplacono ASC");
$variants = fetchArray(
    "SELECT title, SUM(purchase_price) as all_purchase_price, SUM(total_price) as all_total_price, SUM(quantity) as all_quantity
    FROM basket_content c INNER JOIN zamowienia USING (zamowienie_id)
    WHERE $where
    GROUP BY c.variant_id
    ORDER BY SUM(total_price) DESC"
);

echo json_encode([
    "zamowienia" => $zamowienia,
    "oplacono" => $oplacono,
    "variants" => $variants
], JSON_UNESCAPED_UNICODE);
