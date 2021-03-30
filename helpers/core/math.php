<?php

function roundPrice($price)
{
    return round($price, 2);
}

/**
 * input_example = [
 *    ["v" => 500, "c" => 5],
 *    ["v" => 234, "c" => 6],
 *    ["v" => 211, "c" => 10],
 *    ["v" => 190, "c" => 6],
 *    ["v" => 90, "c" => 8],
 *    ["v" => 12, "c" => 9],
 * ];
 *
 * @param  array $values
 * @return void
 */
function setRangesFromLongDataset(&$values, $max_ranges = 10)
{
    while (($count_values = count($values)) > $max_ranges) {
        $counts = array_column($values, "c");
        $lowest_cnt = min($counts);

        $safe = false;
        for ($i = 0; $i < $count_values; $i++) {
            $prev_cnt = def($counts, $i - 1, 0);
            $curr_cnt = $counts[$i];
            $next_cnt = def($counts, $i + 1, 0);

            if ($curr_cnt === $lowest_cnt) {
                $safe = true;
                if (($prev_cnt < $next_cnt) && $i > 0 || $i === $count_values - 1) {
                    $i1 = $i - 1;
                    $i2 = $i;
                } else {
                    $i1 = $i;
                    $i2 = $i + 1;
                }
                array_splice($values, $i1, 2, [[
                    "max" => def($values[$i1], "max", $values[$i1]["v"]),
                    "v" => $values[$i2]["v"],
                    "c" => $values[$i1]["c"] + $values[$i2]["c"]
                ]]);

                break;
            }
        }

        if (!$safe) {
            break;
        }
    }
}

/**
 * input_example = [
 *    ["v" => 500, "i" => [144,144,145]],
 *    ["v" => 234, "i" => [6,6,9]],
 *    ["v" => 211, "i" => [10]],
 *    ["v" => 190, "i" => [6,54,144]],
 *    ["v" => 90, "i" => [8]],
 *    ["v" => 12, "i" => [9]],
 * ];
 * 
 * it's different than setRangesFromLongDataset because it takes ids, and makes sure that none of them repeat in the output range
 *
 * @param  array $values
 * @return void
 */
function setRangesFromLongDatasetWithIndices(&$values, $max_ranges = 10)
{
    // pretty much same as getting "c" from a query but easier to maintain
    foreach ($values as &$value) {
        if (is_string($value["i"])) {
            $value["i"] = json_decode($value["i"], true);
        }
        $value["i"] = array_unique($value["i"]);
        $value["c"] = count($value["i"]);
    }
    unset($value);

    while (($count_values = count($values)) > $max_ranges) {
        $counts = array_column($values, "i");
        $lowest_cnt = min($counts);

        $safe = false;
        for ($i = 0; $i < $count_values; $i++) {
            $prev_cnt = def($counts, $i - 1, 0);
            $curr_cnt = $counts[$i];
            $next_cnt = def($counts, $i + 1, 0);

            if ($curr_cnt === $lowest_cnt) {
                $safe = true;
                if (($prev_cnt < $next_cnt) && $i > 0 || $i === $count_values - 1) {
                    $i1 = $i - 1;
                    $i2 = $i;
                } else {
                    $i1 = $i;
                    $i2 = $i + 1;
                }
                array_splice($values, $i1, 2, [[
                    "max" => def($values[$i1], "max", $values[$i1]["v"]),
                    "v" => $values[$i2]["v"],
                    "c" => $values[$i1]["c"] + $values[$i2]["c"],
                    "i" => array_merge($values[$i1]["i"], $values[$i2]["i"]),
                ]]);

                break;
            }
        }

        if (!$safe) {
            break;
        }
    }

    // once again make sure that "c" is set 
    foreach ($values as &$value) {
        $value["i"] = array_unique($value["i"]);
        $value["c"] = count($value["i"]);
    }
    unset($value);
}


function getSafeNumber($number)
{
    $accuracy = 100000;
    // 0.09 becomes 009, you can easily tell that the dot comes after first 0
    return preg_replace('/^0./', "0", round($accuracy * $number) / $accuracy);
}
