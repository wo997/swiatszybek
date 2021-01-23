<?php

EntityManager::getEntityById("pies", 28)->getProp("paw");

$obj = new Entity("piesx", []);
$obj->setProp("aaa");

EntityManager::setter("piesx", "aaa", function (Entity $obj, $val) {
    $obj->getProp("paw");
    $obj->setProp("food_double", 2 * $val);
    //$obj->setProp("ate_at", date("Y-m-d.H:i:s"));
});
