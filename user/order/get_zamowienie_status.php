<?php //->[get_zamowienie_status]

$status = fetchValue("SELECT status FROM zamowienia WHERE link = ?", [$_GET['link']]);

die(json_encode(["status" => $status]));
