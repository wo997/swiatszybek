<?php

function getSearchableString($str)
{
    return trim(preg_replace('/\s{2,}/', ' ', replacePolishLetters($str)));
}

/**
 * @typedef SearchQueryParams {
 * quick_search_fields: string
 * quick_search: string
 * search_type: string
 * }
 */

/**
 * getSearchQuery
 *
 * @param  SearchQueryParams $data
 * @return void
 */
function getSearchQuery($data)
{

    $quick_search_fields = $data["quick_search_fields"];
    $search_type = def($data, "search_type", "regular");

    if (!$quick_search_fields) {
        return "";
    }
    $quick_search = trim($data["quick_search"]);
    $quick_search = preg_replace("/\s{2,}/", " ", $quick_search);

    if ($search_type == "extended") {
        $quick_search = getSearchableString($quick_search);
    }

    $words = explode(" ", $quick_search);

    if ($search_type == "extended") {
        return getRelevanceQuery($quick_search_fields, $words);
    } else {
        return getRegularSearchQuery($quick_search_fields, $words);
    }
}

function getRegularSearchQuery($fields, $words)
{
    $query = "";
    $counter = 0;
    foreach ($words as $word) {
        $counter++;
        if ($counter > 5) { // restrict 5 words
            break;
        }

        $word = DB::escape($word, false);
        if (!$word) {
            continue;
        }

        $query .= " AND (";
        $first = true;
        foreach ($fields as $field) {
            if (!$first) {
                $query .= " OR";
            }

            $query .= " $field LIKE '%$word%'";
            $first = false;
        }
        $query .= ")";
    }

    return $query;
}

function getRelevanceQuery($fields, $words)
{
    $query = "";
    $counter = 0;
    $first = true;
    foreach ($words as $word) {
        $word = trim($word);
        if (!$word) {
            continue;
        }

        $counter++;
        if ($counter > 5) {
            break;
        }

        $len = strlen($word);

        $letter_groups = [];

        if ($len > 5) {
            $letter_groups["[[:<:]]" . substr($word, 0, -2)] = 12 * $len;
        } else if ($len > 4) {
            $letter_groups["[[:<:]]" . substr($word, 0, -1)] = 15 * $len;
        } else {
            $letter_groups["[[:<:]]" . $word] = 15 * $len;
            $letter_groups["[[:<:]]" . $word . "[[:>:]]"] = 50;
        }

        for ($i = 0; $i < $len - 2; $i++) {
            $letter_groups[substr($word, $i, 3)] = 4;
            $letter_groups[substr($word, $i, 1) . "." . substr($word, $i + 1, 2)] = 2;
            $letter_groups[substr($word, $i, 2) . "." . substr($word, $i + 2, 1)] = 2;
        }

        for ($i = 0; $i < $len - 3; $i++) {
            $letter_groups[substr($word, $i, 1) . "." . substr($word, $i + 2, 2)] = 1;
            $letter_groups[substr($word, $i, 2) . "." . substr($word, $i + 3, 1)] = 1;
            $letter_groups[substr($word, $i, 1) . substr($word, $i + 2, 2)] = 1;
            $letter_groups[substr($word, $i, 2) . substr($word, $i + 3, 1)] = 1;
        }

        foreach ($letter_groups as $letter_group => $points) {
            $letter_group = DB::escape($letter_group, false);

            foreach ($fields as $field) {
                if (!$first) {
                    $query .= " + ";
                }
                $query .= "CASE WHEN $field REGEXP '$letter_group' THEN $points ELSE 0 END";
                $first = false;
            }
        }
    }

    return $query;
}

/**
 * @typedef DatatableParams {
 * filters?: string
 * order?: string
 * quick_search?: string
 * page_id?: number
 * row_count?: number
 * }
 */

/**
 * @typedef PaginationParams {
 * select: string
 * from: string
 * where?: string
 * filters?: string
 * order?: string
 * group?: string
 * quick_search_fields?: array
 * //renderers?: array
 * datatable_params?: DatatableParams
 * primary_key?: string
 * search_type?: string
 * }
 */

/**
 * paginateData
 *
 * @param  PaginationParams $params
 */
