<?php

function getSearchQuery($data = null)
{
    $main_search_fields = $data["main_search_fields"];
    if (!$main_search_fields) {
        return "";
    }
    $main_search_value = trim($data["main_search_value"]);
    $main_search_value = preg_replace("/\s{2,}/", " ", $main_search_value);

    $words = explode(" ", $main_search_value);

    $query = "";
    $counter = 0;
    foreach ($words as $word) {
        $counter++;
        if ($counter > 4) break;

        $word = escapeSQL($word, false);
        if (!$word) {
            continue;
        }

        $query .= " AND (";
        $first = true;
        foreach ($main_search_fields as $field) {
            if (!$first) $query .= " OR";
            $query .= " $field LIKE '%$word%'";
            $first = false;
        }
        $query .= ")";
    }

    return $query;
}

function paginateData($data = null)
{
    /*
    required POSTS:
    - search
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
    if ($pageIndex < 0) $pageIndex = 0;
    $bottomIndex = $pageIndex * $rowCount;

    $select = nonull($data, "select");

    $from = nonull($data, "from");

    $where = nonull($data, "where");

    if (trim($where) == "") $where = "1";

    $filters = nonull($_POST, "filters");
    if ($filters) {
        $filters = json_decode($filters, true);
        foreach ($filters as $filter) {
            $where .= getFilterCondition($filter["field"], $filter["type"], $filter["values"]);
        }
    }

    $where .= getSearchQuery([
        "main_search_value" => nonull($_POST, 'search'),
        "main_search_fields" => nonull($data, "main_search_fields", [])
    ]);

    $group = isset($data["group"]) ? ("GROUP BY " . $data["group"]) : "";

    $order = nonull($data, "order");

    $sort = isset($_POST['sort']) ? clean($_POST['sort']) : null;
    if ($sort) {
        $order = $sort . " " . (strpos($_POST['sort'], "+") !== false ? "ASC" : "DESC");
    }

    $countQuery = "SELECT COUNT(1) FROM $from WHERE $where $group";

    if ($group) {
        $countQuery = "SELECT COUNT(*) FROM($countQuery) t";
    }

    $totalRows = fetchValue($countQuery);
    $pageCount = $rowCount > 0 ? ceil($totalRows / $rowCount) : 0;

    $results = fetchArray("SELECT $select FROM $from WHERE $where $group ORDER BY $order LIMIT $bottomIndex,$rowCount");

    $index = 0;
    foreach ($results as &$result) {
        $index++;
        $result["kolejnosc"] = $pageIndex * $rowCount + $index;

        if (isset($data["renderers"])) {
            foreach ($data["renderers"] as $field => $renderer) {
                $result[$field] = $renderer($result);
            }
        }
    }
    unset($result);

    $responseArray = ["pageCount" => $pageCount, "totalRows" => $totalRows, "results" => $results];

    return isset($data["raw"]) ? $responseArray : json_encode($responseArray);
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
    if (in_array($type, ["=", "!="])) {
        if (is_array($filter_value)) {
            if ($filter_value) {
                $list = "";
                foreach ($filter_value as $value) {
                    $list .= escapeSQL($value) . ",";
                }
                $list = substr($list, 0, -1);
                return " AND $field " . ($type == "!=" ? " NOT IN" : " IN") . "(" . $list . ")";
            } else {
                if ($type == "=") {
                    return " AND 0";
                }
                return "";
            }
        } else {
            return " AND $field " . ($type == "!=" ? "!=" : "=") . escapeSQL($filter_value);
        }
    }
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
        if (!isset($params[$column_name])) return false;
        if (is_integer($params[$column_name])) return "$column_name=" . intval($params[$column_name]);
        return "$column_name=" . escapeSQL($params[$column_name]);
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

    $idList = fetchColumn("SELECT $primary FROM $table WHERE $where ORDER BY kolejnosc ASC");
    if ($itemId !== null && $toIndex !== null) {
        $itemId = intval($itemId);
        $fromIndex = array_search($itemId, $idList) + 1;

        $toIndex = intval($toIndex);

        if ($toIndex == $fromIndex) return;
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
        query("UPDATE $table SET kolejnosc = $i WHERE $primary = $id");
    }
}

function orderTableBeforeListing($table, $primary, $params = [])
{
    $where = getRequiredFilterQuery($table, $params);
    if ($where === false) return;

    if (
        fetchValue("SELECT 1 FROM $table WHERE kolejnosc = 0") || // any new?
        fetchValue("SELECT 1 FROM $table WHERE $where GROUP BY kolejnosc HAVING COUNT(1) > 1") // duplicates
    ) {
        rearrangeTable($table, $primary, null, null, $params);
    }
}
