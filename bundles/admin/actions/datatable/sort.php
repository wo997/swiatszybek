<?php //route[{ADMIN}datatable/sort]

sortTable($_POST["table"], json_decode($_POST["positions"], true), $_POST["order_key"]);

function sortTable($table, $positions, $order_key = "pos", $where = "1")
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
