<?php

function getSearchQuery($data)
{
    $main_search_fields = $data["main_search_fields"];
    $search_type = def($data, "search_type", "regular");

    if (!$main_search_fields) {
        return "";
    }
    $main_search_value = trim($data["main_search_value"]);
    $main_search_value = preg_replace("/\s{2,}/", " ", $main_search_value);

    $words = explode(" ", $main_search_value);

    if ($search_type == "extended") {
        return getRelevanceQuery($main_search_fields, $words);
    } else {
        return getRegularSearchQuery($main_search_fields, $words);
    }
}

function getRegularSearchQuery($fields, $words)
{
    $query = "";
    $counter = 0;
    foreach ($words as $word) {
        $counter++;
        if ($counter > 4) {
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
        $counter++;
        if ($counter > 4) {
            break;
        }

        $len = strlen($word);

        $letter_groups = [];

        if ($len > 5) {
            $letter_groups[substr($word, 0, -2) . "%"] = 15 * $len;
        } else if ($len > 4) {
            $letter_groups[substr($word, 0, -1) . "%"] = 15 * $len;
        } else {
            $letter_groups[$word . "%"] = 15 * $len;
        }

        for ($i = 0; $i < $len - 2; $i++) {
            $letter_groups[substr($word, $i, 3)] = 4;
            $letter_groups[substr($word, $i, 1) . "_" . substr($word, $i + 1, 2)] = 2;
            $letter_groups[substr($word, $i, 2) . "_" . substr($word, $i + 2, 1)] = 2;
        }

        for ($i = 0; $i < $len - 3; $i++) {
            $letter_groups[substr($word, $i, 1) . "_" . substr($word, $i + 2, 2)] = 2;
            $letter_groups[substr($word, $i, 2) . "_" . substr($word, $i + 3, 1)] = 2;
            $letter_groups[substr($word, $i, 1) . substr($word, $i + 2, 2)] = 2;
            $letter_groups[substr($word, $i, 2) . substr($word, $i + 3, 1)] = 2;
        }

        foreach ($letter_groups as $letter_group => $points) {
            $letter_group = DB::escape($letter_group, false);

            foreach ($fields as $field) {
                if (!$first) {
                    $query .= " + ";
                }
                if (strrpos($letter_group, "%") !== 0) {
                    $letter_group = "%$letter_group%";
                }
                $query .= "CASE WHEN $field LIKE '$letter_group' THEN $points ELSE 0 END";

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
 * main_search?: string
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
 * main_search_fields?: array
 * renderers?: array
 * datatable_params?: DatatableParams
 * }
 */

/**
 * paginateData
 *
 * @param  PaginationParams $params
 * @return void
 */
function paginateData($params = [])
{
    /*
    required POSTS:
    - search (+search_type)
    - rowCount
    - pageNumber
    - primary

    params:
    - select
    - from
    - where
    - filters
    - order
    - main_search_fields

    optional params:
    - renderers
    - raw (return array instead of json)

    optional POSTS:
    - sort
     */

    $rowCount = isset($_POST['rowCount']) ? intval($_POST['rowCount']) : 20;
    $pageNumber = isset($_POST['pageNumber']) ? intval($_POST['pageNumber']) : 0;
    $pageIndex = $pageNumber - 1; // start from 0
    if ($pageIndex < 0) {
        $pageIndex = 0;
    }

    $bottomIndex = $pageIndex * $rowCount;

    $select = $params["select"];

    $from = $params["from"];

    $where = def($params, "where");

    if (trim($where) == "") {
        $where = "1";
    }

    $filters = def($_POST, "filters");
    if ($filters) {
        $filters = json_decode($filters, true);
        foreach ($filters as $filter) {
            $where .= getFilterCondition($filter["field"], $filter["type"], $filter["value"]);
        }
    }

    $main_search_value = def($params, "search", def($_POST, 'search'));
    $main_search_fields = def($params, "main_search_fields", []);
    $search_type = def($params, "search_type", "regular");

    $search_query = getSearchQuery([
        "main_search_value" => $main_search_value,
        "main_search_fields" => $main_search_fields,
        "search_type" => $search_type,
    ]);

    if ($search_query) {
        if ($search_type == "extended") {
            $where .= " AND $search_query > 1";
        } else {
            $where .= $search_query;
        }
    }

    $group = isset($params["group"]) ? ("GROUP BY " . $params["group"]) : "";

    $order = def($params, ["datatable_params", "order"], "");

    if ($search_type == "extended") {
        if ($order) {
            [$order_key, $order_dir] = explode(" ", $order);

            $test_order_key = $order_key == "RAND()" ? "1" : $order_key;

            $frmq = "$from WHERE $where $group";
            if ($group) {
                $frmq = "(SELECT $order_key, " . join(",", $main_search_fields) . " FROM $frmq) t";
            }
            $order_info = DB::fetchRow("SELECT MAX($test_order_key) as order_max, MIN($test_order_key) as order_min, MAX($search_query) as relevance_max FROM $from WHERE $where");

            $ratio = round(30 * $order_info["relevance_max"] / max(abs($order_info["order_max"] - $order_info["order_min"]), 5)) / 100; // 30 % care about the order key, we want a match right?

            $order = "(SELECT $search_query"
                . ($order_dir == "DESC" ? "+" : "-")
                . " $ratio * $order_key) DESC";
        } else {
            $order = "$search_query DESC";
        }
    }

    $countQuery = "SELECT COUNT(1) FROM $from WHERE $where $group";

    if ($group) {
        $countQuery = "SELECT COUNT(*) FROM($countQuery) t";
    }

    $totalRows = DB::fetchVal($countQuery);
    $pageCount = $rowCount > 0 ? ceil($totalRows / $rowCount) : 0;

    if ($order) {
        $order = "ORDER BY $order";
    }

    $results = DB::fetchArr("SELECT $select FROM $from WHERE $where $group $order LIMIT $bottomIndex,$rowCount");

    $index = 0;
    foreach ($results as &$result) {
        $index++;
        $result["kolejnosc"] = $pageIndex * $rowCount + $index;

        if (isset($params["renderers"])) {
            foreach ($params["renderers"] as $field => $renderer) {
                $result[$field] = $renderer($result);
            }
        }
    }
    unset($result);

    //$pageCount = $pageCount * 4;$results = array_merge($results, $results, $results, $results);

    $responseArray = ["pageCount" => $pageCount, "totalRows" => $totalRows, "results" => $results];

    return isset($params["raw"]) ? $responseArray : json_encode($responseArray);
}

/**
 * Example filters:
 * - 3, include 3
 * - !3, exclude 3
 * - "abc", include "abc"
 * - [1, 2, 3], include 1, 2, 3
 * - !["a", "b", "c"], exclude "a", "b", "c"
 *
 * @param  string $field column name
 * @param  string $filter_string json
 * @return void
 */
function getFilterCondition($field, $type, $filter_value)
{
    $field = clean($field);
    //if (in_array($type, ["=", "!=", "%"])) {

    if ($type == "<>") {
        return " AND $field BETWEEN " . DB::escape($filter_value[0]) . " AND " . DB::escape(changeDate($filter_value[1], "+1 day"));
    }

    if (is_array($filter_value)) {
        if ($filter_value) {
            $list = "";
            foreach ($filter_value as $value) {
                $list .= DB::escape($value) . ",";
            }
            $list = substr($list, 0, -1);
            return " AND $field " . ($type == "!=" ? " NOT IN" : " IN") . "(" . $list . ")";
        } else {
            if ($type == "=") {
                return " AND 0";
            }
            return "";
        }
    }

    if ($type == "%") {
        if (!preg_replace("/[^%]/", "", $filter_value)) {
            return "";
        }
        return " AND $field LIKE " . DB::escape($filter_value);
    }

    if ($type == ">") {
        return " AND $field > " . DB::escape($filter_value);
    }

    if ($type == "<") {
        return " AND $field < " . DB::escape(changeDate($filter_value, "+1 day"));
    }

    return " AND $field " . ($type == "!=" ? "!=" : "=") . DB::escape($filter_value);
}

$requiredFilterTables = [
    "product_categories" => "parent_id",
    "menu" => "parent_id",
    "variant" => "product_id",
    "konfiguracja" => "category",
];

function getRequiredFilterQuery($table, $params = [])
{
    global $requiredFilterTables;
    if (isset($requiredFilterTables[$table])) {
        $column_name = $requiredFilterTables[$table];
        if (!isset($params[$column_name])) {
            return false;
        }

        if (is_integer($params[$column_name])) {
            return "$column_name=" . intval($params[$column_name]);
        }

        return "$column_name=" . DB::escape($params[$column_name]);
    }
    return "1";
}

function rearrangeTable($table, $primary, $itemId = null, $toIndex = null, $params = [])
{
    $where = getRequiredFilterQuery($table, $params);
    if ($where === false) {
        die("Table must be tree view based!");
        return;
    }

    $primary = clean($primary);

    $idList = DB::fetchCol("SELECT $primary FROM $table WHERE $where ORDER BY kolejnosc ASC");
    if ($itemId !== null && $toIndex !== null) {
        $itemId = intval($itemId);
        $fromIndex = array_search($itemId, $idList) + 1;

        $toIndex = intval($toIndex);

        if ($toIndex == $fromIndex) {
            return;
        }

        if ($toIndex > $fromIndex) {
            array_splice($idList, $toIndex, 0, [$itemId]);
            array_splice($idList, $fromIndex - 1, 1);
        } else {
            array_splice($idList, $fromIndex - 1, 1);
            array_splice($idList, $toIndex - 1, 0, [$itemId]);
        }
    }

    $i = 0;
    foreach ($idList as $id) {
        $i++;
        DB::execute("UPDATE $table SET kolejnosc = $i WHERE $primary = $id");
    }
}

function orderTableBeforeListing($table, $primary, $params = [])
{
    $where = getRequiredFilterQuery($table, $params);
    if ($where === false) {
        return;
    }

    if (
        DB::fetchVal("SELECT 1 FROM $table WHERE kolejnosc = 0") || // any new?
        DB::fetchVal("SELECT 1 FROM $table WHERE $where GROUP BY kolejnosc HAVING COUNT(1) > 1") // duplicates
    ) {
        rearrangeTable($table, $primary, null, null, $params);
    }
}
