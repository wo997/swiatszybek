<?php

class DB
{
    // TODO: transactions

    /**
     * @param string $sql !SQL_query
     * @param array $params
     */
    public static function execute($sql, $params = []) // returns nothing; update delete insert purpose 
    {
        return DB::fetchArr($sql, $params, false);
    }

    /**
     * @param string $sql !SQL_query
     * @param array $params
     * @return array !SQL_selected[]
     */
    public static function fetchArr($sql, $params = [], $give_response = true)
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

    /**
     * @param string $sql !SQL_query
     * @param array $params
     * @return array $sql !SQL_selected
     */
    public static function fetchRow($sql, $params = [])
    {
        $res = DB::fetchArr($sql, $params);
        return isset($res[0]) ? $res[0] : [];
    }

    /**
     * @param string $sql !SQL_query
     * @param array $params
     * @return mixed
     */
    public static function fetchVal($sql, $params = [])
    {
        $res = DB::fetchRow($sql, $params);
        return isset(array_keys($res)[0]) ? $res[array_keys($res)[0]] : null;
    }

    /**
     * @param string $sql !SQL_select
     * @param array $params
     * @return array
     */
    public static function fetchCol($sql, $params = [])
    {
        $res = DB::fetchArr($sql, $params);
        if (!isset($res[0]) || !isset(array_keys($res[0])[0])) return [];
        return array_column($res, array_keys($res[0])[0]);
    }

    public static function lastInsertedId()
    {
        global $con;
        return mysqli_insert_id($con);
    }

    /**
     * escapes SQL param
     *
     * @param  mixed $var
     * @param  mixed $quote
     * @return void
     */
    public static function escape($var, $quote = true)
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
}
