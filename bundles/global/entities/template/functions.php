<?php //hook[helper]

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
