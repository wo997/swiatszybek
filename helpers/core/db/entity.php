<?php

class Entity
{
    private static $entities = [];
    private static $entities_with_parent = [];

    public static function register($name, $props = [])
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
                    self::register($child_entity_name);
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

            $child_id_column = Entity::getEntityIdColumn($child_entity_name);
            $child_id = intval(def($child_props, $child_id_column, -1));
            if ($child_id === -1) {
                $child_props[$obj->getIdColumn()] = $obj->getId();
                $child = Entity::getFromProps($child_entity_name, $child_props);
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
            $query .= " AND " . Entity::getEntityIdColumn($child_entity_name) . " <> " . $child->getId();
            $children[] = $child;
        }

        $children_props = fetchArray($query);
        foreach ($children_props as $child_props) {
            $child = Entity::getFromProps($child_entity_name, $child_props);
            $child->setParent($obj); // ugh it should be the same thing that's a parent but it loops kinda like if it wasn't the case
            $children[] = $child;
        }

        //var_dump(["children <<<<<", $children, "children >>>>>"]);
        return $children;
    }
}