function paginateData($params = [])
{
    if (isset($params["datatable_params"])) {
        $params["datatable_params"] = json_decode($params["datatable_params"], true);
    }

    $row_count = min(def($params, ["datatable_params", "row_count"], 20), 100);
    $page_id = def($params, ["datatable_params", "page_id"], 0);
    if ($page_id < 0) {
        $page_id = 0;
    }

    $bottomIndex = $page_id * $row_count;

    $select = $params["select"];

    $from = $params["from"];

    $where = def($params, "where");

    if (trim($where) == "") {
        $where = "1";
    }

    $filters = def($params, ["datatable_params", "filters"], []);
    if ($filters) {
        foreach ($filters as $filter) {
            $where .= getFilterCondition($filter["db_key"], $filter["data"], def($filter, "simplify_search", false));
        }
    }

    $quick_search = def($params, ["datatable_params", "quick_search"], "");
    $quick_search_fields = def($params, "quick_search_fields", []);
    $search_type = def($params, "search_type", "regular");

    $search_query = getSearchQuery([
        "quick_search" => $quick_search,
        "quick_search_fields" => $quick_search_fields,
        "search_type" => $search_type,
    ]);

    if ($search_query) {
        if ($search_type == "extended") {
            $where .= " AND $search_query > 0";
        } else {
            $where .= $search_query;
        }
    }

    $group = isset($params["group"]) ? ("GROUP BY " . $params["group"]) : "";

    $order = def($params, ["datatable_params", "order"], def($params, "order"));

    if ($search_query && $search_type == "extended") {
        // if ($order) {
        //     [$order_key, $order_dir] = explode(" ", $order);

        //     $test_order_key = $order_key == "RAND()" ? "1" : $order_key;

        //     $frmq = "$from WHERE $where $group";
        //     if ($group) {
        //         $frmq = "(SELECT $order_key, " . join(",", $quick_search_fields) . " FROM $frmq) t";
        //     }
        //     $order_info = DB::fetchRow("SELECT MAX($test_order_key) as order_max, MIN($test_order_key) as order_min, MAX($search_query) as relevance_max FROM $from WHERE $where");

        //     $ratio = round(30 * $order_info["relevance_max"] / max(abs($order_info["order_max"] - $order_info["order_min"]), 5)) / 100; // 30 % care about the order key, we want a match right?

        //     $order = "(SELECT $search_query"
        //         . ($order_dir == "DESC" ? "+" : "-")
        //         . " $ratio * $order_key) DESC";
        // } else {
        // }
        $order = "$search_query DESC";
    }

    $countQuery = "SELECT COUNT(1) FROM $from WHERE $where $group";

    if ($group) {
        $countQuery = "SELECT COUNT(1) FROM($countQuery) t";
    }

    $total_rows = DB::fetchVal($countQuery);

    if ($order) {
        $order = "ORDER BY $order";
    }

    $results = DB::fetchArr("SELECT $select FROM $from WHERE $where $group $order LIMIT $bottomIndex,$row_count");

    $res = ["total_rows" => $total_rows, "rows" => $results];

    return $res;
}

function getFilterCondition($key, $data, $simplify_search = false)
{
    $key = clean($key);
    $type = def($data, "type", "");

    if ($type === "string") {
        $full_match = def($data, "full_match", 0);
        if ($simplify_search) {
            $data["string"] = getSearchableString($data["string"]);
        }
        $string = DB::escape($data["string"], false);
        if (!$full_match) {
            $string = "%$string%";
        }
        return " AND $key LIKE '$string'";
    } else if ($type === "boolean") {
        if ($data["value"]) {
            return " AND $key";
        }
        return " AND NOT $key";
    } else if ($type === "exact") {
        if ($simplify_search) {
            $data["value"] = getSearchableString($data["value"]);
        }
        $string = DB::escape($data["value"]); // can also be a number but leave it a string
        return " AND $key = $string";
    } else if ($type === "number") {
        $operator = def($data, "operator", "");
        $num = def($data, "num", 0);
        $val = def($data, "val", 0);
        if ($operator === "=") {
            return " AND $key = $num";
        } else if ($operator === ">=") {
            return " AND $key >= $num";
        } else if ($operator === "<=") {
            return " AND $key <= $num";
        } else if ($operator === "<>") {
            $more_than = def($data, "more_than", 0);
            $less_than = def($data, "less_than", 0);
            return " AND $key BETWEEN $more_than AND $less_than";
        }
    }

    return "";
}

function sortTable($table, $positions = [], $order_key = "pos", $where = "1")
{
    $table = clean($table);
    $order_key = clean($order_key);
    $primary = $table . "_id";

    $curr_ids = DB::fetchCol("SELECT $primary FROM $table WHERE $where ORDER BY $order_key ASC");

    $wanted = $positions; //[5,3,34,10,7,11];
    $before = $curr_ids; //[7,4,5,3,6,11];
    $before_flip = array_flip($before);
    foreach ($wanted as $key => $want) {
        if (!isset($before_flip[$want])) {
            $wanted[$key] = 0;
        }
    }
    // push anything missing at the end
    $wanted = array_filter($wanted);
    $wanted_flip = array_flip($wanted);
    foreach ($before as $key => $befo) {
        if (!isset($wanted_flip[$befo])) {
            $wanted[] = $befo;
        }
    }

    $i = 0;
    foreach ($wanted as $id) {
        $i++;
        DB::execute("UPDATE $table SET $order_key = $i WHERE $primary = $id");
    }
}
