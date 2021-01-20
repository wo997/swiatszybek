<?php //route[{ADMIN}entity_test]

class EntityManager
{
    private static $entities = [];
    private static $entities_with_parent = [];

    public static function registerEntity($name, $props = [])
    {
        if (!isset(self::$entities[$name])) {
            self::$entities[$name] = [
                "props" => [],
                "parent" => null
            ];
        }

        $parent = def(self::$entities_with_parent, $name, null);
        if ($parent) {
            $props["parent"] = $parent;
        }

        // it should tell other entities that there is a prop that is a child of other entity ezy
        if (isset($props["props"])) {
            self::$entities[$name]["props"] = array_merge($props["props"], self::$entities[$name]["props"]);

            foreach (self::$entities[$name]["props"] as $prop_name => $prop) {
                $prop_type = $prop["type"];

                if ($prop_type && endsWith($prop_type, "[]")) {
                    $child_entity_name = substr($prop_type, 0, -2);

                    self::$entities_with_parent[$child_entity_name] = [
                        "name" => $name,
                        "prop" => $prop_name
                    ];
                    self::registerEntity($child_entity_name);
                }
            }
        }

        if (isset($props["parent"])) {
            self::$entities[$name]["parent"] = $props["parent"];
        }
    }

    public static function getEntityProps($name)
    {
        return def(self::$entities, $name, null);
    }

    /**
     * if you pass just the ID it will act like getById
     *
     * @param  string $name
     * @param  array $props
     * @return EntityObject
     */
    public static function getFromProps($name, $props) // reference?
    {
        return new EntityObject($name, $props);
    }

    /**
     * createById
     *
     * @param  string $name
     * @param  number $id
     * @return EntityObject
     */
    public static function getById($name, $id)
    {
        $props = [self::getEntityIdColumn($name) => $id];
        return new EntityObject($name, $props);
    }

    public static function getEntityIdColumn($name)
    {
        return $name . "_id";
    }

    /**
     * setManyToOneEntities
     *
     * @param  mixed $obj
     * @param  mixed $obj_prop_name
     * @param  mixed $child_entity_name
     * @param  mixed $children_props
     * @param  mixed $options
     * @return EntityObject[]
     */
    public static function setManyToOneEntities(EntityObject $obj, $obj_prop_name, $child_entity_name, $children_props)
    {
        //var_dump($options);

        /** @var EntityObject[] */
        $curr_children = def($obj->getProp($obj_prop_name), []);

        $children_with_id_props = [];
        $children = [];
        foreach ($children_props as &$child_props) {
            if ($child_props instanceof EntityObject) {
                return;
            }

            $child_id_column = EntityManager::getEntityIdColumn($child_entity_name);
            $child_id = intval(def($child_props, $child_id_column, -1));
            if ($child_id === -1) {
                $child_props[$obj->getIdColumn()] = $obj->getId();
                $child = EntityManager::getFromProps($child_entity_name, $child_props);
                $children[] = $child;
            } else {
                $children_with_id_props[$child_id] = $child_props;
            }
        }
        unset($child_props);

        foreach ($curr_children as &$curr_child) {
            $child_props = def($children_with_id_props, $curr_child->getId(), null);

            if ($child_props) {
                $curr_child->setVarFromArray($child_props);
            } else {
                $curr_child->setWillDelete();
            }
            $children[] = $curr_child;
        }
        unset($child);

        return $children;
    }

    public static function getManyToOneEntities(EntityObject $obj, $child_entity_name, $options = [])
    {
        /** @var EntityObject */
        $child = def($options, "child", null);

        $children = [];

        $query = "SELECT * FROM " . $child_entity_name . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId();

        if ($child) {
            $query .= " AND " . EntityManager::getEntityIdColumn($child_entity_name) . " <> " . $child->getId();
            $children[] = $child;
        }

        $children_props = fetchArray($query);
        foreach ($children_props as $child_props) {
            $child = EntityManager::getFromProps($child_entity_name, $child_props);
            $child->setParent($obj); // ugh it should be the same thing that's a parent but it loops kinda like if it wasn't the case
            $children[] = $child;
        }

        //var_dump(["children <<<<<", $children, "children >>>>>"]);
        return $children;
    }
}

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

// what about registering events like that? it would definitely work
EntityManager::registerEntity("pies", [
    "props" => [
        "food" => ["type" => "number"],
        "food_double" => ["type" => "number"],
        "ate_at" => ["type" => "datetime"],
    ],
]);

// this can be a module yay
EntityManager::registerEntity("pies", [
    "props" => [
        "paws" => ["type" => "pies_paw[]"]
    ],
]);

