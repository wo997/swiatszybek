<?php

class EntityManager
{
    private static $entities = [];
    private static $entities_with_parent = [];

    /**
     * @typedef RegisterEntityData {
     * props: string
     * }
     */

    /**
     * register
     *
     * @param  string $name !register_entity_name
     * @param  RegisterEntityData $data
     * @return void
     */
    public static function register($name, $data = [])
    {
        if (!isset(self::$entities[$name])) {
            self::$entities[$name] = [
                "props" => [],
                "parent" => null
            ];
        }


        // it should tell other entities that there is a prop that is a child of other entity ezy
        if (isset($data["props"])) {
            self::$entities[$name]["props"] = array_merge($data["props"], self::$entities[$name]["props"]);

            // foreach (self::$entities[$name]["props"] as $prop_name => $prop) {
            //     $prop_type = $prop["type"];

            //     if ($prop_type && endsWith($prop_type, "[]")) {
            //         $child_entity_name = substr($prop_type, 0, -2);

            //         self::$entities_with_parent[$child_entity_name] = [
            //             "name" => $name,
            //             "prop" => $prop_name
            //         ];
            //         self::register($child_entity_name);
            //     }
            // }
        }

        $parent = def(self::$entities_with_parent, $name, null);
        if ($parent) {
            self::$entities[$name]["parent"] = $parent;
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
     * @param  string $name !entity_name
     * @param  array $props !entity_props // to be added I guess, oh also the modifier should stop at whitespaces
     * @return Entity
     */
    public static function getFromProps($name, $props) // reference? seems to make 0 difference for memory management, wow
    {
        return new Entity($name, $props);
    }

    /**
     * createById
     *
     * @param  string $name !entity_name
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
     * @return Entity[]
     */
    public static function setManyToOneEntities(Entity $obj, $obj_prop_name, $child_entity_name, $children_props)
    {
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

    /**
     * setter
     *
     * @param  string $name !entity_name
     * @param  string $prop !entity_prop_name
     * @param  callback $callback !entity_setter_callback
     * @return void
     */
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

    /**
     * if you pass just the ID it will act like getById
     *
     * @param  string $name1 !entity_name
     * @param  string $name2 !entity_name
     * @return Entity
     */
    public static function manyToMany($name1, $name2)
    {
        var_dump([$name1, $name2]);
    }

    /**
     * if you pass just the ID it will act like getById
     *
     * @param  string $parent_name !entity_name
     * @param  string $prop_name !entity_prop_name
     * @param  string $child_name !entity_name
     * @return Entity
     */
    public static function OneToMany($parent_name, $prop_name, $child_name)
    {
        self::$entities_with_parent[$child_name] = [
            "name" => $parent_name,
            "prop" => $prop_name
        ];
        self::register($child_name); // make sure the child uses the parent
        self::register($parent_name); // just in case
    }
}
