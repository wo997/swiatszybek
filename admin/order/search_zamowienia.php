<?php //route[admin/search_zamowienia]


$status_id = isset($_POST['status']) ? $_POST['status'] : "";

$where = "1";

if ($status_id != "") {
  if ($status_id == "otwarte") {
    $where = "status IN (0,1)";
  } else {
    $status_id = intval($status_id);
    $where = "status = $status_id";
  }
}

if (isset($_POST['user_id'])) {
  $where .= " AND user_id = " . intval($_POST['user_id']);
}

$dateLimit = "";
if (isset($_POST['dateFrom'])) {
  $date = mysqli_real_escape_string($con, $_POST['dateFrom']);
  $dateLimit .= " AND DATE(zlozono) >= '$date'";
}
if (isset($_POST['dateTo'])) {
  $date = mysqli_real_escape_string($con, $_POST['dateTo']);
  $dateLimit .= " AND DATE(zlozono) <= '$date'";
}
$where .= $dateLimit;

echo getTableData([
  "select" => "zamowienie_id, imie, nazwisko, link, dostawa, koszt, status, DATE_FORMAT(zlozono, '%d-%m-%Y %H:%i') as zlozono, DATE_FORMAT(wyslano, '%d-%m-%Y %H:%i') as wyslano, firma, user_id, cache_basket",
  "from" => "zamowienia z",
  "where" => $where,
  "order" => "z.zamowienie_id DESC",
  "main_search_fields" => ["z.zamowienie_id", "z.imie", "z.nazwisko", "z.firma"],
  "renderers" => [
    "dostawa" => function ($row) {
      global $dostawy;
      return nonull($dostawy, $row["dostawa"], "");
    }
  ]
]);
