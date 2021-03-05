<?php //route[/{ADMIN}search_zamowienia]

Request::jsonResponse(paginateData([
    "select" => "zamowienie_id, imie, nazwisko, link, dostawa, koszt, status_id, DATE_FORMAT(zlozono, '%d-%m-%Y %H:%i') as zlozono, DATE_FORMAT(wyslano, '%d-%m-%Y %H:%i') as wyslano, firma, user_id, cache_basket",
    "from" => "zamowienia z",
    "order" => "z.zamowienie_id DESC",
    "quick_search_fields" => ["z.zamowienie_id", "z.imie", "z.nazwisko", "z.firma"],
    "renderers" => [
        "dostawa" => function ($row) {
            global $dostawy;
            return def($dostawy, $row["dostawa"], "");
        }
    ],
]));
