<?php

class Entity
{
    private $name;
    private $id_column;
    private $global_id;
    private $props = []; // row props in DB
    private $fetched = []; // stores info of what relations that were fetched already
    private $curr_props = null; // in case the object existed in DB
    private $will_delete = false;
    private $parents = []; // map string name -> Entity
    private $saved = false;
    private $will_unlink_from_entities = [];
    private $meta = []; // used for many to many relations
    public $is_new;
    private $curr_meta = []; // same as curr_props
    /** @var Entity[] */
    public $children_about_to_join = [];

    public function __construct($name, &$props)
    {
        $this->name = $name;
        $this->id_column = $this->getIdColumn();

        $obj_curr_id = $this->getIdFromProps($props);
        if ($obj_curr_id == -1) {
            // $columns = "";
            // $values = "";

            // $entity_data = EntityManager::getEntityData($this->name);
            // $parent_entity_name = def($entity_data, ["parent", "name"]);
            // if ($parent_entity_name) {
            //     $parent_entity_column_id = EntityManager::getEntityIdColumn($parent_entity_name);
            //     $parent_id = def($props, $parent_entity_column_id, -1);
            //     if ($parent_id !== -1) {
            //         $columns .= "$parent_entity_column_id,";
            //         $values .= "$parent_id,";
            //     }
            // }

            //$columns = trim($columns, ",");
            //$values = trim($values, ",");

            $this->curr_props = [];
            DB::execute("INSERT INTO $name () VALUES ()");
            //DB::execute("INSERT INTO $name ($columns) VALUES ($values)");
            $this->setId(DB::insertedId());
            $this->curr_meta = [];
            $this->is_new = true;

            $entity_data = EntityManager::getEntityData($this->name);
            foreach (array_keys($entity_data["parents"]) as $parent_entity_name) {
                $parent_entity_column_id = EntityManager::getEntityIdColumn($parent_entity_name);
                $parent_id = def($props, $parent_entity_column_id, -1);
                // if you ever get stuck here, the child must contain it's parent in definition, for example general_product_id will point to the parent
                // if (is_array($props)) {
                // } else {
                //     $parent_id = intval($props);
                // }
                if ($parent_id !== -1) {
                    $parent = EntityManager::getEntityById($parent_entity_name, $parent_id);
                    if ($parent) {
                        $parent->childAboutToJoin($this);
                        // why not just set prop? well, because it would be overriden by relation from DB
                    }
                }
            }
        } else {
            $this->setId($obj_curr_id);
            $this->setCurrSimpleProps();
            if (!$this->curr_props) {
                throw new Exception("Entity does not exist in the DB");
            }
            $this->setProps(def($this->curr_props, []));
            $this->curr_meta = $this->meta;
            $this->is_new = false;
        }

        $this->setProps($props);
    }

