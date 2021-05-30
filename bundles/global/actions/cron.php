<?php //route[/cron]

if ($_GET["token"] !== secret('security_token')) {
    die("wrong token");
}

define("CRON_HOURLY_GAP", "30 minutes");
define("CRON_DAILY_GAP", "12 hours");

$cron_runs = json_decode(@file_get_contents(CRON_INFO_PATH), true);
if (!$cron_runs) {
    $cron_runs = [];
}

$any_cron_run = false;

function cronTimeCondition($run_at, $latest_run_at)
{
    $run_datetime = strtotime($run_at);
    $latest_run_datetime = strtotime($latest_run_at);
    $now_datetime = time();
    if ($now_datetime < $run_datetime || $now_datetime > $latest_run_datetime) {
        return false;
    }

    return true;
}

function cronHourlyCondition()
{
    // snaps about the closest hour
    return cronTimeCondition(date("H:00:00", strtotime("+1 minute")), date("H:15:00", strtotime("+1 minute")));
}

function shouldRunCron($unique_name, $min_run_gap)
{
    global $cron_runs, $any_cron_run;

    $now_datetime = time();
    $min_run_gap_time_diff = strtotime($min_run_gap, 0);
    if (isset($cron_runs[$unique_name])) {
        $time_diff = $now_datetime - $cron_runs[$unique_name];
        if ($time_diff < $min_run_gap_time_diff) {
            return false;
        }
    }
    $cron_runs[$unique_name] = $now_datetime;
    $any_cron_run = true;

    return true;
}

foreach (def($build_info, ["hooks", "cron"], []) as $path) {
    @include $path;
}

if ($any_cron_run) {
    Files::save(CRON_INFO_PATH, json_encode($cron_runs));
}
