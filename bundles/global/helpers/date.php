<?php

define("m_pol", ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]);

function dateDifference($time)
{
    $date_time = strtotime($time);

    $diff = time() - $date_time;

    if ($diff < 60) {
        return "Przed chwilą";
    } else if ($diff < 3600) {
        $m = floor($diff / 60);
        if ($m == 1) return "1 minutę temu";
        else if ($m == 2 || $m == 3 || $m == 4) return $m . " minuty temu";
        else return $m . " minut temu";
    } else if ($diff < 12 * 3600) {
        $m = floor($diff / 3600);
        if ($m == 1) return "1 godzinę temu";
        else if ($m == 2 || $m == 3 || $m == 4) return $m . " godziny temu";
        else return $m . " godzin temu";
    } else {
        return date("d", $date_time) . " " . def(m_pol, intval(substr($time, 5, 2)) - 1, "") . " " . date("Y", $date_time);
    }
}

function reverseDate($date_str)
{
    return substr($date_str, 8, 2) . "-" . substr($date_str, 5, 2) . "-" . substr($date_str, 0, 4);
}

function reverseDateTime($date_str)
{
    return substr($date_str, 8, 2) . "-" . substr($date_str, 5, 2) . "-" . substr($date_str, 0, 4) . " " . substr($date_str, 11, 8);
}

function niceDate($time = null)
{
    if (!$time) $time = date("Y-m-d");

    $date_time = strtotime($time);

    return date("d", $date_time) . " " . m_pol[intval(substr($time, 5, 2)) - 1] . " " . date("Y", $date_time);
}

function changeDate($date_string, $offset)
{
    return date("Y-m-d", strtotime("$date_string $offset"));
}

function changeDateTime($date_string, $offset)
{
    return date("Y-m-d H:i:s", strtotime("$date_string $offset"));
}
