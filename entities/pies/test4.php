<?php //route[{ADMIN}entity_test]

/*
createTable("pies", [
    ["name" => "pies_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "food", "type" => "INT"],
    ["name" => "food_double", "type" => "INT"],
    ["name" => "ate_at", "type" => "DATETIME", "index" => "index"],
]);

createTable("pies_paw", [
    ["name" => "pies_paw_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "pies_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "TINYTEXT"],
]);
*/

// maybe worth it to have those but still, not necessary by the entity manager, but rather for the dev / extention
$entities = [
    "pies" => [
        "properties" => [
            "food",
            "food_double",
            "ate_at"
        ]
    ],
    "pies_paw" => [
        "properties" => [
            "pies_id",
            "name",
        ]
    ],
];

class EntityObject
{
    private $name;
    private $id_column;
    private $data = []; // row data in DB
    private $fetched = []; // stores info of already fetched relations
    private $curr_data = null; // in case the object existed in DB

    public function __construct($name, &$data)
    {
        // must go first
        $this->name = $name;
        // must go second
        $this->id_column = $this->getEntityIdColumn();

        $obj_curr_id = $this->getIdFromData($data);
        if ($obj_curr_id === -1) {
            $this->setDataFromArray($data);
        } else {
            $this->curr_data = fetchRow("SELECT * FROM " . $name . " WHERE " . $this->id_column . " = " . $obj_curr_id);
            $this->setDataFromArray(def($this->curr_data, []));
            $this->setDataFromArray($data);
        }

        // make sure u have the id no matter if it was in the constructor data or not
        if (!isset($this->data[$this->id_column])) {
            $this->data[$this->id_column] = -1;
        }
    }

    /**
     * saveChildren
     *
     * @param  EntityObjects[] $objs
     * @return void
     */
    public function saveChildren($objs)
    {
        foreach ($objs as $obj) {
            if ($obj instanceof EntityObject) {
                $obj->saveToDB();
            }
        }
    }

    public function saveToDB()
    {
        if ($this->curr_data) {
            $update_data = [];
            foreach ($this->data as $key => $value) {
                if ($key === $this->id_column) {
                    continue;
                }
                if (is_array($value)) {
                    $this->saveChildren($value);
                    continue;
                }
                if ($this->curr_data[$key] === $value) {
                    continue;
                }

                $update_data[$key] = $value;
            }

            if (!empty($update_data)) {
                // update
                $query = "UPDATE " . $this->name . " SET ";
                foreach (array_keys($update_data) as $field) {
                    $query .= clean($field) . "=?,";
                }
                $query = rtrim($query, ",");
                $query .= " WHERE " . $this->id_column . "=" . intval($this->data[$this->id_column]);
                var_dump($query, array_values($update_data));
                //query($query, array_values($update_data));
                //return true;
            }
        } else {
            $insert_data = [];
            foreach ($this->data as $key => $value) {
                if ($key === $this->id_column) {
                    continue;
                }
                if (is_array($value)) {
                    $this->saveChildren($value);
                    continue;
                }
                $insert_data[$key] = $value;
            }

            $keys_query = "";
            foreach (array_keys($insert_data) as $field) {
                $keys_query .= clean($field) . ",";
            }
            $keys_query = rtrim($keys_query, ",");
            $values_query = rtrim(str_repeat("?,", count($insert_data)), ",");

            $query = "INSERT INTO " . clean($this->name) . "($keys_query) VALUES($values_query)";

            var_dump($query, array_values($insert_data));
            //query($query, array_values($insert_data));
            //$entity_id = getLastInsertedId();
            //return $entity_id;
        }
    }

    public function setData($var, $val, $quiet = false)
    {
        if ($var === $this->id_column && $this->getId() !== -1) {
            // set id once, ezy
            return;
        }

        if ($quiet === false) {
            $setter = "SET_" . $this->name . "_" . $var;
            if (function_exists($setter)) {
                $res = call_user_func($setter, $this, $val);
                if ($res) { // handle errors maybe?
                    $val = $res;
                }
            } else if (is_array($val)) { // nah
                return;
            }
        }

        $this->data[$var] = $val;
    }

    public function setDataFromArray($arr)
    {
        foreach ($arr as $var => $val) {
            $this->setData($var, $val);
        }
    }

    public function getData($var)
    {
        if ($this->shouldFetch($var)) {
            $getter = "GET_" . $this->name . "_" . $var;
            if (function_exists($getter)) {
                $res = call_user_func($getter, $this);
                if ($res !== null) {
                    return $res;
                }
            }
        }
        return def($this->data, $var, null);
    }

    public function shouldFetch($var)
    {
        if (in_array($var, $this->fetched)) {
            return false;
        }

        $this->fetched[] = $var;
        return true;
    }

    /*public function addChildren(EntityObject $obj)
    {
        $this->children[] = $obj;
    }*/


    private function getEntityIdColumn()
    {
        return $this->name . "_id";
    }

    public function getId()
    {
        return $this->getIdFromData($this->data);
    }

    public function getIdFromData(&$data)
    {
        return intval(def($data, $this->id_column, -1));
    }
}

