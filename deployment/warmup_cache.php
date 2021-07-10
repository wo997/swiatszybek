<?php

include "deployment/build.php";
Theme::saveSettings();

// TODO: kinda pagination necessary dude ;)
// IMPORTANT, test whether resetting and saving actually works properly, backup DB
foreach (array_keys(EntityManager::getEntities()) as $entity_name) {
    $id_col = EntityManager::getEntityIdColumn($entity_name);
    foreach (DB::fetchCol("SELECT $id_col FROM $entity_name") as $id) {
        EntityManager::getEntityById($entity_name, $id);
    }
}

EntityManager::saveAll();
EntityManager::reset(); // necessary!

foreach (DB::fetchCol("SELECT page_id FROM page") as $page_id) {
    buildPageable("page", $page_id);
}
foreach (DB::fetchCol("SELECT template_id FROM template") as $template_id) {
    buildPageable("template", $template_id);
}
