<?php

$args = [];
include "deployment/build.php";

foreach (array_keys(EntityManager::getEntities()) as $entity_name) {
    $id_col = EntityManager::getEntityIdColumn($entity_name);
    foreach (DB::fetchCol("SELECT $id_col FROM $entity_name") as $id) {
        EntityManager::getEntityById($entity_name, $id);
    }
}

EntityManager::saveAll();
