<?php

class EntityManager
{
    private static $entities = [];
    /** @var Entity[] */
    private static $objects = [];
    /** @var Entity[] */
    private static $warmup_objects = [];

    /**
     * @typedef RegisterEntityData {
     * props: string
     * //sortable?: string
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
                "parents" => [],
                "sortable" => false,
            ];
        }

        if (isset($data["props"]) && is_array($data["props"])) {
            self::$entities[$name]["props"] = array_merge($data["props"], def(self::$entities[$name], "props", []));
        }

        // if (isset($data["sortable"])) {
        //     self::$entities[$name]["sortable"] = $data["sortable"];
        // }

        if (!def(self::$entities, [$name, "props", self::getEntityIdColumn($name)], null)) {
            self::$entities[$name]["props"][self::getEntityIdColumn($name)] = ["type" => "number"];
        }
    }

    public static function getEntities()
    {
        return self::$entities;
    }

    public static function getObjects()
    {
        return self::$objects;
    }

    /**
     * addObject
     *
     * @param  Entity $obj
     * @return void
     */
    public static function addObject($obj)
    {
        $global_id = self::getObjectGlobalId($obj->getName(), $obj->getId());
        $obj->setGlobalId($global_id);
        self::$objects[$global_id] = $obj; // u can restore the data yay :) not used yet bro, think about it
    }

    /**
     * addWarmupObject
     *
     * @param  Entity $entity
     * @return void
     */
    public static function addWarmupObject($entity)
    {
        return self::$warmup_objects[] = $entity;
    }

    /**
     * getEntityData
     *
     * @param  string $name !entity_name
     */
    public static function getEntityData($name)
    {
        return def(self::$entities, $name, null);
    }

    /**
     * getObjectGlobalId
     *
     * @param  string $name !entity_name
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
     * @param  array $props !entity_props
     * @return Entity
     */
    public static function getEntity($name, $props, $only_new = false) // must be the only place where we create Entities for consistency
    {
        $id = def($props, self::getEntityIdColumn($name), -1);

        if (intval($id) >= 0) {
            $global_id = self::getObjectGlobalId($name, $id);
            /** @var Entity */
            $entity = def(self::$objects, $global_id);
            if ($entity) {
                $entity->setProps($props, $only_new);
                return $entity;
            }
        }

        try {
            $obj = new Entity($name, $props);
        } catch (Exception $e) {
            // var_dump($e);
            // die;
            return false;
        }

        return $obj;
    }

    public static function saveAll()
    {
        array_push(self::$objects, ...self::$warmup_objects);
        foreach (self::$objects as $object) {
            $object->save();
        }

        // down below run just sql queries or send emails
        foreach (self::$objects as $object) {
            $saver = "after_save_" . $object->getName() . "_entity";
            EventListener::dispatch($saver, ["obj" => $object]);
        }
    }

