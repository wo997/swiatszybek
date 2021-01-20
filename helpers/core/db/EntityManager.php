<?php

class EntityManager
{
    private static $entities = [];
    private static $entities_with_parent = [];

    public static function register($name, $data = [])
    {
        if (!isset(self::$entities[$name])) {
            self::$entities[$name] = [
                "props" => [],
                "parent" => null
            ];
        }

        $parent = def(self::$entities_with_parent, $name, null);
        if ($parent) {
            $data["parent"] = $parent;
        }

        // it should tell other entities that there is a prop that is a child of other entity ezy
        if (isset($data["props"])) {
            self::$entities[$name]["props"] = array_merge($data["props"], self::$entities[$name]["props"]);

            foreach (self::$entities[$name]["props"] as $prop_name => $prop) {
                $prop_type = $prop["type"];

                if ($prop_type && endsWith($prop_type, "[]")) {
                    $child_entity_name = substr($prop_type, 0, -2);

                    self::$entities_with_parent[$child_entity_name] = [
                        "name" => $name,
                        "prop" => $prop_name
                    ];
                    self::register($child_entity_name);
                }
            }
        }

        if (isset($data["parent"])) {
            self::$entities[$name]["parent"] = $data["parent"];
        }

        if (!def(self::$entities, [$name, "props", self::getEntityIdColumn($name)], null)) {
            self::$entities[$name]["props"][self::getEntityIdColumn($name)] = ["type" => "number"];
        }
    }

    public static function getEntityData($name)
    {
        return def(self::$entities, $name, null);
    }

    /**
     * if you pass just the ID it will act like getById
     *
     * @param  string $name
     * @param  array $props
     * @return Entity
     */
    public static function getFromProps($name, $props) // reference? seems to make 0 difference for memory management, wow
    {
        return new Entity($name, $props);
    }

    /**
     * createById
     *
     * @param  string $name
     * @param  number $id
     * @return Entity
     */
    public static function getById($name, $id)
    {
        $props = [self::getEntityIdColumn($name) => $id];
        return new Entity($name, $props);
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
     * @return Entity[]
     */
    public static function setManyToOneEntities(Entity $obj, $obj_prop_name, $child_entity_name, $children_props)
    {
        //var_dump($options);

        /** @var Entity[] */
        $curr_children = def($obj->getProp($obj_prop_name), []);

        $children_with_id_props = [];
        $children = [];
        foreach ($children_props as &$child_props) {
            if ($child_props instanceof Entity) {
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

    public static function getManyToOneEntities(Entity $obj, $child_entity_name, $options = [])
    {
        /** @var Entity */
        $child = def($options, "child", null);

        $children = [];

        $query = "SELECT * FROM " . $child_entity_name . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId();

        if ($child) {
            $query .= " AND " . EntityManager::getEntityIdColumn($child_entity_name) . " <> " . $child->getId();
            $children[] = $child;
        }

        $children_props = DB::fetchArr($query);
        foreach ($children_props as $child_props) {
            $child = EntityManager::getFromProps($child_entity_name, $child_props);
            $child->setParent($obj); // ugh it should be the same thing that's a parent but it loops kinda like if it wasn't the case
            $children[] = $child;
        }

        //var_dump(["children <<<<<", $children, "children >>>>>"]);
        return $children;
    }

    public static function setter($name, $prop, $callback)
    {
        EventListener::register($name . "_set_" . $prop, function ($params) use ($callback) {
            $callback($params["obj"], $params["val"]);
        });
    }

    public static function getter($name, $prop, $callback)
    {
        EventListener::register($name . "_get_" . $prop, function ($params) use ($callback) {
            $callback($params["obj"]);
        });
    }
}
