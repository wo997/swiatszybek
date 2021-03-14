<?php

$entities = EntityManager::getEntities();
foreach ($entities as $entity_name => $entity_data) {
    foreach ($entity_data["props"] as $prop_name => $prop_data) {
        if (isset($entities[$prop_data["type"]])) {
            // one to one relation spotted
            EntityManager::register($entity_name, [
                "props" => [
                    EntityManager::getEntityIdColumn($prop_name) => ["type" => "number"]
                ]
            ]);
        }
    }
}
