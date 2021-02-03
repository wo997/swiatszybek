<?php //route[{ADMIN}search_uzytkownicy]  

$where = "u.authenticated = 1";

echo paginateData([
    "select" => "*, (select count(1) from zamowienia z where z.user_id = u.user_id) as zamowienia_count",
    "from" => "users u",
    "where" => $where,
    "order" => "u.user_id DESC",
    "quick_search_fields" => ["u.imie", "u.nazwisko", "u.firma", "u.email"],
]);