EntityManager::registerEntity("pies_paw", [
    "props" => [
        "pies_id" => ["type" => "number"],
        "name" => ["type" => "string"],
    ],
    //"parent" => ["type" => "pies"] // entity manager understands that and assigns it for you :*
]);

// var_dump(EntityManager::getEntityProps(("pies_paw")));
// die;


// imagine it's another file start
// function set__pies_pies_id(EntityObject $obj, $props) // if u don't add it it's completely fine!, it's assumed as default
// {
//     
// }
function set__pies_food(EntityObject $obj, $props)
{
    // other actions
    $obj->setProp("food_double", 2 * $props);
    $obj->setProp("ate_at", date("Y-m-d.H:i:s"));

    // modify value itself, what about errors tho?
    //return $props;
}
// what about append?

/*function set__pies_food_double(EntityObject $obj)
{
    
}*/

function set__pies_paws(EntityObject $obj, $props)
{
    /** @var EntityObject[] */
    $paws = $obj->getProp("paws"); //setManyToOneEntities($obj, "paws", "pies_paw", $props);

    $paws_props = [];
    foreach ($paws as $paw) {
        if ($paw->getWillDelete()) {
            continue;
        }
        $paws_props[] = $paw->getRowProps();
    }
    $obj->setProp("paws_json", json_encode($paws_props));

    return $paws;
}

// function get__pies_paws(EntityObject $obj)
// {
//     return getManyToOneEntities($obj, "pies_paw");
// }

// imagine it's another file end

class EntityObject
{
    private $name;
    private $id_column;
    private $props = []; // row props in DB
    private $fetched = []; // stores info of what relations that were fetched already
    private $curr_props = null; // in case the object existed in DB
    private $will_delete = false;
    private $parent = null; // in case there is any
    private $fetched_parent = false;
    private $saved = false;

    public function __construct($name, &$props)
    {
        // must go first
        $this->name = $name;
        // must go second
        $this->id_column = $this->getIdColumn();

        $obj_curr_id = $this->getIdFromProps($props);
        if ($obj_curr_id === -1) {
            $this->setVarFromArray($props);
        } else {
            $this->curr_props = fetchRow("SELECT * FROM " . $name . " WHERE " . $this->id_column . " = " . $obj_curr_id);
            $this->setVarFromArray(def($this->curr_props, []));
            $this->setVarFromArray($props);
        }
    }


    /**
     * setWillDelete
     *
     * @param  boolean $delete
     * @return void
     */
    public function setWillDelete($delete = true)
    {
        $this->will_delete = $delete;
    }

