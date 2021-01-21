<?php

class DB
{
    private static $con;

    /**
     * @param string $sql !SQL_query
     * @param array $params
     */
    public static function connect($db_server, $db_user, $db_pass, $db_name) // returns nothing; update delete insert purpose 
    {
        self::$con = new mysqli($db_server, $db_user, $db_pass, $db_name) or die("Failed to connect to MySQL: " . mysqli_connect_error());
        self::$con->set_charset("utf8mb4");
    }

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
        try {
            // TODO: apply table prefixes with sql string replace, might never happen but in emergency u can try
            // way more effortless comparing to other solutions, we dont want a developer to die typing these.
            // for example:
            // 'FROM ' => 'FROM $prefix_'
            // 'JOIN ' => 'JOIN $prefix_'
            $stmt = self::$con->prepare($sql);
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

    public static function insertedId()
    {
        return mysqli_insert_id(self::$con);
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
        if (!preg_match("/\D/", $var)) {
            $ret = intval($var);
        } else {
            $ret = mysqli_real_escape_string(self::$con, $var);
        }
        if ($quote) {
            $ret = "'$ret'";
        }
        return $ret;
    }

    /**
     * @typedef DBTableColumn {
     * name: string column name
     * type: string
     * index?: (primary|index|unique)
     * increment?: boolean use with primary key
     * null?: boolean
     * default?: string
     * previous_name?: string use if you want to replace an old column in DB
     * }
     */

    /**
     * checks whether table exists in db
     *
     * @param  string $name
     * @return bool
     */
    public static function tableExists($name)
    {
        return DB::fetchVal("show tables like '" . clean($name) . "'");
    }

    /**
     * checks whether column exists in db
     *
     * @param  string $table
     * @param  string $name
     * @return bool
     */
    public static function columnExists($table, $name)
    {
        if (!DB::tableExists($table)) return null;
        if (DB::fetchVal("SHOW COLUMNS FROM " . clean($table) . " LIKE '" . clean($name) . "'")) return true;
        return false;
    }

    /**
     * - table: string
     * - names: []
     *
     * @param  string $table
     * @param  array $names
     * @return void
     */
    public static function dropColumns($table, $columns)
    {
        foreach ($columns as $column) {
            if (DB::columnExists($table, $column)) {
                DB::execute("ALTER TABLE " . clean($table) . " DROP COLUMN " . clean($column));

                echo "🗑️ Column '$column' dropped from $table! <br>";
            }
        }
    }

    /**
     *
     * @param  string $table
     * @param  array $names
     * @return void
     */
    public static function dropTable($table)
    {
        if (DB::tableExists($table)) {
            DB::execute("DROP TABLE " . clean($table));
            echo "🗑️ Table '$table' dropped! <br>";
        }
    }

    public static function getColumnDefinition($column, $keys = true)
    {
        $definition = clean($column["name"])
            . " " . $column["type"]
            . ($column["null"] ? "" : " NOT NULL");

        if (isset($column["default"])) {
            $definition .= " DEFAULT " . $column["default"];
        } else if (isset($column["default_string"])) {
            $definition .= " DEFAULT " . DB::escape($column["default_string"]);
        }

        if (!$keys) {
            return $definition;
        }

        if (isset($column["index"])) {
            if ($column["index"] == "primary") {
                $definition .= " PRIMARY KEY";
            } else if ($column["index"] == "unique") {
                $definition .= " UNIQUE KEY";
            } else if ($column["index"] == "index") {
                // do it after the table is created
            }

            if (isset($column["increment"])) {
                $definition .= " AUTO_INCREMENT";
            }
        }

        return $definition;
    }

    public static function getIndex($table, $column)
    {
        return DB::fetchRow("SHOW INDEX FROM " . clean($table) . " WHERE Column_name = '" . clean($column) . "'");
    }

    /**
     * - table name
     * - column name (or comma separated names f.e for unique constraint)
     * - index type ["index", "unique", "primary"]
     * 
     * @param  mixed $table
     * @param  mixed $column
     * @param  mixed $type
     * @return void
     */
    public static function addIndex($table, $column, $type = "index")
    {
        $type = strtolower($type);

        $index_types = ["index", "unique", "primary"];
        if (!in_array($type, $index_types)) {
            echo "⚠️ Undefined index type '" . $type . "'!";
        }

        $currentIndex = DB::getIndex($table, $column);

        if ($currentIndex) {
            if ($type == "index") {
                $doDrop = false;
                if ($currentIndex["Non_unique"] && $currentIndex["Key_name"] != "PRIMARY") {
                    return;
                } else {
                    $doDrop = true;
                }
            } else if ($type == "unique") {
                if (!$currentIndex["Non_unique"] && $currentIndex["Key_name"] != "PRIMARY") {
                    return;
                } else {
                    $doDrop = true;
                }
            } else if ($type == "primary") {
                if (!$currentIndex["Non_unique"] && $currentIndex["Key_name"] == "PRIMARY") {
                    return;
                } else {
                    $doDrop = true;
                }
            }
            if ($doDrop) {
                DB::dropIndex($table, $currentIndex["Key_name"]);
            }
        }

        if ($type == "index") {
            DB::execute("ALTER TABLE " . clean($table) . " ADD INDEX (" . clean($column) . ")");
            echo "➕ INDEX '$column' added to '$table<br>";
        } else if ($type == "unique") {
            DB::execute("ALTER TABLE " . clean($table) . " ADD CONSTRAINT " . clean($column) . " UNIQUE (" . clean($column) . ")");
            echo "➕ UNIQUE '$column' added to '$table<br>";
        } else if ($type == "primary") {
            DB::execute("ALTER TABLE " . clean($table) . " ADD PRIMARY KEY (" . clean($column) . ")");
            echo "➕ PRIMARY key '$column' added to '$table<br>";
        }
    }

    public static function dropIndex($table, $column)
    {
        $index = DB::getIndex($table, $column);
        if ($index) {
            DB::dropIndexByName($table, $index["Key_name"]);
        }
    }

    public static function dropIndexByName($table, $key_name)
    {
        try {
            if ($key_name == "PRIMARY") {
                DB::execute("ALTER TABLE " . clean($table) . " DROP PRIMARY KEY");
                echo "🗑️ PRIMARY KEY dropped from '$table<br>";
            } else {
                DB::execute("ALTER TABLE " . clean($table) . " DROP INDEX " . clean($key_name));
                echo "🗑️ Key '$key_name' dropped from '$table<br>";
            }
        } catch (Exception $e) {
        }
    }

    /**
     * Create table in DB with specified columns allowing to modify the table if necessary
     * parameter details in function DB::manageTableColumns($table, $columns)
     * @param  string $table
     * @param DBTableColumn[] $columns
     * @return void
     */
    public static function createTable($table, $columns)
    {
        if (!DB::tableExists($table)) {
            $sql = "CREATE TABLE $table (";

            foreach ($columns as $column) {
                $column["null"] = def($column, "null", false);
                $column["type"] = strtoupper($column["type"]);

                $definition = DB::getColumnDefinition($column);

                $sql .= $definition . ",";
            }

            $sql = rtrim($sql, ",");
            $sql .= ")";

            DB::execute($sql);

            echo "➕ Table '$table' created<br>";
        }

        DB::manageTableColumns($table, $columns); // do your job ;)
        return;
    }

    /**
     * Add columns to the database or modify existing ones if they differ
     * Provide columns defined by
     * - name *required*
     * - type (f.e int) *required*
     * - previous_name (rename old field)
     * - null (boolean, default false - no nulls allowed)
     * - default / default_string (f.e 0)
     * - index: [primary, unique]
     * - increment: bool
     *
     * @param  string $table
     * @param array<array> $columns
     * @return void
     */
    public static function manageTableColumns($table, $columns)
    {
        foreach ($columns as $column) {
            $column["null"] = def($column, "null", false);
            $column["type"] = strtoupper($column["type"]);

            $columnExists = DB::columnExists($table, $column["name"]);

            $isNew = false;
            $modify = false;

            if (isset($column["previous_name"]) && $column["previous_name"] !== $column["name"]) {
                $differentNameColumnExists = DB::columnExists($table, $column["previous_name"]);

                if ($differentNameColumnExists && $columnExists) {
                    echo "⚠️ Migration error, tried to change column from '" . $column["previous_name"] . "' to '" . $column["name"] . "' but '" . $column["name"] . "' already exists in '" . $table . "'!<br>";
                    continue;
                }

                if ($differentNameColumnExists) {
                    $columnExists = true;
                    $modify = true;
                } else {
                    $column["previous_name"] = $column["name"];
                }
            }

            $column["previous_name"] = def($column, "previous_name", $column["name"]);

            if (!$modify && !$columnExists) {
                $isNew = true;
            } else { // compare new column with already existing one
                foreach (DB::fetchArr("DESC " . clean($table)) as $existing_column) {
                    // early escape if names are different
                    if ($existing_column["Field"] != $column["previous_name"]) {
                        continue;
                    }

                    if ($existing_column["Key"] === "PRI" xor in_array(def($column, "index"), ["primary", "unique"])) {
                        $modify = true;
                        break;
                    }

                    // compare nulls
                    if ($existing_column["Null"] != ($column["null"] ? "YES" : "NO")) {
                        $modify = true;
                        break;
                    }

                    // compare defaults
                    if (isset($column["default"]) && $existing_column["Default"] !== $column["default"]) {
                        $modify = true;
                        break;
                    }
                    if (isset($column["default_string"]) && $existing_column["Default"] !== $column["default_string"]) {
                        $modify = true;
                        break;
                    }
                    if (!isset($column["default_string"]) && !isset($column["default"]) && $existing_column["Default"] !== null) {
                        $modify = true;
                        break;
                    }
                    if (isset($column["increment"]) xor $existing_column["Extra"] == "auto_increment") {
                        $def = DB::getColumnDefinition($column, false);
                        $def = str_replace($column["name"], $column["previous_name"], str_replace("AUTO_INCREMENT", "", $def));
                        DB::execute("ALTER TABLE " . clean($table) . " CHANGE " . $column["previous_name"] . " " . $def);
                        DB::dropIndex($table, $column["name"]);
                        $modify = true;
                        break;
                    }

                    // compare types literally only when new type contains any digit meaning that digits in general are limited, kind of hacky
                    $existing_column["Type"] = strtoupper($existing_column["Type"]);

                    if (preg_replace("/\D/", "", $column["type"]) === "") { // no digits
                        if (preg_replace("/[^A-Z]/", "", $existing_column["Type"]) != preg_replace("/[^A-Z]/", "", $column["type"])) { // no digit comparision
                            $modify = true;
                            break;
                        }
                    } else {
                        if ($existing_column["Type"] != $column["type"]) { // literal comparision
                            $modify = true;
                            break;
                        }
                    }
                }
            }

            $definition = DB::getColumnDefinition($column);

            if ($modify) {
                DB::execute("ALTER TABLE " . clean($table) . " CHANGE " . $column["previous_name"] . " " . $definition);
                echo "🔄 Column '" . $column["name"] . "' modified in $table<br>";
            } else if ($isNew) {
                DB::execute("ALTER TABLE " . clean($table) . " ADD " . $definition);
                echo "➕ Column '" . $column["name"] . "' added into $table<br>";
            }
        }

        // do it after the table is created
        foreach ($columns as $column) {
            if (def($column, "index") == "index") {
                DB::addIndex($table, $column["name"], "index");
            }
        }
    }

    public static function getForeignKey($table_1, $field_1, $table_2, $field_2 = null)
    {
        if ($field_2 === null) {
            $field_2 = $field_1;
        }

        $table_1 = clean($table_1);
        $field_1 = clean($field_1);
        $table_2 = clean($table_2);
        $field_2 = clean($field_2);

        $sql = <<<SQL
        SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '$table_1' AND COLUMN_NAME = '$field_1'
        AND REFERENCED_TABLE_NAME = '$table_2' AND REFERENCED_COLUMN_NAME = '$field_2'
SQL;
        return DB::fetchRow($sql);
    }

    public static function addForeignKey($table_1, $field_1, $table_2, $field_2 = null)
    {
        if ($field_2 === null) {
            $field_2 = $field_1;
        }

        $table_1 = clean($table_1);
        $field_1 = clean($field_1);
        $table_2 = clean($table_2);
        $field_2 = clean($field_2);

        if (DB::getForeignKey($table_1, $field_1, $table_2, $field_2)) {
            return;
        }
        // TODO: on delete set null etc.
        $sql = <<<SQL
        ALTER TABLE $table_1
        ADD FOREIGN KEY ($field_1)
        REFERENCES $table_2($field_2)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
SQL;
        DB::execute($sql);
        echo "🔗 Added foreign key from $table_1($field_1) to $table_2($field_2)<br>";
    }

    public static function dropForeignKey($table_1, $field_1, $table_2, $field_2 = null)
    {
        if ($field_2 === null) {
            $field_2 = $field_1;
        }

        $table_1 = clean($table_1);
        $field_1 = clean($field_1);
        $table_2 = clean($table_2);
        $field_2 = clean($field_2);

        $key = DB::getForeignKey($table_1, $field_1, $table_2, $field_2);
        if (!$key) {
            return;
        }

        DB::execute("ALTER TABLE $table_1 DROP FOREIGN KEY " . $key["CONSTRAINT_NAME"]);
        echo "🗑️ Added foreign key from $table_1($field_1) to $table_2($field_2)<br>";
    }

    public static function beginTransaction()
    {
        self::$con->begin_transaction();
    }

    public static function commitTransaction()
    {
        self::$con->commit();
    }

    public static function rollbackTransation()
    {
        self::$con->rollback();
    }
}
