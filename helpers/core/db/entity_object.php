<?php

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
        return $this->id_column ? $this->id_column : EntityManager::getEntityIdColumn($this->name);
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
