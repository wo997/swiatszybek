<?php //route[{ADMIN}search_kody_rabatowe]  

$where = "1";

$getUserListQuery = "(SELECT GROUP_CONCAT(imie, ' ', nazwisko, ' ', email SEPARATOR ', ') FROM users WHERE FIND_IN_SET(user_id, user_id_list))";

Request::jsonResponse(paginateData([
    "select" => "kod_id, kod, kwota, $getUserListQuery as user_list, user_id_list, date_from, date_to, ilosc, type",
    "from" => "kody_rabatowe k",
    "where" => $where,
    "order" => "k.kod_id DESC",
    "quick_search_fields" => ["k.kod", "k.kwota", $getUserListQuery],
]));
