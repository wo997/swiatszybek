<?php //->[get_zamowienie_status]

$status = fetchValue("SELECT status FROM zamowienia WHERE link = ?",[$_GET['link']]);
echo "$status";
die;