// imagine it's another file start
// function SET_pies_pies_id(EntityObject $obj, $data) // if u don't add it it's completely fine!, it's assumed as default
// {
//     $obj->setData("pies_id", $data, true);
// }
function SET_pies_food(EntityObject $obj, $data)
{
    // other actions
    $obj->setData("food_double", 2 * $data);

    // modify value itself, what about errors tho?
    //return $data;
}

/*function SET_pies_food_double(EntityObject $obj)
{
    $obj->setData("food_double", 2 * $obj->getData("food"), false);
}*/

function SET_pies_paws(EntityObject $obj, $data)
{
    /** @var EntityObject[] */
    $obj_paws = def($obj->getData("paws"), []);

    foreach ($data as $paw_data) {
        if ($paw_data instanceof EntityObject) {
            return;
        }

        $pies_paw_id = intval(def($paw_data, "pies_paw_id", -1));
        if ($pies_paw_id === -1) {
            $paw = new EntityObject("pies_paw", $paw_data);
            $obj_paws[] = $paw;
        } else {
            foreach ($obj_paws as &$obj_paw) {
                if ($obj_paw->getId() === $pies_paw_id) {
                    $obj_paw->setDataFromArray($paw_data);
                }
            }
            unset($obj_paw);
        }
    }
    return $obj_paws;
}

function GET_pies_paws(EntityObject $obj)
{
    $var = "paws";

    if (!isset($obj->data[$var])) {
        $obj->setData($var, []);
    }
    $paws = [];
    $paws_data = fetchArray("SELECT * FROM pies_paw WHERE pies_id = " . intval($obj->getData("pies_id")));
    foreach ($paws_data as $paw_data) {
        $paws[] = new EntityObject("pies_paw", $paw_data);
    }
    $obj->setData($var, $paws, true);
    return $paws;
}
// imagine it's another file end

/*function createEntityObject($entity_name, $data)
{
    $obj = new EntityObject();
    $obj->name = $entity_name;

    foreach ($data as $key => $value) {
        $function = "SET_" . ucfirst($entity_name) . "_" . ucfirst($key);
        if (function_exists($function)) {
            call_user_func($function, ...[$obj, $value]);
        }
    }

    return $obj;
}*/

$data = [
    "pies_id" => 20,
    "food" => 666,
    "paws" => [
        [
            "pies_paw_id" => 8, // change
            "name" => "changed name"
        ],
        [
            "pies_paw_id" => -1, // create
            "name" => "created"
        ],
    ]
];

$pies = new EntityObject("pies", $data);

//var_dump($pies);

$pies->saveToDB();


// function getEntityById($entity_name, $entity_id = -1, &$data = [])
// {
//     $id_column = getEntityIdColumn($entity_name);
//     if ($entity_id !== -1) {
//         $data = fetchRow("SELECT * FROM $entity_name WHERE $id_column = " . intval($entity_id));
//     }
//     createEntityObject($data);
//     return $data;
// }

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

// function combineEntityData(&$data, $key, $new_data)
// {
//     $data[$key] = array_merge($data[$key], $new_data);
// }

// !!! event for managing pies:
// function pies_listen(&$data)
// {
//     //var_dump(def($data, "paws", []));
//     if ($data["food"] < 0) {
//         return ["error" => "Cannot set food to a negative number"];
//     }

//     foreach (getPiesPaws($data) as $paw_data) {
//         $paw_data["pies_id"] = $data["pies_id"];
//         $response = manageEntity("pies_paw", $paw_data);
//         if ($error = def($response, "error")) {
//             return ["error" => $error];
//         }
//     }
//     return ["success" => true];
// }

// function manageEntity($entity_name, &$data)
// {
//     try {
//         //var_dump($entity_name, $data);

//         $id_column = getEntityIdColumn($entity_name);
//         if (!isset($data[$id_column])) {
//             return ["error" => "No $id_column found in " . json_encode($data)];
//         }

//         $entity_id = $data[$id_column];
//         if ($entity_id === -1) {
//             query("INSERT INTO $entity_name () VALUES ()");
//             // deleting might be necessary in that case
//             $entity_id = getLastInsertedId();
//             $data[$id_column] = $entity_id;
//         } else {
//             $data = array_merge(query("SELECT * FROM $entity_name"), $data);
//         }

//         if ($entity_name === "pies") {
//             $response = pies_listen($data);
//             if ($error = def($response, "error")) {
//                 return ["error" => $error];
//             }
//         }

//         $update_data = [];
//         foreach ($data as $key => $value) {
//             // _fetched is an array so it own't be included
//             if (!is_array($value)) {
//                 $update_data[$key] = $value;
//             }
//         }

//         $query = "UPDATE " . clean($entity_name) . " SET ";
//         foreach (array_keys($update_data) as $field) {
//             $query .= clean($field) . "=?,";
//         }
//         $query = rtrim($query, ",");
//         $query .= " WHERE " . clean($id_column) . "=" . intval($entity_id);
//         query($query, array_values($update_data));

//         return ["success" => true];
//     } catch (Exception $e) {
//         var_dump($e);
//         // here u might wanna delete shit
//     }
// }
