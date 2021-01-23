<?php

class EntityManager
{
    private static $entities = [];
    private static $objects = [];

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

        if (!def(self::$entities, [$name, "props", self::getEntityIdColumn($name)], null)) {
            self::$entities[$name]["props"][self::getEntityIdColumn($name)] = ["type" => "number"];
        }
    }

    public static function getEntityData($name)
    {
        return def(self::$entities, $name, null);
    }

    /**
     * getObjectGlobalId
     *
     * @param  string $name
     * @param  mixed $id
     * @return void
     */
    public static function getObjectGlobalId($name, $id)
    {
        return $name . "_" . $id;
    }

    /**
     * if you pass just the ID it will act like getById
     *
     * @param  string $name !entity_name
     * @param  array $props !entity_props // to be added I guess, oh also the modifier should stop at whitespaces
     * @return Entity
     */
    public static function getFromProps($name, $props) // must be the only place where we create Entities for consistency
    {
        $id = $props[self::getEntityIdColumn($name)];
        $global_id = self::getObjectGlobalId($name, $id);
        $cacheable = $id != -1;

        if ($cacheable && isset(self::$objects[$global_id])) {
            return self::$objects[$global_id];
        }

        $obj = new Entity($name, $props);
        if ($cacheable) {
            self::$objects[$global_id] = $obj; // u can restore the data yay :) not used yet bro, think about it
        }
        return $obj;
    }

    /**
     * it just removes references to objects that could be used multiple times, they are necessary for the ORM to work so be careful ;)
     *
     * @return void
     */
    public static function clearObjects()
    {
        self::$objects = [];
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
        return self::getFromProps($name, $props);
    }

    public static function getEntityIdColumn($name)
    {
        return $name . "_id";
    }

    /**
     * setOneToManyEntities
     *
     * @param  mixed $obj
     * @param  mixed $obj_prop_name
     * @param  mixed $child_entity_name
     * @param  mixed $children_props
     * @return Entity[]
     */
    public static function setOneToManyEntities(Entity $obj, $obj_prop_name, $child_entity_name, $children_props)
    {
        /** @var Entity[] */
        $curr_children = def($obj->getProp($obj_prop_name), []);

        $child_id_column = self::getEntityIdColumn($child_entity_name);

        $children_with_id_props = [];
        $children = [];
        foreach ($children_props as &$child_props) {
            if ($child_props instanceof Entity) {
                return;
            }

            $child_id = intval(def($child_props, $child_id_column, -1));
            $child_props[$obj->getIdColumn()] = $obj->getId();
            if ($child_id == -1) {
                $child = self::getFromProps($child_entity_name, $child_props);
                $children[] = $child;
            } else {
                $children_with_id_props[$child_id] = $child_props;
            }
        }
        unset($child_props);

        foreach ($curr_children as &$curr_child) {
            $child_props = def($children_with_id_props, $curr_child->getId(), null);

            if ($child_props) {
                $curr_child->setProps($child_props);
            } else {
                $curr_child->setWillDelete();
            }
            $children[] = $curr_child;
        }
        unset($child);

        return $children;
    }

    public static function getOneToManyEntities(Entity $obj, $child_entity_name, $options = [])
    {
        /** @var Entity */
        $child = def($options, "child", null);

        $children = [];

        $query = "SELECT * FROM " . $child_entity_name . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId();

        if ($child) {
            $query .= " AND " . self::getEntityIdColumn($child_entity_name) . " <> " . $child->getId();
            $children[] = $child;
        }

        $children_props = DB::fetchArr($query);
        foreach ($children_props as $child_props) {
            $child = self::getFromProps($child_entity_name, $child_props);
            $child->setParent($obj);
            $children[] = $child;
        }

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
     * @param  string $name1 !entity_name
     * @param  string $name2 !entity_name
     */
    public static function manyToMany($name1, $name2)
    {
        self::$entities[$name1]["linked_with"] = $name2;
        self::$entities[$name2]["linked_with"] = $name1;
    }

    /**
     * @param  string $parent_name !entity_name
     * @param  string $prop_name !entity_prop_name
     * @param  string $child_name !entity_name
     */
    public static function OneToMany($parent_name, $prop_name, $child_name)
    {
        self::$entities[$child_name]["parent"] = [
            "name" => $parent_name,
            "prop" => $prop_name
        ];
    }
}
