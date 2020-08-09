<?php

function getSearchQuery($data = null)
{
    $query = "";

    $main_search_value = trim($data["main_search_value"]);
    $main_search_value = preg_replace("/\s{2}/", " ", $main_search_value);

    $words = explode(" ", $main_search_value);

    $counter = 0;
    foreach ($words as $word) {
        $counter++;
        if ($counter > 4) break;

        $word = escapeSQL($word);
        if (!$word) {
            continue;
        }

        $query .= " AND (";
        $first = true;
        foreach ($data["main_search_fields"] as $field) {
            if (!$first) $query .= " OR";
            $query .= " $field LIKE '%$word%'";
            $first = false;
        }
        $query .= ")";
    }

    return $query;
}

function getTableData($data = null)
{
    /*
    required POSTS:
    - search
    - rowCount
    - pageNumber

    params: 
    - select
    - from
    - where
    - order
    - main_search_fields

    optional params:
    - renderers
    - raw (return array)
  */

    $rowCount = isset($_POST['rowCount']) ? intval($_POST['rowCount']) : 20;
    $pageNumber = isset($_POST['pageNumber']) ? intval($_POST['pageNumber']) : 0;
    if ($pageNumber < 0) $pageNumber = 0;
    $bottomIndex = $pageNumber * $rowCount;

    $select = isset($data["select"]) ? $data["select"] : "";

    $from = isset($data["from"]) ? $data["from"] : "";

    $where = isset($data["where"]) ? $data["where"] : "";
    if (trim($where) == "") $where = "1";

    $where .= getSearchQuery([
        "main_search_value" => isset($_POST['search']) ? $_POST['search'] : "",
        "main_search_fields" => isset($data["main_search_fields"]) ? $data["main_search_fields"] : []
    ]);

    $group = isset($data["group"]) ? ("GROUP BY " . $data["group"]) : "";

    $order = isset($data["order"]) ? $data["order"] : "";


    $countQuery = "SELECT COUNT(1) FROM $from WHERE $where $group";

    if ($group) {
        $countQuery = "SELECT COUNT(*) FROM($countQuery) t";
    }

    //var_dump($countQuery);die;

    $totalRows = fetchValue($countQuery);
    $pageCount = $rowCount > 0 ? ceil($totalRows / $rowCount) : 0;

    $results = fetchArray("SELECT $select FROM $from WHERE $where $group ORDER BY $order LIMIT $bottomIndex,$rowCount");

    $index = 0;
    foreach ($results as &$result) {
        $index++;
        $result["kolejnosc"] = $pageNumber * $rowCount + $index;

        if (isset($data["renderers"])) {
            foreach ($data["renderers"] as $field => $renderer) {
                $result[$field] = $renderer($result);
            }
        }
    }
    unset($result);
    $results = array_merge($results, $results);
    $results = array_merge($results, $results);
    $results = array_merge($results, $results);
    $results = array_merge($results, $results);
    $responseArray = ["pageCount" => 16 * $pageCount, "totalRows" => 16 * $totalRows, "results" => $results];

    return isset($data["raw"]) ? $responseArray : json_encode($responseArray);
}

function getListCondition($field, $filter)
{
    $not = substr($filter, 0, 1) === "!" ? "NOT" : "";
    $id_list = preg_replace("/[^\d,]/", "", $filter);
    if ($id_list) return " AND $field $not IN (" . $id_list . ")";
    return " AND $not 0";
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
        return "$column_name='" . escapeSQL($params[$column_name]) . "'";
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
