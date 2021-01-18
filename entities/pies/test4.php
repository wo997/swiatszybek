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

$entities = [
    // maybe worth it to have those but still, not necessary by the entity manager, but rather for the dev / extention
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

function createEntityObject($name, $data)
{
    return new EntityObject($name, $data);
}

function getEntityObject($name, $id)
{
    return createEntityObject($name, [getEntityIdColumn($name) => $id]);
}

class EntityObject
{
    private $name;
    private $id_column;
    private $data = []; // row data in DB
    private $fetched = []; // stores info of what relations that were fetched already
    private $curr_data = null; // in case the object existed in DB

    public function __construct($name, &$data)
    {
        // must go first
        $this->name = $name;
        // must go second
        $this->id_column = $this->getIdColumn();

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
    private function saveChildren($objs)
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

    /**
     * Usually used for comparing changes
     *
     * @param  mixed $var
     * @return void
     */
    public function getCurrData($var)
    {
        return def($this->curr_data, $var, null);
    }

    private function shouldFetch($var)
    {
        if (in_array($var, $this->fetched)) {
            return false;
        }

        $this->fetched[] = $var;
        return true;
    }

    private function getIdColumn()
    {
        return getEntityIdColumn($this->name);
    }

    public function getId()
    {
        return $this->getIdFromData($this->data);
    }

    private function getIdFromData(&$data)
    {
        return intval(def($data, $this->id_column, -1));
    }
}

function getEntityIdColumn($name)
{
    return $name . "_id";
}

// imagine it's another file start
// function SET_pies_pies_id(EntityObject $obj, $data) // if u don't add it it's completely fine!, it's assumed as default
// {
//     
// }
function SET_pies_food(EntityObject $obj, $data)
{
    // other actions
    $obj->setData("food_double", 2 * $data);
    $obj->setData("ate_at", date("Y-m-d.h:i:s"));

    // modify value itself, what about errors tho?
    //return $data;
}

/*function SET_pies_food_double(EntityObject $obj)
{
    
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
            $paw = createEntityObject("pies_paw", $paw_data);
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
        $paws[] = createEntityObject("pies_paw", $paw_data);
    }
    $obj->setData($var, $paws, true);
    return $paws;
}
// imagine it's another file end

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

// TODO: transactions :P
$pies = createEntityObject("pies", $data);

if ($pies) {
    $pies->saveToDB();
}

$pies2 = getEntityObject("pies", 21);

if ($pies2) {
    $pies2->setData("ate_at", date("Y-m-d.h:i:s", strtotime("-2 days")));
    $pies2->saveToDB();
}

//var_dump($pies, "\n\n\n", $same_pies, "\n\n\n");
