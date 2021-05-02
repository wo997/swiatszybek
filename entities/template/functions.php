<?php //hook[helper]

function updateTemplateModificationTime($template_id)
{
    $template = EntityManager::getEntityById("page", $template_id);
    $template->setProp("modified_at", date("Y-m-d H:i:s"));
}

function getAllTemplates()
{
    return DB::fetchArr("SELECT * FROM template");
}

function preloadTemplates()
{
    $templates = json_encode(getAllTemplates());
    return <<<JS
    templates = $templates;
    loadedTemplates();
JS;
}
