<?php

function getOrderEmailList()
{
    $general_emails = getSetting("general", "emails", []);
    $order_emails = nonull($general_emails, "order_emails", "[]");
    $order_email_list = [];
    foreach (json_decode($order_emails, true) as $row) {
        $order_email_list[] = $row["values"]["email"];
    }
    return $order_email_list;
}

function getDailyReportEmailList()
{
    $general_emails = getSetting("general", "emails", []);
    $order_emails = nonull($general_emails, "daily_report_emails", "[]");
    $order_email_list = [];
    foreach (json_decode($order_emails, true) as $row) {
        $order_email_list[] = $row["values"]["email"];
    }
    return $order_email_list;
}
