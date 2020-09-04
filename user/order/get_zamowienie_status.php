<?php //route[get_zamowienie_status]

$status_id = fetchValue("SELECT status_id FROM zamowienia WHERE link = ?", [$_GET['link']]);

die(json_encode(["status_id" => $status_id]));
