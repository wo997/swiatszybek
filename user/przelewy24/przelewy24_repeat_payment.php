<?php //->[przelewy24_repeat_payment]

$zamowienie_link = $_GET['link'];
$link = getZamowienieLink($zamowienie_link);

$session_id = uniqid();

query("UPDATE zamowienia SET session_id = ? WHERE link = ?",[$session_id, $zamowienie_link]);

$zamowienie_id = fetchValue("SELECT zamowienie_id FROM zamowienia WHERE link = ?",[$zamowienie_link]);

/*if ($przelewy24_token)
{
    $url = "https://".(secret("p24_testMode") ? "sandbox" : "secure").".przelewy24.pl/trnRequest/".$przelewy24_token;
    header("Location: $url");
    die;
}
else
{*/
if ($status == 0) {
    require "user/przelewy24/przelewy24_register_payment.php";
}
//}
