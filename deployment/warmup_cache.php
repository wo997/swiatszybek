<?php

$dont_return = true;
include "deployment/build.php";
Theme::saveSettings();

foreach (array_keys(EntityManager::getEntities()) as $entity_name) {
    $id_col = EntityManager::getEntityIdColumn($entity_name);
    foreach (DB::fetchCol("SELECT $id_col FROM $entity_name") as $id) {
        EntityManager::getEntityById($entity_name, $id);
    }
}

EntityManager::saveAll();