    public function setCurrSimpleProps()
    {
        $this->curr_props = DB::fetchRow("SELECT * FROM " . $this->name . " WHERE " . $this->id_column . " = " . $this->getId());
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

    public function getMeta()
    {
        return $this->meta;
    }

    public function setGlobalId($id)
    {
        $this->global_id = $id;
    }

    public function getGlobalId()
    {
        return $this->global_id;
    }

    /**
     * setWillDelete
     *
     * @param  boolean $delete
     * @return void
     */
    public function willUnlinkFromEntity($name)
    {
        $this->will_unlink_from_entities[] = $name;
    }

    public function getWillUnlinkFromEntities()
    {
        return $this->will_unlink_from_entities;
    }

    /**
     * saveChildren
     *
     * @param  Entity[] $objs
     * @return void
     */
    private function saveChildren($objs)
    {
        foreach ($objs as $obj) {
            if ($obj instanceof Entity) {
                $obj->save(["propagate_to_parents" => false]);
            }
        }
    }

    /**
     * saveChildren
     *
     * @param  Entity $child
     * @return void
     */
    public function childAboutToJoin($child)
    {
        $this->children_about_to_join[] = $child;
    }

    public function save($options = [])
    {
        if ($this->saved) {
            return;
        }

        $entity_data = EntityManager::getEntityData($this->name);

        $saver = "before_save_" . $this->name . "_entity";
        EventListener::dispatch($saver, ["obj" => $this]);

        if (def($options, "propagate_to_parents", true) === true) {
            // possibly delegate
            $any_parent_just_saved = false;
            foreach ($this->parents as $parent) {
                if ($parent && !$parent->saved) {
                    $any_parent_just_saved = true;
                    $parent->save();
                }
            }

            if ($any_parent_just_saved) {
                if (!$this->getWillDelete()) {
                    // in that case any parent will handle saving so chill
                    return;
                }
            }
        }
        $this->saved = true;

        $changed = false;

        // don't worry about sorting removed items, the order is still the same, anyway it's managed separately
        if ($this->getWillDelete()) {
            $query = "DELETE FROM " . $this->name . " WHERE " . $this->id_column . "=" . $this->getId();
            //var_dump([$query]);
            DB::execute($query);
            //return true;

            $changed = true;
        } else {
            // save primitive types and complex types / relations etc.
            $changed_props = [];
            foreach ($this->props as $key => $value) {
                if ($key === $this->id_column) {
                    continue;
                }

                if (is_array($value)) {
                    $zeroth = def($value, 0, null);
                    if (is_object($zeroth) && $zeroth instanceof Entity) {
                        $this->saveChildren($value);
                    }
                } else if (is_object($value) && $value instanceof Entity) {
                    $changed_props[EntityManager::getEntityIdColumn($key)] = $value->getId();
                    $value->save(["propagate_to_parents" => false]);
                }

                $other_entity_data = def($entity_data, ["props", $key], []);
                $other_entity_type = def($other_entity_data, ["type"], "");
                $other_entity_simple_type = str_replace("[]", "", def($other_entity_data, ["type"], ""));

                $link = def($entity_data, ["linked_with", $other_entity_simple_type]);
                if ($link) {
                    EntityManager::setManyToManyRelationship($this, $other_entity_simple_type, def($this->curr_props, $key, []), $value, $link);
                }

                if (def($this->curr_props, $key, null) === $value) {
                    continue;
                }

                if (($other_entity_type && EntityManager::getEntityData(clean($other_entity_type))) || is_array($value)) {
                    continue;
                }
                $changed_props[$key] = $value;
            }

            if (!empty($changed_props)) {
                // update
                $query = "UPDATE " . $this->name . " SET ";
                foreach (array_keys($changed_props) as $field) {
                    $query .= clean($field) . "=?,";
                }
                $query = rtrim($query, ",");
                $query .= " WHERE " . $this->id_column . "=" . $this->getId();
                //var_dump([$query, array_values($changed_props)]);
                DB::execute($query, array_values($changed_props));
                //return true;

                $changed = true;
            }
        }

        if ($changed) {
            $warmup_other = def($entity_data, ["warmup_other"], []);
            foreach ($warmup_other as $entity_name => $relation_data) {
                $this->warmupEntity($entity_name, $relation_data["relation_table"]);
            }
            $linked_with = def($entity_data, ["linked_with"], []);
            foreach ($linked_with as $entity_name => $relation_data) {
                $this->warmupEntity($entity_name, $relation_data["relation_table"]);
            }
        }

        $saver = "after_save_" . $this->name . "_entity";
        EventListener::dispatch($saver, ["obj" => $this]);
    }

    function warmupEntity($other_entity_name, $relation_table)
    {
        $id_col = EntityManager::getEntityIdColumn($other_entity_name);
        $our_id_col = $this->getIdColumn();
        $our_id = $this->getId();
        foreach (DB::fetchCol("SELECT $id_col FROM $relation_table WHERE $our_id_col = $our_id") as $other_ent_id) {
            $other_obj = EntityManager::getEntityById($other_entity_name, $other_ent_id);
            if ($other_obj) {
                EntityManager::addWarmupObject($other_obj);
            }
        }
    }

    /**
     * setProp
     *
     * @param  string $prop_name !entity_prop_name
     * @param  mixed $val
     * @return void
     */
    public function setProp($prop_name, $val = false)
    {
        if ($prop_name === $this->id_column && $this->getId() !== -1) {
            // set id once, ezy
            return;
        }

        $setter = "set_" . $this->name . "_entity_" .  $prop_name;
        $vals = EventListener::dispatch($setter, ["obj" => $this, "val" => $val]);
        foreach ($vals as $v) {
            if ($v !== null) {
                $val = $v;
            }
        }

        if ($val === false) {
            $val = $this->getProp($prop_name);
        }

        if (strpos($prop_name, "_meta_", 0) === 0) {
            $this->meta[str_replace("_meta_", "", $prop_name)] = $val;
            return;
        }

        $prop_data = def(EntityManager::getEntityData($this->name), ["props", $prop_name]);
        $prop_type = def($prop_data, "type", "");

        if (!$prop_data) {
            //var_dump("failed at prop: $prop_name"); // use it when u need
            return; // error?
        }

        if ($prop_type && endsWith($prop_type, "[]")) {
            $other_entity_name = substr($prop_type, 0, -2);
            $child_entity_data = EntityManager::getEntityData($other_entity_name);
            $relation_data = def($child_entity_data, ["parents", $this->name], null);
            if ($relation_data) {
                $val = EntityManager::setOneToManyEntities($this, $prop_name, $other_entity_name, $val, $relation_data);
            } else {
                $link = def($child_entity_data, ["linked_with", $this->name]);
                if ($link) {
                    $val = EntityManager::setManyToManyEntities($this, $prop_name, $other_entity_name, $val);
                }
            }
        } else if ($prop_type && EntityManager::getEntityData($prop_type)) {
            $relation_data = def($prop_type, ["parents", $this->name], null);
            $val = EntityManager::setOneToOneEntity($this, $prop_name, $prop_type, $val, $relation_data);
        }

        $this->props[$prop_name] = $val;
    }

    public function setProps($arr, $only_new = false)
    {
        foreach ($arr as $prop_name => $val) {
            // if ($this->getProp($prop_name !== $val) {
            //     var_dump();
            // }
            if ($only_new && $this->getProp($prop_name) !== null) {
                continue;
            }
            $this->setProp($prop_name, $val);
        }
    }

    /**
     * getProp
     *
     * @param  string $prop_name !entity_prop_name
     * @param  mixed $options
     */
    public function getProp($prop_name)
    {
        if ($this->shouldFetchProp($prop_name)) {
            $prop_type = def(EntityManager::getEntityData($this->name), ["props", $prop_name, "type"]);
            if ($prop_type && endsWith($prop_type, "[]")) {
                $other_entity_name = substr($prop_type, 0, -2);
                $child_entity_data = EntityManager::getEntityData($other_entity_name);
                if (isset($child_entity_data["parents"][$this->name])) {
                    $this->props[$prop_name] = EntityManager::getOneToManyEntities($this, $other_entity_name);
                    $this->curr_props[$prop_name] = $this->props[$prop_name];
                } else {
                    $link = def($child_entity_data, ["linked_with", $this->name]);
                    if ($link) {
                        $this->props[$prop_name] = EntityManager::getManyToManyEntities($this, $other_entity_name, $link);
                        $this->curr_props[$prop_name] = $this->props[$prop_name];
                    }
                }
            } else if ($prop_type && EntityManager::getEntityData($prop_type)) {
                $this->props[$prop_name] = EntityManager::getOneToOneEntity($this, $prop_name, $prop_type);
                $this->curr_props[$prop_name] = $this->props[$prop_name];
            }
        }

        return def($this->props, $prop_name, null);
    }

    /**
     * getParents
     *
     * @return Entity[]
     */
    public function getParents()
    {
        $fetched_parent_names = array_keys($this->parents);
        $parent_names = def(EntityManager::getEntityData($this->name), ["parents"]);

        foreach ($parent_names as $parent_name => $parent_data) {
            if (!in_array($parent_name, $fetched_parent_names)) {
                $parent_id = $this->getProp(EntityManager::getEntityIdColumn($parent_name));
                if ($parent_id > 0) { // only the existing ones for sure, otherwise empty garbage is created
                    $parent = EntityManager::getEntityById($parent_name, $parent_id);
                    if ($parent) {
                        $parent->setProp($parent_data["prop"]);
                        $this->addParent($parent);
                    }
                }
            }
        }

        return $this->parents;
    }

    /**
     * getParent
     *
     * @param  string $name !entity_name
     * @return Entity
     */
    public function getParent($name)
    {
        return def($this->getParents(), $name, null);
    }

    /**
     * addParent
     *
     * @param  Entity $parent
     * @return void
     */
    public function addParent($parent)
    {
        if ($parent) {
            $this->parents[$parent->getName()] = $parent;
        }
    }

    public function getProps()
    {
        return $this->props;
    }

    public function getAllProps()
    {
        $entity_data = EntityManager::getEntityData($this->name);
        //$prop_names = array_keys(def($entity_data, ["props"], []));
        $props = def($entity_data, ["props"], []);

        $all_props = [];
        foreach ($props as $prop_name => $prop_data) {
            $val = $this->getProp($prop_name);

            if (is_array($val)) {
                $entities_data = [];
                foreach ($val as
                    /** @var Entity */
                    $ent) {
                    if ($ent instanceof Entity) {
                        $d = $ent->getAllProps();
                        foreach ($ent->meta as $key => $val) {
                            $d["_meta_$key"] = $val;
                        }
                        $entities_data[] = $d;
                    }
                }
                $val = $entities_data;
            }

            if ($val instanceof Entity) {
                $d = $val->getAllProps();
                foreach ($val->meta as $key => $val) {
                    $d["_meta_$key"] = $val;
                }
                $val = $d;
            }

            $all_props[$prop_name] = $val;
        }
        return $all_props;
    }

    /**
     * F.e. used to reacreate a frontend object
     */
    public function getSimpleProps()
    {
        $entity_data = EntityManager::getEntityData($this->name);
        $props = def($entity_data, ["props"], []);

        $simple_props = [];
        foreach ($props as $prop_name => $prop_data) {
            $val = $this->getProp($prop_name);

            if (is_array($val)) {
                $entities_data = [];
                foreach ($val as
                    /** @var Entity */
                    $ent) {
                    if ($ent instanceof Entity) {
                        $d = [$ent->getIdColumn() => $ent->getId()];
                        foreach ($ent->meta as $key => $val) {
                            $d["_meta_$key"] = $val;
                        }
                        $entities_data[] = $d;
                    }
                }
                $val = $entities_data;
            }

            if ($val instanceof Entity) {
                $d = [$val->getIdColumn() => $val->getId()];
                foreach ($val->meta as $key => $val) {
                    $d["_meta_$key"] = $val;
                }
                $val = $d;
            }

            $simple_props[$prop_name] = $val;
        }
        return $simple_props;
    }

    public function getRowProps()
    {
        $row_props = [];
        foreach ($this->props as $prop => $val) {
            if ($val instanceof Entity) { // might never happen? isn't it the arrays element that should indicate it? or even better, the entity def
                return;
            }
            $row_props[$prop] = $val;
        }
        return $row_props;
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
        return $this->id_column ? $this->id_column : EntityManager::getEntityIdColumn($this->name);
    }


    /**
     * getId
     *
     * @return number
     */
    public function getId()
    {
        if (!isset($this->props[$this->id_column])) {
            $this->props[$this->id_column] = -1;
        }
        return $this->getIdFromProps($this->props);
    }

    /**
     * setId
     *
     * @return number
     */
    public function setId($id)
    {
        $this->props[$this->id_column] = $id;
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
