<?php //hook[helper]

function updateTemplateModificationTime($template_id)
{
    $template = EntityManager::getEntityById("page", $template_id);
    $template->setProp("modified_at", date("Y-m-d H:i:s"));
}
