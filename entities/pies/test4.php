<?php //route[{ADMIN}entity_test]

// imagine it's another file start
function setPiesPies_id(&$obj, $data)
{
    $obj["pies_id"] = $data;
}
function setPiesFood(&$obj, $data)
{
    $obj["food"] = $data;

    $paws = getPiesPaws($obj);
    var_dump($paws);
    $obj["food"] += count($paws);
}
function setPiesPaws(&$obj, $data)
{
    $obj["paws"] = $data;
    /*foreach ($data as $paw) {
        createEntityObject("pies_paw", $paw);
    }
    $obj["paws"] = $data;*/
}
function getPiesPaws(&$obj)
{
    if (!isset($obj["pies_id"])) {
        return ["error" => "No ID"];
    }
    $field = "paws";

    if (!isset($obj[$field])) {
        $obj[$field] = [];
    }
    if (!in_array($field, $obj["_fetched"])) {
        $fetched_data = fetchArray("SELECT * FROM pies_paw WHERE pies_id = " . intval($obj["pies_id"]));
        $obj[$field] = array_merge($obj[$field], $fetched_data);
        $obj["_fetched"][] = $field;
    }

    return $obj[$field];
}
// imagine it's another file end

function createEntityObject($entity_name, &$data)
{
    // init obj
    $obj = [];
    $obj["_fetched"] = [];
    //$data["_more_stuff"] = [];

    foreach ($data as $key => $value) {
        $function = "set" . ucfirst($entity_name) . ucfirst($key);
        if (function_exists($function)) {
            call_user_func($function, ...[&$obj, $value]);
        }
    }

    return $obj;
}

$data = [
    "pies_id" => 20,
    "food" => 666,
    "paws" => [
        "pies_paw_id" => 69,
        "name" => "wtf"
    ]
];

$pies = createEntityObject("pies", $data);

var_dump($pies);

echo "x";
die;


// $u = fetchRow("SELECT cat_id, mother, children_json js, pies as piesekx FROM cat");
// $u["cat_id"];

// $u = fetchArray("SELECT dddd, mother, children_json js, pies as piesekx FROM cat");
// $u[0]["cat_id"];
// $u[1]["mother"];

// foreach ($u as $p) {
//     $p["dddd"];
// }

// /**
//  * heyca
//  *
//  * @param  GridData $x
//  * @param  string $y
//  * @return void
//  */
// function heyca($x, $y)
// {
//     $x["x_coords"];
// }
// createTable("product_attribute_values", [
//     ["name" => "", "type" => ""],
//     ["name" => "product_id", "type" => "INT"],
//     ["name" => "attribute_id", "type" => "INT"],
//     ["name" => "numerical_value", "type" => "INT", "null" => true],
//     ["name" => "text_value", "type" => "TEXT", "null" => true],
//     ["name" => "date_value", "type" => "DATE", "null" => true],
// ]);

// $a = fetchArray("select pies from dog", []);
// $a[""]["pies"];


$pies_data = json_decode("{
    \"pies_id\":-1,
    \"food\":1234,
    \"paws\":[
     {\"pies_paw_id\":-1,\"name\":\"elaxu\"},
     {\"pies_paw_id\":-1,\"name\":\"zupkaxu\"}
    ]
   }", true);

$pies = createEntityObject($pies_data);

//var_dump("manage new pies");
//var_Dump(manageEntity("pies", $pies_data));

/*$pies_data_2 = json_decode("{
    \"pies_id\":18,
    \"food\":123
   }", true);*/

// createEntityObject(json_decode("{
//     \"pies_id\":18,
//     \"food\":123,
//     \"paws\":[
//      {\"pies_paw_id\":-1,\"name\":\"ela\"},
//      {\"pies_paw_id\":-1,\"name\":\"zupka\"}
//     ]
//    }", true));

$pies_data_2 = getEntityById("pies", 22);

var_dump($pies_data_2);
var_dump(getPiesPaws($pies_data_2));
var_dump($pies_data_2); // has pies paws

/*function createEntityObject(&$data)
{
    $data["_fetched"] = [];
    return $data;
}*/

function getEntityIdColumn($entity_name)
{
    return $entity_name . "_id";
}

function getEntityById($entity_name, $entity_id = -1, &$data = [])
{
    $id_column = getEntityIdColumn($entity_name);
    if ($entity_id !== -1) {
        $data = fetchRow("SELECT * FROM $entity_name WHERE $id_column = " . intval($entity_id));
    }
    createEntityObject($data);
    return $data;
}

// all functions of that type will act like a singleton, fetch only when necessary, ezy
// remember to use a &reference
// function getPiesPaws(&$data)
// {
//     if (!isset($data["pies_id"])) {
//         return ["error" => "No ID"];
//     }
//     $field = "paws";

//     if (!isset($data[$field])) {
//         $data[$field] = [];
//     }
//     if (!in_array($field, $data["_fetched"])) {
//         $fetched_data = fetchArray("SELECT * FROM pies_paw WHERE pies_id = " . intval($data["pies_id"]));
//         $data[$field] = array_merge($data[$field], $fetched_data);
//         $data["_fetched"][] = $field;
//     }

//     return $data[$field];
// }

function combineEntityData(&$data, $key, $new_data)
{
    $data[$key] = array_merge($data[$key], $new_data);
}

// !!! event for managing pies:
function pies_listen(&$data)
{
    //var_dump(def($data, "paws", []));
    if ($data["food"] < 0) {
        return ["error" => "Cannot set food to a negative number"];
    }

    foreach (getPiesPaws($data) as $paw_data) {
        $paw_data["pies_id"] = $data["pies_id"];
        $response = manageEntity("pies_paw", $paw_data);
        if ($error = def($response, "error")) {
            return ["error" => $error];
        }
    }
    return ["success" => true];
}

function manageEntity($entity_name, &$data)
{
    try {
        //var_dump($entity_name, $data);

        $id_column = getEntityIdColumn($entity_name);
        if (!isset($data[$id_column])) {
            return ["error" => "No $id_column found in " . json_encode($data)];
        }

        $entity_id = $data[$id_column];
        if ($entity_id === -1) {
            query("INSERT INTO $entity_name () VALUES ()");
            // deleting might be necessary in that case
            $entity_id = getLastInsertedId();
            $data[$id_column] = $entity_id;
        } else {
            $data = array_merge(query("SELECT * FROM $entity_name"), $data);
        }

        if ($entity_name === "pies") {
            $response = pies_listen($data);
            if ($error = def($response, "error")) {
                return ["error" => $error];
            }
        }

        $update_data = [];
        foreach ($data as $key => $value) {
            // _fetched is an array so it own't be included
            if (!is_array($value)) {
                $update_data[$key] = $value;
            }
        }

        $query = "UPDATE " . clean($entity_name) . " SET ";
        foreach (array_keys($update_data) as $field) {
            $query .= clean($field) . "=?,";
        }
        $query = rtrim($query, ",");
        $query .= " WHERE " . clean($id_column) . "=" . intval($entity_id);
        query($query, array_values($update_data));

        return ["success" => true];
    } catch (Exception $e) {
        var_dump($e);
        // here u might wanna delete shit
    }
}