    /**
     * it just removes references to objects that could be used multiple times, they are necessary for the ORM to work so be careful ;)
     *
     * @return void
     */
    public static function reset()
    {
        self::$objects = [];
        self::$warmup_objects = [];
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

    /**
     *
     * @param  string $name !entity_name
     * @return string
     */
    public static function getEntityIdColumn($name)
    {
        return $name . "_id";
    }

    /**
     * setOneToOneEntity
     *
     * @param  mixed $obj
     * @param  mixed $obj_prop_name
     * @param  mixed $child_entity_name
     * @param  mixed $children_props
     * @param  mixed $relation_data
     * @return Entity[]
     */
    public static function setOneToOneEntity(Entity $obj, $obj_prop_name, $child_entity_name, $child_props, $relation_data)
    {
        /** @var Entity */
        $curr_child = def($obj->getProp($obj_prop_name), []);

        $child = null;

        if ($child_props) {
            if ($child_props instanceof Entity) {
                $child = $child_props;
            } else {
                if (is_numeric($child_props)) {
                    $other_entity_id_column = self::getEntityIdColumn($child_entity_name);
                    $child_props = [
                        $other_entity_id_column => intval($child_props)
                    ];
                }

                $child = self::getEntity($child_entity_name, $child_props, true);
            }
        }

        if ($relation_data["parent_required"] && $child->getId() !== $curr_child->getId()) {
            $parent_required_action = $relation_data["parent_required_action"];
            if ($parent_required_action === "delete") {
                $curr_child->setWillDelete();
            }
            if ($parent_required_action === "unlink") {
                $curr_child->setProp($obj->getIdColumn(), null);
            }
        }

        $prop_id_column = self::getEntityIdColumn($obj_prop_name);
        $child_id = $child ? $child->getId() : null;
        $obj->dangerouslySetProp($prop_id_column, $child_id);

        return $child;
    }

    /**
     * setOneToManyEntities
     *
     * @param  mixed $obj
     * @param  mixed $obj_prop_name
     * @param  mixed $child_entity_name
     * @param  mixed $children_props
     * @param  mixed $relation_data
     * @return Entity[]
     */
    public static function setOneToManyEntities(Entity $obj, $obj_prop_name, $child_entity_name, $children_props, $relation_data)
    {
        /** @var Entity[] */
        $curr_children = def($obj->getProp($obj_prop_name), []);

        $child_id_column = self::getEntityIdColumn($child_entity_name);

        $children = [];
        $children_with_id_props = [];
        foreach ($children_props as &$child_props) {
            if ($child_props instanceof Entity) {
                $child_id = $child_props->getId();
                $child_props = $child_props->getProps();
            } else {
                $child_id = intval(def($child_props, $child_id_column, -1));
                $child_props[$obj->getIdColumn()] = $obj->getId();
                if ($child_id == -1) {
                    $child = self::getEntity($child_entity_name, $child_props);
                    if ($child) {
                        $children[] = $child;
                    }
                    continue;
                }
            }

            $children_with_id_props[$child_id] = $child_props;
        }
        unset($child_props);

        foreach ($curr_children as &$curr_child) {
            $child_props = def($children_with_id_props, $curr_child->getId(), null);

            if ($child_props) {
                $curr_child->setProps($child_props);
                $children[] = $curr_child;
            } else {
                if ($relation_data["parent_required"]) {
                    $parent_required_action = $relation_data["parent_required_action"];
                    if ($parent_required_action === "delete") {
                        $curr_child->setWillDelete();
                    }
                    if ($parent_required_action === "unlink") {
                        $curr_child->setProp($obj->getIdColumn(), null);
                    }
                }
            }
        }
        unset($child);

        return $children;
    }

    public static function getOneToOneEntity(Entity $obj, $prop_name, $child_entity_name)
    {
        $prop_id_column = self::getEntityIdColumn($prop_name);
        $child_id = DB::fetchVal("SELECT $prop_id_column FROM " . $obj->getName() . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId());
        if ($child_id) {
            $child_id_column = self::getEntityIdColumn($child_entity_name);
            $child_props = DB::fetchRow("SELECT * FROM $child_entity_name WHERE $child_id_column = $child_id");
            $child = self::getEntity($child_entity_name, $child_props, true);
            if ($child) {
                $child->addParent($obj);
                return $child;
            }
            $prop_id_column = self::getEntityIdColumn($prop_name);
            $child_id = $child ? $child->getId() : null;
            $obj->setProp($prop_id_column, $child_id);
        }

        return null;
    }

    public static function getOneToManyEntities(Entity $obj, $child_entity_name)
    {
        $children = [];

        $children_props = DB::fetchArr("SELECT * FROM " . $child_entity_name . " WHERE " . $obj->getIdColumn() . " = " . $obj->getId());
        foreach ($children_props as $child_props) {
            $child = self::getEntity($child_entity_name, $child_props, true);
            if ($child) {
                $child->addParent($obj);
                $children[] = $child;
            }
        }
        foreach ($obj->children_about_to_join as $key => $child) {
            if ($child->getName() === $child_entity_name) {
                $children[] = $child;
                unset($obj->children_about_to_join[$key]);
            }
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
        $curr_ids = [];
        foreach ($curr_other_entities as &$curr_other_entity) {
            $curr_ids[] = $curr_other_entity->getId();
        }
        unset($curr_other_entity);

        $other_entity_id_column = self::getEntityIdColumn($other_entity_name);

        $other_entities = [];
        $other_entities_with_id_props = [];
        foreach ($other_entities_props as &$other_entity_props) {
            if ($other_entity_props instanceof Entity) {
                $other_entity_id = $other_entity_props->getId();
                $other_entity_props = $other_entity_props->getProps();
            } else {
                if (is_numeric($other_entity_props)) {
                    $other_entity_props = [
                        $other_entity_id_column => intval($other_entity_props)
                    ];
                }

                $other_entity_id = intval(def($other_entity_props, $other_entity_id_column, -1));
                $other_entity_props[$obj->getIdColumn()] = $obj->getId();
                if ($other_entity_id == -1) {
                    $other_entity = self::getEntity($other_entity_name, $other_entity_props, true);
                    if ($other_entity) {
                        $other_entities[] = $other_entity;
                    }
                    continue;
                }
            }

            $other_entities_with_id_props[$other_entity_id] = $other_entity_props;
        }
        unset($other_entity_props);

        foreach ($curr_other_entities as &$curr_other_entity) {
            $other_id = $curr_other_entity->getId();
            $other_entity_props = def($other_entities_with_id_props, $other_id, null);

            if ($other_entity_props) {
                $curr_other_entity->setProps($other_entity_props);
                $other_entities[] = $curr_other_entity;
            } else {
                $curr_other_entity->willUnlinkFromEntity($obj->getGlobalId());
            }
        }
        unset($other_entity);

        // the ones that were not linked so far
        foreach ($other_entities_with_id_props as &$other_entity_props) {
            if ($other_entity_props instanceof Entity) {
                $other_entities[] = $other_entity_props;
                continue;
            }
            if (is_numeric($other_entity_props)) {
                $other_entity_props = [
                    $other_entity_id_column => intval($other_entity_props)
                ];
            }

            if (in_array($other_entity_props[$other_entity_id_column], $curr_ids)) {
                continue;
            }

            $other_entity = self::getEntity($other_entity_name, $other_entity_props, true);
            if ($other_entity) {
                $other_entities[] = $other_entity;
            }
        }
        unset($other_entity_props);

        return $other_entities;
    }

    public static function getManyToManyEntities(Entity $obj, $other_entity_name, $link)
    {
        $relation_table = $link["relation_table"];

        $other_entities = [];

        $other_entity_id_column = self::getEntityIdColumn($other_entity_name);
        $meta_sql = "";
        $meta = def($link, ["extra", "meta"], null);
        if ($meta) {
            foreach (array_keys($meta) as $key) {
                $meta_sql .= ", $relation_table.$key _meta_$key";
            }
        }

        $other_entities_props = DB::fetchArr("SELECT *$meta_sql FROM $other_entity_name INNER JOIN $relation_table USING ($other_entity_id_column) WHERE $relation_table." . $obj->getIdColumn() . " = " . $obj->getId());

        foreach ($other_entities_props as $other_entity_props) {
            $other_entity = self::getEntity($other_entity_name, $other_entity_props, true);
            if ($other_entity) {
                $other_entities[] = $other_entity;
            }
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
    public static function manyToMany($name1, $name2, $relation_table, $extra = [])
    {
        self::$entities[$name1]["linked_with"][$name2] = [
            "relation_table" => $relation_table,
            "extra" => $extra
        ];

        self::$entities[$name2]["linked_with"][$name1] = [
            "relation_table" => $relation_table,
            "extra" => $extra
        ];

        // warmups are less important than actual links - the seconds can actually store extra information
        self::$entities[$name1]["warmup_other"][$name2] = [
            "relation_table" => $relation_table,
            "extra" => $extra
        ];

        // self::$entities[$name2]["warmup_other"][$name1] = [
        //     "relation_table" => $relation_table,
        //     "extra" => $extra
        // ];

        // self::$entities[$name2]["linked_with"][$name1] = [
        //     "relation_table" => $relation_table,
        //     "extra" => $extra
        // ];
    }

    /**
     * Note that it's the same as oneToMany
     * 
     * @param  string $parent_name !entity_name
     * @param  string $prop_name !entity_prop_name
     * @param  string $child_name !entity_name
     * @param  OneRelationOptions $options
     */
    public static function oneToOne($parent_name, $prop_name, $child_name, $options = [])
    {
        self::$entities[$child_name]["parents"][$parent_name] = [
            "prop" => $prop_name,
            "parent_required" => def($options, "parent_required", false),
            "parent_required_action" => def($options, "parent_required_action", "delete")
        ];
    }

    /**
     * @typedef OneRelationOptions {
     *  parent_required?: boolean remove child once the parent is gone
     *  parent_required_action?: string delete | unlink
     * }
     */

    /**
     * @param  string $parent_name !entity_name
     * @param  string $prop_name !entity_prop_name
     * @param  string $child_name !entity_name
     * @param  OneRelationOptions $options
     */
    public static function oneToMany($parent_name, $prop_name, $child_name, $options = [])
    {
        self::$entities[$child_name]["parents"][$parent_name] = [
            "prop" => $prop_name,
            "parent_required" => def($options, "parent_required", false),
            "parent_required_action" => def($options, "parent_required_action", "delete")
        ];
    }

    /**
     * setManyToManyRelationship
     *
     * @param  Entity $obj
     * @param  string $other_entity_name
     * @param  Entity[] $curr_val
     * @param  Entity[] $val
     * @param  array $link
     */
    public static function setManyToManyRelationship(Entity $obj, $other_entity_name, $curr_val, $val, $link)
    {
        $relation_table = $link["relation_table"];

        $our_id = $obj->getId();
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
        $meta = def($link, ["extra", "meta"], null);
        $update_meta_sqls = [];
        foreach ($val as $other_obj) {
            if (in_array($obj->getName(), $other_obj->getWillUnlinkFromEntities())) {
                continue;
            }

            $other_id = $other_obj->getProp($other_entity_id_column);
            if ($other_id > 0) { // always but prevents bugs
                $ids[] = $other_id;
            }

            if ($meta && $other_obj->getMeta()) {
                $update_meta_sql = "UPDATE $relation_table SET";

                foreach ($other_obj->getMeta() as $key => $val) {
                    if (isset($meta[$key])) {
                        $update_meta_sql .= " " . clean($key) . " = " . DB::escape($val) . ",";
                    }
                }
                $update_meta_sqls[] = substr($update_meta_sql, 0, -1) . " WHERE $other_entity_id_column = $other_id AND $our_id_column = $our_id";
            }
        }

        $removed_ids = array_diff($curr_ids, $ids);
        $added_ids = array_diff($ids, $curr_ids);

        if ($removed_ids) {
            $query = "DELETE FROM $relation_table WHERE $our_id_column = $our_id AND $other_entity_id_column IN (" . implode(",", $removed_ids) . ")";
            //var_dump([$query]);
            DB::execute($query);
        }
        if ($added_ids) {
            $query = "INSERT INTO $relation_table ($our_id_column, $other_entity_id_column) VALUES " . implode(",", array_map(function ($a) use ($our_id) {
                return "($our_id,$a)";
            }, $added_ids));
            //var_dump([$query]);
            DB::execute($query);
        }

        // optimize the update, not necessary in mysql tho lol
        foreach ($update_meta_sqls as $update_meta_sql) {
            DB::execute($update_meta_sql);
        }
    }
}
