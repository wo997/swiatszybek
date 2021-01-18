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
    // UPDATE: well, both might need it
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
    private $will_delete = false;

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
    }


    /**
     * willDelete
     *
     * @param  boolean $delete
     * @return void
     */
    public function willDelete($delete = true)
    {
        $this->will_delete = $delete;
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
        if ($this->will_delete) {
            $query = "DELETE FROM " . $this->name . " WHERE " . $this->id_column . "=" . $this->getId();
            var_dump([$query]);
            return;
        }

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
                $query .= " WHERE " . $this->id_column . "=" . $this->getId();
                var_dump([$query, array_values($update_data)]);
                //query($query, array_values($update_data));
                //return true;
            }
        } else {
            // insert
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

            var_dump([$query, array_values($insert_data)]);
            //query($query, array_values($insert_data));
            //$entity_id = getLastInsertedId();
            //return $entity_id;
        }
    }

    public function setData($var, $val)
    {
        if ($var === $this->id_column && $this->getId() !== -1) {
            // set id once, ezy
            return;
        }

        $setter = "set__" . $this->name . "_" . $var;
        if (function_exists($setter)) {
            $res = call_user_func($setter, $this, $val);
            if ($res) { // handle errors maybe?
                $val = $res;
            }
        } else if (is_array($val)) { // nah
            return;
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
            $getter = "get__" . $this->name . "_" . $var;
            if (function_exists($getter)) {
                $val = call_user_func($getter, $this);
                $this->data[$var] = $val;
                //if ($val !== null) {}
            }
        }
        return def($this->data, $var, null);
    }

    public function getAllData()
    {
        return $this->data;
    }

    public function getAllRowData()
    {
        $row_data = [];
        foreach ($this->data as $data) {
            if ($data instanceof EntityObject) {
                return;
            }
            $row_data[] = $data;
        }
        return $this->data;
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

    public function getIdColumn()
    {
        return getEntityIdColumn($this->name);
    }

    public function getId()
    {
        if (!isset($this->data[$this->id_column])) {
            $this->data[$this->id_column] = -1;
        }
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
// function set__pies_pies_id(EntityObject $obj, $data) // if u don't add it it's completely fine!, it's assumed as default
// {
//     
// }
function set__pies_food(EntityObject $obj, $data)
{
    // other actions
    $obj->setData("food_double", 2 * $data);
    $obj->setData("ate_at", date("Y-m-d.H:i:s"));

    // modify value itself, what about errors tho?
    //return $data;
}
// what about append?

/*function set__pies_food_double(EntityObject $obj)
{
    
}*/

function set__pies_paws(EntityObject $obj, $data)
{
    $paws = setManyToOneEntities($obj, "paws", "pies_paw", $data);
    $paws_data = [];
    foreach ($paws as $paw) {
        $paws_data[] = $paw->getAllRowData();
    }
    $obj->setData("paws_json", json_encode($paws_data));

    return $paws;
}

function get__pies_paws(EntityObject $obj)
{
    return getManyToOneEntities($obj, "paws", "pies_paw");
}

/**
 * setManyToOneEntities
 *
 * @param  mixed $obj
 * @param  mixed $obj_var_name
 * @param  mixed $child_entity_name
 * @param  mixed $children_data
 * @return EntityObject[]
 */
function setManyToOneEntities(EntityObject $obj, $obj_var_name, $child_entity_name, $children_data)
{
    /** @var EntityObject[] */
    $curr_children = def($obj->getData($obj_var_name), []);

    $children_with_id_data = [];
    $children = [];
    foreach ($children_data as &$child_data) {
        if ($child_data instanceof EntityObject) {
            return;
        }

        $child_id_column = getEntityIdColumn($child_entity_name);
        $child_id = intval(def($child_data, $child_id_column, -1));
        if ($child_id === -1) {
            $child_data[$obj->getIdColumn()] = $obj->getId();
            $child = createEntityObject($child_entity_name, $child_data);
            $children[] = $child;
        } else {
            $children_with_id_data[$child_id] = $child_data;
        }
    }
    unset($child_data);

    foreach ($curr_children as &$curr_child) {
        $child_data = def($children_with_id_data, $curr_child->getId(), null);

        if ($child_data) {
            $curr_child->setDataFromArray($child_data);
        } else {
            $curr_child->willDelete();
        }
        $children[] = $curr_child;
    }
    unset($child);

    return $children;
}

function getManyToOneEntities(EntityObject $obj, $obj_var_name, $child_entity_name)
{
    $children = [];
    $children_data = fetchArray("SELECT * FROM " . $child_entity_name . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId());
    foreach ($children_data as $child_data) {
        $children[] = createEntityObject($child_entity_name, $child_data);
    }
    return $children;
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

// $pies2 = getEntityObject("pies", 20);

// if ($pies2) {
//     $pies2->setData("ate_at", date("Y-m-d.H:i:s", strtotime("-2 days")));
//     var_dump(["pies 2 paws: "], $pies2->getData("paws"));
//     $pies2->saveToDB();
// }

//var_dump($pies, "\n\n\n", $pies2, "\n\n\n");
//var_dump($pies2);
