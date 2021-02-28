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
    private $parent = null; // in case there is any
    private $fetched_parent = false;
    private $saved = false;
    private $will_unlink_from_entities = [];
    private $meta = []; // used for many to many relations
    private $curr_meta = []; // same as curr_props

    public function __construct($name, &$props)
    {
        $this->name = $name;
        $this->id_column = $this->getIdColumn();

        $obj_curr_id = $this->getIdFromProps($props);
        if ($obj_curr_id == -1) {
            $this->curr_props = [];
            DB::execute("INSERT INTO $name () VALUES ()");
            $this->setId(DB::insertedId());
            $this->curr_meta = [];
        } else {
            $this->curr_props = DB::fetchRow("SELECT * FROM " . $name . " WHERE " . $this->id_column . " = " . $obj_curr_id);
            if (!$this->curr_props) {
                throw new Exception("Entity does not exist in the DB");
            }
            $this->setProps(def($this->curr_props, []));
            $this->curr_meta = $this->meta;
        }

        $this->setProps($props);
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

    public function willExistForOtherEntity($global_id)
    {
        if ($this->getWillDelete() || in_array($global_id, $this->getWillUnlinkFromEntities())) {
            return false;
        }
        return true;
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
     * @param  Entitys[] $objs
     * @return void
     */
    private function saveChildren($objs)
    {
        foreach ($objs as $obj) {
            if ($obj instanceof Entity) {
                $obj->save(["propagate_to_parent" => false]);
            }
        }
    }

    public function save($options = [])
    {
        if ($this->saved) {
            return;
        }

        $entity_data = EntityManager::getEntityData($this->name);

        $saver = "save_" . $this->name . "_entity";
        EventListener::dispatch($saver, ["obj" => $this]);

        if (def($options, "propagate_to_parent", true) === true) {
            // possibly delegate
            $parent = $this->getParent();

            if ($parent) {
                $parent->save();
                return;
            }
        }
        $this->saved = true;

        // don't worry about sorting removed items, the order is still the same, anyway it's managed separately
        if ($this->will_delete) {
            $query = "DELETE FROM " . $this->name . " WHERE " . $this->id_column . "=" . $this->getId();
            //var_dump([$query]);
            DB::execute($query);
            return true;
        }

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

            if (($other_entity_type && endsWith($other_entity_type, "[]")) || is_array($value)) {
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
            return true;
        }
    }

    /**
     * setProp
     *
     * @param  string $prop_name !entity_prop_name
     * @param  mixed $val
     * @return void
     */
    public function setProp($prop_name, $val = null)
    {
        if ($prop_name === $this->id_column && $this->getId() !== -1) {
            // set id once, ezy
            return;
        }

        if ($val === null) {
            $val = $this->getProp($prop_name);
        }

        if (strpos($prop_name, "_meta_", 0) !== false) {
            $this->meta[str_replace("_meta_", "", $prop_name)] = $val;
            return;
        }

        $prop_data = def(EntityManager::getEntityData($this->name), ["props", $prop_name]);
        $prop_type = def($prop_data, "type", "");

        if (!$prop_data) {
            //var_dump([$this->name, $prop_name, $prop_data, $prop_type]);
            return; // error?
        }

        if ($prop_type && endsWith($prop_type, "[]")) {
            $other_entity_name = substr($prop_type, 0, -2);
            $child_entity_data = EntityManager::getEntityData($other_entity_name);
            if ($this->name === def($child_entity_data, ["parent", "name"])) {
                // no need to $this->props[$prop_name] but $val instead if u use before and after setters
                $val = EntityManager::setOneToManyEntities($this, $prop_name, $other_entity_name, $val);
                //var_dump(">>>", count($val));
                $this->props[$prop_name] = $val;
            } else {
                $link = def($child_entity_data, ["linked_with", $this->name]);
                if ($link) {
                    $val = EntityManager::setManyToManyEntities($this, $prop_name, $other_entity_name, $val);
                    $this->props[$prop_name] = $val;
                }
            }
        }

        // I think it should not modify anything, just throw an error or set something else
        $setter = "set_" . $this->name . "_entity_" .  $prop_name;
        $vals = EventListener::dispatch($setter, ["obj" => $this, "val" => $val]); // before and after?
        foreach ($vals as $v) {
            if ($v) {
                // doesn't make sense but ok
                //$val = $v; //return $val;
            }
        }

        $this->props[$prop_name] = $val;
    }

    public function setProps($arr)
    {
        foreach ($arr as $prop_name => $val) {
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
                if ($this->name === def($child_entity_data, ["parent", "name"])) {
                    $this->props[$prop_name] = EntityManager::getOneToManyEntities($this, $other_entity_name);
                    $this->curr_props[$prop_name] = $this->props[$prop_name];
                } else {
                    $link = def($child_entity_data, ["linked_with", $this->name]);
                    if ($link) {
                        $this->props[$prop_name] = EntityManager::getManyToManyEntities($this, $other_entity_name, $link);
                        $this->curr_props[$prop_name] = $this->props[$prop_name];
                    }
                }
            }

            // Are you sure you even need this step bro?
            $getter = "get_" . $this->name . "_entity_" .  $prop_name;
            $vals = EventListener::dispatch($getter, ["obj" => $this]);
            foreach ($vals as $val) {
                // not sure of that
                // if ($val !== null) {
                //     $this->props[$prop_name] = $val;
                //     $this->curr_props[$prop_name] = $val;
                // }
                //return $val;
            }

            /*if (function_exists($getter)) {
                $val = call_user_func($getter, $this);
                $this->props[$prop_name] = $val;
                //if ($val !== null) {}
            }*/
        }
        return def($this->props, $prop_name, null);
    }

    /**
     * getParent
     *
     * @return Entity
     */
    public function getParent()
    {
        if ($this->fetched_parent === false) {
            $this->fetched_parent = true;

            $parent_props = def(EntityManager::getEntityData($this->name), ["parent"]);
            if ($parent_props) {
                $parent_name = $parent_props["name"];
                $parent_prop = $parent_props["prop"];
                $this->parent = EntityManager::getEntityById($parent_name, $this->getProp(EntityManager::getEntityIdColumn($parent_name)));
                // warmup, not sure if we need it but ok
                $this->parent->setProp($parent_prop);
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
                        $entities_data[] = $ent->getAllProps();
                    }
                }
                $val = $entities_data;
            }
            $all_props[$prop_name] = $val;

            /*if (strpos($prop_data["type"], "") !== false) {
                $v = $prop_data;
            } else {
            }*/

            // if ($val instanceof Entity) {
            //     $val = $val->getAllProps();
            // }
            //$all_props[$prop_name] = $val;
        }
        //var_dump($all_props);
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
