<?php //route[get_zamowienie_status_id]

$status_id = DB::fetchVal("SELECT status_id FROM zamowienia WHERE link = ?", [$_GET['link']]);

jsonResponse(["status_id" => $status_id]);
