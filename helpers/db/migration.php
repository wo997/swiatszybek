<?php

/**
 * checks whether table exists in db
 *
 * @param  string $name
 * @return bool
 */
function tableExists($name)
{
    return fetchValue("show tables like '" . clean($name) . "'");
}

/**
 * checks whether column exists in db
 *
 * @param  string $table
 * @param  string $name
 * @return bool
 */
function columnExists($table, $name)
{
    if (!tableExists($table)) return null;
    if (fetchValue("SHOW COLUMNS FROM " . clean($table) . " LIKE '" . clean($name) . "'")) return true;
    return false;
}

/**
 *
 * @param  string $table
 * @param  array $names
 * @return void
 */
function dropColumns($table, $names)
{
    foreach ($names as $name) {
        if (columnExists($table, $name)) {
            query("ALTER TABLE " . clean($table) . " DROP COLUMN " . clean($name));

            echo "🗑️ Column '$name' dropped from $table! <br>";
        }
    }
}

/**
 *
 * @param  string $table
 * @param  array $names
 * @return void
 */
function dropTable($table)
{
    if (tableExists($table)) {
        query("DROP TABLE " . clean($table));
        echo "🗑️ Table '$table' dropped! <br>";
    }
}

function getColumnDefinition($column, $keys = true)
{
    $definition = clean($column["name"])
        . " " . $column["type"]
        . ($column["null"] ? "" : " NOT NULL");

    if (isset($column["default"])) {
        $definition .= " DEFAULT " . $column["default"];
    } else if (isset($column["default_string"])) {
        $definition .= " DEFAULT " . escapeSQL($column["default_string"]);
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

function getIndex($table, $column)
{
    return fetchRow("SHOW INDEX FROM " . clean($table) . " WHERE Column_name = '" . clean($column) . "'");
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
function addIndex($table, $column, $type = "index")
{
    $type = strtolower($type);

    $index_types = ["index", "unique", "primary"];
    if (!in_array($type, $index_types)) {
        echo "⚠️ Undefined index type '" . $type . "'!";
    }

    $currentIndex = getIndex($table, $column);

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
            dropIndex($table, $currentIndex["Key_name"]);
        }
    }

    if ($type == "index") {
        query("ALTER TABLE " . clean($table) . " ADD INDEX (" . clean($column) . ")");
        echo "➕ INDEX '$column' added to '$table<br>";
    } else if ($type == "unique") {
        query("ALTER TABLE " . clean($table) . " ADD CONSTRAINT " . clean($column) . " UNIQUE (" . clean($column) . ")");
        echo "➕ UNIQUE '$column' added to '$table<br>";
    } else if ($type == "primary") {
        query("ALTER TABLE " . clean($table) . " ADD PRIMARY KEY (" . clean($column) . ")");
        echo "➕ PRIMARY key '$column' added to '$table<br>";
    }
}

function dropIndex($table, $column)
{
    $index = getIndex($table, $column);
    if ($index) {
        dropIndexByName($table, $index["Key_name"]);
    }
}

function dropIndexByName($table, $key_name)
{
    try {
        if ($key_name == "PRIMARY") {
            query("ALTER TABLE " . clean($table) . " DROP PRIMARY KEY");
            echo "🗑️ PRIMARY KEY dropped from '$table<br>";
        } else {
            query("ALTER TABLE " . clean($table) . " DROP INDEX " . clean($key_name));
            echo "🗑️ Key '$key_name' dropped from '$table<br>";
        }
    } catch (Exception $e) {
    }
}

/**
 * Create table in DB with specified columns allowing to modify the table if necessary
 * parameter details in function alterTable($table, $columns)
 * @param  string $table
 * @param array<array> $columns
 * @return void
 */
function createTable($table, $columns)
{
    if (tableExists($table)) {
        alterTable($table, $columns); // possibly modify columns at this point, totally flexible
        return;
    }

    $sql = "CREATE TABLE $table (";

    foreach ($columns as $column) {
        $column["null"] = nonull($column, "null", false);
        $column["type"] = strtoupper($column["type"]);

        $definition = getColumnDefinition($column);

        $sql .= $definition . ",";
    }

    $sql = rtrim($sql, ",");
    $sql .= ")";

    query($sql);

    echo "➕ Table '$table' created<br>";
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
function alterTable($table, $columns)
{
    foreach ($columns as $column) {
        $column["null"] = nonull($column, "null", false);
        $column["type"] = strtoupper($column["type"]);

        $columnExists = columnExists($table, $column["name"]);

        $isNew = false;
        $modify = false;

        if (isset($column["previous_name"]) && $column["previous_name"] !== $column["name"]) {
            $differentNameColumnExists = columnExists($table, $column["previous_name"]);

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

        $column["previous_name"] = nonull($column, "previous_name", $column["name"]);

        if (!$modify && !$columnExists) {
            $isNew = true;
        } else { // compare new column with already existing one
            foreach (fetchArray("DESC " . clean($table)) as $existing_column) {
                // early escape if names are different
                if ($existing_column["Field"] != $column["previous_name"]) {
                    continue;
                }

                if ($existing_column["Key"] === "PRI" xor in_array(nonull($column, "index"), ["primary", "unique"])) {
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
                    $def = getColumnDefinition($column, false);
                    $def = str_replace($column["name"], $column["previous_name"], str_replace("AUTO_INCREMENT", "", $def));
                    query("ALTER TABLE " . clean($table) . " CHANGE " . $column["previous_name"] . " " . $def);
                    dropIndex($table, $column["name"]);
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

        $definition = getColumnDefinition($column);

        if ($modify) {
            query("ALTER TABLE " . clean($table) . " CHANGE " . $column["previous_name"] . " " . $definition);
            echo "🔄 Column '" . $column["name"] . "' modified in $table<br>";
        } else if ($isNew) {
            query("ALTER TABLE " . clean($table) . " ADD " . $definition);
            echo "➕ Column '" . $column["name"] . "' added into $table<br>";
        }
    }

    // do it after the table is created
    foreach ($columns as $column) {
        if (nonull($column, "index") == "index") {
            addIndex($table, $column["name"], "index");
        }
    }
}

function getForeignKey($table_1, $field_1, $table_2, $field_2 = null)
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
    return fetchRow($sql);
}

function addForeignKey($table_1, $field_1, $table_2, $field_2 = null)
{
    if ($field_2 === null) {
        $field_2 = $field_1;
    }

    $table_1 = clean($table_1);
    $field_1 = clean($field_1);
    $table_2 = clean($table_2);
    $field_2 = clean($field_2);

    if (getForeignKey($table_1, $field_1, $table_2, $field_2)) {
        return;
    }

    $sql = <<<SQL
        ALTER TABLE $table_1
        ADD FOREIGN KEY ($field_1)
        REFERENCES $table_2($field_2)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
SQL;
    query($sql);
    echo "🔗 Added foreign key from $table_1($field_1) to $table_2($field_2)<br>";
}

function dropForeignKey($table_1, $field_1, $table_2, $field_2 = null)
{
    if ($field_2 === null) {
        $field_2 = $field_1;
    }

    $table_1 = clean($table_1);
    $field_1 = clean($field_1);
    $table_2 = clean($table_2);
    $field_2 = clean($field_2);

    $key = getForeignKey($table_1, $field_1, $table_2, $field_2);
    if (!$key) {
        return;
    }

    query("ALTER TABLE $table_1 DROP FOREIGN KEY " . $key["CONSTRAINT_NAME"]);
    echo "🗑️ Added foreign key from $table_1($field_1) to $table_2($field_2)<br>";
}
