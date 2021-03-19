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
