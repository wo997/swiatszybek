<?php

// TODO: use events

if (!isset($CRON)) die;

include_once "kernel.php";

DB::execute("UPDATE products SET cache_sales = cache_sales * 0.95"); // bestsellers

function dailyReport()
{
    global $app;

    $day = date("Y-m-d", time() - 3600 * 5);

    $where = "DATE(oplacono) = '$day' AND status_id NOT IN (4)";

    $variant_list = [];

    $info = DB::fetchRow("SELECT SUM(koszt) as koszt, SUM(1) as zamowienia FROM zamowienia WHERE $where");

    $baskets = DB::fetchArr("SELECT basket FROM zamowienia WHERE $where ORDER BY oplacono ASC LIMIT 1000");
    foreach ($baskets as $basket) {
        $variants = json_decode($basket["basket"], true);
        foreach ($variants as $variant) {
            if (isset($variant_list[$variant["t"]])) {
                $variant_list[$variant["t"]] += $variant["q"];
            } else $variant_list[$variant["t"]] = $variant["q"];
        }
    }

    arsort($variant_list);

    $table = "<table>";
    foreach ($variant_list as $name => $q) {
        $table .= "<tr>
            <td>$name</td>
            <td>$q szt.</td>
        </tr>";
    }
    $table .= "</table>";

    if ($info["koszt"]) {
        $message = "
            <h4>Nowe opłacone zamówienia: {$info["zamowienia"]}</h4>
            <h4>Wpłacono: {$info["koszt"]} zł</h4>
            <h4>Produkty</h4>
            $table
        ";
    } else {
        $message = "
            <h4>Brak zamówień</h4>
        ";
    }

    $mailTitle = "Raport dnia " . $app["company_data"]['shop_name'] . " " . $day;

    foreach (getDailyReportEmailList() as $email) {
        sendEmail($email, $message, $mailTitle);
    }
}

dailyReport();
