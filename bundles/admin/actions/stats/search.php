<?php //route[{ADMIN}/stats/search]

$from_date = clean($_POST["from_date"]);
$to_date = clean($_POST["to_date"]);

$from_date_time = strtotime($from_date);
$to_date_time = strtotime($to_date);

$time_span = $to_date_time - $from_date_time;

$pretty_time_spans = ["1 year", "6 months", "3 months", "2 months", "1 month", "14 days", "7 days", "3 days", "2 days", "1 day", "12 hours", "6 hours", "3 hours", "2 hours", "1 hour"];
$min_tick_count = 10;
foreach ($pretty_time_spans as $pretty_time_span) {
    $tick_str = $pretty_time_span;
    $tick = strtotime($tick_str, 0);
    if ($time_span / $tick >= $min_tick_count) {
        break;
    }
}

$chart_data = [
    "labels" => [],
    "total_price" => [],
    "count" => []
];

$start_period = $from_date;
do {
    $end_period = changeDateTime($start_period, $tick_str);

    $date_label = reverseDateTime($start_period);
    if (strpos($tick_str, "year") !== false) {
        $date_label = substr($date_label, 5, 7);
    } else if (strpos($tick_str, "month") !== false) {
        $date_label = substr($date_label, 3, 7);
    } else if (strpos($tick_str, "day") !== false) {
        $date_label = substr($date_label, 0, 5);
    } else if (strpos($tick_str, "hour") !== false) {
        $date_label = substr($date_label, 11, 5);
    } else {
        $date_label = $start_period;
    }
    $chart_data["labels"][] = $date_label;

    // paid_at is actually what u wanna use later
    //var_dump(DB::fetchRow("SELECT SUM(total_price) total_price, COUNT(1) as count FROM shop_order WHERE '$start_period' <= paid_at AND paid_at < '$end_period'"));
    $shop_orders_data = DB::fetchRow("SELECT SUM(total_price) total_price, COUNT(1) as count FROM shop_order WHERE '$start_period' <= ordered_at AND ordered_at < '$end_period'");

    $chart_data["total_price"][] = def($shop_orders_data, "total_price", 0);
    $chart_data["count"][] = def($shop_orders_data, "count", 0);

    $start_period = $end_period;
} while (strtotime($start_period) < $to_date_time);

Request::jsonResponse($chart_data);
