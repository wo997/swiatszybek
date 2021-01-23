<?php

class Entity
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
        $this->name = $name;
        $this->id_column = $this->getIdColumn();
        $this->will_delete = false;
        $this->will_unlink_from_entities = [];

        $obj_curr_id = $this->getIdFromProps($props);
        if ($obj_curr_id !== -1) {
            $this->curr_props = DB::fetchRow("SELECT * FROM " . $name . " WHERE " . $this->id_column . " = " . $obj_curr_id);
            $this->setProps(def($this->curr_props, []));
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
            DB::execute($query);
            return true;
        }

        $entity_data = EntityManager::getEntityData($this->name);

        $changed_props = [];
        foreach ($this->props as $key => $value) {
            if ($key === $this->id_column) {
                continue;
            }
            if (def($this->curr_props, $key, null) === $value) {
                continue;
            }

            if (is_array($value)) {
                $this->saveChildren($value);
            }

            $other_entity_type = str_replace("[]", "", def($entity_data, ["props", $key, "type"], ""));

            $link = def($entity_data, ["linked_with", $other_entity_type]);
            if ($link) {
                EntityManager::setManyToManyRelationship($this, $other_entity_type, def($this->curr_props, $key, []), $value, $link["relation_table"]);
            }

            if (is_array($value)) {
                continue;
            }

            $changed_props[$key] = $value;
        }

        if (!empty($changed_props)) {
            if ($this->curr_props) {
                // update
                $query = "UPDATE " . $this->name . " SET ";
                foreach (array_keys($changed_props) as $field) {
                    $query .= clean($field) . "=?,";
                }
                $query = rtrim($query, ",");
                $query .= " WHERE " . $this->id_column . "=" . $this->getId();
                var_dump([$query, array_values($changed_props)]);
                DB::execute($query, array_values($changed_props));
                return true;
            } else {
                // insert
                $keys_query = "";
                foreach (array_keys($changed_props) as $field) {
                    $keys_query .= clean($field) . ",";
                }
                $keys_query = rtrim($keys_query, ",");
                $values_query = rtrim(str_repeat("?,", count($changed_props)), ",");

                $query = "INSERT INTO " . clean($this->name) . "($keys_query) VALUES($values_query)";

                var_dump([$query, array_values($changed_props)]);
                DB::execute($query, array_values($changed_props));
                $entity_id = DB::insertedId();
                $this->setId($entity_id);
                return $entity_id;
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
    public function setProp($prop_name, $val = null)
    {
        if ($prop_name === $this->id_column && $this->getId() !== -1) {
            // set id once, ezy
            return;
        }

        if ($val === null) {
            $val = $this->getProp($prop_name);
        }

        $prop_data = def(EntityManager::getEntityData($this->name), ["props", $prop_name]);
        $prop_type = def($prop_data, "type", "");

        if (!$prop_data) {
            //var_dump([$this->name, $prop_name, $prop_data, $prop_type]);
            return; // error?
        }

        if ($prop_type && endsWith($prop_type, "[]")) {
            $child_entity_name = substr($prop_type, 0, -2);
            $child_entity_data = EntityManager::getEntityData($child_entity_name);
            if ($this->name === def($child_entity_data, ["parent", "name"])) {
                // no need to $this->props[$prop_name] but $val instead if u use before and after setters
                $val = EntityManager::setOneToManyEntities($this, $prop_name, $child_entity_name, $val);
                $this->props[$prop_name] = $val;
            } else {
                $link = def($child_entity_data, ["linked_with", $this->name]);
                if ($link) {
                    $val = EntityManager::setManyToManyEntities($this, $prop_name, $child_entity_name, $val);
                    $this->props[$prop_name] = $val;
                }
            }
        }

        $setter = $this->name . "_set_" .  $prop_name;
        $vals = EventListener::dispatch($setter, ["obj" => $this, "val" => $val]); // before and after?
        foreach ($vals as $v) {
            if ($v) {
                // doesn't make sense but ok
                $val = $v; //return $val;
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
     * @return void
     */
    public function getProp($prop_name)
    {
        if ($this->shouldFetchProp($prop_name)) {
            $prop_type = def(EntityManager::getEntityData($this->name), ["props", $prop_name, "type"]);
            if ($prop_type && endsWith($prop_type, "[]")) {
                $child_entity_name = substr($prop_type, 0, -2);
                $child_entity_data = EntityManager::getEntityData($child_entity_name);
                if ($this->name === def($child_entity_data, ["parent", "name"])) {
                    $this->props[$prop_name] = EntityManager::getOneToManyEntities($this, $child_entity_name);
                    $this->curr_props[$prop_name] = $this->props[$prop_name];
                } else {
                    $link = def($child_entity_data, ["linked_with", $this->name]);
                    if ($link) {
                        $this->props[$prop_name] = EntityManager::getManyToManyEntities($this, $child_entity_name, $link["relation_table"]);
                        $this->curr_props[$prop_name] = $this->props[$prop_name];
                    }
                }
            }

            $getter = $this->name . "_get_" .  $prop_name;
            $vals = EventListener::dispatch($getter, ["obj" => $this]);
            foreach ($vals as $val) {
                return $val;
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

    public function getRowProps()
    {
        $row_props = [];
        foreach ($this->props as $prop => $val) {
            if ($val instanceof Entity) {
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
