<?php

$m_pol = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

function dateDifference($time)
{
    global $m_pol;

    $date_time = strtotime($time);

    $diff = time() - $date_time;

    if ($diff < 60) {
        return "Przed chwilą";
    } else if ($diff < 3600) {
        $m = floor($diff / 60);
        if ($m == 1) return "minutę temu";
        else if ($m == 2 || $m == 3 || $m == 4) return $m . " minuty temu";
        else return $m . " minut temu";
    } else if ($diff < 12 * 3600) {
        $m = floor($diff / 3600);
        if ($m == 1) return "godzinę temu";
        else if ($m == 2 || $m == 3 || $m == 4) return $m . " godziny temu";
        else return $m . " godzin temu";
    } else {
        return date("d", $date_time) . " " . $m_pol[intval(substr($time, 5, 2)) - 1] . " " . date("Y", $date_time);
    }
}

function niceDate($time = null)
{
    global $m_pol;

    if (!$time) $time = date("Y-m-d");

    $date_time = strtotime($time);

    return date("d", $date_time) . " " . $m_pol[intval(substr($time, 5, 2)) - 1] . " " . date("Y", $date_time);
}

function changeDate($date_string, $offset)
{
    return date("Y-m-d", strtotime("$date_string $offset"));
}
