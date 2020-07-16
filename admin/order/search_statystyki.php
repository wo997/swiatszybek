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
$basket = fetchArray("SELECT basket FROM zamowienia WHERE $where ORDER BY oplacono ASC LIMIT 10000");

echo json_encode([
    "zamowienia" => $zamowienia,
    "oplacono" => $oplacono,
    "basket" => $basket
], JSON_UNESCAPED_UNICODE);
