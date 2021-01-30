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

        if (isset($data["props"])) {
            self::$entities[$name]["props"] = array_merge($data["props"], self::$entities[$name]["props"]);
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
     * if you pass just the ID it will act like getEntityById
     *
     * @param  string $name !entity_name
     * @param  array $props !entity_props // to be added I guess, oh also the modifier should stop at whitespaces
     * @return Entity
     */
    public static function getEntity($name, $props) // must be the only place where we create Entities for consistency
    {
        $id = $props[self::getEntityIdColumn($name)];

        if (intval($id) >= 0) {
            $global_id = self::getObjectGlobalId($name, $id);
            if (isset(self::$objects[$global_id])) {
                return self::$objects[$global_id];
            }
        }

        $obj = new Entity($name, $props);
        $global_id = self::getObjectGlobalId($name, $obj->getId());
        self::$objects[$global_id] = $obj; // u can restore the data yay :) not used yet bro, think about it

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
    public static function getEntityById($name, $id)
    {
        $props = [self::getEntityIdColumn($name) => $id];
        return self::getEntity($name, $props);
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

        $children = [];
        $children_with_id_props = [];
        foreach ($children_props as &$child_props) {
            if ($child_props instanceof Entity) {
                return;
            }

            $child_id = intval(def($child_props, $child_id_column, -1));
            $child_props[$obj->getIdColumn()] = $obj->getId();
            if ($child_id == -1) {
                $child = self::getEntity($child_entity_name, $child_props);
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

    public static function getOneToManyEntities(Entity $obj, $child_entity_name)
    {
        $children = [];

        $children_props = DB::fetchArr("SELECT * FROM " . $child_entity_name . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId());
        foreach ($children_props as $child_props) {
            $child = self::getEntity($child_entity_name, $child_props);
            $child->setParent($obj);
            $children[] = $child;
        }

        return $children;
    }

    public static function getManyToManyTableName($name_1, $name_2)
    {
        return $name_1 . "_to_" . $name_2;
    }

    /**
     * setManyToManyEntities
     *
     * @param  mixed $obj
     * @param  mixed $obj_prop_name
     * @param  mixed $child_entity_name
     * @param  mixed $children_props
     * @return Entity[]
     */
    public static function setManyToManyEntities(Entity $obj, $obj_prop_name, $other_entity_name, $other_entities_props)
    {
        /** @var Entity[] */
        $curr_other_entities = def($obj->getProp($obj_prop_name), []);

        $other_entity_id_column = self::getEntityIdColumn($other_entity_name);

        $other_entity = [];
        $other_entities_with_id_props = [];
        foreach ($other_entities_props as &$other_entity_props) {
            if ($other_entity_props instanceof Entity) {
                return;
            }
            if (is_numeric($other_entity_props)) {
                $other_entity_props = [
                    $other_entity_id_column => intval($other_entity_props)
                ];
            }

            $other_entity_id = intval(def($other_entity_props, $other_entity_id_column, -1));
            $other_entity_props[$obj->getIdColumn()] = $obj->getId();
            if ($other_entity_id == -1) {
                $other_entity = self::getEntity($other_entity_name, $other_entity_props);
                $other_entities[] = $other_entity;
            } else {
                $other_entities_with_id_props[$other_entity_id] = $other_entity_props;
            }
        }
        unset($other_entity_props);

        foreach ($curr_other_entities as &$curr_other_entity) {
            $other_entity_props = def($other_entities_with_id_props, $curr_other_entity->getId(), null);

            if ($other_entity_props) {
                $curr_other_entity->setProps($other_entity_props);
            } else {
                $curr_other_entity->willUnlinkFromEntity($obj->getName());
            }
            $other_entities[] = $curr_other_entity;
        }
        unset($other_entity);

        return $other_entities;
    }

    public static function getManyToManyEntities(Entity $obj, $other_entity_name, $relation_table)
    {
        $other_entities = [];

        $other_entity_id_column = self::getEntityIdColumn($other_entity_name);
        $other_entities_props = DB::fetchArr("SELECT * FROM " . $other_entity_name . " WHERE " . $other_entity_id_column . " IN (SELECT " . $other_entity_id_column . " FROM " . $relation_table . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId() . ")");
        foreach ($other_entities_props as $other_entity_props) {
            $other_entity = self::getEntity($other_entity_name, $other_entity_props);
            $other_entities[] = $other_entity;
        }

        return $other_entities;
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
        EventListener::register("set_" . $name . "_entity_" . $prop, function ($params) use ($callback) {
            $callback($params["obj"], $params["val"]);
        });
    }

    public static function getter($name, $prop, $callback)
    {
        EventListener::register("get_" . $name . "_entity_" . $prop, function ($params) use ($callback) {
            $callback($params["obj"]);
        });
    }

    /**
     * @param  string $name1 !entity_name
     * @param  string $name2 !entity_name
     */
    public static function manyToMany($name1, $name2, $relation_table)
    {
        self::$entities[$name1]["linked_with"][$name2] = [
            "relation_table" => $relation_table
        ];
        self::$entities[$name2]["linked_with"][$name1] = [
            "relation_table" => $relation_table,
        ];
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

    public static function setManyToManyRelationship(Entity $obj, $other_entity_name, $curr_val, $val, $relation_table)
    {
        $our_id = $obj->getId(); // HEY! it won't work before we save it, so you should do it at the end!
        $our_id_column = $obj->getIdColumn();
        $other_entity_id_column = self::getEntityIdColumn($other_entity_name);

        $curr_ids = [];
        foreach ($curr_val as $other_obj) {
            $other_id = $other_obj->getProp($other_entity_id_column);
            if ($other_id > 0) { // always but prevents bugs
                $curr_ids[] = $other_id;
            }
        }

        $ids = [];
        foreach ($val as $oo) {
            /** @var Entity */
            $other_obj = $oo;

            if (in_array($obj->getName(), $other_obj->getWillUnlinkFromEntities())) {
                continue;
            }

            $other_id = $other_obj->getProp($other_entity_id_column);
            if ($other_id > 0) { // always but prevents bugs
                $ids[] = $other_id;
            }
        }

        $removed_ids = array_diff($curr_ids, $ids);
        $added_ids = array_diff($ids, $curr_ids);

        if ($removed_ids) {
            $query = "DELETE FROM $relation_table WHERE $our_id_column = $our_id AND $other_entity_id_column IN (" . implode(",", $removed_ids) . ")";
            var_dump([$query]);
            DB::execute($query);
        }
        if ($added_ids) {
            $query = "INSERT INTO $relation_table ($our_id_column, $other_entity_id_column) VALUES " . implode(",", array_map(function ($a) use ($our_id) {
                return "($our_id,$a)";
            }, $added_ids));
            var_dump([$query]);
            DB::execute($query);
        }
    }
}