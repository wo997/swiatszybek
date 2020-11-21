<?php

function query($sql, $params = []) // returns nothing; update delete insert purpose 
{
    return fetchArray($sql, $params, false);
}

function fetchArray($sql, $params = [], $give_response = true)
{
    global $con;

    try {
        // TODO: apply table prefixes with sql string replace, might never happen but in emergency u can try
        // way more effortless comparing to other solutions, we dont want a developer to die typing these.
        // for example:
        // 'FROM ' => 'FROM $prefix_'
        // 'JOIN ' => 'JOIN $prefix_'
        $stmt = $con->prepare($sql);
        $paramCount = count($params);
        if ($paramCount) {
            $stmt->bind_param(str_repeat("s", $paramCount), ...$params);
        }

        if (!$give_response) {
            $res = $stmt->execute();
        } else {
            $stmt->execute();
            $res = $stmt->get_result()->fetch_all(1);
        }
        $stmt->close();
    } catch (Exception $e) {
        echo "SQL EXCEPTION:<br>$sql<br>[" . join(",", $params) . "]<br>";
        die($e);
    }
    return $res;
}


function fetchRow($sql, $params = [])
{
    $res = fetchArray($sql, $params);
    return isset($res[0]) ? $res[0] : [];
}

function fetchValue($sql, $params = [])
{
    $res = fetchRow($sql, $params);
    return isset(array_keys($res)[0]) ? $res[array_keys($res)[0]] : null;
}

function fetchColumn($sql, $params = [])
{
    $res = fetchArray($sql, $params);
    if (!isset($res[0]) || !isset(array_keys($res[0])[0])) return [];
    return array_column($res, array_keys($res[0])[0]);
}



function getLastInsertedId()
{
    global $con;
    return mysqli_insert_id($con);
}

/**
 * removes everything except  (a-z) (A-Z) (0-9) "_" " " "," "."
 *
 * @param  string $x
 * @return string
 */
function clean($x)
{
    // TODO: try this for xml escaping maybe?
    //$str = htmlentities($str,ENT_QUOTES,'UTF-8');
    return preg_replace("/[^a-zA-Z0-9_ ,.]/", "", $x);
}

function escapeSQL($var, $quote = true)
{
    global $con;
    if (!preg_match("/\D/", $var)) {
        $ret = intval($var);
    } else {
        $ret = mysqli_real_escape_string($con, $var);
    }
    if ($quote) {
        $ret = "'$ret'";
    }
    return $ret;
}
