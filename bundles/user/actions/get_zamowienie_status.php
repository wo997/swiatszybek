<?php //route[get_zamowienie_status_id]

$status_id = DB::fetchVal("SELECT status_id FROM zamowienia WHERE link = ?", [$_GET['link']]);

json_response(["status_id" => $status_id]);