    public function getWillDelete()
    {
        return $this->will_delete;
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
                $obj->saveToDB(["propagate_to_parent" => false]);
            }
        }
    }

    public function saveToDB($options = [])
    {
        if ($this->saved) {
            return;
        }

        if (def($options, "propagate_to_parent", true) === true) {
            // possibly delegate
            $parent = $this->getParent();
            if ($parent) {
                $parent->saveToDB();
                return;
            }
        }

        $this->saved = true;

        if ($this->will_delete) {
            $query = "DELETE FROM " . $this->name . " WHERE " . $this->id_column . "=" . $this->getId();
            var_dump([$query]);
            return;
        }

        if ($this->curr_props) {
            $update_props = [];
            foreach ($this->props as $key => $value) {
                if ($key === $this->id_column) {
                    continue;
                }
                if (is_array($value)) {
                    $this->saveChildren($value);
                    continue;
                }
                if ($this->curr_props[$key] === $value) {
                    continue;
                }

                $update_props[$key] = $value;
            }

            if (!empty($update_props)) {
                // update
                $query = "UPDATE " . $this->name . " SET ";
                foreach (array_keys($update_props) as $field) {
                    $query .= clean($field) . "=?,";
                }
                $query = rtrim($query, ",");
                $query .= " WHERE " . $this->id_column . "=" . $this->getId();
                var_dump([$query, array_values($update_props)]);
                //query($query, array_values($update_props));
                //return true;
            }

            return;
        } else {
            // insert
            $insert_props = [];
            foreach ($this->props as $key => $value) {
                if ($key === $this->id_column) {
                    continue;
                }
                if (is_array($value)) {
                    $this->saveChildren($value);
                    continue;
                }
                $insert_props[$key] = $value;
            }

            $keys_query = "";
            foreach (array_keys($insert_props) as $field) {
                $keys_query .= clean($field) . ",";
            }
            $keys_query = rtrim($keys_query, ",");
            $values_query = rtrim(str_repeat("?,", count($insert_props)), ",");

            $query = "INSERT INTO " . clean($this->name) . "($keys_query) VALUES($values_query)";

            var_dump([$query, array_values($insert_props)]);
            //query($query, array_values($insert_props));
            //$entity_id = getLastInsertedId();
            //return $entity_id;

            return;
        }
    }

    public function setProp($prop_name, $val = null)
    {
        if ($prop_name === $this->id_column && $this->getId() !== -1) {
            // set id once, ezy
            return;
        }

        if ($val === null) {
            $val = $this->getProp($prop_name);
        }

        $prop_props = def(EntityManager::getEntityProps($this->name), ["props", $prop_name]);
        $prop_type = def($prop_props, "type", "");

        if (!$prop_props || !$prop_type) {
            return; // error?
        }

        if ($prop_type && endsWith($prop_type, "[]")) {
            $child_entity_name = substr($prop_type, 0, -2);
            EntityManager::setManyToOneEntities($this, $prop_name, $child_entity_name, $val);
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

        $this->props[$prop_name] = $val;
    }

    public function setVarFromArray($arr)
    {
        foreach ($arr as $prop_name => $val) {
            $this->setProp($prop_name, $val);
        }
    }

    public function getProp($prop_name, $options = [])
    {
        if ($this->shouldFetchProp($prop_name)) {
            $prop_type = def(EntityManager::getEntityProps($this->name), ["props", $prop_name, "type"]);
            if ($prop_type && endsWith($prop_type, "[]")) {
                $child_entity_name = substr($prop_type, 0, -2);
                $this->props[$prop_name] = EntityManager::getManyToOneEntities($this, $child_entity_name, filterArrayKeys($options, ["child"]));
            }

            $getter = "get__" . $this->name . "_" . $prop_name;
            if (function_exists($getter)) {
                $val = call_user_func($getter, $this);
                $this->props[$prop_name] = $val;
                //if ($val !== null) {}
            }
        }
        return def($this->props, $prop_name, null);
    }

    /**
     * getParent
     *
     * @return EntityObject
     */
    public function getParent()
    {
        if ($this->fetched_parent === false) {
            $this->fetched_parent = true;

            $parent_props = def(EntityManager::getEntityProps($this->name), ["parent"]);
            if ($parent_props) {
                $parent_name = $parent_props["name"];
                $parent_prop = $parent_props["prop"];
                $this->parent = EntityManager::getById($parent_name, $this->getProp(EntityManager::getEntityIdColumn($parent_name)));
                // assign the child, a single reference
                $this->parent->setProp($parent_prop, $this->parent->getProp($parent_prop, ["child" => $this]));
            }
        }
        return $this->parent;
    }

    public function setParent($parent)
    {
        $this->parent = $parent;
        $this->fetched_parent = true;
    }

    public function getProps()
    {
        return $this->props;
    }

    public function getRowProps()
    {
        $row_props = [];
        foreach ($this->props as $props) {
            if ($props instanceof EntityObject) {
                return;
            }
            $row_props[] = $props;
        }
        return $this->props;
    }

    /**
     * Usually used for comparing changes
     *
     * @param  mixed $prop_name
     * @return void
     */
    public function getCurrProps($prop_name)
    {
        return def($this->curr_props, $prop_name, null);
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
        return EntityManager::getEntityIdColumn($this->name);
    }

    public function getId()
    {
        if (!isset($this->props[$this->id_column])) {
            $this->props[$this->id_column] = -1;
        }
        return $this->getIdFromProps($this->props);
    }

    public function getName()
    {
        return $this->name;
    }

    private function getIdFromProps(&$props)
    {
        return intval(def($props, $this->id_column, -1));
    }
}

$props = [
    "pies_id" => 20,
    "food" => 666,
    "unknown_field" => 12345,
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
$pies = EntityManager::getFromProps("pies", $props);
$pies->saveToDB();

// $pies_paw_8 = EntityManager::getById("pies_paw", 8);
// $pies_paw_8->setWillDelete();
// $pies_paw_8->saveToDB();

//var_dump($pies_paw_8->getParent());

/** @var EntityObject[] */
//$pies_paws = $pies->getProp("paws");
//$pies_paws[1]->setWillDelete(); actually deletes pies_paw_8
//var_dump();

//if ($pies) {

//}

// $pies2 = EntityManager::getById("pies", 20);

// if ($pies2) {
//     $pies2->setProp("ate_at", date("Y-m-d.H:i:s", strtotime("-2 days")));
//     var_dump(["pies 2 paws: "], $pies2->getProp("paws"));
//     $pies2->saveToDB();
// }

//var_dump($pies, "\n\n\n", $pies2, "\n\n\n");
//var_dump($pies2);
