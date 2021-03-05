<?php

$args = [];
include "event_listeners/deployment/build.php";

foreach (array_keys(EntityManager::getEntities()) as $entity_name) {
    $id_col = EntityManager::getEntityIdColumn($entity_name);
    foreach (DB::fetchCol("SELECT $id_col FROM $entity_name") as $id) {
        EntityManager::getEntityById($entity_name, $id);
    }
}

EntityManager::saveAll();

// triggerEvent("sitemap_change");
triggerEvent("config_change");

triggerEvent("assets_change");
