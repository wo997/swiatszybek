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

// TODO: instead of creating app scope, maybe we should have static classes?
// or even raw classes, cause why not, we do instantiate the user on each request
function getEntitiesData()
{
    $entities = [
        "pies" => [
            "props" => [
                "food" => ["type" => "number"],
                "food_double" => ["type" => "number"],
                "ate_at" => ["type" => "datetime"],
                "paws" => ["type" => "pies_paw[]"]
            ],
        ],
        "pies_paw" => [
            "props" => [
                "pies_id" => ["type" => "number"],
                "name" => ["type" => "number"],
            ]
        ],
    ];

    return $entities;
}

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
            $this->setVarFromArray($data);
        } else {
            $this->curr_data = fetchRow("SELECT * FROM " . $name . " WHERE " . $this->id_column . " = " . $obj_curr_id);
            $this->setVarFromArray(def($this->curr_data, []));
            $this->setVarFromArray($data);
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

    public function setProp($prop_name, $val)
    {
        if ($prop_name === $this->id_column && $this->getId() !== -1) {
            // set id once, ezy
            return;
        }

        $entities_data = getEntitiesData();

        $prop_type = def($entities_data, [$this->name, "props", $prop_name, "type"]);
        if ($prop_type && endsWith($prop_type, "[]")) {
            $child_entity_name = substr($prop_type, 0, -2);
            setManyToOneEntities($this, $prop_name, $child_entity_name, $val);
        }

        $setter = "set__" . $this->name . "_" . $prop_name; // TODO: setters as events?
        if (function_exists($setter)) {
            $res = call_user_func($setter, $this, $val);
            if ($res !== null) { // handle errors maybe?
                $val = $res;
            }
        } else if (is_array($val)) { // nah
            return;
        }

        $this->data[$prop_name] = $val;
    }

    public function warmupProp($prop_name)
    {
        $this->setProp($prop_name, $this->getProp($prop_name));
    }

    public function setVarFromArray($arr)
    {
        foreach ($arr as $prop_name => $val) {
            $this->setProp($prop_name, $val);
        }
    }

    public function getProp($prop_name)
    {
        if ($this->shouldFetchProp($prop_name)) {
            $entities_data = getEntitiesData();

            $prop_type = def($entities_data, [$this->name, "props", $prop_name, "type"]);
            if ($prop_type && endsWith($prop_type, "[]")) {
                $child_entity_name = substr($prop_type, 0, -2);
                $this->data[$prop_name] =  getManyToOneEntities($this, $child_entity_name);
            }

            $getter = "get__" . $this->name . "_" . $prop_name;
            if (function_exists($getter)) {
                $val = call_user_func($getter, $this);
                $this->data[$prop_name] = $val;
                //if ($val !== null) {}
            }
        }
        return def($this->data, $prop_name, null);
    }

    public function getData()
    {
        return $this->data;
    }

    public function getRowData()
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
     * @param  mixed $prop_name
     * @return void
     */
    public function getCurrData($prop_name)
    {
        return def($this->curr_data, $prop_name, null);
    }

    private function shouldFetchProp($prop_name)
    {
        if (in_array($prop_name, $this->fetched)) {
            return false;
        }

        $this->fetched[] = $prop_name;
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
    $obj->setProp("food_double", 2 * $data);
    $obj->setProp("ate_at", date("Y-m-d.H:i:s"));

    // modify value itself, what about errors tho?
    //return $data;
}
// what about append?

/*function set__pies_food_double(EntityObject $obj)
{
    
}*/

function set__pies_paws(EntityObject $obj, $data)
{
    $paws = $obj->getProp("paws"); //setManyToOneEntities($obj, "paws", "pies_paw", $data);

    $paws_data = [];
    foreach ($paws as $paw) {
        $paws_data[] = $paw->getRowData();
    }
    $obj->setProp("paws_json", json_encode($paws_data));

    return $paws;
}

// function get__pies_paws(EntityObject $obj)
// {
//     return getManyToOneEntities($obj, "pies_paw");
// }

/**
 * setManyToOneEntities
 *
 * @param  mixed $obj
 * @param  mixed $obj_prop_name
 * @param  mixed $child_entity_name
 * @param  mixed $children_data
 * @return EntityObject[]
 */
function setManyToOneEntities(EntityObject $obj, $obj_prop_name, $child_entity_name, $children_data)
{
    /** @var EntityObject[] */
    $curr_children = def($obj->getProp($obj_prop_name), []);

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
            $curr_child->setVarFromArray($child_data);
        } else {
            $curr_child->willDelete();
        }
        $children[] = $curr_child;
    }
    unset($child);

    return $children;
}

function getManyToOneEntities(EntityObject $obj, $child_entity_name)
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
//     $pies2->setProp("ate_at", date("Y-m-d.H:i:s", strtotime("-2 days")));
//     var_dump(["pies 2 paws: "], $pies2->getProp("paws"));
//     $pies2->saveToDB();
// }

//var_dump($pies, "\n\n\n", $pies2, "\n\n\n");
//var_dump($pies2);
