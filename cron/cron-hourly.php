<?php

if (!isset($CRON)) die;

include_once "kernel.php";

function sendPaymentNotification($delayHours = 5)
{
    $dateBottom = date("Y-m-d H", time() + 100 - 3600 * $delayHours) . ":00:00";
    $dateTop = date("Y-m-d H", time() + 100 - 3600 * ($delayHours - 1)) . ":00:00";

    $zamowienia = fetchArray(
        "SELECT zamowienie_id, link, email, imie, nazwisko, zlozono
        FROM zamowienia WHERE status = 0 AND zlozono >= '$dateBottom' AND zlozono < '$dateTop'");

    foreach ($zamowienia as $z) {
        $message = getEmailHeader($z);
        $message .= "Uprzejmie informujemy, że jeszcze nie opłaciłaś/eś swojego zamówienia numerze #" . $z["zamowienie_id"] . ".<br><br>";
        $message .= "Możesz tego dokonać teraz klikając w <a href='" . getZamowienieLink($z["link"]) . "' style='font-weight:bold;color:#37f;'>ten link</a>";
        $message .= getEmailFooter();

        $mailTitle = "Przypomnienie o opłacie zamówienia #" . $z["zamowienie_id"] . " - ".config('main_email_sender');

        if (!isset($TEST)) {
            sendEmail($z["email"], $message, $mailTitle);
            sendEmail("wojtekwo997@gmail.com", $message.$z['email'].":)", $mailTitle);
        }
        //sendEmail("wojtekwo997@gmail.com", $message.$z['email'], $mailTitle);
    }
}

sendPaymentNotification(5);

function inviteToGiveComment($hour = 18, $daysAfterSent = 14)
{
    global $TEST;
    $currentHour = date("H", time() + 100);
    if ($currentHour == $hour || isset($TEST)) {
        $someDaysAgoDate = date("Y-m-d", time() - 3600 * 24 * $daysAfterSent);

        $zamowienia = fetchArray(
            "SELECT zamowienie_id, link, email, imie, nazwisko, zlozono, basket, user_id
            FROM zamowienia WHERE status IN (2,3) AND DATE(wyslano) = '$someDaysAgoDate'");

        foreach ($zamowienia as $z) {
            $basket = json_decode($z['basket'], true);

            $ids = trim(json_encode(array_map(function ($v) {
                return $v['i'];
            }, $basket)), "[]");

            $products = fetchArray("SELECT product_id, link FROM products WHERE product_id IN ($ids)");
            $links = [];
            foreach ($products as $item) {
                $links[$item["product_id"]] = $item["link"];
            }

            $res = "";
            $c = 0;
            foreach ($basket as $item) {
                $title = $item['t'];
                //$price = $item['p'];
                //$quantity = $item['q'];
                $product_id = $item['i'];
                $link = $links[$product_id];
                $c++;
                $res .= "$c. <a style='color:#37f' href='" . getProductLink($product_id, $link) . "'>$title</a><br>";
            }

            $message = getEmailHeader($z);
            $message .= "Dziękujemy Ci za zakupy! Mamy nadzieję, że jesteś z nich zadowolona/y.<br>";
            $message .= "Chcieliśmy poprosić Cię o <span style='font-weight:bold;color:#2c2;'>wystawienie oceny</span> dla produktów <a href='".getZamowienieLink($z['link'])."' style='font-weight:bold;color:#37f;'>zamówienia #{$z['zamowienie_id']}</a>.<br>";
            if (!empty($z['user_id'])) {
                $message .= "Za dodanie komentarza otrzymasz <span style='font-weight:bold;color:#2c2;'>kod rabatowy o wartości 25 zł</span> na dowolny zakup w naszym sklepie!<br>";
            }
            $message .= "<br>$res";
            $message .= getEmailFooter();

            $mailTitle = "Podziękowanie za zamówienie nr #{$z['zamowienie_id']} - ".config('main_email_sender');

            if (!isset($TEST)) {
                sendEmail($z['email'], $message, $mailTitle);
                sendEmail("wojtekwo997@gmail.com", $message.$z['email'].":)", $mailTitle);
            }
            //sendEmail("wojtekwo997@gmail.com", $message.$z['email'], $mailTitle);
        }
    }
}

inviteToGiveComment();