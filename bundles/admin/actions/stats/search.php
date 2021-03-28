<?php //route[{ADMIN}/stats/search]

$from_date = clean($_POST["from_date"]);
$to_date = clean($_POST["to_date"]);

$from_date_time = strtotime($from_date);
$to_date_time = strtotime($to_date);

$time_diff = $to_date_time - $from_date_time;

if ($time_diff >= 3600 * 24 * 365 * 8) {
    $tick = "1 year";
} else if ($time_diff >= 3600 * 24 * 365 * 4) {
    $tick = "6 months";
} else if ($time_diff >= 3600 * 24 * 365 * 2) {
    $tick = "3 months";
} else if ($time_diff >= 3600 * 24 * 365) {
    $tick = "2 month";
} else if ($time_diff >= 3600 * 24 * 240) {
    $tick = "1 month";
} else if ($time_diff >= 3600 * 24 * 120) {
    $tick = "14 days";
} else if ($time_diff >= 3600 * 24 * 60) {
    $tick = "7 days";
} else if ($time_diff >= 3600 * 24 * 30) {
    $tick = "3 day";
} else if ($time_diff >= 3600 * 24 * 14) {
    $tick = "1 day";
} else if ($time_diff >= 3600 * 24 * 7) {
    $tick = "6 hours";
} else if ($time_diff >= 3600 * 24 * 3) {
    $tick = "3 hours";
} else if ($time_diff >= 3600 * 24 * 2) {
    $tick = "2 hours";
} else {
    $tick = "1 hour";
}

$chart_data = [
    "labels" => [],
    "total_price" => [],
    "count" => []
];

$start_period = $from_date;
do {
    $end_period = changeDatetime($start_period, $tick);

    $chart_data["labels"][] = niceDate($start_period);

    // paid_at is actually what u wanna use later
    //var_dump(DB::fetchRow("SELECT SUM(total_price) total_price, COUNT(1) as count FROM shop_order WHERE '$start_period' <= paid_at AND paid_at < '$end_period'"));
    $shop_orders_data = DB::fetchRow("SELECT SUM(total_price) total_price, COUNT(1) as count FROM shop_order WHERE '$start_period' <= ordered_at AND ordered_at < '$end_period'");

    $chart_data["total_price"][] = def($shop_orders_data, "total_price", 0);
    $chart_data["count"][] = def($shop_orders_data, "count", 0);

    $start_period = $end_period;
} while (strtotime($start_period) < $to_date_time);

Request::jsonResponse($chart_data);
